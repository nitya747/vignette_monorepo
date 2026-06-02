import { supabase, isDbConfigured } from '../db/client.js';
import { CTRCritiqueResponse } from '../types/index.js';
import { createHash } from 'crypto';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getUuidFromString(id: string): string {
  if (uuidRegex.test(id)) {
    return id;
  }
  const hash = createHash('md5').update(id).digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
}

export interface SaveHistoryPayload {
  userId: string;
  videoId?: string;
  title: string;
  prompt: string;
  imageUrl: string;
  niche: string;
  archetype: string;
  aspectRatio: '16:9' | '9:16';
  provider: string;
  analysis: CTRCritiqueResponse;
}

export interface ThumbnailHistoryItem {
  id: string;
  userId: string;
  videoId: string | null;
  title: string | null;
  prompt: string;
  promptVer: string;
  imageUrl: string;
  niche: string;
  archetype: string;
  aspectRatio: string;
  provider: string;
  createdAt: string;
  analysis?: {
    id: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    attentionHierarchy: string[];
    suggestedTitles: string[];
  } | null;
}

/**
 * Saves a generation and its analysis atomically to Supabase.
 * Fails fast by propagating errors directly to the caller.
 */
export async function saveGeneration(payload: SaveHistoryPayload): Promise<ThumbnailHistoryItem> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const dbUserId = getUuidFromString(payload.userId);

  // Ensure user profile row exists defensively before inserting thumbnail record
  await supabase.from('profiles').upsert({ id: dbUserId }, { onConflict: 'id' });

  // 1. Insert thumbnail record
  const { data: thumbnailData, error: thumbError } = await supabase
    .from('thumbnails')
    .insert({
      user_id: dbUserId,
      video_id: payload.videoId || null,
      title: payload.title,
      prompt: payload.prompt,
      prompt_ver: 'thumbnail-v1',
      image_url: payload.imageUrl,
      niche: payload.niche,
      archetype: payload.archetype,
      aspect_ratio: payload.aspectRatio,
      provider: payload.provider
    })
    .select()
    .single();

  if (thumbError || !thumbnailData) {
    throw thumbError || new Error('Failed to save thumbnail metadata');
  }

  const savedThumbnailId = thumbnailData.id;

  // 2. Insert analysis record linked to thumbnail
  const { data: analysisData, error: analysisError } = await supabase
    .from('analyses')
    .insert({
      thumbnail_id: savedThumbnailId,
      user_id: dbUserId,
      score: payload.analysis.score,
      strengths: payload.analysis.strengths,
      weaknesses: payload.analysis.weaknesses,
      suggestions: payload.analysis.suggestions,
      attention_hierarchy: payload.analysis.attentionHierarchy,
      suggested_titles: payload.analysis.suggestedTitles
    })
    .select()
    .single();

  if (analysisError || !analysisData) {
    // Clean up orphaned thumbnail in case of partial transaction fail
    await supabase.from('thumbnails').delete().eq('id', savedThumbnailId);
    throw analysisError || new Error('Failed to save analysis metadata');
  }

  return {
    id: savedThumbnailId,
    userId: payload.userId,
    videoId: thumbnailData.video_id,
    title: thumbnailData.title,
    prompt: thumbnailData.prompt,
    promptVer: thumbnailData.prompt_ver,
    imageUrl: thumbnailData.image_url,
    niche: thumbnailData.niche,
    archetype: thumbnailData.archetype,
    aspectRatio: thumbnailData.aspect_ratio,
    provider: thumbnailData.provider,
    createdAt: thumbnailData.created_at,
    analysis: {
      id: analysisData.id,
      score: analysisData.score,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      suggestions: analysisData.suggestions,
      attentionHierarchy: analysisData.attention_hierarchy,
      suggestedTitles: analysisData.suggested_titles
    }
  };
}

/**
 * Retrieves paginated history for a specific authenticated user.
 */
export async function getUserHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: ThumbnailHistoryItem[]; total: number; page: number; pageSize: number }> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const dbUserId = getUuidFromString(userId);
  const startOffset = (page - 1) * pageSize;

  // Fetch joined rows sorted desc and paginated natively from database
  const { data, error, count } = await supabase
    .from('thumbnails')
    .select(`
      *,
      analyses (
        id,
        score,
        strengths,
        weaknesses,
        suggestions,
        attention_hierarchy,
        suggested_titles
      )
    `, { count: 'exact' })
    .eq('user_id', dbUserId)
    .order('created_at', { ascending: false })
    .range(startOffset, startOffset + pageSize - 1);

  if (error) {
    throw error;
  }

  const dbItems: ThumbnailHistoryItem[] = (data || []).map((row: any) => {
    const dbAnalysis = row.analyses?.[0] || null;
    return {
      id: row.id,
      userId: userId,
      videoId: row.video_id,
      title: row.title,
      prompt: row.prompt,
      promptVer: row.prompt_ver,
      imageUrl: row.image_url,
      niche: row.niche,
      archetype: row.archetype || 'reaction',
      aspectRatio: row.aspect_ratio,
      provider: row.provider,
      createdAt: row.created_at,
      analysis: dbAnalysis ? {
        id: dbAnalysis.id,
        score: dbAnalysis.score,
        strengths: dbAnalysis.strengths,
        weaknesses: dbAnalysis.weaknesses,
        suggestions: dbAnalysis.suggestions,
        attentionHierarchy: dbAnalysis.attention_hierarchy,
        suggestedTitles: dbAnalysis.suggested_titles
      } : null
    };
  });

  return {
    items: dbItems,
    total: count || 0,
    page,
    pageSize
  };
}

/**
 * Retrieves a single history record by ID directly from Supabase.
 */
export async function getGenerationById(id: string, userId: string): Promise<ThumbnailHistoryItem | null> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const dbUserId = getUuidFromString(userId);

  const { data, error } = await supabase
    .from('thumbnails')
    .select(`
      *,
      analyses (
        id,
        score,
        strengths,
        weaknesses,
        suggestions,
        attention_hierarchy,
        suggested_titles
      )
    `)
    .eq('id', id)
    .eq('user_id', dbUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Record not found
    }
    throw error;
  }
  if (!data) {
    return null;
  }

  const dbAnalysis = data.analyses?.[0] || null;
  return {
    id: data.id,
    userId: userId,
    videoId: data.video_id,
    title: data.title,
    prompt: data.prompt,
    promptVer: data.prompt_ver,
    imageUrl: data.image_url,
    niche: data.niche,
    archetype: data.archetype || 'reaction',
    aspectRatio: data.aspect_ratio,
    provider: data.provider,
    createdAt: data.created_at,
    analysis: dbAnalysis ? {
      id: dbAnalysis.id,
      score: dbAnalysis.score,
      strengths: dbAnalysis.strengths,
      weaknesses: dbAnalysis.weaknesses,
      suggestions: dbAnalysis.suggestions,
      attentionHierarchy: dbAnalysis.attention_hierarchy,
      suggestedTitles: dbAnalysis.suggested_titles
    } : null
  };
}

/**
 * Deletes a single generation record directly from Supabase.
 */
export async function deleteGeneration(id: string, userId: string): Promise<boolean> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const dbUserId = getUuidFromString(userId);

  const { error } = await supabase
    .from('thumbnails')
    .delete()
    .eq('id', id)
    .eq('user_id', dbUserId);

  if (error) {
    throw error;
  }
  return true;
}

/**
 * Renames a single generation record's title directly in Supabase.
 */
export async function renameGeneration(id: string, userId: string, newTitle: string): Promise<boolean> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const dbUserId = getUuidFromString(userId);

  const { data, error } = await supabase
    .from('thumbnails')
    .update({ title: newTitle })
    .eq('id', id)
    .eq('user_id', dbUserId)
    .select();

  if (error) {
    throw error;
  }
  return data && data.length > 0;
}

/**
 * Evaluates historical generations for the user and extracts visual strengths
 * from items with a CTR score >= 85% in the current niche.
 */
export async function getLearningModifiers(userId: string, niche: string): Promise<string> {
  // 1. Fetch up to 50 recent history items for this user
  const historyResult = await getUserHistory(userId, 1, 50);

  // 2. Filter by niche and score threshold of 85+
  const successfulItems = historyResult.items.filter(item =>
    item.niche === niche &&
    item.analysis &&
    item.analysis.score >= 85
  );

  if (successfulItems.length === 0) {
    return '';
  }

  // 3. Extract and de-duplicate specific descriptive visual strengths
  const visualStrengthsSet = new Set<string>();
  successfulItems.forEach(item => {
    if (item.analysis && Array.isArray(item.analysis.strengths)) {
      item.analysis.strengths.forEach(strength => {
        const cleaned = strength.replace(/\.$/, '').trim();
        if (cleaned.length > 5 && cleaned.length < 150) {
          visualStrengthsSet.add(cleaned);
        }
      });
    }
  });

  const uniqueStrengths = Array.from(visualStrengthsSet).slice(0, 3);
  if (uniqueStrengths.length === 0) {
    return '';
  }

  // 4. Compile a high-impact prompt guidance instruction
  const guidingPhrase = uniqueStrengths.join(', ');
  console.log(`[Self-Learning] 🔄 Active learning loop! Enhancing prompt with visual cues from ${successfulItems.length} successful designs: "${guidingPhrase}"`);
  return `Draw visual cues and proven style enhancements from successful high-performing thumbnails in this channel: ${guidingPhrase}.`;
}

/**
 * Retrieves the current credit count of a specific user directly from Supabase profiles.
 */
export async function getUserCredits(userId: string): Promise<number> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const isGuest = userId.startsWith('guest-');
  const dbUserId = getUuidFromString(userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', dbUserId)
    .single();

  if (error || !data) {
    if (error?.code === 'PGRST116') {
      console.log(`[History Service] Profile record missing for user ${dbUserId}. Defensively creating row.`);
      const defaultCredits = isGuest ? 100 : 500;
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: dbUserId, credits: defaultCredits }, { onConflict: 'id' })
        .select('credits')
        .single();

      if (upsertError || !upsertData) {
        throw upsertError || new Error('Failed to defensively upsert missing profile record');
      }
      return upsertData.credits;
    }
    throw error || new Error('Failed to retrieve user profile record');
  }
  return data.credits;
}

/**
 * Decrements user credit balance by a given amount directly in Supabase profiles.
 */
export async function decrementUserCredits(userId: string, amount: number = 1): Promise<number> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }

  const dbUserId = getUuidFromString(userId);

  const currentCredits = await getUserCredits(userId);
  const nextCredits = Math.max(0, currentCredits - amount);

  const { data, error } = await supabase
    .from('profiles')
    .update({ credits: nextCredits })
    .eq('id', dbUserId)
    .select('credits')
    .single();

  if (error || !data) {
    throw error || new Error('Failed to update/decrement user credits in database');
  }
  return data.credits;
}

/**
 * Deletes a guest profile from the profiles table after credit migration is complete.
 */
export async function deleteGuestProfile(guestId: string): Promise<boolean> {
  if (!isDbConfigured || !supabase) {
    throw new Error('Supabase database connection is not configured.');
  }
  const dbGuestId = getUuidFromString(guestId);
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', dbGuestId);

  if (error) {
    throw error;
  }
  return true;
}
