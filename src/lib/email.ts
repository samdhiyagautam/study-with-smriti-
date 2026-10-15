import "server-only";

import { Resend } from "resend";
import { serverSupabaseConfig } from "@/lib/supabase/server-config";

/**
 * Server-side email sending (Resend).
 * - Credentials only ever come from environment variables.
 * - Failures are logged WITHOUT message content (privacy) and never thrown at
 *   the visitor: the submission is already stored, so the form still succeeds.
 * - We never claim an email was delivered — only that it was accepted by the
 *   provider (see README for domain verification steps).
 */

export interface ContactNotification {
  name: string;
  email: string;
  subject: string;
  submittedAt: string;
}

export async function sendContactNotification(
  notification: ContactNotification,
): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.OWNER_EMAIL;

  if (!apiKey || !from || !to) {
    return { ok: false, reason: "email-not-configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: notification.email,
      subject: `[Website] ${notification.subject}`,
      text: [
        `New contact form submission on Study with Smriti`,
        ``,
        `Name: ${notification.name}`,
        `Email: ${notification.email}`,
        `Subject: ${notification.subject}`,
        `Submitted: ${notification.submittedAt}`,
        ``,
        `Full message is available in the admin inbox.`,
      ].join("\n"),
    });

    if (error) {
      console.error("[email] provider rejected message:", error.name);
      return { ok: false, reason: "provider-error" };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    console.error(
      "[email] unexpected failure:",
      error instanceof Error ? error.message : "unknown",
      "service-configured:",
      serverSupabaseConfig.adminConfigured,
    );
    return { ok: false, reason: "exception" };
  }
}
