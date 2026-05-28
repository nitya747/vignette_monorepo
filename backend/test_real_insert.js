import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealInsert() {
  const email = `test-user-${Date.now()}@vignette.ai`;
  const password = 'password123';

  try {
    console.log('--- Supabase Real Insert Test ---');
    console.log('1. Creating a real user in Supabase auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError || !authData.user) {
      console.error('Failed to create user:', authError?.message);
      return;
    }

    const realUserId = authData.user.id;
    console.log('Successfully created real user with UUID:', realUserId);

    console.log('2. Inserting thumbnail row...');
    const { data: thumbData, error: thumbError } = await supabase
      .from('thumbnails')
      .insert({
        user_id: realUserId,
        video_id: null,
        title: 'Supabase Real Persistence Test',
        prompt: 'A real database row insertion test prompt',
        prompt_ver: 'thumbnail-v1',
        image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1280&h=720',
        niche: 'gaming',
        archetype: 'hero',
        aspect_ratio: '16:9',
        provider: 'Supabase Verification'
      })
      .select()
      .single();

    if (thumbError || !thumbData) {
      console.error('Failed to save thumbnail metadata:', thumbError?.message);
      return;
    }

    console.log('Successfully saved thumbnail to Supabase thumbnails table:', thumbData);

    console.log('3. Inserting analysis row linked to thumbnail...');
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        thumbnail_id: thumbData.id,
        user_id: realUserId,
        score: 92,
        strengths: ['Vibrant color contrast', 'Clear focal points'],
        weaknesses: ['None detected'],
        suggestions: ['None'],
        attention_hierarchy: ['Primary: Subject', 'Secondary: Highlights'],
        suggested_titles: ['Title 1', 'Title 2']
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Failed to save analysis metadata:', analysisError.message);
      return;
    }

    console.log('Successfully saved analysis to Supabase analyses table:', analysisData);
    console.log('\n--- Live Supabase Database Write Verified Successfully! ---');

  } catch (err) {
    console.error('Exception during database validation:', err);
  }
}

testRealInsert();
