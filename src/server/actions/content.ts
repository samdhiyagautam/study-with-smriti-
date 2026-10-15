"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sanitizePlainText, sanitizeRichText, sanitizeUrl } from "@/lib/sanitize";
import { createAdminSupabase, requireAdmin } from "@/lib/supabase/server";
import { logAudit } from "@/server/audit";

/**
 * Admin content actions. Every action:
 *   1. verifies session + database role (requireAdmin),
 *   2. validates with Zod (server is authoritative),
 *   3. sanitizes all rich text server-side,
 *   4. writes with the service role (RLS also still applies),
 *   5. records an audit entry.
 */

export interface ActionState {
  status: "idle" | "saved" | "error";
  message?: string;
  errors?: Record<string, string>;
}

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug must be at least 3 characters.")
  .max(100, "Slug is too long.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => sanitizeUrl(value))
  .refine((value) => value === "" || value.length <= 500, "URL is too long.");

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function zodErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function notAuthorized(): ActionState {
  return {
    status: "error",
    message: "Your session is missing admin rights. Sign in again.",
  };
}

function publishTimestamp(
  current: string | null | undefined,
  status: string,
): string | null {
  if (status !== "published") return current ?? null;
  return current ?? new Date().toISOString();
}

/* ------------------------------- blog posts ------------------------------ */

const postSchema = z.object({
  originalSlug: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  slug: slugSchema.optional().or(z.literal("")),
  excerpt: z.string().trim().max(500, "Excerpt must be 500 characters or fewer.").optional(),
  content: z.string().max(400_000, "Content is too large."),
  categoryId: z.string().uuid("Choose a valid category.").nullable().optional(),
  tagsCsv: z.string().max(500).optional(),
  status: z.enum(["draft", "published", "unpublished"]),
  seoTitle: z.string().trim().max(70, "SEO title must be 70 characters or fewer.").optional(),
  seoDescription: z
    .string()
    .trim()
    .max(170, "SEO description must be 170 characters or fewer.")
    .optional(),
  featuredImageUrl: optionalUrl.optional(),
  featuredImageAlt: z.string().trim().max(300).optional(),
});

export async function savePostAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return notAuthorized();

  const parsed = postSchema.safeParse({
    originalSlug: String(formData.get("originalSlug") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    categoryId: (formData.get("categoryId") as string) || null,
    tagsCsv: String(formData.get("tagsCsv") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    featuredImageUrl: String(formData.get("featuredImageUrl") ?? ""),
    featuredImageAlt: String(formData.get("featuredImageAlt") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: zodErrors(parsed.error),
    };
  }

  const value = parsed.data;
  const originalSlug = (value.originalSlug ?? "").trim();
  const slug = value.slug || slugify(value.title);
  const slugCheck = slugSchema.safeParse(slug);
  if (!slugCheck.success) {
    return {
      status: "error",
      message: "Could not build a valid slug from the title — edit it manually.",
      errors: { slug: slugCheck.error.issues[0]?.message ?? "Invalid slug." },
    };
  }

  const supabase = createAdminSupabase();
  if (!supabase) {
    return {
      status: "error",
      message: "Server credentials missing (SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  // Uniqueness check (23505 is still caught below as a second line of defence)
  if (slug !== originalSlug) {
    const { data: conflict } = await supabase
      .from("blog_posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (conflict) {
      return {
        status: "error",
        message: "Another post already uses this slug.",
        errors: { slug: "This slug is already taken." },
      };
    }
  }

  const nowPublishedAt = await resolveExistingPublishedAt(
    "blog_posts",
    originalSlug,
    value.status,
  );

  const record = {
    title: sanitizePlainText(value.title, 200),
    slug,
    excerpt: sanitizePlainText(value.excerpt ?? "", 500) || null,
    content: { html: sanitizeRichText(value.content) },
    category_id: value.categoryId || null,
    status: value.status,
    published_at: nowPublishedAt,
    seo_title: sanitizePlainText(value.seoTitle ?? "", 70) || null,
    seo_description: sanitizePlainText(value.seoDescription ?? "", 170) || null,
    featured_image_url: sanitizeUrl(value.featuredImageUrl ?? "") || null,
    featured_image_alt: sanitizePlainText(value.featuredImageAlt ?? "", 300) || null,
  };

  // Alt text is required whenever an image is present (database constraint)
  if (record.featured_image_url && !record.featured_image_alt) {
    return {
      status: "error",
      message: "Featured image alt text is required for accessibility.",
      errors: { featuredImageAlt: "Add a short description of the image." },
    };
  }

  let error: { message: string; code?: string } | null = null;
  let savedId: string | null = null;

  if (originalSlug) {
    const result = await supabase
      .from("blog_posts")
      .update(record)
      .eq("slug", originalSlug)
      .select("slug, id")
      .maybeSingle();
    error = result.error;
    if (!error && !result.data) {
      error = { message: "Post not found (it may have been deleted)." };
    }
    savedId = result.data?.id ?? null;
  } else {
    const result = await supabase
      .from("blog_posts")
      .insert({ ...record, author_id: admin.userId })
      .select("slug, id")
      .single();
    error = result.error;
    savedId = result.data?.id ?? null;
  }

  if (error) {
    console.error("[admin/posts] save failed:", error.message);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "That slug is already in use."
          : "Could not save the post. Check the fields and try again.",
    };
  }

  if (savedId) {
    await applyPostTags(supabase, savedId, value.tagsCsv ?? "");
  }

  await logAudit({
    actorId: admin.userId,
    action: originalSlug ? "post.update" : "post.create",
    entity: "blog_posts",
    entityId: slug,
    metadata: { status: value.status },
  });
  revalidatePath("/", "layout");

  redirect(`/admin/posts/${slug}?status=saved`);
}

/**
 * Resolves comma-separated tag names (creating missing tags) and links them
 * to the post, replacing any previous links.
 */
async function applyPostTags(
  supabase: NonNullable<ReturnType<typeof createAdminSupabase>>,
  postId: string,
  tagsCsv: string,
): Promise<void> {
  const names = [
    ...new Set(
      tagsCsv
        .split(",")
        .map((name) => sanitizePlainText(name, 60).trim())
        .filter(Boolean),
    ),
  ].slice(0, 15);

  const { error: clearError } = await supabase
    .from("blog_post_tags")
    .delete()
    .eq("post_id", postId);
  if (clearError) {
    console.warn("[admin/posts] clearing tags failed:", clearError.message);
    return;
  }

  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;

    let { data: tag } = await supabase
      .from("blog_tags")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!tag) {
      const { data: created, error: createError } = await supabase
        .from("blog_tags")
        .insert({ name, slug })
        .select("id")
        .maybeSingle();
      if (createError) {
        console.warn("[admin/posts] tag create failed:", createError.message);
        continue;
      }
      tag = created;
    }

    if (tag) {
      const { error: linkError } = await supabase
        .from("blog_post_tags")
        .insert({ post_id: postId, tag_id: tag.id });
      if (linkError && linkError.code !== "23505") {
        console.warn("[admin/posts] tag link failed:", linkError.message);
      }
    }
  }
}

async function resolveExistingPublishedAt(
  table: "blog_posts" | "resources",
  slug: string,
  status: string,
): Promise<string | null> {
  if (!slug) return status === "published" ? new Date().toISOString() : null;

  const admin = createAdminSupabase();
  if (!admin) return null;
  const { data } = await admin
    .from(table)
    .select("published_at")
    .eq("slug", slug)
    .maybeSingle();
  return publishTimestamp(data?.published_at ?? null, status);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/posts");

  const supabase = createAdminSupabase();
  if (supabase) {
    const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
    if (error) console.error("[admin/posts] delete failed:", error.message);
    else {
      await logAudit({
        actorId: admin.userId,
        action: "post.delete",
        entity: "blog_posts",
        entityId: slug,
      });
    }
  }

  revalidatePath("/", "layout");
  redirect("/admin/posts?status=deleted");
}

/* -------------------------------- resources ------------------------------ */

const resourceSchema = z.object({
  originalSlug: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  slug: slugSchema.optional().or(z.literal("")),
  description: z.string().trim().max(500, "Max 500 characters.").optional(),
  content: z.string().max(400_000, "Content is too large."),
  categoryId: z.string().uuid("Choose a valid category.").nullable().optional(),
  subject: z.string().trim().max(80).optional(),
  classLevel: z
    .enum(["8", "9", "10", "8-10", ""])
    .optional()
    .or(z.literal("")),
  fileUrl: optionalUrl.optional(),
  status: z.enum(["draft", "published", "unpublished"]),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
});

const PDF_TYPE = "application/pdf";
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export async function saveResourceAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return notAuthorized();

  const parsed = resourceSchema.safeParse({
    originalSlug: String(formData.get("originalSlug") ?? ""),
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    content: String(formData.get("content") ?? ""),
    categoryId: (formData.get("categoryId") as string) || null,
    subject: String(formData.get("subject") ?? ""),
    classLevel: String(formData.get("classLevel") ?? ""),
    fileUrl: String(formData.get("fileUrl") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      errors: zodErrors(parsed.error),
    };
  }

  const value = parsed.data;
  const originalSlug = (value.originalSlug ?? "").trim();
  const slug = value.slug || slugify(value.title);
  if (!slugSchema.safeParse(slug).success) {
    return {
      status: "error",
      message: "Could not build a valid slug — edit it manually.",
      errors: { slug: "Invalid slug." },
    };
  }

  const supabase = createAdminSupabase();
  if (!supabase) {
    return {
      status: "error",
      message: "Server credentials missing (SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  if (slug !== originalSlug) {
    const { data: conflict } = await supabase
      .from("resources")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (conflict) {
      return {
        status: "error",
        message: "Another resource already uses this slug.",
        errors: { slug: "This slug is already taken." },
      };
    }
  }

  // Optional PDF attachment
  let fileUrl = sanitizeUrl(value.fileUrl ?? "");
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.type !== PDF_TYPE) {
      return {
        status: "error",
        message: "Only PDF files can be attached to resources.",
        errors: { file: "Choose a PDF file." },
      };
    }
    if (file.size > MAX_FILE_BYTES) {
      return {
        status: "error",
        message: "PDF is larger than 5 MB.",
        errors: { file: "Maximum size is 5 MB." },
      };
    }

    const safeName = `${slug}-${Date.now()}.pdf`;
    const path = `resource-files/${slug}/${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from("resource-files")
      .upload(`${slug}/${safeName}`, bytes, { contentType: PDF_TYPE, upsert: true });

    if (uploadError) {
      console.error("[admin/resources] upload failed:", uploadError.message);
      return {
        status: "error",
        message: "PDF upload failed. Try again or paste a file URL instead.",
        errors: { file: uploadError.message },
      };
    }
    fileUrl = path;
  }

  const publishedAt = await resolveExistingPublishedAt(
    "resources",
    originalSlug,
    value.status,
  );

  const record = {
    title: sanitizePlainText(value.title, 200),
    slug,
    description: sanitizePlainText(value.description ?? "", 500) || null,
    body: { html: sanitizeRichText(value.content) },
    category_id: value.categoryId || null,
    subject: sanitizePlainText(value.subject ?? "", 80) || null,
    class_level: value.classLevel || null,
    file_url: fileUrl || null,
    file_type: fileUrl ? (fileUrl.startsWith("http") ? "link" : "pdf") : "none",
    status: value.status,
    published_at: publishedAt,
    seo_title: sanitizePlainText(value.seoTitle ?? "", 70) || null,
    seo_description: sanitizePlainText(value.seoDescription ?? "", 170) || null,
  };

  let error: { message: string; code?: string } | null = null;

  if (originalSlug) {
    const result = await supabase
      .from("resources")
      .update(record)
      .eq("slug", originalSlug)
      .select("slug")
      .maybeSingle();
    error = result.error;
    if (!error && !result.data) error = { message: "Resource not found." };
  } else {
    const result = await supabase
      .from("resources")
      .insert({ ...record, created_by: admin.userId })
      .select("slug")
      .single();
    error = result.error;
  }

  if (error) {
    console.error("[admin/resources] save failed:", error.message);
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "That slug is already in use."
          : "Could not save the resource. Try again.",
    };
  }

  await logAudit({
    actorId: admin.userId,
    action: originalSlug ? "resource.update" : "resource.create",
    entity: "resources",
    entityId: slug,
    metadata: { status: value.status, file: Boolean(fileUrl) },
  });
  revalidatePath("/", "layout");

  redirect(`/admin/resources/${slug}?status=saved`);
}

export async function deleteResourceAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) redirect("/admin/resources");

  const supabase = createAdminSupabase();
  if (supabase) {
    const { error } = await supabase.from("resources").delete().eq("slug", slug);
    if (error) console.error("[admin/resources] delete failed:", error.message);
    else {
      await logAudit({
        actorId: admin.userId,
        action: "resource.delete",
        entity: "resources",
        entityId: slug,
      });
    }
  }

  revalidatePath("/", "layout");
  redirect("/admin/resources?status=deleted");
}

/* ---------------------------------- FAQs --------------------------------- */

const faqSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  question: z.string().trim().min(3, "Question is too short.").max(300),
  answer: z.string().trim().min(3, "Answer is too short.").max(5000),
  category: z.string().trim().max(80).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isPublished: z.coerce.boolean(),
});

export async function saveFaqAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const parsed = faqSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    category: String(formData.get("category") ?? ""),
    sortOrder: String(formData.get("sortOrder") ?? "0"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    redirect(`/admin/faqs?status=error&msg=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }

  const value = parsed.data;
  const supabase = createAdminSupabase();
  if (!supabase) redirect("/admin/faqs?status=error");

  const record = {
    question: sanitizePlainText(value.question, 300),
    answer: sanitizePlainText(value.answer, 5000),
    category: sanitizePlainText(value.category ?? "", 80) || null,
    sort_order: value.sortOrder,
    is_published: value.isPublished,
  };

  const { error } = value.id
    ? await supabase.from("faqs").update(record).eq("id", value.id)
    : await supabase.from("faqs").insert(record);

  if (error) {
    console.error("[admin/faqs] save failed:", error.message);
    redirect("/admin/faqs?status=error");
  }

  await logAudit({
    actorId: admin.userId,
    action: value.id ? "faq.update" : "faq.create",
    entity: "faqs",
    entityId: value.id || record.question.slice(0, 40),
  });
  revalidatePath("/", "layout");
  redirect("/admin/faqs?status=saved");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const id = String(formData.get("id") ?? "");
  const supabase = createAdminSupabase();
  if (supabase && id) {
    await supabase.from("faqs").delete().eq("id", id);
    await logAudit({
      actorId: admin.userId,
      action: "faq.delete",
      entity: "faqs",
      entityId: id,
    });
  }
  revalidatePath("/", "layout");
  redirect("/admin/faqs?status=deleted");
}

/* ------------------------------ announcements ---------------------------- */

const announcementSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Title is too short.").max(200),
  body: z.string().trim().min(5, "Body is too short.").max(10_000),
  type: z.enum(["announcement", "app_update", "resource_notice"]),
  status: z.enum(["draft", "published", "unpublished"]),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function saveAnnouncementAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const parsed = announcementSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    type: String(formData.get("type") ?? "announcement"),
    status: String(formData.get("status") ?? "draft"),
    publishedAt: String(formData.get("publishedAt") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
  });

  if (!parsed.success) {
    redirect(`/admin/announcements?status=error&msg=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`);
  }

  const value = parsed.data;
  const supabase = createAdminSupabase();
  if (!supabase) redirect("/admin/announcements?status=error");

  const existing = await supabase
    .from("announcements")
    .select("published_at")
    .eq("id", value.id || "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  const record = {
    title: sanitizePlainText(value.title, 200),
    body: sanitizePlainText(value.body, 10_000),
    type: value.type,
    status: value.status,
    published_at: publishTimestamp(
      existing.data?.published_at ?? null,
      value.status,
    ),
    expires_at: value.expiresAt ? new Date(value.expiresAt).toISOString() : null,
  };

  const { error } = value.id
    ? await supabase.from("announcements").update(record).eq("id", value.id)
    : await supabase
        .from("announcements")
        .insert({ ...record, created_by: admin.userId });

  if (error) {
    console.error("[admin/announcements] save failed:", error.message);
    redirect("/admin/announcements?status=error");
  }

  await logAudit({
    actorId: admin.userId,
    action: value.id ? "announcement.update" : "announcement.create",
    entity: "announcements",
    entityId: value.id || record.title.slice(0, 40),
  });
  revalidatePath("/", "layout");
  redirect("/admin/announcements?status=saved");
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const id = String(formData.get("id") ?? "");
  const supabase = createAdminSupabase();
  if (supabase && id) {
    await supabase.from("announcements").delete().eq("id", id);
    await logAudit({
      actorId: admin.userId,
      action: "announcement.delete",
      entity: "announcements",
      entityId: id,
    });
  }
  revalidatePath("/", "layout");
  redirect("/admin/announcements?status=deleted");
}

/* ------------------------------- taxonomy -------------------------------- */

const termSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(80),
  slug: slugSchema.optional().or(z.literal("")),
  description: z.string().trim().max(300).optional(),
});

export type TermKind = "blog-categories" | "blog-tags" | "resource-categories";

const TERM_TABLES: Record<TermKind, string> = {
  "blog-categories": "blog_categories",
  "blog-tags": "blog_tags",
  "resource-categories": "resource_categories",
};

function termActionUrl(kind: TermKind, params: string): string {
  return `/admin/taxonomy?kind=${kind}&${params}`;
}

async function handleTermAction(
  kind: TermKind,
  formData: FormData,
  mode: "create" | "delete",
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login?denied=1");

  const supabase = createAdminSupabase();
  if (!supabase) redirect(termActionUrl(kind, "status=error"));

  const table = TERM_TABLES[kind];

  if (mode === "delete") {
    const id = String(formData.get("id") ?? "");
    if (id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) {
        // Likely referenced by content → protect against accidental breakage
        console.warn(`[admin/taxonomy] delete refused: ${error.message}`);
        redirect(
          termActionUrl(
            kind,
            `status=error&msg=${encodeURIComponent("Still in use by some content. Remove it from those items first.")}`,
          ),
        );
      }
      await logAudit({
        actorId: admin.userId,
        action: `${kind}.delete`,
        entity: table,
        entityId: id,
      });
    }
    revalidatePath("/", "layout");
    redirect(termActionUrl(kind, "status=deleted"));
  }

  const parsed = termSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  if (!parsed.success) {
    redirect(
      termActionUrl(
        kind,
        `status=error&msg=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid input")}`,
      ),
    );
  }

  const value = parsed.data;
  const slug = value.slug || slugify(value.name);
  if (!slugSchema.safeParse(slug).success) {
    redirect(termActionUrl(kind, "status=error"));
  }

  const record: Record<string, unknown> = {
    name: sanitizePlainText(value.name, 80),
    slug,
  };
  if (kind !== "blog-tags") {
    record.description = sanitizePlainText(value.description ?? "", 300) || null;
  }

  const { error } = await supabase.from(table).insert(record);
  if (error) {
    redirect(
      termActionUrl(
        kind,
        `status=error&msg=${encodeURIComponent(error.code === "23505" ? "That name or slug already exists." : "Could not save.")}`,
      ),
    );
  }

  await logAudit({
    actorId: admin.userId,
    action: `${kind}.create`,
    entity: table,
    entityId: slug,
  });
  revalidatePath("/", "layout");
  redirect(termActionUrl(kind, "status=saved"));
}

export async function createTermAction(
  kind: TermKind,
  formData: FormData,
): Promise<void> {
  await handleTermAction(kind, formData, "create");
}

export async function deleteTermAction(
  kind: TermKind,
  formData: FormData,
): Promise<void> {
  await handleTermAction(kind, formData, "delete");
}
