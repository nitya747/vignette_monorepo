import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
export let supabase = null;
export let isDbConfigured = false;
if (config.supabaseUrl &&
    config.supabaseServiceKey &&
    config.supabaseUrl !== 'your_supabase_url_here') {
    try {
        supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
        isDbConfigured = true;
        console.log('[Supabase Client] Singleton database client initialized successfully.');
    }
    catch (error) {
        console.error('[Supabase Client] Failed to initialize Supabase client:', error);
    }
}
else {
    console.warn('[Supabase Client] Supabase credentials not fully configured. Persistence layer will use in-memory sandbox mocks.');
}
