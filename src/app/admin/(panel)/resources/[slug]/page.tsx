import { notFound } from "next/navigation";
import { ResourceForm, type ResourceFormValues } from "@/components/admin/resource-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { fetchCategoryOptions, richTextToHtml } from "@/server/admin-data";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";

interface EditableResource {
  slug: string;
  title: string;
  description: string | null;
  body: unknown;
  category_id: string | null;
  subject: string | null;
  class_level: string | null;
  file_url: string | null;
  status: string;
  seo_title: string | null;
  seo_description: string | null;
}

export default async function EditResourcePage({
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
        <h1 className="text-xl font-bold">Edit resource</h1>
        <p className="mt-2 text-sm text-muted">Supabase is not configured.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("resources")
    .select(
      "slug, title, description, body, category_id, subject, class_level, file_url, status, seo_title, seo_description",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) console.warn("[admin/resources] load failed:", error.message);
  if (!data) notFound();

  const row = data as unknown as EditableResource;
  const categories = await fetchCategoryOptions(supabase, "resource_categories");

  const values: ResourceFormValues = {
    originalSlug: row.slug,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    content: richTextToHtml(row.body),
    categoryId: row.category_id ?? "",
    subject: row.subject ?? "",
    classLevel: (row.class_level ?? "") as ResourceFormValues["classLevel"],
    fileUrl: row.file_url ?? "",
    status: row.status as ResourceFormValues["status"],
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit resource</h1>
        <p className="text-sm text-muted">/resources/{row.slug}</p>
      </div>
      <StatusNotice status={status} msg={msg} />
      <ResourceForm resource={values} categories={categories} submitLabel="Save changes" />
    </div>
  );
}
