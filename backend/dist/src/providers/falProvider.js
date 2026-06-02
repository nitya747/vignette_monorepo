import fetch from 'node-fetch';
import { compilePrompt } from '../../prompts/thumbnail-v1.js';
import { getLearningModifiers } from '../services/historyService.js';
import { ProviderError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';
export class FalProvider {
    falKey;
    constructor() {
        if (!config.falKey) {
            throw new Error('FAL_KEY is missing in configurations');
        }
        this.falKey = config.falKey;
    }
    async generate({ prompt, niche, archetype, aspectRatio = '16:9', userId, image }, refinedPrompt) {
        // Fetch learning modifiers from the user's past high-performing generations
        let learningModifiers = '';
        if (userId) {
            learningModifiers = await getLearningModifiers(userId, niche || 'default');
        }
        // Use pre-refined prompt from Layer 1 if available, otherwise compile it standard
        const compiledPrompt = refinedPrompt || compilePrompt({
            title: prompt,
            niche,
            archetype,
            aspectRatio,
            learningModifiers,
            usePhoto: !!image
        });
        const startTime = Date.now();
        const endpoint = image ? 'https://fal.run/fal-ai/gemini-3.1-flash-image-preview/edit' : 'https://fal.run/fal-ai/gemini-3.1-flash-image-preview';
        const body = {
            prompt: compiledPrompt,
            sync_mode: true,
            aspect_ratio: aspectRatio,
        };
        if (image) {
            body.image_urls = [image];
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
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const latencyMs = Date.now() - startTime;
        if (!response.ok) {
            const errorText = await response.text();
            throw new ProviderError(`fal.ai service responded with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        if (!data.images || data.images.length === 0 || !data.images[0].url) {
            throw new ProviderError('fal.ai response did not contain any valid image URLs');
        }
        return {
            imageUrl: data.images[0].url,
            revisedPrompt: data.revised_prompt || compiledPrompt,
            provider: image ? 'fal.ai (gemini-3.1-flash-image-preview/edit)' : 'fal.ai (gemini-3.1-flash-image-preview)',
            latencyMs
        };
    }
}
