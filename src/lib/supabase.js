import { createClient } from '@supabase/supabase-js'

// These come from your Supabase project (Settings → API). Put them in a .env
// file at the project root — see .env.example and AUTH_SETUP.md.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // The app still loads so you can see the UI, but auth calls won't work
  // until you add your keys.
  console.warn('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — add them to .env')
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)

export const isSupabaseConfigured = Boolean(url && anonKey)
