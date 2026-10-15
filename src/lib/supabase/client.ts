"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./config";

/**
 * Browser Supabase client (anon key only — safe to expose).
 * Throws only if actually used without configuration; callers must check
 * `supabaseConfig.configured` first.
 */
export function createBrowserClientOrNull() {
  if (!supabaseConfig.configured) return null;
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
