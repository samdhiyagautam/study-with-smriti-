import { z } from "zod";

/**
 * Contact form validation — used on the client for instant feedback AND on
 * the server (authoritative). Never trust the client.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name (at least 2 characters).")
    .max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(200, "Email is too long.")
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Please enter a valid email address."),
  subject: z
    .string()
    .trim()
    .min(3, "Please add a short subject.")
    .max(200, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(5000, "Message is too long (max 5000 characters)."),
  /** Honeypot — must stay empty. Hidden from real users via CSS. */
  website: z.string().max(0, "Spam detected.").optional().or(z.literal("")),
  /** Milliseconds the form was open before submit (spam bots submit instantly). */
  elapsedMs: z.coerce.number().min(0).max(60 * 60 * 1000 * 24),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactParsed = z.output<typeof contactSchema>;

/** Flatten a ZodError into field → message entries. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
