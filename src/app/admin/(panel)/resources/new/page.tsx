import { ResourceForm } from "@/components/admin/resource-form";
import { fetchCategoryOptions } from "@/server/admin-data";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";

export default async function NewResourcePage() {
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-warning/40 bg-highlight p-6">
        <h1 className="text-xl font-bold">New resource</h1>
        <p className="mt-2 text-sm text-muted">
          Supabase is not configured — add keys to{" "}
          <code className="rounded bg-surface px-1">.env.local</code> before creating resources.
        </p>
      </div>
    );
  }

  const categories = await fetchCategoryOptions(supabase, "resource_categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New resource</h1>
        <p className="text-sm text-muted">Starts as a draft until you publish it.</p>
      </div>
      <ResourceForm resource={null} categories={categories} submitLabel="Create resource" />
    </div>
  );
}
