import { config } from '../config/index.js';
import { AnalyzePayload, CTRCritiqueResponse } from '../types/index.js';
import { OpenAIProvider } from '../providers/openaiProvider.js';

export async function analyzeThumbnail(payload: AnalyzePayload): Promise<CTRCritiqueResponse> {
  const isKeyAvailable = config.visionApiKey && config.visionApiKey !== 'your_openai_api_key_here' && config.visionApiKey.trim() !== '';
  if (!isKeyAvailable) {
    throw new Error('OpenAI Vision API key is not configured. Please set the VISION_API_KEY environment variable in your .env.local file.');
  }

  const provider = new OpenAIProvider();

  const systemPrompt = `You are an elite, world-class YouTube Thumbnail Director, Audience Psychologist, and CTR Performance Optimizer. 
Critically analyze the provided thumbnail image in the context of the "${payload.niche}" niche and "${payload.archetype}" layout archetype.
Assess its visual contrast, focal separation, text legibility, safe-zone layouts, and overall clickability.

Return your critique strictly as a JSON object with the following keys and structure:
{
  "score": 85, // An integer between 35 and 95 representing CTR effectiveness.
  "strengths": [
    "Praise dynamic accents, layout choices, composition balance, or colors"
  ],
  "weaknesses": [
    "Focal clutter, low contrast, clashing palettes, or typography size limits"
  ],
  "suggestions": [
    "Actionable dynamic adjustments: e.g. zoom 20%, blur background, add orange glow"
  ],
  "attentionHierarchy": [
    "Primary: [What catches the eye first]",
    "Secondary: [What catches the eye second]",
    "Tertiary: [What catches the eye third]"
  ],
  "suggestedTitles": [
    "Bespoke High-CTR Title 1",
    "Bespoke High-CTR Title 2",
    "Bespoke High-CTR Title 3"
  ]
}

CRITICAL RULES FOR "suggestedTitles" (STRICT CONSTRAINTS):
1. NO FORMULAIC TEMPLATES: Do NOT use generic, repetitive formulas like "How to Master [Subject] in 24 Hours", "This [Subject] Changed Everything", or "I Tried [Subject] for 30 Days". Every suggested title must be a bespoke, natural-sounding, unique sentence that sounds like it was hand-crafted by a professional copywriter.
2. DISSECT VIDEO CONTEXT & INTENT: Deeply digest the provided Draft Title, Video Context/Description, and Keywords. Understand the exact genre, intent, and cultural context. 
   - E.g., If it is a TV serial/sitcom episode (like "Taarak Mehta Ka Ooltah Chashmah"), generate dramatic, comedic, or story-based titles focused on the characters or the central sitcom conflict (e.g. Jethalal's Pressure Cooker Chaos!, Confusion in Gokuldham Society!).
   - E.g., If it is a cooking video (like "Jalebi recipe"), focus on taste, texture, secrets, and crispy outcomes rather than generic cooking secrets.
3. CLEAN UP METADATA: Absolutely strip out raw metadata, episode numbers, serial pipes ("|"), hyphens ("-"), "Full Episode" labels, or channel names from the suggested titles. Focus purely on the high-intrigue click trigger of the video's content.
4. FLAWLESS GRAMMAR: Ensure perfect capitalization and natural phrasing. Never output plural mismatches (e.g., never say "This Cooking Secrets").
5. COMPLEMENT THE THUMBNAIL: The titles must pair beautifully with the visual composition of the thumbnail (e.g., matching the mood, character, or focal highlights).

Make the roasts constructive, specific, and actionable. Ensure the JSON is completely valid.`;

  const userPrompt = `Draft Video Title: "${payload.title}"
Video Context / Description: "${payload.topic || ''}"
Keywords: "${payload.keywords || ''}"
Niche: ${payload.niche}
Archetype Layout: ${payload.archetype}

Critique this thumbnail and suggest improvements and 3 contextual, high-CTR title pairings.`;

  return provider.analyze({
    image: payload.image,
    systemPrompt,
    userPrompt,
    title: payload.title,
    topic: payload.topic,
    keywords: payload.keywords,
    niche: payload.niche,
    archetype: payload.archetype
  });
}
