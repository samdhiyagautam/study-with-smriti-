/**
 * Domain types shared by the public site and the admin panel.
 * `content` is a TipTap document serialized as sanitized HTML:
 *   { "html": "<p>…</p>" }
 */

export type ContentStatus = "draft" | "published" | "unpublished";

export interface RichContent {
  html: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  category: Pick<Category, "name" | "slug"> | null;
  publishedAt: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Post extends PostSummary {
  content: string;
  tags: Array<Pick<Category, "name" | "slug">>;
  authorName: string | null;
  viewCount: number;
}

export interface ResourceSummary {
  slug: string;
  title: string;
  description: string | null;
  category: Pick<Category, "name" | "slug"> | null;
  subject: string | null;
  classLevel: string | null;
  fileType: "pdf" | "link" | "none" | null;
  publishedAt: string | null;
}

export interface Resource extends ResourceSummary {
  content: string;
  fileUrl: string | null;
  viewCount: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
}

export type AnnouncementType =
  | "announcement"
  | "app_update"
  | "resource_notice";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface PageDoc {
  slug: string;
  title: string;
  description: string | null;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  googlePlayUrl: string;
  contactEmail: string;
  contactPhones: string[];
  contactAddress: string;
  socialLinks: Record<string, string>;
  analyticsEnabled: boolean;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
