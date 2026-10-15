import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout-primitives";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { DANGER_BUTTON, SECONDARY_BUTTON } from "@/components/admin/field-styles";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { deletePostAction } from "@/server/actions/content";

interface PostRow {
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  updated_at: string;
  view_count: number;
  category: { name: string } | null;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-warning/40 bg-highlight p-6">
        <h1 className="text-xl font-bold">Blog posts</h1>
        <p className="mt-2 text-sm text-muted">
          Supabase is not configured. Add your project keys to{" "}
          <code className="rounded bg-surface px-1">.env.local</code> to manage posts.
        </p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug, title, status, published_at, updated_at, view_count, category:blog_categories(name)",
    )
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    console.warn("[admin/posts] list failed:", error.message);
  }

  const posts: PostRow[] = (data ?? []) as unknown as PostRow[];
  const published = posts.filter((post) => post.status === "published").length;
  const drafts = posts.filter((post) => post.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Blog posts</h1>
          <p className="text-sm text-muted">
            {published} published · {drafts} draft
            {posts.length >= 200 ? " · showing latest 200" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/blog" target="_blank" className={SECONDARY_BUTTON}>
            View blog ↗
          </Link>
          <Link href="/admin/posts/new" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
            New post
          </Link>
        </div>
      </div>

      <StatusNotice status={status} msg={msg} />

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Create your first post — it stays a draft until you publish it."
          action={
            <Link href="/admin/posts/new" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover">
              New post
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Title</th>
                <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Published</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Views</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.slug} className="hover:bg-surface">
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      href={`/admin/posts/${post.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {post.title}
                    </Link>
                    <p className="truncate text-xs text-muted">/blog/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {post.category?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={post.status === "published" ? "green" : post.status === "draft" ? "neutral" : "warning"}>
                      {post.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(post.published_at)}</td>
                  <td className="px-4 py-3 text-right text-muted">{post.view_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/posts/${post.slug}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                      >
                        Edit
                      </Link>
                      <ConfirmForm
                        action={deletePostAction}
                        message={`Delete "${post.title}" permanently? This cannot be undone.`}
                      >
                        <input type="hidden" name="slug" value={post.slug} />
                        <button type="submit" className={DANGER_BUTTON}>
                          Delete
                        </button>
                      </ConfirmForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
