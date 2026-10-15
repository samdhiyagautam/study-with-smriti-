"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  submitContactAction,
  type ContactFormState,
} from "@/server/actions/contact";

const INITIAL: ContactFormState = { status: "idle" };

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ id, label, error, required, children, hint }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required ? (
          <span className="ml-1 text-error" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-0.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactAction,
    INITIAL,
  );
  const openedAt = useRef<number | null>(null);
  const elapsedInput = useRef<HTMLInputElement>(null);

  // Record mount time after hydration (never during render/prerender).
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const errors = state.errors ?? {};

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5"
      onSubmitCapture={() => {
        // Time-trap: bots submit instantly, humans take longer.
        if (elapsedInput.current) {
          const opened = openedAt.current;
          elapsedInput.current.value =
            opened === null ? "5000" : String(Math.max(0, Date.now() - opened));
        }
      }}
    >
      {/* Honeypot — hidden from humans, tempting for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <input ref={elapsedInput} type="hidden" name="elapsedMs" defaultValue="0" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Your name" required error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={isPending}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass}
          />
        </Field>

        <Field id="email" label="Email address" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <Field id="subject" label="Subject" required error={errors.subject}>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          disabled={isPending}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          className={inputClass}
          placeholder="e.g. Question about Class 10 science notes"
        />
      </Field>

      <Field
        id="message"
        label="Message"
        required
        error={errors.message}
        hint="Minimum 10 characters. Do not share sensitive personal information."
      >
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          disabled={isPending}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${inputClass} resize-y`}
        />
      </Field>

      {state.status !== "idle" ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg border px-4 py-3 text-sm font-medium ${
            state.status === "success"
              ? "border-success/40 bg-secondary-soft text-success"
              : "border-error/40 bg-error-soft text-error"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
        <p className="text-xs text-muted">
          We use your email only to reply to this message.
        </p>
      </div>
    </form>
  );
}
