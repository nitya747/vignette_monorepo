import { supabase } from './src/db/client.js';

async function listRows() {
  console.log('=== Listing Profiles ===');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  if (pError) console.error('Profiles select error:', pError);
  else console.log('Profiles:', profiles);

  console.log('\n=== Listing Thumbnails ===');
  const { data: thumbnails, error: tError } = await supabase.from('thumbnails').select('*');
  if (tError) console.error('Thumbnails select error:', tError);
  else console.log('Thumbnails:', thumbnails);

  console.log('\n=== Listing Analyses ===');
  const { data: analyses, error: aError } = await supabase.from('analyses').select('*');
  if (aError) console.error('Analyses select error:', aError);
  else console.log('Analyses:', analyses);
}

listRows();
