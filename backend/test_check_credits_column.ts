import { supabase } from './src/db/client.js';

async function verifyCreditsColumn() {
  console.log('=== Verifying live profiles schema in Supabase ===');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Failed to select from profiles:', error.message);
      process.exit(1);
    }

    console.log('Successfully queried profiles table. Sample row:');
    if (data && data.length > 0) {
      console.log(JSON.stringify(data[0], null, 2));
      if ('credits' in data[0]) {
        console.log(`✅ PASS: "credits" column exists in live public.profiles! Current value: ${data[0].credits}`);
      } else {
        console.warn('⚠️ WARNING: "credits" column is NOT found in public.profiles. Did you run the SQL migration script in your Supabase SQL editor?');
      }
    } else {
      console.log('No rows in profiles table, inserting test row to check schema...');
      // Try to select just the column to verify existence
      const { error: colError } = await supabase
        .from('profiles')
        .select('credits')
        .limit(1);

      if (colError) {
        console.error('❌ "credits" column does not exist:', colError.message);
      } else {
        console.log('✅ PASS: "credits" column exists in public.profiles (verified via specific column select)!');
      }
    }
  } catch (err: any) {
    console.error('❌ Exception during verification:', err.message);
    process.exit(1);
  }
}

verifyCreditsColumn();
