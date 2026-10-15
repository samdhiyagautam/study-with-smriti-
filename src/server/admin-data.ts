import "server-only";

import type { createServerSupabase } from "@/lib/supabase/server";
import type { FormOption } from "@/components/admin/post-form";

type ServerClient = Awaited<ReturnType<typeof createServerSupabase>>;

/** Category options for editor dropdowns (works with the session client). */
export async function fetchCategoryOptions(
  supabase: NonNullable<ServerClient>,
  table: "blog_categories" | "resource_categories",
): Promise<FormOption[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id, name")
    .order("name", { ascending: true })
    .limit(200);

  if (error) {
    console.warn(`[admin] category load failed (${table}):`, error.message);
    return [];
  }
  return (data ?? []) as FormOption[];
}

/** JSONB rich text ({ html }) → HTML string (tolerates older `[]` rows). */
export function richTextToHtml(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "html" in value) {
    const html = (value as { html?: unknown }).html;
    if (typeof html === "string") return html;
  }
  return "";
}
