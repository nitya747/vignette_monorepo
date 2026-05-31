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
    async generate({ prompt, niche, archetype, aspectRatio = '16:9', userId, image }) {
        // Fetch learning modifiers from the user's past high-performing generations
        let learningModifiers = '';
        if (userId) {
            learningModifiers = await getLearningModifiers(userId, niche);
        }
        const compiledPrompt = compilePrompt({ title: prompt, niche, archetype, aspectRatio, learningModifiers, usePhoto: !!image });
        const startTime = Date.now();
        const endpoint = image ? 'https://fal.run/fal-ai/flux/dev/image-to-image' : 'https://fal.run/fal-ai/flux/schnell';
        const body = {
            prompt: compiledPrompt,
            image_size: aspectRatio === '9:16' ? 'portrait_16_9' : (aspectRatio === '4:5' ? { width: 832, height: 1040 } : 'landscape_16_9'),
            sync_mode: true,
            num_inference_steps: 4,
        };
        if (image) {
            body.image_url = image;
            body.strength = 0.65;
            delete body.image_size;
        }
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${this.falKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
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
            provider: image ? 'fal.ai (flux/dev/image-to-image)' : 'fal.ai (flux/schnell)',
            latencyMs
        };
    }
}
