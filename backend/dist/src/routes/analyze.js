import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validateRequest.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { analyzeThumbnail } from '../services/analysisService.js';
export const analyzeRouter = Router();
const analyzeSchema = z.object({
    image: z.string().min(1, 'Image is required'),
    title: z.string().min(1, 'Title is required'),
    topic: z.string().optional(),
    keywords: z.string().optional(),
    niche: z.string().min(1, 'Niche is required'),
    archetype: z.string().min(1, 'Archetype is required')
});
analyzeRouter.post('/', rateLimiter('expensive'), validate(analyzeSchema), async (req, res, next) => {
    try {
        const { image, title, topic, keywords, niche, archetype } = req.body;
        const result = await analyzeThumbnail({ image, title, topic, keywords, niche, archetype });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
