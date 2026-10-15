import { ConfirmForm } from "@/components/admin/confirm-form";
import {
  CARD_CLASS,
  DANGER_BUTTON,
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SELECT_CLASS,
  TEXTAREA_CLASS,
} from "@/components/admin/field-styles";
import { NotConfigured, StatusNotice } from "@/components/admin/status-notice";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { deleteAnnouncementAction, saveAnnouncementAction } from "@/server/actions/content";

interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  type: string;
  status: string;
  published_at: string | null;
  expires_at: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  announcement: "General announcement",
  app_update: "App update",
  resource_notice: "Resource notice",
};

/** ISO timestamp → value for <input type="datetime-local"> (local time). */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function AnnouncementCard({ item }: { item: AnnouncementRow }) {
  const fieldId = (name: string) => `ann-${item.id}-${name}`;

  return (
    <li className={CARD_CLASS}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{item.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {TYPE_LABELS[item.type] ?? item.type} · {item.status}
            {item.published_at
              ? ` · live since ${new Date(item.published_at).toLocaleDateString("en-IN")}`
              : ""}
          </p>
        </div>
        <ConfirmForm
          action={deleteAnnouncementAction}
          message={`Delete "${item.title}" permanently?`}
          className="shrink-0"
        >
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className={DANGER_BUTTON}>
            Delete
          </button>
        </ConfirmForm>
      </div>

      <form action={saveAnnouncementAction} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={item.id} />

        <div>
          <label className={LABEL_CLASS} htmlFor={fieldId("title")}>
            Title *
          </label>
          <input
            id={fieldId("title")}
            name="title"
            required
            maxLength={200}
            defaultValue={item.title}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={fieldId("body")}>
            Message *
          </label>
          <textarea
            id={fieldId("body")}
            name="body"
            required
            rows={3}
            maxLength={10000}
            defaultValue={item.body}
            className={TEXTAREA_CLASS}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor={fieldId("type")}>
              Type
            </label>
            <select
              id={fieldId("type")}
              name="type"
              defaultValue={item.type}
              className={SELECT_CLASS}
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor={fieldId("status")}>
              Status
            </label>
            <select
              id={fieldId("status")}
              name="status"
              defaultValue={item.status}
              className={SELECT_CLASS}
            >
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published (live)</option>
              <option value="unpublished">Unpublished (was live)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor={fieldId("expires")}>
              Hide after (optional)
            </label>
            <input
              id={fieldId("expires")}
              name="expiresAt"
              type="datetime-local"
              defaultValue={toLocalInput(item.expires_at)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <button type="submit" className={PRIMARY_BUTTON}>
          Save announcement
        </button>
      </form>
    </li>
  );
}

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="Announcements" />;

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, type, status, published_at, expires_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) console.warn("[admin/announcements] list failed:", error.message);
  const items = (data ?? []) as unknown as AnnouncementRow[];
  const live = items.filter((item) => item.status === "published").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted">
          {live} live · {items.length} total — shown on Home and /announcements.
        </p>
      </div>

      <StatusNotice status={status} msg={msg} />

      <section aria-labelledby="ann-add" className={CARD_CLASS}>
        <h2 id="ann-add" className="text-base font-bold">
          Post an announcement
        </h2>
        <form action={saveAnnouncementAction} className="mt-4 space-y-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="ann-new-title">
              Title *
            </label>
            <input
              id="ann-new-title"
              name="title"
              required
              maxLength={200}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ann-new-body">
              Message *
            </label>
            <textarea
              id="ann-new-body"
              name="body"
              required
              rows={3}
              maxLength={10000}
              placeholder="Plain text — e.g. “Live class timing change for Class 10 Maths this Sunday.”"
              className={TEXTAREA_CLASS}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="ann-new-type">
                Type
              </label>
              <select id="ann-new-type" name="type" defaultValue="announcement" className={SELECT_CLASS}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ann-new-status">
                Status
              </label>
              <select
                id="ann-new-status"
                name="status"
                defaultValue="published"
                className={SELECT_CLASS}
              >
                <option value="published">Published (live)</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="ann-new-expires">
                Hide after (optional)
              </label>
              <input
                id="ann-new-expires"
                name="expiresAt"
                type="datetime-local"
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <button type="submit" className={PRIMARY_BUTTON}>
            Publish announcement
          </button>
          <p className={HINT_CLASS}>
            The publish timestamp is set automatically the first time you publish.
          </p>
        </form>
      </section>

      {items.length === 0 ? (
        <p className="text-sm text-muted">No announcements yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
