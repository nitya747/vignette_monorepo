import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validateRequest.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { optionalAuth } from '../middleware/auth.js';
import { generateImage } from '../services/imageGenerationService.js';

export const generateRouter = Router();

const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  niche: z.string().min(1, 'Niche is required'),
  archetype: z.string().min(1, 'Archetype is required'),
  aspectRatio: z.enum(['16:9', '9:16']).default('16:9')
});

generateRouter.post(
  '/',
  optionalAuth,
  rateLimiter('expensive'),
  cacheMiddleware('generate'),
  validate(generateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { prompt, niche, archetype, aspectRatio } = req.body;
      const userId = req.user?.id;
      const result = await generateImage({ prompt, niche, archetype, aspectRatio, userId });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

