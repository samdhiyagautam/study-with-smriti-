import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, SectionHeading } from "@/components/ui/layout-primitives";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { signOutAction } from "@/server/actions/auth";

/** Fresh metrics on every visit â€” no stale dashboards. */
/** Minimal count helper that keeps the dashboard readable and type-safe. */
async function countHead(
  promise: PromiseLike<{ count: number | null; error: { message: string } | null }>,
  label: string,
): Promise<number> {
  const { count, error } = await promise;
  if (error) {
    console.warn(`[admin/dashboard] count failed (${label}):`, error.message);
    return 0;
  }
  return count ?? 0;
}

export default async function AdminDashboard() {
  const admin = await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) {
    return (
      <div className="rounded-xl border border-warning/40 bg-highlight p-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Supabase is not configured. Add your project keys to{" "}
          <code className="rounded bg-surface px-1">.env.local</code> to load live
          content metrics.
        </p>
      </div>
    );
  }

  const [
    postsPublished,
    postsDraft,
    resources,
    resourcesDraft,
    unreadMessages,
    faqs,
    publishedAnnouncements,
  ] = await Promise.all([
    countHead(
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      "published posts",
    ),
    countHead(
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
      "draft posts",
    ),
    countHead(
      supabase.from("resources").select("id", { count: "exact", head: true }).eq("status", "published"),
      "published resources",
    ),
    countHead(
      supabase.from("resources").select("id", { count: "exact", head: true }).eq("status", "draft"),
      "draft resources",
    ),
    countHead(
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "unread"),
      "unread messages",
    ),
    countHead(
      supabase.from("faqs").select("id", { count: "exact", head: true }).eq("is_published", true),
      "published FAQs",
    ),
    countHead(
      supabase.from("announcements").select("id", { count: "exact", head: true }).eq("status", "published"),
      "live announcements",
    ),
  ]);

  const [recentPosts, recentResources, recentAudit] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("resources")
      .select("slug, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("admin_audit_logs")
      .select("action, entity, entity_id, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const metrics: Array<{
    label: string;
    value: number;
    href?: string;
    tone?: "blue" | "green" | "warning";
  }> = [
    { label: "Published posts", value: postsPublished, href: "/admin/posts", tone: "green" },
    { label: "Draft posts", value: postsDraft, href: "/admin/posts", tone: "blue" },
    { label: "Published resources", value: resources, href: "/admin/resources", tone: "green" },
    { label: "Draft resources", value: resourcesDraft, href: "/admin/resources", tone: "blue" },
    { label: "Unread messages", value: unreadMessages, href: "/admin/messages", tone: "warning" },
    { label: "Published FAQs", value: faqs, href: "/admin/faqs", tone: "blue" },
    { label: "Live announcements", value: publishedAnnouncements, href: "/admin/announcements", tone: "green" },
  ];

  const TILE_TONES: Record<string, { tint: string; chip: string }> = {
    blue: { tint: "bg-primary-soft", chip: "📌" },
    green: { tint: "bg-secondary-soft", chip: "🎉" },
    warning: { tint: "bg-highlight", chip: "📬" },
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted">
            Signed in as {admin.email} ({admin.role})
          </p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-bg"
          >
            Sign out
          </button>
        </form>
      </div>

      <section aria-labelledby="metrics">
        <SectionHeading id="metrics" title="Content metrics" level={3} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const toneStyle = TILE_TONES[metric.tone ?? ""] ?? {
              tint: "border border-border bg-card",
              chip: "📝",
            };
            const tile = (
              <div className={`rounded-2xl p-5 ${toneStyle.tint}`}>
                <p className="text-3xl font-extrabold text-text">
                  {metric.value}{" "}
                  <span className="text-base" aria-hidden="true">
                    {toneStyle.chip}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted">{metric.label}</p>
              </div>
            );
            return metric.href ? (
              <Link key={metric.label} href={metric.href} className="block hover:opacity-90">
                {tile}
              </Link>
            ) : (
              <div key={metric.label}>{tile}</div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          Counts come from the database only â€” no estimated visitors, downloads or
          student numbers are ever invented.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <section aria-labelledby="recent-posts" className="lg:col-span-1">
          <SectionHeading id="recent-posts" title="Recent posts" level={3} />
          <Card>
            <ul className="space-y-3 text-sm">
              {(recentPosts.data ?? []).map((post) => (
                <li key={post.slug} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/admin/posts/${post.slug}`}
                    className="truncate font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <Badge tone={post.status === "published" ? "green" : "neutral"}>
                    {post.status}
                  </Badge>
                </li>
              ))}
              {(recentPosts.data ?? []).length === 0 ? (
                <li className="text-muted">No posts yet.</li>
              ) : null}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="recent-resources" className="lg:col-span-1">
          <SectionHeading id="recent-resources" title="Recent resources" level={3} />
          <Card>
            <ul className="space-y-3 text-sm">
              {(recentResources.data ?? []).map((resource) => (
                <li key={resource.slug} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/admin/resources/${resource.slug}`}
                    className="truncate font-medium hover:text-primary"
                  >
                    {resource.title}
                  </Link>
                  <Badge tone={resource.status === "published" ? "green" : "neutral"}>
                    {resource.status}
                  </Badge>
                </li>
              ))}
              {(recentResources.data ?? []).length === 0 ? (
                <li className="text-muted">No resources yet.</li>
              ) : null}
            </ul>
          </Card>
        </section>

        <section aria-labelledby="recent-activity" className="lg:col-span-1">
          <SectionHeading
            id="recent-activity"
            title="Admin activity"
            level={3}
            action={
              <Link href="/admin/audit" className="text-sm text-primary hover:underline">
                Full log â†’
              </Link>
            }
          />
          <Card>
            <ul className="space-y-3 text-sm">
              {(recentAudit.data ?? []).map((entry, index) => (
                <li key={`${entry.created_at}-${index}`} className="flex justify-between gap-3">
                  <span className="font-medium">
                    {entry.action} <span className="text-muted">{entry.entity}</span>
                  </span>
                  <time
                    dateTime={entry.created_at}
                    className="shrink-0 text-xs text-muted"
                  >
                    {new Date(entry.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </li>
              ))}
              {(recentAudit.data ?? []).length === 0 ? (
                <li className="text-muted">No activity recorded yet.</li>
              ) : null}
            </ul>
          </Card>
        </section>
      </div>
    </div>
  );
}
