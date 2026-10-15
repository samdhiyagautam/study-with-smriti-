"use server";

import { headers } from "next/headers";
import { sendContactNotification } from "@/lib/email";
import { createAdminSupabase } from "@/lib/supabase/server";
import { allowContactSubmission, hashIp } from "@/server/rate-limit";
import { contactSchema, fieldErrors } from "@/lib/validation/contact";

export interface ContactFormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
}

const SUCCESS_MESSAGE =
  "Thank you — your message has been sent. Our team will reply by email as soon as possible.";

/**
 * Contact form server action.
 * Layers: honeypot + submit-time check → Zod validation → IP rate limiting →
 * service-role insert (RLS keeps it private) → best-effort email notification.
 */
export async function submitContactAction(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
    elapsedMs: String(formData.get("elapsedMs") ?? "0"),
  };

  // 1. Spam heuristics (before doing any work)
  if (raw.website.trim().length > 0) {
    // Honeypot triggered — pretend success, store nothing.
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      errors: fieldErrors(parsed.error),
    };
  }

  const value = parsed.data;
  if (value.elapsedMs < 1500) {
    return {
      status: "error",
      message: "That was submitted too quickly. Please try again.",
    };
  }

  // 2. Rate limiting per hashed IP
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const userAgent = requestHeaders.get("user-agent")?.slice(0, 300) ?? null;

  if (!(await allowContactSubmission(ip))) {
    return {
      status: "error",
      message: "Too many messages from your network. Please try again in a few minutes.",
    };
  }

  // 3. Store privately (service role; table has no public read policies)
  const admin = createAdminSupabase();
  if (!admin) {
    console.error("[contact] SUPABASE_SERVICE_ROLE_KEY not configured — message not stored");
    return {
      status: "error",
      message:
        "The contact form is not fully configured on the server yet. Please email us directly.",
    };
  }

  const { error } = await admin.from("contact_submissions").insert({
    name: value.name,
    email: value.email,
    subject: value.subject,
    message: value.message,
    ip_hash: hashIp(ip),
    user_agent: userAgent,
  });

  if (error) {
    console.error("[contact] insert failed:", error.code ?? error.message);
    return {
      status: "error",
      message: "Something went wrong while sending your message. Please try again later.",
    };
  }

  // 4. Best-effort owner notification (failure is logged, never blocks storage)
  const emailResult = await sendContactNotification({
    name: value.name,
    email: value.email,
    subject: value.subject,
    submittedAt: new Date().toISOString(),
  });
  if (!emailResult.ok) {
    console.warn("[contact] stored, but owner email not sent:", emailResult.reason);
  }

  return { status: "success", message: SUCCESS_MESSAGE };
}
