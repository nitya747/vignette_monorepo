import { config } from './src/config/index.js';
import { supabase, isDbConfigured } from './src/db/client.js';

console.log('=== Backend DB Configuration Test ===');
console.log('config.supabaseUrl:', config.supabaseUrl);
console.log('config.supabaseServiceKey Length:', config.supabaseServiceKey?.length);
console.log('isDbConfigured:', isDbConfigured);
console.log('supabase is initialized:', !!supabase);
