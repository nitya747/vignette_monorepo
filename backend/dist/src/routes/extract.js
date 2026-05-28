import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validateRequest.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { extractYouTubeMetadata } from '../services/metadataService.js';
export const extractRouter = Router();
const extractSchema = z.object({
    url: z.string().min(1, 'URL is required')
});
extractRouter.post('/', rateLimiter('cheap'), cacheMiddleware('extract'), validate(extractSchema), async (req, res, next) => {
    try {
        const { url } = req.body;
        const metadata = await extractYouTubeMetadata(url);
        res.json(metadata);
    }
    catch (error) {
        next(error);
    }
});
