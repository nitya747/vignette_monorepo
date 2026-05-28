import fetch from 'node-fetch';
import { BaseImageProvider } from './base.js';
import { ImageGenerationPayload, ImageGenerationResponse } from '../types/index.js';
import { compilePrompt } from '../../prompts/thumbnail-v1.js';
import { getLearningModifiers } from '../services/historyService.js';
import { ProviderError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

export class FalProvider implements BaseImageProvider {
  private falKey: string;

  constructor() {
    if (!config.falKey) {
      throw new Error('FAL_KEY is missing in configurations');
    }
    this.falKey = config.falKey;
  }

  async generate({ prompt, niche, archetype, aspectRatio = '16:9', userId }: ImageGenerationPayload): Promise<ImageGenerationResponse> {
    // Fetch learning modifiers from the user's past high-performing generations
    let learningModifiers = '';
    if (userId) {
      learningModifiers = await getLearningModifiers(userId, niche);
    }

    const compiledPrompt = compilePrompt({ title: prompt, niche, archetype, aspectRatio, learningModifiers });
    const startTime = Date.now();

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: compiledPrompt,
        image_size: aspectRatio === '9:16' ? '9:16' : '16:9',
        sync_mode: true,
        num_inference_steps: 4,
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new ProviderError(`fal.ai service responded with status ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();

    if (!data.images || data.images.length === 0 || !data.images[0].url) {
      throw new ProviderError('fal.ai response did not contain any valid image URLs');
    }

    return {
      imageUrl: data.images[0].url,
      revisedPrompt: data.revised_prompt || compiledPrompt,
      provider: 'fal.ai (flux/schnell)',
      latencyMs
    };
  }
}
