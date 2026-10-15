import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout-primitives";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { StatusNotice } from "@/components/admin/status-notice";
import { DANGER_BUTTON, SECONDARY_BUTTON } from "@/components/admin/field-styles";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { deleteResourceAction } from "@/server/actions/content";

interface ResourceRow {
  slug: string;
  title: string;
  status: string;
  subject: string | null;
  class_level: string | null;
  file_type: string | null;
  published_at: string | null;
  updated_at: string;
}

export default async function AdminResourcesPage({
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
        <h1 className="text-xl font-bold">Resources</h1>
        <p className="mt-2 text-sm text-muted">
          Supabase is not configured. Add your project keys to{" "}
          <code className="rounded bg-surface px-1">.env.local</code> to manage resources.
        </p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("resources")
    .select("slug, title, status, subject, class_level, file_type, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) console.warn("[admin/resources] list failed:", error.message);

  const resources: ResourceRow[] = (data ?? []) as unknown as ResourceRow[];
  const published = resources.filter((item) => item.status === "published").length;
  const drafts = resources.filter((item) => item.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Learning resources</h1>
          <p className="text-sm text-muted">
            {published} published · {drafts} draft
            {resources.length >= 200 ? " · showing latest 200" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/resources" target="_blank" className={SECONDARY_BUTTON}>
            View library ↗
          </Link>
          <Link
            href="/admin/resources/new"
            className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
          >
            New resource
          </Link>
        </div>
      </div>

      <StatusNotice status={status} msg={msg} />

      {resources.length === 0 ? (
        <EmptyState
          title="No resources yet"
          description="Add study material — notes, PDFs, links — that students can browse."
          action={
            <Link
              href="/admin/resources/new"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
            >
              New resource
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Title</th>
                <th scope="col" className="px-4 py-3 font-semibold">Subject</th>
                <th scope="col" className="px-4 py-3 font-semibold">Class</th>
                <th scope="col" className="px-4 py-3 font-semibold">File</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resources.map((resource) => (
                <tr key={resource.slug} className="hover:bg-surface">
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      href={`/admin/resources/${resource.slug}`}
                      className="font-medium hover:text-primary"
                    >
                      {resource.title}
                    </Link>
                    <p className="truncate text-xs text-muted">/resources/{resource.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{resource.subject ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {resource.class_level ? `Class ${resource.class_level}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {resource.file_type && resource.file_type !== "none" ? (
                      <Badge tone="blue">{resource.file_type}</Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        resource.status === "published"
                          ? "green"
                          : resource.status === "draft"
                            ? "neutral"
                            : "warning"
                      }
                    >
                      {resource.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/resources/${resource.slug}`}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
                      >
                        Edit
                      </Link>
                      <ConfirmForm
                        action={deleteResourceAction}
                        message={`Delete "${resource.title}" permanently? This cannot be undone.`}
                      >
                        <input type="hidden" name="slug" value={resource.slug} />
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
