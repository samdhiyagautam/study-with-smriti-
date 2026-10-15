import { EmptyState } from "@/components/ui/layout-primitives";
import { HINT_CLASS } from "@/components/admin/field-styles";
import { NotConfigured } from "@/components/admin/status-notice";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";

interface AuditRow {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: { email: string; full_name: string | null } | null;
}

function metadataSummary(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "";
  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return "";
  return entries
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" · ")
    .slice(0, 160);
}

export default async function AdminAuditPage() {
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="Audit log" />;

  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select(
      "id, action, entity, entity_id, metadata, created_at, actor:profiles(email, full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) console.warn("[admin/audit] list failed:", error.message);
  const rows = (data ?? []) as unknown as AuditRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit log</h1>
        <p className="text-sm text-muted">
          Every admin action (create/update/delete, uploads, settings) is recorded here — latest
          {rows.length >= 200 ? " 200" : ""} entries.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Actions from the admin panel will appear here once the database is connected."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">When</th>
                <th scope="col" className="px-4 py-3 font-semibold">Who</th>
                <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                <th scope="col" className="px-4 py-3 font-semibold">Target</th>
                <th scope="col" className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    <time dateTime={row.created_at}>
                      {new Date(row.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {row.actor?.full_name || row.actor?.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">
                      {row.action}
                    </span>
                  </td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-xs text-muted">
                    {row.entity}
                    {row.entity_id ? ` · ${row.entity_id}` : ""}
                  </td>
                  <td className="max-w-[18rem] truncate px-4 py-3 text-xs text-muted">
                    {metadataSummary(row.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className={HINT_CLASS}>
        Audit entries cannot be edited or deleted from the panel — they are append-only via the
        service role.
      </p>
    </div>
  );
}
