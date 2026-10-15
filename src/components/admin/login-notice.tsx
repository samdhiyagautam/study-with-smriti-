"use client";

import { useSearchParams } from "next/navigation";

/** Notices shown on the admin login screen (URL-driven). */
export function LoginNotice() {
  const params = useSearchParams();

  if (params.get("denied") === "1") {
    return (
      <p
        role="alert"
        className="mb-4 rounded-lg border border-error/40 bg-error-soft px-4 py-3 text-sm font-medium text-error"
      >
        This account does not have administrator access. Sign in with the
        owner/admin account.
      </p>
    );
  }

  if (params.get("reason") === "not-configured") {
    return (
      <p
        role="status"
        className="mb-4 rounded-lg border border-warning/40 bg-highlight px-4 py-3 text-sm text-muted"
      >
        Administrator sign-in requires Supabase configuration.
      </p>
    );
  }

  return null;
}
