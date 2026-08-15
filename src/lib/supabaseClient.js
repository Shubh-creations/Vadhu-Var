import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean base URL: strip trailing slashes, /rest/v1 or /auth/v1 suffixes, and whitespace
const sanitizeSupabaseUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/+$/, ''); // Remove trailing slashes
  cleaned = cleaned.replace(/\/(rest|auth)\/v[0-9]+$/i, ''); // Remove accidental endpoint suffixes
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
};

const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = rawKey.trim();

// Safely create Supabase client if valid URL and Key exist
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }) 
  : null;

export const isSupabaseConfigured = () => Boolean(supabase);
