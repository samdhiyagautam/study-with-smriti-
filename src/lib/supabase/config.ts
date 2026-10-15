/**
 * Public Supabase configuration (anon key only — safe in the browser bundle).
 * The app builds and runs before credentials exist; callers must check
 * `supabaseConfig.configured` and show a helpful message instead of crashing.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfig = {
  url,
  anonKey,
  /** Public content reads available */
  configured: Boolean(url && anonKey),
} as const;

export const MISSING_PUBLIC_CONFIG =
  "Public content storage is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.";
