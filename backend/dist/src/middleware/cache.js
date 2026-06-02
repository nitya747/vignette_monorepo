// LRUCache and Redis caching have been completely removed per request
export const cacheMiddleware = (cacheType) => {
    return async (req, res, next) => {
        // Caching has been deactivated and removed globally.
        // Set X-Cache to BYPASS to explicitly indicate caching is deactivated.
        res.setHeader('X-Cache', 'BYPASS');
        next();
    };
};
