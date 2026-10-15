import { supabaseConfig } from "@/lib/supabase/config";
import { createAdminSupabase, createServerSupabase } from "@/lib/supabase/server";
import {
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_FAQS,
  FALLBACK_PAGES,
  FALLBACK_POSTS,
  FALLBACK_RESOURCES,
  FALLBACK_SETTINGS,
} from "./fallback";
import type {
  Announcement,
  Faq,
  PageDoc,
  Paged,
  Post,
  PostSummary,
  Resource,
  ResourceSummary,
  SiteSettings,
} from "./types";

/**
 * Public content queries.
 *
 * - Always filter to "published" in code ON TOP OF database RLS (defence in
 *   depth: an admin session rendering a public page must not leak drafts).
 * - When Supabase is not configured, clearly-marked local fallback content is
 *   returned so the site stays reviewable before credentials exist.
 * - Callers wrap these in <Suspense>: data is read per request, so content
 *   published in the admin panel appears immediately without a redeploy.
 */

const PER_PAGE = 9;
const RESOURCE_PER_PAGE = 12;

function htmlOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && "html" in content) {
    const html = (content as { html?: unknown }).html;
    return typeof html === "string" ? html : "";
  }
  return "";
}

/* ----------------------------- settings ---------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabaseConfig.configured) return FALLBACK_SETTINGS;

  const supabase = await createServerSupabase();
  if (!supabase) return FALLBACK_SETTINGS;

  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .eq("is_public", true);

  const values = new Map(
    (data ?? []).map((row) => [row.key, row.value] as const),
  );
  const str = (key: string, fallback: string): string => {
    const value = values.get(key);
    return typeof value === "string" && value.length > 0 ? value : fallback;
  };

  return {
    ...FALLBACK_SETTINGS,
    siteName: str("site_name", FALLBACK_SETTINGS.siteName),
    tagline: str("tagline", FALLBACK_SETTINGS.tagline),
    googlePlayUrl: str(
      "google_play_url",
      FALLBACK_SETTINGS.googlePlayUrl ||
        process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL ||
        "",
    ),
    contactEmail: str("contact_email", FALLBACK_SETTINGS.contactEmail),
    contactAddress: str("contact_address", FALLBACK_SETTINGS.contactAddress),
    contactPhones: Array.isArray(values.get("contact_phones"))
      ? (values.get("contact_phones") as string[])
      : FALLBACK_SETTINGS.contactPhones,
    socialLinks: (values.get("social_links") as Record<string, string>) ??
      FALLBACK_SETTINGS.socialLinks,
    analyticsEnabled: values.get("analytics_enabled") === true,
  };
}

/* -------------------------------- blog ----------------------------------- */

interface PostRow {
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  category: { name: string; slug: string } | null;
  author: { full_name: string | null; email: string } | null;
  blog_post_tags?: Array<{ tag: { name: string; slug: string } }>;
}

function mapPostRow(row: PostRow, withContent: boolean): Post {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: withContent ? htmlOf(row.content) : "",
    featuredImageUrl: row.featured_image_url,
    featuredImageAlt: row.featured_image_alt,
    category: row.category,
    publishedAt: row.published_at,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    tags: (row.blog_post_tags ?? []).map((entry) => entry.tag),
    authorName: row.author?.full_name ?? row.author?.email ?? null,
    viewCount: row.view_count ?? 0,
  };
}

const POST_LIST_SELECT =
  "slug, title, excerpt, featured_image_url, featured_image_alt, published_at, seo_title, seo_description, category:blog_categories(name, slug)";

const POST_DETAIL_SELECT =
  "slug, title, excerpt, content, featured_image_url, featured_image_alt, published_at, seo_title, seo_description, view_count, category:blog_categories(name, slug), author:profiles(full_name, email), blog_post_tags(tag:blog_tags(name, slug))";

export interface PostQuery {
  page?: number;
  category?: string;
  tag?: string;
  q?: string;
  perPage?: number;
}

export async function getPosts(query: PostQuery = {}): Promise<Paged<PostSummary>> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = query.perPage ?? PER_PAGE;

  if (!supabaseConfig.configured) {
    let items = [...FALLBACK_POSTS];
    if (query.category) items = items.filter((p) => p.category?.slug === query.category);
    if (query.tag) items = items.filter((p) => p.tags.some((t) => t.slug === query.tag));
    if (query.q) {
      const needle = query.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          (p.excerpt ?? "").toLowerCase().includes(needle),
      );
    }
    const total = items.length;
    return {
      items: items.slice((page - 1) * perPage, page * perPage),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { items: [], total: 0, page, perPage, totalPages: 1 };

  let builder = supabase
    .from("blog_posts")
    .select(
      query.tag
        ? `blog_post_tags!inner(tag:blog_tags!inner(slug)), ${POST_LIST_SELECT}`
        : POST_LIST_SELECT,
      { count: "exact" },
    )
    .eq("status", "published");

  if (query.category) {
    builder = builder.eq("blog_categories.slug", query.category);
  }
  if (query.q) {
    const needle = query.q.replace(/[%_,()']/g, " ").trim();
    if (needle) builder = builder.or(`title.ilike.%${needle}%,excerpt.ilike.%${needle}%`);
  }
  if (query.tag) {
    builder = builder.eq("blog_post_tags.tag.slug", query.tag);
  }

  const from = (page - 1) * perPage;
  const { data, count } = await builder
    .order("published_at", { ascending: false })
    .range(from, from + perPage - 1);

  const total = count ?? 0;
  return {
    items: (data ?? []).map((row) => mapPostRow(row as unknown as PostRow, false)),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!supabaseConfig.configured) {
    const post = FALLBACK_POSTS.find((p) => p.slug === slug);
    return post ?? null;
  }

  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("blog_posts")
    .select(POST_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data ? mapPostRow(data as unknown as PostRow, true) : null;
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<PostSummary[]> {
  if (!supabaseConfig.configured) {
    return FALLBACK_POSTS.filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        (candidate.category?.slug === post.category?.slug ||
          candidate.tags.some((tag) => post.tags.some((t) => t.slug === tag.slug))),
    ).slice(0, limit);
  }

  const supabase = await createServerSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("blog_posts")
    .select(POST_LIST_SELECT)
    .eq("status", "published")
    .neq("slug", post.slug)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => mapPostRow(row as unknown as PostRow, false));
}

/* ----------------------------- resources --------------------------------- */

interface ResourceRow {
  slug: string;
  title: string;
  description: string | null;
  body: unknown;
  subject: string | null;
  class_level: string | null;
  file_url: string | null;
  file_type: "pdf" | "link" | "none" | null;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  category: { name: string; slug: string } | null;
}

function mapResourceRow(row: ResourceRow, withContent: boolean): Resource {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: withContent ? htmlOf(row.body) : "",
    category: row.category,
    subject: row.subject,
    classLevel: row.class_level,
    fileType: row.file_type,
    fileUrl: row.file_url,
    publishedAt: row.published_at,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    viewCount: row.view_count ?? 0,
  };
}

export interface ResourceQuery {
  page?: number;
  perPage?: number;
  category?: string;
  subject?: string;
  classLevel?: string;
  q?: string;
}

export async function getResources(
  query: ResourceQuery = {},
): Promise<Paged<ResourceSummary>> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = query.perPage ?? RESOURCE_PER_PAGE;

  if (!supabaseConfig.configured) {
    let items = [...FALLBACK_RESOURCES];
    if (query.category) items = items.filter((r) => r.category?.slug === query.category);
    if (query.subject) items = items.filter((r) => r.subject === query.subject);
    if (query.classLevel) items = items.filter((r) => r.classLevel === query.classLevel);
    if (query.q) {
      const needle = query.q.toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(needle) ||
          (r.description ?? "").toLowerCase().includes(needle),
      );
    }
    const total = items.length;
    return {
      items: items.slice((page - 1) * perPage, page * perPage),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { items: [], total: 0, page, perPage, totalPages: 1 };

  let builder = supabase
    .from("resources")
    .select("slug, title, description, subject, class_level, file_type, published_at, seo_title, seo_description, category:resource_categories(name, slug)", {
      count: "exact",
    })
    .eq("status", "published");

  if (query.category) builder = builder.eq("resource_categories.slug", query.category);
  if (query.subject) builder = builder.eq("subject", query.subject);
  if (query.classLevel) builder = builder.eq("class_level", query.classLevel);
  if (query.q) {
    const needle = query.q.replace(/[%_,()']/g, " ").trim();
    if (needle) builder = builder.or(`title.ilike.%${needle}%,description.ilike.%${needle}%`);
  }

  const from = (page - 1) * perPage;
  const { data, count } = await builder
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  const total = count ?? 0;
  return {
    items: (data ?? []).map((row) => mapResourceRow(row as unknown as ResourceRow, false)),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  if (!supabaseConfig.configured) {
    return FALLBACK_RESOURCES.find((r) => r.slug === slug) ?? null;
  }

  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("resources")
    .select(
      "slug, title, description, body, subject, class_level, file_url, file_type, published_at, seo_title, seo_description, view_count, category:resource_categories(name, slug)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data ? mapResourceRow(data as unknown as ResourceRow, true) : null;
}

export async function getFacets(): Promise<{
  categories: Array<{ name: string; slug: string }>;
  subjects: string[];
  classLevels: string[];
}> {
  const fallbackCategories = [
    ...new Map(
      FALLBACK_RESOURCES
        .filter((r) => r.category)
        .map((r) => [r.category!.slug, r.category!]),
    ).values(),
  ];
  const fallback = {
    categories: fallbackCategories,
    subjects: [...new Set(FALLBACK_RESOURCES.map((r) => r.subject).filter(Boolean))] as string[],
    classLevels: ["8", "9", "10", "8-10"],
  };

  if (!supabaseConfig.configured) return fallback;

  const supabase = await createServerSupabase();
  if (!supabase) return fallback;

  const [categoriesResult, subjectsResult] = await Promise.all([
    supabase
      .from("resource_categories")
      .select("name, slug")
      .order("name", { ascending: true }),
    supabase.from("resources").select("subject, class_level").eq("status", "published"),
  ]);

  const rows = subjectsResult.data ?? [];
  return {
    categories: categoriesResult.data ?? fallback.categories,
    subjects: [...new Set(rows.map((r) => r.subject).filter((s): s is string => Boolean(s)))],
    classLevels: [
      ...new Set(rows.map((r) => r.class_level).filter((s): s is string => Boolean(s))),
    ],
  };
}

/* -------------------------- faqs / announcements -------------------------- */

export async function getFaqs(): Promise<Faq[]> {
  if (!supabaseConfig.configured) return FALLBACK_FAQS;

  const supabase = await createServerSupabase();
  if (!supabase) return FALLBACK_FAQS;

  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, category, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) return FALLBACK_FAQS;
  return data.map((row) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    sortOrder: row.sort_order,
  }));
}

export async function getAnnouncements(limit = 5): Promise<Announcement[]> {
  if (!supabaseConfig.configured) return FALLBACK_ANNOUNCEMENTS.slice(0, limit);

  const supabase = await createServerSupabase();
  if (!supabase) return FALLBACK_ANNOUNCEMENTS.slice(0, limit);

  const { data } = await supabase
    .from("announcements")
    .select("id, title, body, type, published_at, expires_at")
    .eq("status", "published")
    .eq("is_archived", false)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!data) return [];
  return data
    .filter((row) => !row.expires_at || row.expires_at > new Date().toISOString())
    .map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      type: row.type as Announcement["type"],
      publishedAt: row.published_at,
      expiresAt: row.expires_at,
    }));
}

/* ------------------------------- file URLs -------------------------------- */

/**
 * Resolves a stored file reference into a usable URL.
 * - `https://…` values pass through (public assets).
 * - Storage paths like `resource-files/xyz.pdf` become short-lived signed
 *   URLs generated server-side with the service-role key (never exposed).
 */
export async function resolveFileUrl(fileUrl: string | null): Promise<string | null> {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const admin = createAdminSupabase();
  if (!admin) return null;

  const separator = fileUrl.indexOf("/");
  if (separator < 0) return null;
  const bucket = fileUrl.slice(0, separator);
  const path = fileUrl.slice(separator + 1);

  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}

/* -------------------------------- pages ---------------------------------- */

export async function getPageBySlug(slug: string): Promise<PageDoc | null> {
  if (!supabaseConfig.configured) {
    return FALLBACK_PAGES.find((page) => page.slug === slug) ?? null;
  }

  const supabase = await createServerSupabase();
  if (!supabase) return null;

  const { data } = await supabase
    .from("pages")
    .select("slug, title, description, content, seo_title, seo_description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) {
    // Fall back to bundled placeholder legal/about content if not in DB yet
    return FALLBACK_PAGES.find((page) => page.slug === slug) ?? null;
  }

  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    content: htmlOf(data.content),
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
  };
}
