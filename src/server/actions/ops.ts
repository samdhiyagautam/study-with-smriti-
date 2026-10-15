"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sanitizePlainText, sanitizeUrl } from "@/lib/sanitize";
import { createAdminSupabase, requireAdmin } from "@/lib/supabase/server";
import { serverSupabaseConfig } from "@/lib/supabase/server-config";
import { logAudit } from "@/server/audit";

/** Inbox, settings and media-library operations (admin only). */

/* ------------------------------ contact inbox ---------------------------- */

export async function setMessageStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["unread", "read", "archived"].includes(status)) {
    redirect("/admin/messages");
  }

  const supabase = createAdminSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ status })
      .eq("id", id);
    if (error) console.error("[admin/messages] status update failed:", error.message);
    else {
      await logAudit({
        actorId: admin.userId,
        action: `message.${status}`,
        entity: "contact_submissions",
        entityId: id,
      });
    }
  }

  redirect("/admin/messages?status=saved");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const id = String(formData.get("id") ?? "");
  const supabase = createAdminSupabase();
  if (supabase && id) {
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) console.error("[admin/messages] delete failed:", error.message);
    else {
      await logAudit({
        actorId: admin.userId,
        action: "message.delete",
        entity: "contact_submissions",
        entityId: id,
      });
    }
  }

  redirect("/admin/messages?status=deleted");
}

/* -------------------------------- settings ------------------------------- */

const settingsSchema = z.object({
  siteName: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(120),
  googlePlayUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https:\/\/play\.google\.com\/.+/i.test(value),
      "Must be a https://play.google.com/… link (or empty).",
    ),
  contactEmail: z.string().trim().email("Enter a valid email address."),
  contactPhones: z.string().trim().max(80),
  contactAddress: z.string().trim().max(300),
  facebook: z.string().trim(),
  instagram: z.string().trim(),
  youtube: z.string().trim(),
  telegram: z.string().trim(),
  analyticsEnabled: z.coerce.boolean(),
  footerNote: z.string().trim().max(500),
});

export async function saveSettingsAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const parsed = settingsSchema.safeParse({
    siteName: String(formData.get("siteName") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    googlePlayUrl: String(formData.get("googlePlayUrl") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhones: String(formData.get("contactPhones") ?? ""),
    contactAddress: String(formData.get("contactAddress") ?? ""),
    facebook: String(formData.get("facebook") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    youtube: String(formData.get("youtube") ?? ""),
    telegram: String(formData.get("telegram") ?? ""),
    analyticsEnabled: formData.get("analyticsEnabled") === "on",
    footerNote: String(formData.get("footerNote") ?? ""),
  });

  if (!parsed.success) {
    redirect(
      `/admin/settings?status=error&msg=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
    );
  }

  const value = parsed.data;
  const supabase = createAdminSupabase();
  if (!supabase) redirect("/admin/settings?status=error");

  const phones = value.contactPhones
    .split(/[,\s]+/)
    .map((phone) => phone.replace(/[^\d+]/g, ""))
    .filter((phone) => phone.length >= 10)
    .slice(0, 5);

  const social: Record<string, string> = {};
  for (const [key, url] of [
    ["facebook", value.facebook],
    ["instagram", value.instagram],
    ["youtube", value.youtube],
    ["telegram", value.telegram],
  ] as const) {
    const sanitized = sanitizeUrl(url);
    if (sanitized) social[key] = sanitized;
  }

  const rows = [
    { key: "site_name", value: sanitizePlainText(value.siteName, 100), is_public: true },
    { key: "tagline", value: sanitizePlainText(value.tagline, 120), is_public: true },
    { key: "google_play_url", value: value.googlePlayUrl, is_public: true },
    { key: "contact_email", value: value.contactEmail, is_public: true },
    { key: "contact_phones", value: phones, is_public: true },
    { key: "contact_address", value: sanitizePlainText(value.contactAddress, 300), is_public: true },
    { key: "social_links", value: social, is_public: true },
    { key: "analytics_enabled", value: value.analyticsEnabled, is_public: true },
    { key: "footer_note", value: sanitizePlainText(value.footerNote, 500), is_public: false },
  ];

  const { error } = await supabase.from("site_settings").upsert(
    rows.map((row) => ({
      ...row,
      updated_by: admin.userId,
    })),
    { onConflict: "key" },
  );

  if (error) {
    console.error("[admin/settings] upsert failed:", error.message);
    redirect("/admin/settings?status=error");
  }

  await logAudit({
    actorId: admin.userId,
    action: "settings.update",
    entity: "site_settings",
    entityId: null,
    metadata: { keys: rows.map((row) => row.key) },
  });
  revalidatePath("/", "layout");
  redirect("/admin/settings?status=saved");
}

/* --------------------------------- media --------------------------------- */

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadMediaAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const file = formData.get("file");
  const altText = sanitizePlainText(String(formData.get("altText") ?? ""), 300);

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/media?status=error&msg=Choose%20an%20image%20file");
  }
  if (!IMAGE_TYPES.includes(file.type)) {
    redirect("/admin/media?status=error&msg=Only%20PNG%2C%20JPEG%20and%20WebP%20images%20are%20allowed");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    redirect("/admin/media?status=error&msg=Image%20must%20be%205%20MB%20or%20smaller");
  }
  if (!altText) {
    redirect("/admin/media?status=error&msg=Alt%20text%20is%20required%20(accessibility)");
  }

  const supabase = createAdminSupabase();
  if (!supabase) redirect("/admin/media?status=error");

  const extension = file.name.toLowerCase().endsWith(".png")
    ? "png"
    : file.name.toLowerCase().endsWith(".webp")
      ? "webp"
      : "jpg";
  const baseName = slugifyMedia(file.name);
  const storagePath = `uploads/${Date.now()}-${baseName}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("site-media")
    .upload(storagePath, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[admin/media] upload failed:", uploadError.message);
    redirect("/admin/media?status=error&msg=Upload%20failed");
  }

  const publicUrl = `${serverSupabaseConfig.url}/storage/v1/object/public/site-media/${storagePath}`;

  const { error: insertError } = await supabase.from("media_assets").insert({
    storage_path: `site-media/${storagePath}`,
    url: publicUrl,
    file_name: sanitizePlainText(file.name, 200),
    mime_type: file.type,
    size_bytes: file.size,
    alt_text: altText,
    uploaded_by: admin.userId,
  });

  if (insertError) {
    console.error("[admin/media] record failed:", insertError.message);
    // Roll the orphaned object back
    await supabase.storage.from("site-media").remove([storagePath]);
    redirect("/admin/media?status=error&msg=Could%20not%20record%20the%20upload");
  }

  await logAudit({
    actorId: admin.userId,
    action: "media.upload",
    entity: "media_assets",
    entityId: storagePath,
    metadata: { size: file.size, type: file.type },
  });
  redirect("/admin/media?status=saved");
}

function slugifyMedia(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image"
  );
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const id = String(formData.get("id") ?? "");
  const supabase = createAdminSupabase();
  if (supabase && id) {
    const { data: row } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    if (row) {
      const separator = row.storage_path.indexOf("/");
      const bucket = row.storage_path.slice(0, separator);
      const path = row.storage_path.slice(separator + 1);
      if (bucket && path) {
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([path]);
        if (storageError) {
          console.warn("[admin/media] storage remove failed:", storageError.message);
        }
      }

      const { error } = await supabase.from("media_assets").delete().eq("id", id);
      if (error) console.error("[admin/media] delete failed:", error.message);
      else {
        await logAudit({
          actorId: admin.userId,
          action: "media.delete",
          entity: "media_assets",
          entityId: id,
        });
      }
    }
  }

  redirect("/admin/media?status=deleted");
}
