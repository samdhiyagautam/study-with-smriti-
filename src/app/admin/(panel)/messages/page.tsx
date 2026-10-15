import { ConfirmForm } from "@/components/admin/confirm-form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout-primitives";
import { DANGER_BUTTON, SECONDARY_BUTTON } from "@/components/admin/field-styles";
import { NotConfigured, StatusNotice } from "@/components/admin/status-notice";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { deleteMessageAction, setMessageStatusAction } from "@/server/actions/ops";

interface MessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
}

const STATUS_TONE: Record<MessageRow["status"], "warning" | "blue" | "neutral"> = {
  unread: "warning",
  read: "blue",
  archived: "neutral",
};

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setMessageStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={SECONDARY_BUTTON}>
        {label}
      </button>
    </form>
  );
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="Messages" />;

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id, name, email, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) console.warn("[admin/messages] list failed:", error.message);
  const messages = (data ?? []) as unknown as MessageRow[];
  const unread = messages.filter((message) => message.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact messages</h1>
        <p className="text-sm text-muted">
          {unread} unread · showing the latest {messages.length} submissions from /contact.
        </p>
      </div>

      <StatusNotice status={status} msg={msg} />

      {messages.length === 0 ? (
        <EmptyState
          title="Inbox is empty"
          description="Messages sent through the contact form land here (and are emailed to the office inbox when Resend is configured)."
        />
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{message.subject}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {message.name} ·{" "}
                    <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                      {message.email}
                    </a>{" "}
                    ·{" "}
                    <time dateTime={message.created_at}>
                      {new Date(message.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </p>
                </div>
                <Badge tone={STATUS_TONE[message.status]}>{message.status}</Badge>
              </div>

              <p className="mt-3 whitespace-pre-line rounded-lg bg-surface p-3 text-sm">
                {message.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {message.status !== "read" ? (
                  <StatusButton id={message.id} status="read" label="Mark read" />
                ) : (
                  <StatusButton id={message.id} status="unread" label="Mark unread" />
                )}
                {message.status !== "archived" ? (
                  <StatusButton id={message.id} status="archived" label="Archive" />
                ) : null}
                <ConfirmForm
                  action={deleteMessageAction}
                  message="Delete this message permanently?"
                >
                  <input type="hidden" name="id" value={message.id} />
                  <button type="submit" className={DANGER_BUTTON}>
                    Delete
                  </button>
                </ConfirmForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
