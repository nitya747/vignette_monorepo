import { createClient } from '@supabase/supabase-js';
import { config } from './src/config/index.js';

async function checkUsers() {
  console.log('=== Checking Auth Users vs Profiles ===');
  
  const client = createClient(config.supabaseUrl!, config.supabaseServiceKey!);
  
  // 1. Fetch all users from Supabase Auth
  console.log('Fetching auth users...');
  const { data: { users }, error: authError } = await client.auth.admin.listUsers();
  
  if (authError) {
    console.error('Failed to list auth users:', authError.message);
    return;
  }
  
  console.log(`Found ${users.length} users in Supabase Auth.`);
  
  // 2. Fetch all profiles
  console.log('Fetching public profiles...');
  const { data: profiles, error: profileError } = await client.from('profiles').select('*');
  
  if (profileError) {
    console.error('Failed to fetch profiles:', profileError.message);
    return;
  }
  
  console.log(`Found ${profiles.length} profiles in public.profiles.`);
  
  // 3. Compare
  const profileIds = new Set(profiles.map(p => p.id));
  
  users.forEach(user => {
    const hasProfile = profileIds.has(user.id);
    console.log(`User Email: ${user.email} | ID: ${user.id} | Has Profile: ${hasProfile}`);
  });
}

checkUsers();
