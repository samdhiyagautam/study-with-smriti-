import { CopyButton } from "@/components/admin/copy-button";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout-primitives";
import {
  CARD_CLASS,
  DANGER_BUTTON,
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from "@/components/admin/field-styles";
import { NotConfigured, StatusNotice } from "@/components/admin/status-notice";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { deleteMediaAction, uploadMediaAction } from "@/server/actions/ops";

interface MediaRow {
  id: string;
  url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
  created_at: string;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="Media" />;

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, url, file_name, mime_type, size_bytes, alt_text, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) console.warn("[admin/media] list failed:", error.message);
  const assets = (data ?? []) as unknown as MediaRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Media library</h1>
        <p className="text-sm text-muted">
          {assets.length} image{assets.length === 1 ? "" : "s"} — copy a URL into the post or
          resource editor (featured image / editor images).
        </p>
      </div>

      <StatusNotice status={status} msg={msg} />

      <section aria-labelledby="media-upload" className={CARD_CLASS}>
        <h2 id="media-upload" className="text-base font-bold">
          Upload image
        </h2>
        <form action={uploadMediaAction} className="mt-4 space-y-3" encType="multipart/form-data">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="media-file">
                Image file * (PNG, JPEG or WebP — max 5 MB)
              </label>
              <input
                id="media-file"
                name="file"
                type="file"
                required
                accept="image/png,image/jpeg,image/webp"
                className={`${INPUT_CLASS} file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold`}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="media-alt">
                Alt text * (describe the image)
              </label>
              <input
                id="media-alt"
                name="altText"
                required
                maxLength={300}
                placeholder="e.g. Class 10 maths formula chart"
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <button type="submit" className={PRIMARY_BUTTON}>
            Upload
          </button>
          <p className={HINT_CLASS}>
            PDFs are attached directly on the resource editor instead of here.
          </p>
        </form>
      </section>

      {assets.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Upload an image to get a shareable URL for posts and resources."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <li key={asset.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
              {/* Next Image is intentionally avoided for arbitrary CMS URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.alt_text ?? asset.file_name}
                className="h-36 w-full rounded-lg border border-border bg-surface object-contain"
                loading="lazy"
              />
              <p className="mt-3 truncate text-sm font-medium" title={asset.file_name}>
                {asset.file_name}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {formatSize(asset.size_bytes)} ·{" "}
                <Badge tone="blue">{asset.mime_type.replace("image/", "")}</Badge>
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-muted" title={asset.alt_text ?? ""}>
                alt: {asset.alt_text ?? "—"}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton value={asset.url} />
                <a
                  href={asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SECONDARY_BUTTON}
                >
                  Open ↗
                </a>
              </div>

              <div className="mt-3 border-t border-border pt-3">
                <ConfirmForm
                  action={deleteMediaAction}
                  message={`Delete "${asset.file_name}"? Anything embedding this URL will show a broken image.`}
                >
                  <input type="hidden" name="id" value={asset.id} />
                  <button type="submit" className={DANGER_BUTTON}>
                    Delete image
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
