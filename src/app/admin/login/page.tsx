import type { Metadata } from "next";
import { supabaseConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Owner login",
  robots: { index: false, follow: false },
};

/**
 * Placeholder login screen (Milestone M7 replaces it with the Supabase
 * email/password form + session handling). Always noindex.
 */
export default function AdminLoginPage() {
  const notConfigured = !supabaseConfig.configured;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Owner login</h1>

      {notConfigured ? (
        <div
          role="status"
          className="mt-6 rounded-lg border border-warning/40 bg-highlight p-4 text-sm"
        >
          <p className="font-semibold">Setup required</p>
          <p className="mt-1 text-muted">
            Supabase is not configured yet. Add{" "}
            <code className="rounded bg-surface px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="rounded bg-surface px-1">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            to <code className="rounded bg-surface px-1">.env.local</code>, then
            provision the owner account (see README → Supabase setup).
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Milestone M7 wires in the secure sign-in form. Until then this page
          only exists so the route resolves.
        </p>
      )}
    </div>
  );
}
