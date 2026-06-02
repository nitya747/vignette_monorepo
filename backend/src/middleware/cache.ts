import { Request, Response, NextFunction } from 'express';

// LRUCache and Redis caching have been completely removed per request
export const cacheMiddleware = (cacheType: 'extract' | 'generate') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Caching has been deactivated and removed globally.
    // Set X-Cache to BYPASS to explicitly indicate caching is deactivated.
    res.setHeader('X-Cache', 'BYPASS');
    next();
  };
};
