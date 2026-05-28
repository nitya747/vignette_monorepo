import { config } from '../config/index.js';
import { ImageGenerationPayload, ImageGenerationResponse } from '../types/index.js';
import { FalProvider } from '../providers/falProvider.js';
import { MockProvider } from '../providers/mockProvider.js';

export async function generateImage(payload: ImageGenerationPayload): Promise<ImageGenerationResponse> {
  const isKeyAvailable = config.falKey && config.falKey !== 'your_fal_ai_api_key_here' && config.falKey.trim() !== '';
  const provider = isKeyAvailable ? new FalProvider() : new MockProvider();
  return provider.generate(payload);
}

