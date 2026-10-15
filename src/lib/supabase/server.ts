import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
import { serverSupabaseConfig } from "./server-config";

/**
 * Cookie-aware client for Server Components / Route Handlers / Server Actions.
 * Authenticates as the signed-in owner/admin; RLS still applies.
 */
export async function createServerSupabase() {
  if (!supabaseConfig.configured) return null;

  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — session refresh is handled by
          // middleware, so this can be ignored safely.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — NEVER create this in client code and
 * never return its results that contain private rows to unauthenticated users.
 */
export function createAdminSupabase() {
  if (!serverSupabaseConfig.adminConfigured) return null;

  return createSupabaseClient(
    serverSupabaseConfig.url,
    serverSupabaseConfig.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export interface AdminContext {
  userId: string;
  email: string;
  role: "owner" | "admin";
}

/**
 * Server-side authorization gate for admin pages, actions and API routes.
 * Verifies the session AND the role stored in the database — client-supplied
 * role values are never trusted. Returns null when access must be denied.
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "owner" && profile.role !== "admin")) {
    return null;
  }

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? "",
    role: profile.role,
  };
}
