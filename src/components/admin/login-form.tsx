"use client";

import { useActionState } from "react";
import { signInAction, type AuthFormState } from "@/server/actions/auth";

const INITIAL: AuthFormState = {};

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, isPending] = useActionState(signInAction, INITIAL);

  if (!configured) {
    return (
      <div
        role="status"
        className="rounded-lg border border-warning/40 bg-highlight p-4 text-sm"
      >
        <p className="font-semibold">Setup required</p>
        <p className="mt-1 text-muted">
          Supabase is not configured yet. Add{" "}
          <code className="rounded bg-surface px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-surface px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          to <code className="rounded bg-surface px-1">.env.local</code>, provision
          the owner account, then restart the server. See README → Supabase setup.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending}
          className="mt-1.5 w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="mt-1.5 w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-soft px-4 py-3 text-sm font-medium text-error"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-fg hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-muted">
        Owner and admin accounts only — there is no public registration.
      </p>
    </form>
  );
}
