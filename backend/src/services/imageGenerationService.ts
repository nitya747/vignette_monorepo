import { config } from '../config/index.js';
import { ImageGenerationPayload, ImageGenerationResponse } from '../types/index.js';
import { FalProvider } from '../providers/falProvider.js';

export async function generateImage(payload: ImageGenerationPayload): Promise<ImageGenerationResponse> {
  const isKeyAvailable = config.falKey && config.falKey !== 'your_fal_ai_api_key_here' && config.falKey.trim() !== '';
  if (!isKeyAvailable) {
    console.log('[imageGenerationService] fal.ai key not configured. Returning premium mock placeholder image to allow database billing verification.');
    
    // Choose a premium preset image based on niche to look gorgeous
    let mockUrl = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=1280&h=720'; // Lofi default
    if (payload.niche === 'gaming') {
      mockUrl = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=1280&h=720';
    } else if (payload.niche === 'fitness') {
      mockUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1280&h=720';
    } else if (payload.niche === 'finance') {
      mockUrl = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1280&h=720';
    } else if (payload.niche === 'tech') {
      mockUrl = 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1280&h=720';
    }
    
    return {
      imageUrl: payload.image || mockUrl,
      revisedPrompt: payload.prompt,
      provider: 'Mock Engine (Defense Sandbox Fallback)',
      latencyMs: 100
    };
  }

  const provider = new FalProvider();
  return provider.generate(payload);
}
