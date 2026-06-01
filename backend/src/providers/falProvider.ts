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

  async generate({ prompt, niche, archetype, aspectRatio = '16:9', userId, image }: ImageGenerationPayload): Promise<ImageGenerationResponse> {
    // Fetch learning modifiers from the user's past high-performing generations
    let learningModifiers = '';
    if (userId) {
      learningModifiers = await getLearningModifiers(userId, niche || 'default');
    }

    const compiledPrompt = compilePrompt({ title: prompt, niche, archetype, aspectRatio, learningModifiers, usePhoto: !!image });
    const startTime = Date.now();

    const endpoint = image ? 'https://fal.run/fal-ai/gemini-25-flash-image/edit' : 'https://fal.run/fal-ai/gemini-25-flash-image';
    const body: any = {
      prompt: compiledPrompt,
      sync_mode: true,
    };
    
    if (image) {
      body.image_urls = [image];
    } else {
      body.aspect_ratio = aspectRatio;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for image generation

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

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
      provider: image ? 'fal.ai (gemini-25-flash-image/edit)' : 'fal.ai (gemini-25-flash-image)',
      latencyMs
    };
  }
}
