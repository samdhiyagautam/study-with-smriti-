import { notFound } from "next/navigation";
import { PostForm, type PostFormValues } from "@/components/admin/post-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { fetchCategoryOptions, richTextToHtml } from "@/server/admin-data";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";

interface EditablePost {
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  category_id: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  blog_post_tags: Array<{ tag: { name: string } | null }>;
}

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { slug } = await params;
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-warning/40 bg-highlight p-6">
        <h1 className="text-xl font-bold">Edit post</h1>
        <p className="mt-2 text-sm text-muted">Supabase is not configured.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug, title, excerpt, content, category_id, status, seo_title, seo_description, featured_image_url, featured_image_alt, blog_post_tags(tag:blog_tags(name))",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) console.warn("[admin/posts] load failed:", error.message);
  if (!data) notFound();

  const row = data as unknown as EditablePost;
  const categories = await fetchCategoryOptions(supabase, "blog_categories");

  const values: PostFormValues = {
    originalSlug: row.slug,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: richTextToHtml(row.content),
    categoryId: row.category_id ?? "",
    tags: (row.blog_post_tags ?? [])
      .map((link) => link.tag?.name)
      .filter((name): name is string => Boolean(name))
      .join(", "),
    status: row.status as PostFormValues["status"],
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    featuredImageUrl: row.featured_image_url ?? "",
    featuredImageAlt: row.featured_image_alt ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit post</h1>
        <p className="text-sm text-muted">/blog/{row.slug}</p>
      </div>
      <StatusNotice status={status} msg={msg} />
      <PostForm post={values} categories={categories} submitLabel="Save changes" />
    </div>
  );
}
