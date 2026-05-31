import { LRUCache } from 'lru-cache';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { decrementUserCredits } from '../services/historyService.js';
// Fallback in-memory cache when Upstash Redis is not active
const localExtractCache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 60 // 1 hour TTL
});
const localGenerateCache = new LRUCache({
    max: 500,
    ttl: 1000 * 60 * 30 // 30 minutes TTL
});
let redisClient = null;
let redisConfigured = false;
if (config.upstashRedisUrl &&
    config.upstashRedisToken &&
    config.upstashRedisUrl !== 'your_upstash_redis_url_here') {
    try {
        redisClient = new Redis({
            url: config.upstashRedisUrl,
            token: config.upstashRedisToken,
        });
        redisConfigured = true;
        console.log('[Cache Middleware] Upstash Redis cache client initialized successfully.');
    }
    catch (error) {
        console.error('[Cache Middleware] Failed to initialize Upstash Redis cache client:', error);
    }
}
else {
    console.warn('[Cache Middleware] Upstash Redis credentials not configured. Local memory caching will be active.');
}
// Helper to compute stable cache keys
const getHash = (payload) => {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};
export const cacheMiddleware = (cacheType) => {
    return async (req, res, next) => {
        // Only cache POST requests with payloads
        if (req.method !== 'POST' || !req.body) {
            return next();
        }
        const localCache = cacheType === 'extract' ? localExtractCache : localGenerateCache;
        // Determine key
        let key = '';
        if (cacheType === 'extract') {
            key = req.body.url || '';
        }
        else {
            const { prompt, niche, archetype, aspectRatio = '16:9' } = req.body;
            key = getHash({ prompt, niche, archetype, aspectRatio });
        }
        if (!key) {
            return next();
        }
        const redisKey = `vignette:cache:${cacheType}:${key}`;
        // Check hit
        try {
            if (redisConfigured && redisClient) {
                const cachedData = await redisClient.get(redisKey);
                if (cachedData) {
                    console.log(`[Cache Hit] Serving ${cacheType} request from Redis: ${redisKey}`);
                    res.setHeader('X-Cache', 'HIT');
                    const responseBody = { ...cachedData };
                    if (cacheType === 'generate' && req.user?.id) {
                        try {
                            const remainingCredits = await decrementUserCredits(req.user.id, 1);
                            responseBody.remainingCredits = remainingCredits;
                            console.log(`[Cache Hit] Decremented credits for user ${req.user.id} from cache hit. Remaining: ${remainingCredits}`);
                        }
                        catch (err) {
                            console.error('[Cache Hit] Failed to decrement user credits on Redis cache hit:', err);
                        }
                    }
                    res.json(responseBody);
                    return;
                }
            }
            else {
                const cachedData = localCache.get(key);
                if (cachedData) {
                    console.log(`[Cache Hit] Serving ${cacheType} request from memory: ${key.substring(0, 15)}...`);
                    res.setHeader('X-Cache', 'HIT');
                    const responseBody = { ...cachedData };
                    if (cacheType === 'generate' && req.user?.id) {
                        try {
                            const remainingCredits = await decrementUserCredits(req.user.id, 1);
                            responseBody.remainingCredits = remainingCredits;
                            console.log(`[Cache Hit] Decremented credits for user ${req.user.id} from memory cache hit. Remaining: ${remainingCredits}`);
                        }
                        catch (err) {
                            console.error('[Cache Hit] Failed to decrement user credits on memory cache hit:', err);
                        }
                    }
                    res.json(responseBody);
                    return;
                }
            }
        }
        catch (err) {
            console.error(`[Cache Middleware] Upstash Redis retrieval error (failing open):`, err);
            // Fall open: proceed to miss if Redis fails
        }
        console.log(`[Cache Miss] Querying upstream for ${cacheType} request: ${key.substring(0, 15)}...`);
        res.setHeader('X-Cache', 'MISS');
        // Intercept res.json to cache response payload
        const originalJson = res.json;
        res.json = function (body) {
            // Only cache successful 2xx responses
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Strip user-specific credits balance from cache payload to prevent leakages
                const bodyToCache = { ...body };
                if (bodyToCache && typeof bodyToCache === 'object') {
                    delete bodyToCache.remainingCredits;
                }
                if (redisConfigured && redisClient) {
                    const ttl = cacheType === 'extract' ? 3600 : 1800; // 1 hour for extract, 30 min for generate
                    redisClient.set(redisKey, bodyToCache, { ex: ttl }).catch(err => {
                        console.error('[Cache Middleware] Upstash Redis write error:', err);
                    });
                }
                else {
                    localCache.set(key, bodyToCache);
                }
            }
            return originalJson.call(this, body);
        };
        next();
    };
};
