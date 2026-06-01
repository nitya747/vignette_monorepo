import { ImageGenerationPayload, ImageGenerationResponse, CTRCritiqueResponse } from '../types/index.js';

export interface ThumbnailAnalysisPayload {
  image: string; // base64 or URL
  systemPrompt: string;
  userPrompt: string;
  title: string;
  topic?: string;
  keywords?: string;
  niche?: string;
  archetype?: string;
}

export interface BaseImageProvider {
  generate(payload: ImageGenerationPayload): Promise<ImageGenerationResponse>;
}

export interface BaseAnalysisProvider {
  analyze(payload: ThumbnailAnalysisPayload): Promise<CTRCritiqueResponse>;
}
