import fetch from 'node-fetch';
import { ProviderError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';
export class OpenAIProvider {
    visionApiKey;
    constructor() {
        if (!config.visionApiKey) {
            throw new Error('VISION_API_KEY is missing in configurations');
        }
        this.visionApiKey = config.visionApiKey;
    }
    async analyze({ image, systemPrompt, userPrompt, title }) {
        let imageUrlPayload = image;
        if (typeof image === 'string' && image.startsWith('iVBORw0KGgo')) {
            imageUrlPayload = `data:image/png;base64,${image}`;
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.visionApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                response_format: { type: 'json_object' },
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: userPrompt
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageUrlPayload
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 600,
            }),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            const errorText = await response.text();
            throw new ProviderError(`OpenAI Vision service responded with status ${response.status}: ${errorText}`);
        }
        const chatResponse = await response.json();
        const resultText = chatResponse.choices?.[0]?.message?.content;
        if (!resultText) {
            throw new ProviderError('OpenAI Vision returned an empty completion');
        }
        const parsedResult = JSON.parse(resultText);
        const strengths = Array.isArray(parsedResult.strengths) ? parsedResult.strengths.slice(0, 3) : [];
        const weaknesses = Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses.slice(0, 3) : [];
        const suggestions = Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions.slice(0, 3) : [];
        return {
            score: Math.max(35, Math.min(95, parsedResult.score || 70)),
            strengths,
            weaknesses,
            suggestions,
            roast: [...strengths, ...weaknesses, ...suggestions],
            attentionHierarchy: Array.isArray(parsedResult.attentionHierarchy) ? parsedResult.attentionHierarchy.slice(0, 3) : ['Primary: Central subject'],
            suggestedTitles: Array.isArray(parsedResult.suggestedTitles) ? parsedResult.suggestedTitles.slice(0, 3) : [title]
        };
    }
}
