import fetch from 'node-fetch';
import { config } from '../config/index.js';
import { DEFAULT_MASTER_PROMPT } from '../../prompts/master-prompt-v1.js';
import { CompilePromptPayload } from '../types/index.js';

// Visual niche mappings for the fallback compiler
const FALLBACK_NICHES = {
  gaming: 'High-saturation, highly dramatic contrast, vibrant rim lighting, cinematic action, bold intense colors, glowing game elements, extreme dynamic visual highlights, 3D render styling, HDR details.',
  finance: 'Sleek professional studio setting, premium wealth and growth aesthetics, trust-building deep navy and gold color palette, soft key lighting, volumetric backlighting.',
  documentary: 'Cinematic dramatic lighting, high emotional depth, dramatic side-lighting, organic moody color grade, deep atmospheric depth of field, chiaroscuro lighting.',
  tech: 'Futuristic neon gradients, glowing tech gadgets, holographic data elements, clean ultra-dark background, sharp high-tech metal reflections, raytraced metallic accents.',
  fitness: 'High-energy athletic focus, raw sweat and muscular texture, motivational side-lit body highlights, high physical action contrast, volumetric backlighting.',
  education: 'Cozy study setting, intense focused student leaning over a glowing screen, background with whiteboard mathematical equations, glowing volumetric brain energy outline.'
};

const FALLBACK_ARCHETYPES = {
  reaction: 'An extreme macro close-up of a human face with an exaggerated expressive expression of wide-eyed curiosity and shock, dominating the left side, looking towards a glowing center focal point.',
  versus: 'A sharp, symmetrical split screen layout. Left side features a bright, high-energy colored visual; right side features a highly contrasting dark, moody visual. A vertical neon energy line splits the center.',
  hero: 'A single, high-fidelity subject standing crisply in the exact center, isolated by a clean, heavily blurred background with a vibrant colored neon rim light highlighting its outer edges.',
  question: 'An abstract, mysterious, and high-intrigue setting. A central glowing outline emerges from deep shadows, creating a compelling curiosity gap with deep atmospheric fog.'
};

export async function refinePromptWithLLM(payload: CompilePromptPayload): Promise<string> {
  const isKeyAvailable = config.visionApiKey && config.visionApiKey !== 'your_openai_api_key_here' && config.visionApiKey.trim() !== '';
  
  if (!isKeyAvailable) {
    throw new Error('LLM prompt refinement API key (VISION_API_KEY) is missing or not configured.');
  }

  const { title, topic, keywords, niche = 'gaming', archetype = 'hero', aspectRatio = '16:9', learningModifiers = '', usePhoto = false } = payload;

  const userContent = `Now generate the Nano Banana 2 thumbnail prompt for: "${topic || title || ''}" (Additional context: Title: "${title}", Keywords: "${keywords || ''}", Niche: "${niche}", Archetype: "${archetype}", Aspect Ratio: "${aspectRatio}", learningModifiers: "${learningModifiers}", contains reference photo: ${usePhoto ? 'Yes' : 'No'})`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for Layer 1 prompt refinement

    const key = config.visionApiKey!.trim();
    const isGemini = key.startsWith('AQ.') || key.startsWith('AIzaSy');

    let response: any = null;
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      if (isGemini) {
        // Direct call to Gemini AI Studio generateContent endpoint
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: userContent }]
              }
            ],
            systemInstruction: {
              parts: [{ text: DEFAULT_MASTER_PROMPT }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192
            }
          }),
          signal: controller.signal as any
        });
      } else {
        // Call OpenAI endpoint
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: DEFAULT_MASTER_PROMPT },
              { role: 'user', content: userContent }
            ],
            temperature: 0.7,
            max_tokens: 500
          }),
          signal: controller.signal as any
        });
      }

      if (response && response.status === 429) {
        attempt++;
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // 2000ms, 4000ms
          console.warn(`[promptRefinementService] API rate limited (429). Retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      break;
    }

    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      const errorText = response ? await response.text() : 'No response from LLM provider';
      throw new Error(`LLM prompt refinement API failed (${response ? response.status : 'N/A'}): ${errorText}`);
    }

    const data: any = await response.json();
    let refined = '';
    
    if (isGemini) {
      refined = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      refined = data.choices?.[0]?.message?.content || '';
    }

    if (!refined || refined.trim() === '') {
      throw new Error('LLM prompt refinement returned an empty completion.');
    }

    return refined.trim();
  } catch (error: any) {
    console.error(`[promptRefinementService] LLM prompt compilation error:`, error?.message || error);
    throw error;
  }
}

function compileLocalFallback(payload: CompilePromptPayload): string {
  const { title, topic, keywords, niche = 'gaming', archetype = 'hero', aspectRatio = '16:9', learningModifiers = '', usePhoto = false } = payload;
  
  const nicheStyle = FALLBACK_NICHES[niche as keyof typeof FALLBACK_NICHES] || FALLBACK_NICHES.gaming;
  const archComposition = FALLBACK_ARCHETYPES[archetype as keyof typeof FALLBACK_ARCHETYPES] || FALLBACK_ARCHETYPES.hero;
  
  let baseSubject = (topic || title || 'creative subject').trim();
  
  let promptParts = [
    `A masterfully composed, high-impact YouTube thumbnail designed for maximum CTR.`,
    `Aspect Ratio: ${aspectRatio}.`,
    `Composition layout: ${archComposition}`,
    `Subject detail: ${baseSubject}.`,
    `Niche style constraints: ${nicheStyle}`,
    `Rule of 3 elements: Strictly 1 focal subject, 1 glowing neon contrast accent, 1 highly blurred out-of-focus background for depth of field separation.`,
    `Safe zone rule: Keep the bottom-right quadrant clean of important details to prevent overlap with YouTube's duration badge.`
  ];
  
  if (usePhoto) {
    promptParts.push(`Naturally integrate the user's provided subject photo into the design as the primary foreground element with matching edge lighting.`);
  }
  
  if (learningModifiers) {
    promptParts.push(`Additional enhancements: ${learningModifiers}`);
  }
  
  // Strict rule to avoid AI text hallucinations
  promptParts.push(`Strict constraints: Absolutely NO text, NO words, NO letters, NO badges, NO typography. Blank visual base only.`);
  
  return promptParts.join(' ');
}
