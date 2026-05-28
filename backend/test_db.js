import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key Length:', supabaseServiceKey?.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  try {
    console.log('Testing insert into thumbnails...');
    const { data, error } = await supabase
      .from('thumbnails')
      .insert({
        user_id: 'mock-sandbox-user-id',
        video_id: null,
        title: 'Test Title',
        prompt: 'Test Prompt',
        prompt_ver: 'thumbnail-v1',
        image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1280&h=720',
        niche: 'gaming',
        archetype: 'hero',
        aspect_ratio: '16:9',
        provider: 'mock'
      })
      .select();

    if (error) {
      console.error('Error inserting into thumbnails:', error);
    } else {
      console.log('Successfully inserted into thumbnails:', data);
      
      const thumbId = data[0].id;
      console.log('Testing insert into analyses with thumb ID:', thumbId);
      const { data: aData, error: aError } = await supabase
        .from('analyses')
        .insert({
          thumbnail_id: thumbId,
          user_id: 'mock-sandbox-user-id',
          score: 80,
          strengths: ['Strength 1'],
          weaknesses: ['Weakness 1'],
          suggestions: ['Suggestion 1'],
          attention_hierarchy: ['Primary', 'Secondary'],
          suggested_titles: ['Title 1']
        })
        .select();

      if (aError) {
        console.error('Error inserting into analyses:', aError);
      } else {
        console.log('Successfully inserted into analyses:', aData);
      }
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();
