import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validateRequest.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { optionalAuth } from '../middleware/auth.js';
import { generateImage } from '../services/imageGenerationService.js';
import { creditMiddleware } from '../middleware/creditMiddleware.js';
import { decrementUserCredits } from '../services/historyService.js';

export const generateRouter = Router();

const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  niche: z.string().default('default'),
  archetype: z.string().default('default'),
  aspectRatio: z.enum(['16:9', '9:16', '4:5']).default('16:9'),
  image: z.string().url('Reference image must be a valid public or signed URL.').nullable().optional()
});

generateRouter.post(
  '/',
  optionalAuth,
  creditMiddleware,
  rateLimiter('expensive'),
  cacheMiddleware('generate'),
  validate(generateSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { prompt, niche, archetype, aspectRatio, image } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ 
          error: 'Authentication or guest session is required to generate thumbnails.' 
        });
        return;
      }

      const result = await generateImage({ prompt, niche, archetype, aspectRatio, userId, image });
      
      let remainingCredits = undefined;
      if (userId) {
        remainingCredits = await decrementUserCredits(userId, 1);
      }

      res.json({
        ...result,
        ...(remainingCredits !== undefined ? { remainingCredits } : {})
      });
    } catch (error) {
      next(error);
    }
  }
);

