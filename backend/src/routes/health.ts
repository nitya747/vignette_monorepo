import { Router, Request, Response } from 'express';
import { config } from '../config/index.js';
import { isDbConfigured } from '../db/client.js';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Vignette.ai Express backend is healthy.',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    database: isDbConfigured ? 'connected (Supabase PostgreSQL)' : 'disconnected (using memory sandbox)',
    providers: {
      imageGeneration: config.falKey && config.falKey !== 'your_fal_ai_api_key_here' ? 'fal.ai (flux/schnell)' : 'Mock Engine (Auto-Fallback)',
      analysis: config.visionApiKey && config.visionApiKey !== 'your_openai_api_key_here' ? 'openai (gpt-4o)' : 'Mock Engine (Auto-Fallback)'
    },
    uptime: Math.floor(process.uptime())
  });
});
