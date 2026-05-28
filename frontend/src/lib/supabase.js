import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize client defensively. If environment keys are not configured,
// we will export null to alert components to run sandbox mock sessions.
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here'
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

console.log('[Supabase Init] URL:', supabaseUrl, 'AnonKey length:', supabaseAnonKey ? supabaseAnonKey.length : 0, 'Client initialized:', !!supabase);
