import { supabase, isDbConfigured } from '../db/client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SANDBOX_FILE = path.resolve(__dirname, '../../sandbox_history.json');
function loadMemoryHistory() {
    try {
        if (fs.existsSync(SANDBOX_FILE)) {
            const data = fs.readFileSync(SANDBOX_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (err) {
        console.error('[History Service] Failed to load sandbox history file:', err);
    }
    return [];
}
function saveMemoryHistory(items) {
    try {
        fs.writeFileSync(SANDBOX_FILE, JSON.stringify(items, null, 2), 'utf-8');
    }
    catch (err) {
        console.error('[History Service] Failed to write sandbox history file:', err);
    }
}
// Memory-backed sandbox fallback
const memoryHistory = loadMemoryHistory();
/**
 * Saves a generation and its analysis atomically
 */
export async function saveGeneration(payload) {
    const generatedId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const nowStr = new Date().toISOString();
    const mockItem = {
        id: generatedId,
        userId: payload.userId,
        videoId: payload.videoId || null,
        title: payload.title,
        prompt: payload.prompt,
        promptVer: 'thumbnail-v1',
        imageUrl: payload.imageUrl,
        niche: payload.niche,
        archetype: payload.archetype,
        aspectRatio: payload.aspectRatio,
        provider: payload.provider,
        createdAt: nowStr,
        analysis: {
            id: 'analysis-' + generatedId,
            score: payload.analysis.score,
            strengths: payload.analysis.strengths,
            weaknesses: payload.analysis.weaknesses,
            suggestions: payload.analysis.suggestions,
            attentionHierarchy: payload.analysis.attentionHierarchy,
            suggestedTitles: payload.analysis.suggestedTitles
        }
    };
    const isMockUser = payload.userId === 'mock-sandbox-user-id' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.userId);
    if (!isDbConfigured || isMockUser) {
        console.log(`[History Service] DB not configured or mock user used. Saving generated item ${generatedId} to local sandbox file.`);
        memoryHistory.unshift(mockItem);
        saveMemoryHistory(memoryHistory);
        return mockItem;
    }
    try {
        // Ensure user profile row exists defensively before inserting thumbnail record
        try {
            await supabase.from('profiles').upsert({ id: payload.userId }, { onConflict: 'id' });
        }
        catch (upsertError) {
            console.warn('[History Service] Defensive profile upsert failed, proceeding anyway:', upsertError);
        }
        // 1. Insert thumbnail record
        const { data: thumbnailData, error: thumbError } = await supabase
            .from('thumbnails')
            .insert({
            user_id: payload.userId,
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
            throw new Error(`Failed to save thumbnail metadata: ${thumbError?.message}`);
        }
        const savedThumbnailId = thumbnailData.id;
        // 2. Insert analysis record linked to thumbnail
        const { data: analysisData, error: analysisError } = await supabase
            .from('analyses')
            .insert({
            thumbnail_id: savedThumbnailId,
            user_id: payload.userId,
            score: payload.analysis.score,
            strengths: payload.analysis.strengths,
            weaknesses: payload.analysis.weaknesses,
            suggestions: payload.analysis.suggestions,
            attention_hierarchy: payload.analysis.attentionHierarchy,
            suggested_titles: payload.analysis.suggestedTitles
        })
            .select()
            .single();
        if (analysisError) {
            // Clean up orphaned thumbnail in case of partial transaction fail
            await supabase.from('thumbnails').delete().eq('id', savedThumbnailId);
            throw new Error(`Failed to save analysis metadata: ${analysisError.message}`);
        }
        return {
            id: savedThumbnailId,
            userId: thumbnailData.user_id,
            videoId: thumbnailData.video_id,
            title: thumbnailData.title,
            prompt: thumbnailData.prompt,
            promptVer: thumbnailData.prompt_ver,
            imageUrl: thumbnailData.image_url,
            niche: thumbnailData.niche,
            archetype: payload.archetype,
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
    catch (error) {
        console.error('[History Service] PostgreSQL write failed, using fallback in-memory backup:', error);
        memoryHistory.unshift(mockItem);
        return mockItem;
    }
}
/**
 * Retrieves paginated history for a specific authenticated user
 */
export async function getUserHistory(userId, page = 1, pageSize = 20) {
    const startOffset = (page - 1) * pageSize;
    const isMockUser = userId === 'mock-sandbox-user-id' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    let dbItems = [];
    if (isDbConfigured && !isMockUser) {
        try {
            // Fetch joined rows sorted desc from live database
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
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            dbItems = (data || []).map((row) => {
                const dbAnalysis = row.analyses?.[0] || null;
                return {
                    id: row.id,
                    userId: row.user_id,
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
        }
        catch (error) {
            console.error('[History Service] PostgreSQL query failed, falling back to local storage only:', error);
        }
    }
    // Get local memory items for this user
    const localItems = memoryHistory.filter(item => item.userId === userId);
    // Combine and deduplicate by ID, letting PostgreSQL items overwrite local fallback copies
    const itemMap = new Map();
    localItems.forEach(item => itemMap.set(item.id, item));
    dbItems.forEach(item => itemMap.set(item.id, item));
    // Convert map back to list
    const allItems = Array.from(itemMap.values());
    // Sort by createdAt descending
    allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // Paginate
    const paginatedItems = allItems.slice(startOffset, startOffset + pageSize);
    return {
        items: paginatedItems,
        total: allItems.length,
        page,
        pageSize
    };
}
/**
 * Retrieves a single history record by ID
 */
export async function getGenerationById(id, userId) {
    const isMockUser = userId === 'mock-sandbox-user-id' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isDbConfigured || isMockUser) {
        const item = memoryHistory.find(item => item.id === id && item.userId === userId);
        return item || null;
    }
    try {
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
            .eq('user_id', userId)
            .single();
        if (error || !data)
            return null;
        const dbAnalysis = data.analyses?.[0] || null;
        return {
            id: data.id,
            userId: data.user_id,
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
    catch (error) {
        console.error('[History Service] PostgreSQL select failed, using in-memory backup:', error);
        const item = memoryHistory.find(item => item.id === id && item.userId === userId);
        return item || null;
    }
}
/**
 * Deletes a single generation record
 */
export async function deleteGeneration(id, userId) {
    const initialLen = memoryHistory.length;
    const idx = memoryHistory.findIndex(item => item.id === id && item.userId === userId);
    if (idx !== -1) {
        memoryHistory.splice(idx, 1);
        saveMemoryHistory(memoryHistory);
    }
    const isMockUser = userId === 'mock-sandbox-user-id' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isDbConfigured || isMockUser) {
        return memoryHistory.length < initialLen;
    }
    try {
        const { error } = await supabase
            .from('thumbnails')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.error('[History Service] PostgreSQL delete failed, using in-memory backup:', error);
        return memoryHistory.length < initialLen;
    }
}
/**
 * Renames a single generation record's title
 */
export async function renameGeneration(id, userId, newTitle) {
    const idx = memoryHistory.findIndex(item => item.id === id && item.userId === userId);
    if (idx !== -1) {
        memoryHistory[idx].title = newTitle;
        saveMemoryHistory(memoryHistory);
    }
    const isMockUser = userId === 'mock-sandbox-user-id' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isDbConfigured || isMockUser) {
        return idx !== -1;
    }
    try {
        const { data, error } = await supabase
            .from('thumbnails')
            .update({ title: newTitle })
            .eq('id', id)
            .eq('user_id', userId)
            .select();
        if (error)
            throw error;
        return (data && data.length > 0) || idx !== -1;
    }
    catch (error) {
        console.error('[History Service] PostgreSQL update failed, using in-memory backup:', error);
        return idx !== -1;
    }
}
/**
 * Evaluates historical generations for the user and extracts visual strengths
 * from items with a CTR score >= 85% in the current niche, to automatically
 * inject them as guided learning modifiers into the next prompt compilation.
 */
export async function getLearningModifiers(userId, niche) {
    try {
        // 1. Fetch up to 50 recent history items for this user
        const historyResult = await getUserHistory(userId, 1, 50);
        // 2. Filter by niche and score threshold of 85+
        const successfulItems = historyResult.items.filter(item => item.niche === niche &&
            item.analysis &&
            item.analysis.score >= 85);
        if (successfulItems.length === 0) {
            return '';
        }
        // 3. Extract and de-duplicate specific descriptive visual strengths
        const visualStrengthsSet = new Set();
        successfulItems.forEach(item => {
            if (item.analysis && Array.isArray(item.analysis.strengths)) {
                item.analysis.strengths.forEach(strength => {
                    // Trim, remove trailing period, and only keep concise descriptive strings
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
    catch (err) {
        console.warn('[History Service] Self-learning query failed, falling back gracefully:', err);
        return '';
    }
}
