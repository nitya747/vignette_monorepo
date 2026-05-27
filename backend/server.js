import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMockCTRScore, getMockImageUrl } from './lib/prompts.js';

// Load environment variables defensively from multiple potential locations
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend proxying and stand-alone request testing
app.use(cors());
// Configure high body limit to support direct base64 image uploads for analysis
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vignette.ai Express backend is healthy.' });
});

/**
 * POST /api/extract
 * Extracts YouTube video metadata via oEmbed or deterministic fallbacks.
 */
app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);

    if (!match) {
      return res.status(400).json({ error: 'Invalid YouTube URL format. Please enter a standard video link.' });
    }

    const videoId = match[1];
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

    console.log(`[Backend API] Fetching oEmbed metadata from YouTube for video: ${videoId}`);

    try {
      const response = await fetch(oembedUrl);
      if (!response.ok) {
        throw new Error(`YouTube oEmbed returned status ${response.status}`);
      }

      const metadata = await response.json();
      
      const title = metadata.title || 'Untitled YouTube Video';
      const author = metadata.author_name || 'YouTube Creator';

      const stopWords = new Set([
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 
        'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
        'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 
        'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 
        'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 
        'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 
        'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 
        'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 
        'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 
        'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 
        'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 
        'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 
        'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 
        'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 
        'your', 'yours', 'yourself', 'yourselves'
      ]);

      const words = title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      const uniqueKeywords = Array.from(new Set(words)).slice(0, 5).join(', ');

      return res.json({
        title,
        author,
        topic: `A detailed video discussion regarding: ${title}`,
        keywords: uniqueKeywords || 'youtube, video, tutorial, viral'
      });

    } catch (fetchError) {
      console.warn(`[Backend API] oEmbed metadata fetch failed for ${videoId}. Using offline fallback generator:`, fetchError);
      
      const fallbackTitles = [
        'I Spent 100 Hours Inside an Autonomous AI Village',
        'How to Scale a Startup to $10M ARR in 2026',
        'We Designed the Ultimate High-Tech Dream Studio',
        'The Truth Behind YouTube’s Secret CTR Algorithm',
        '1 Hour of Cozy Late Night Lofi Study Beats'
      ];
      
      let charSum = 0;
      for (let i = 0; i < videoId.length; i++) {
        charSum += videoId.charCodeAt(i);
      }
      const selectedIndex = charSum % fallbackTitles.length;
      const fallbackTitle = fallbackTitles[selectedIndex];
      
      return res.json({
        title: fallbackTitle,
        author: 'Content Creator',
        topic: `A highly engaging viral breakdown explaining: ${fallbackTitle}`,
        keywords: 'ai, coding, tech, creative, youtube'
      });
    }

  } catch (error) {
    console.error('[Backend API] Server error during YouTube metadata extraction:', error);
    res.status(500).json({ error: 'Internal server error while extracting video details' });
  }
});

/**
 * POST /api/generate
 * Dispatches secure thumbnail generation requests to fal.ai FLUX Schnell.
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, niche, archetype, aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const falKey = process.env.FAL_KEY;

    if (!falKey) {
      console.log(`[Backend API] FAL_KEY is not configured. Falling back to mock assets for ${niche}-${archetype} at ratio ${aspectRatio}.`);
      return res.json({
        imageUrl: getMockImageUrl(niche, archetype, aspectRatio),
        revisedPrompt: prompt,
        provider: 'Mock Engine (Auto-Fallback)'
      });
    }

    console.log(`[Backend API] Dispatching generation request to fal.ai for prompt: "${prompt.substring(0, 60)}..."`);

    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: aspectRatio === '9:16' ? '9:16' : '16:9',
        sync_mode: true,
        num_inference_steps: 4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`fal.ai service responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.images || data.images.length === 0 || !data.images[0].url) {
      throw new Error('fal.ai response did not contain any valid image URLs');
    }

    res.json({
      imageUrl: data.images[0].url,
      revisedPrompt: data.revised_prompt || prompt,
      provider: 'fal.ai (flux/schnell)'
    });

  } catch (error) {
    console.error('[Backend API] Failed to generate image via live API, falling back:', error);
    
    // Safety fallback to mock image in case of live API failure
    try {
      const { niche = 'gaming', archetype = 'reaction', prompt = '', aspectRatio = '16:9' } = req.body;
      res.json({
        imageUrl: getMockImageUrl(niche, archetype, aspectRatio),
        revisedPrompt: prompt,
        provider: 'API Call Fallback (Mock)'
      });
    } catch (fallbackError) {
      console.error('[Backend API] Fallback extraction failed:', fallbackError);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
});

/**
 * POST /api/analyze
 * Dispatches secure thumbnail analysis requests to OpenAI GPT-4o Vision.
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { image, title, topic, keywords, niche, archetype } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const visionApiKey = process.env.VISION_API_KEY;

    if (!visionApiKey) {
      console.log(`[Backend API] VISION_API_KEY is not configured. Falling back to mock CTR analysis.`);
      const mockResult = getMockCTRScore(title, niche, archetype, topic, keywords);
      return res.json(mockResult);
    }

    console.log(`[Backend API] Dispatching thumbnail analysis to OpenAI GPT-4o Vision for title: "${title}"`);

    const systemPrompt = `You are an elite, world-class YouTube Thumbnail Director, Audience Psychologist, and CTR Performance Optimizer. 
Critically analyze the provided thumbnail image in the context of the "${niche}" niche and "${archetype}" layout archetype.
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
   - E.g., If it is a TV serial/sitcom episode (like "Taarak Mehta Ka Ooltah Chashmah"), generate dramatic, comedic, or story-based titles focused on the characters or the central sitcom conflict (e.g. "Jethalal's Pressure Cooker Chaos!", "Confusion in Gokuldham Society!").
   - E.g., If it is a cooking video (like "Jalebi recipe"), focus on taste, texture, secrets, and crispy outcomes rather than generic "cooking secrets".
3. CLEAN UP METADATA: Absolutely strip out raw metadata, episode numbers, serial pipes ("|"), hyphens ("-"), "Full Episode" labels, or channel names from the suggested titles. Focus purely on the high-intrigue click trigger of the video's content.
4. FLAWLESS GRAMMAR: Ensure perfect capitalization and natural phrasing. Never output plural mismatches (e.g., never say "This Cooking Secrets").
5. COMPLEMENT THE THUMBNAIL: The titles must pair beautifully with the visual composition of the thumbnail (e.g., matching the mood, character, or focal highlights).

Make the roasts constructive, specific, and actionable. Ensure the JSON is completely valid.`;

    const userPrompt = `Draft Video Title: "${title}"
Video Context / Description: "${topic || ''}"
Keywords: "${keywords || ''}"
Niche: ${niche}
Archetype Layout: ${archetype}

Critique this thumbnail and suggest improvements and 3 contextual, high-CTR title pairings.`;

    let imageUrlPayload = image;
    if (typeof image === 'string' && image.startsWith('iVBORw0KGgo')) {
      imageUrlPayload = `data:image/png;base64,${image}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${visionApiKey}`,
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Vision service responded with status ${response.status}: ${errorText}`);
    }

    const chatResponse = await response.json();
    const resultText = chatResponse.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error('OpenAI Vision returned an empty completion');
    }

    const parsedResult = JSON.parse(resultText);

    const strengths = Array.isArray(parsedResult.strengths) ? parsedResult.strengths.slice(0, 3) : [];
    const weaknesses = Array.isArray(parsedResult.weaknesses) ? parsedResult.weaknesses.slice(0, 3) : [];
    const suggestions = Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions.slice(0, 3) : [];

    res.json({
      score: Math.max(35, Math.min(95, parsedResult.score || 70)),
      strengths,
      weaknesses,
      suggestions,
      roast: [...strengths, ...weaknesses, ...suggestions],
      attentionHierarchy: Array.isArray(parsedResult.attentionHierarchy) ? parsedResult.attentionHierarchy.slice(0, 3) : ['Primary: Central subject'],
      suggestedTitles: Array.isArray(parsedResult.suggestedTitles) ? parsedResult.suggestedTitles.slice(0, 3) : [title]
    });

  } catch (error) {
    console.error('[Backend API] Failed to analyze vision via live API:', error);
    
    // Safety fallback to mock analysis
    try {
      const { title = 'My Underperforming Thumbnail', topic = '', keywords = '', niche = 'gaming', archetype = 'reaction' } = req.body;
      const mockResult = getMockCTRScore(title, niche, archetype, topic, keywords);
      res.json({
        ...mockResult,
        roast: [
          'API analysis error fallback. Visual score represents preset parameters.',
          ...mockResult.roast
        ]
      });
    } catch (fallbackError) {
      console.error('[Backend API] Fallback extraction failed:', fallbackError);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Vignette.ai Express server is running on port ${PORT} `);
  console.log(` Environment loaded. Health: http://localhost:${PORT}/api/health `);
  console.log(`====================================================`);
});
