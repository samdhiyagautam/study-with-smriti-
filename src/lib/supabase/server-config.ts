import "server-only";

/**
 * Server-only secrets. Importing this module from client code fails the build,
 * which is how we guarantee the service-role key never reaches the browser.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const serverSupabaseConfig = {
  url,
  serviceRoleKey,
  adminConfigured: Boolean(url && serviceRoleKey),
} as const;

export const MISSING_ADMIN_CONFIG =
  "Server credentials missing: set SUPABASE_SERVICE_ROLE_KEY in .env.local (server only).";
