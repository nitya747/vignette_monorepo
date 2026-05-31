// Vignette.ai Shared TypeScript Declarations

export interface NicheInfo {
  id: string;
  name: string;
  style: string;
  description: string;
}

export interface ArchetypeInfo {
  id: string;
  name: string;
  composition: string;
  textSafeZone: string;
  description: string;
}

export interface CompilePromptPayload {
  title: string;
  topic?: string;
  keywords?: string;
  niche: string;
  archetype: string;
  aspectRatio?: '16:9' | '9:16' | '4:5';
  learningModifiers?: string;
  usePhoto?: boolean;
}

export interface ImageGenerationPayload {
  prompt: string;
  niche: string;
  archetype: string;
  aspectRatio?: '16:9' | '9:16' | '4:5';
  userId?: string;
  image?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  revisedPrompt: string;
  provider: string;
  latencyMs?: number;
}

export interface CTRCritiqueResponse {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  roast: string[];
  attentionHierarchy: string[];
  suggestedTitles: string[];
}

export interface AnalyzePayload {
  image: string; // base64 or URL
  title: string;
  topic?: string;
  keywords?: string;
  niche: string;
  archetype: string;
}

export interface ExtractPayload {
  url: string;
}

export interface ExtractResponse {
  title: string;
  author: string;
  topic: string;
  keywords: string;
}
