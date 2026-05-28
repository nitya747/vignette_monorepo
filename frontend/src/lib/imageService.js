/**
 * Vignette.ai - Decoupled Image Generation & Vision Analysis Service
 * Acts as an abstract driver allowing seamless mock-to-live switches.
 */

import { getMockImageUrl, getMockCTRScore } from './prompts';

// Switch to false in Phase 4 when environmental secrets are configured on Vercel/Netlify
const MOCK_MODE = false;

/**
 * Interface function to handle secure backend image generation
 */
export async function generateThumbnailImage(prompt, niche, archetype, aspectRatio = '16:9', image = null) {
  // If Mock Mode is active (Phases 1-3), return immediately with custom local stock presets
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          imageUrl: image || getMockImageUrl(niche, archetype, aspectRatio),
          revisedPrompt: prompt,
          provider: 'Mock Engine (nanobanana 2 flash representation)'
        });
      }, 1500); // realistic latency
    });
  }

  // Phase 4 Live Integration Route
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, niche, archetype, aspectRatio, image }),
    });

    if (!response.ok) {
      throw new Error('Image generation endpoint reported an error');
    }

    const data = await response.json();
    return {
      imageUrl: data.imageUrl,
      revisedPrompt: data.revisedPrompt || prompt,
      provider: data.provider || 'fal.ai (flux/schnell)'
    };
  } catch (error) {
    console.error('Failed to generate image via live API, falling back to mock:', error);
    return {
      imageUrl: image || getMockImageUrl(niche, archetype, aspectRatio),
      revisedPrompt: prompt,
      provider: 'API Error Fallback (Mock)'
    };
  }
}

/**
 * Interface function to handle vision analysis of thumbnails
 */
export async function analyzeThumbnailCTR(imageBlobOrUrl, title, topic, keywords, niche, archetype) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockCTRScore(title, niche, archetype, topic, keywords));
      }, 2000); // realistic latency
    });
  }

  // Phase 4 Live Integration Route
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBlobOrUrl, title, topic, keywords, niche, archetype }),
    });

    if (!response.ok) {
      throw new Error('Analysis endpoint reported an error');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to analyze vision via live API, falling back to mock:', error);
    return getMockCTRScore(title, niche, archetype, topic, keywords);
  }
}
