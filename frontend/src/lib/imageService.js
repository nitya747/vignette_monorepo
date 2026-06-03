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
export async function generateThumbnailImage(prompt, niche, archetype, aspectRatio = '16:9', image = null, token = null, title = '', topic = '', keywords = '') {
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
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90-second timeout for image generation

    // Strip local blob URLs — fal.ai cannot fetch them. Only send https:// or data: URLs.
    const safeImage = image && !image.startsWith('blob:') ? image : null;

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        prompt, 
        niche, 
        archetype, 
        aspectRatio, 
        image: safeImage,
        title: title || undefined,
        topic: topic || undefined,
        keywords: keywords || undefined
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(`[${response.status}] ${errBody.error || 'Image generation endpoint reported an error'}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.imageUrl,
      revisedPrompt: data.revisedPrompt || prompt,
      provider: data.provider || 'fal.ai (gemini-3.1-flash-image-preview)',
      remainingCredits: data.remainingCredits
    };
  } catch (error) {
    const errMsg = error?.message || String(error);
    console.error('[imageService] Failed to generate image via live API:', errMsg);
    // Propagate credit restriction errors immediately so they are handled by the UI
    if (errMsg.includes('credits') || errMsg.includes('Insufficient') || errMsg.includes('top up')) {
      throw error;
    }
    // Propagate auth errors so the UI can prompt sign-in
    if (errMsg.includes('401') || errMsg.includes('Authentication') || errMsg.includes('Unauthorized')) {
      throw new Error('Authentication required. Please sign in again.');
    }
    return {
      imageUrl: image || getMockImageUrl(niche, archetype, aspectRatio),
      revisedPrompt: prompt,
      provider: `API Error Fallback (Mock) — ${errMsg.substring(0, 80)}`
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90-second timeout for vision analysis

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageBlobOrUrl, title, topic, keywords, niche, archetype }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Analysis endpoint reported an error');
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to analyze vision via live API, falling back to mock:', error);
    return getMockCTRScore(title, niche, archetype, topic, keywords);
  }
}

import { supabase } from './supabase.js';

/**
 * Uploads a raw binary image file directly to Supabase Storage in the
 * private bucket 'vignette-temp-uploads' and returns a short-lived signed URL.
 */
export async function uploadReferenceImage(file, userId = 'guest') {
  if (!supabase) {
    console.warn('[uploadReferenceImage] Supabase is not configured. Falling back to local data URL.');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const uniqueId = Math.random().toString(36).substring(2, 9);
    const filePath = `temp-uploads/${userId}/${Date.now()}-${uniqueId}.${fileExt}`;

    // 1. Upload raw binary to Supabase
    const { data, error } = await supabase.storage
      .from('vignette-temp-uploads')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    // 2. Request a 10-minute (600 seconds) short-lived signed URL for fal.ai ingestion
    const { data: signData, error: signError } = await supabase.storage
      .from('vignette-temp-uploads')
      .createSignedUrl(filePath, 600);

    if (signError) {
      throw new Error(`Failed to generate signed URL: ${signError.message}`);
    }

    return signData.signedUrl;
  } catch (err) {
    console.error('[uploadReferenceImage] Upload failed, falling back to local base64 preview:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}
