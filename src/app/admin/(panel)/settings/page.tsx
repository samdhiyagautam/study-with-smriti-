import {
  CARD_CLASS,
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  TEXTAREA_CLASS,
} from "@/components/admin/field-styles";
import { NotConfigured, StatusNotice } from "@/components/admin/status-notice";
import { FALLBACK_SETTINGS } from "@/lib/content/fallback";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { saveSettingsAction } from "@/server/actions/ops";

const SOCIAL_KEYS = ["facebook", "instagram", "youtube", "telegram"] as const;

function str(values: Map<string, unknown>, key: string, fallback: string): string {
  const value = values.get(key);
  return typeof value === "string" ? value : fallback;
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="Settings" />;

  const { data, error } = await supabase.from("site_settings").select("key, value, is_public");
  if (error) console.warn("[admin/settings] load failed:", error.message);

  const values = new Map<string, unknown>((data ?? []).map((row) => [row.key, row.value]));
  const social = (values.get("social_links") as Record<string, string> | undefined) ?? {};
  const phones = Array.isArray(values.get("contact_phones"))
    ? (values.get("contact_phones") as string[]).join(", ")
    : FALLBACK_SETTINGS.contactPhones.join(", ");
  const analyticsOn = values.get("analytics_enabled") === true;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Site settings</h1>
        <p className="text-sm text-muted">
          These values feed the header, footer and contact sections of the public site — edits go
          live immediately.
        </p>
      </div>

      <StatusNotice status={status} msg={msg} />

      <form action={saveSettingsAction} className="space-y-6">
        <section className={CARD_CLASS} aria-labelledby="settings-general">
          <h2 id="settings-general" className="text-base font-bold">
            General
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="set-site-name">
                Site name *
              </label>
              <input
                id="set-site-name"
                name="siteName"
                required
                maxLength={100}
                defaultValue={str(values, "site_name", FALLBACK_SETTINGS.siteName)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="set-tagline">
                Tagline
              </label>
              <input
                id="set-tagline"
                name="tagline"
                maxLength={120}
                defaultValue={str(values, "tagline", FALLBACK_SETTINGS.tagline)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="set-play-url">
              Google Play URL
            </label>
            <input
              id="set-play-url"
              name="googlePlayUrl"
              type="url"
              maxLength={500}
              defaultValue={str(
                values,
                "google_play_url",
                FALLBACK_SETTINGS.googlePlayUrl || process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || "",
              )}
              placeholder="https://play.google.com/store/apps/details?id=…"
              className={INPUT_CLASS}
            />
            <p className={HINT_CLASS}>
              Leave empty until the app listing is public — the download button then stays hidden
              instead of linking nowhere.
            </p>
          </div>
        </section>

        <section className={CARD_CLASS} aria-labelledby="settings-contact">
          <h2 id="settings-contact" className="text-base font-bold">
            Contact
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="set-email">
                Contact email *
              </label>
              <input
                id="set-email"
                name="contactEmail"
                type="email"
                required
                maxLength={200}
                defaultValue={str(values, "contact_email", FALLBACK_SETTINGS.contactEmail)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="set-phones">
                Phone numbers (comma-separated)
              </label>
              <input
                id="set-phones"
                name="contactPhones"
                maxLength={80}
                defaultValue={phones}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="set-address">
              Office address
            </label>
            <input
              id="set-address"
              name="contactAddress"
              maxLength={300}
              defaultValue={str(values, "contact_address", FALLBACK_SETTINGS.contactAddress)}
              className={INPUT_CLASS}
            />
          </div>
        </section>

        <section className={CARD_CLASS} aria-labelledby="settings-social">
          <h2 id="settings-social" className="text-base font-bold">
            Social links
          </h2>
          <p className={HINT_CLASS}>Empty fields are simply not shown in the footer.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SOCIAL_KEYS.map((key) => (
              <div key={key}>
                <label className={LABEL_CLASS} htmlFor={`set-${key}`}>
                  {key[0].toUpperCase() + key.slice(1)}
                </label>
                <input
                  id={`set-${key}`}
                  name={key}
                  type="url"
                  maxLength={500}
                  defaultValue={social[key] ?? ""}
                  placeholder="https://…"
                  className={INPUT_CLASS}
                />
              </div>
            ))}
          </div>
        </section>

        <section className={CARD_CLASS} aria-labelledby="settings-privacy">
          <h2 id="settings-privacy" className="text-base font-bold">
            Privacy & notes
          </h2>
          <label className="mt-4 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="analyticsEnabled"
              defaultChecked={analyticsOn}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Enable privacy-friendly analytics (only if a provider is configured)
          </label>
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="set-footer-note">
              Internal note (never shown publicly)
            </label>
            <textarea
              id="set-footer-note"
              name="footerNote"
              rows={2}
              maxLength={500}
              defaultValue={str(values, "footer_note", "")}
              className={TEXTAREA_CLASS}
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" className={PRIMARY_BUTTON}>
            Save settings
          </button>
          <p className="text-xs text-muted">Values marked with * are required.</p>
        </div>
      </form>
    </div>
  );
}
