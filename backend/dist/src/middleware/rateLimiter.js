import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { config } from '../config/index.js';
let expensiveLimiter = null;
let cheapLimiter = null;
let redisConfigured = false;
if (config.upstashRedisUrl &&
    config.upstashRedisToken &&
    config.upstashRedisUrl !== 'your_upstash_redis_url_here') {
    try {
        const redis = new Redis({
            url: config.upstashRedisUrl,
            token: config.upstashRedisToken,
        });
        expensiveLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, '60 m'),
            prefix: 'vignette:expensive',
        });
        cheapLimiter = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(60, '60 m'),
            prefix: 'vignette:cheap',
        });
        redisConfigured = true;
        console.log('[Rate Limiter] Upstash Redis client initialized successfully.');
    }
    catch (error) {
        console.error('[Rate Limiter] Failed to initialize Upstash Redis rate limiter:', error);
    }
}
else {
    console.warn('[Rate Limiter] Upstash Redis credentials not configured. Rate limiting is currently disabled.');
}
export const rateLimiter = (tier = 'expensive') => {
    return async (req, res, next) => {
        if (!redisConfigured) {
            return next();
        }
        const limiter = tier === 'expensive' ? expensiveLimiter : cheapLimiter;
        if (!limiter) {
            return next();
        }
        // Capture requester's IP defensively
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.socket.remoteAddress ||
            '127.0.0.1';
        try {
            const { success, limit, reset, remaining } = await limiter.limit(ip);
            res.setHeader('X-RateLimit-Limit', limit.toString());
            res.setHeader('X-RateLimit-Remaining', remaining.toString());
            res.setHeader('X-RateLimit-Reset', reset.toString());
            if (!success) {
                const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: `Too many requests. Please retry in ${retryAfterSeconds} seconds.`,
                    limit,
                    reset: new Date(reset).toISOString(),
                    retryAfterSeconds,
                    timestamp: new Date().toISOString()
                });
                return;
            }
        }
        catch (err) {
            console.error('[Rate Limiter] Upstash evaluation error (bypassing):', err);
        }
        next();
    };
};
