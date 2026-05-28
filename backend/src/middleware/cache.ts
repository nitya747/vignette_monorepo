import { Request, Response, NextFunction } from 'express';
import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

// Initialize two separate LRU caches with capacity limits and TTLs
const extractCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 60 // 1 hour TTL
});

const generateCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 30 // 30 minutes TTL
});

// Helper to compute stable cache keys
const getHash = (payload: any): string => {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

export const cacheMiddleware = (cacheType: 'extract' | 'generate') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache POST requests with payloads
    if (req.method !== 'POST' || !req.body) {
      return next();
    }

    const cache = cacheType === 'extract' ? extractCache : generateCache;
    
    // Determine key
    let key = '';
    if (cacheType === 'extract') {
      key = req.body.url || '';
    } else {
      const { prompt, niche, archetype, aspectRatio = '16:9' } = req.body;
      key = getHash({ prompt, niche, archetype, aspectRatio });
    }

    if (!key) {
      return next();
    }

    // Check hit
    const cachedData = cache.get(key);
    if (cachedData) {
      console.log(`[Cache Hit] Serving ${cacheType} request from memory: ${key.substring(0, 15)}...`);
      res.setHeader('X-Cache', 'HIT');
      res.json(cachedData);
      return;
    }

    console.log(`[Cache Miss] Querying upstream for ${cacheType} request: ${key.substring(0, 15)}...`);
    res.setHeader('X-Cache', 'MISS');

    // Intercept res.json to cache response payload
    const originalJson = res.json;
    res.json = function (body: any): Response {
      // Only cache successful 2xx responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};
