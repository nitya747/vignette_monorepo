import { supabase } from './src/db/client.js';

async function checkPublication() {
  console.log('=== Checking Supabase Realtime Publication Tables ===');
  try {
    // Query pg_publication_tables to see which tables are in the supabase_realtime publication
    const { data, error } = await supabase
      .from('pg_publication_tables')
      .select('*')
      .eq('pubname', 'supabase_realtime');

    if (error) {
      // If we cannot query pg_publication_tables directly due to permissions or postgrest schema rules,
      // let's try querying using a raw SQL bypass or RPC if available.
      console.warn('⚠️ Cannot select from pg_publication_tables directly:', error.message);
      console.log('Attempting alternative schema query...');
      
      const { data: pubData, error: pubError } = await supabase
        .rpc('get_publications'); // check if there is an rpc
      
      if (pubError) {
        console.error('❌ Alternative query failed:', pubError.message);
      } else {
        console.log('Publications:', pubData);
      }
    } else {
      console.log('Tables in supabase_realtime publication:');
      console.log(data);
      const isProfilesInPub = data.some((t: any) => t.tablename === 'profiles');
      if (isProfilesInPub) {
        console.log('✅ SUCCESS: "profiles" table is in "supabase_realtime" publication!');
      } else {
        console.log('❌ FAIL: "profiles" table is NOT in "supabase_realtime" publication! You need to run: alter publication supabase_realtime add table public.profiles;');
      }
    }
  } catch (err: any) {
    console.error('❌ Exception during publication check:', err.message);
  }
}

checkPublication();
