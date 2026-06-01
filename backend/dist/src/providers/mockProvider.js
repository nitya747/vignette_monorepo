import { getMockImageUrl } from '../../prompts/thumbnail-v1.js';
import { getMockCTRScore } from '../../prompts/ctr-analysis-v1.js';
export class MockProvider {
    async generate({ prompt, niche, archetype, aspectRatio = '16:9', image }) {
        console.log(`[MockProvider] Generating high-fidelity mock image for niche: ${niche || 'default'}, archetype: ${archetype || 'default'}`);
        return {
            imageUrl: image || getMockImageUrl(niche || 'default', archetype || 'default', aspectRatio),
            revisedPrompt: prompt,
            provider: 'Mock Engine (Auto-Fallback)'
        };
    }
    async analyze({ title, niche, archetype, topic = '', keywords = '' }) {
        console.log(`[MockProvider] Running custom CTR analysis for title: "${title}"`);
        return getMockCTRScore(title, niche || 'default', archetype || 'default', topic, keywords);
    }
}
