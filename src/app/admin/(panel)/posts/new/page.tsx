import { PostForm } from "@/components/admin/post-form";
import { fetchCategoryOptions } from "@/server/admin-data";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";

export default async function NewPostPage() {
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-warning/40 bg-highlight p-6">
        <h1 className="text-xl font-bold">New post</h1>
        <p className="mt-2 text-sm text-muted">
          Supabase is not configured — add keys to <code className="rounded bg-surface px-1">.env.local</code>{" "}
          before creating posts.
        </p>
      </div>
    );
  }

  const categories = await fetchCategoryOptions(supabase, "blog_categories");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New post</h1>
        <p className="text-sm text-muted">Starts as a draft until you set the status to published.</p>
      </div>
      <PostForm post={null} categories={categories} submitLabel="Create post" />
    </div>
  );
}
