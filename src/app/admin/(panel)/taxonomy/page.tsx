import { ConfirmForm } from "@/components/admin/confirm-form";
import {
  CARD_CLASS,
  DANGER_BUTTON,
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
} from "@/components/admin/field-styles";
import { NotConfigured, StatusNotice } from "@/components/admin/status-notice";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { createTermAction, deleteTermAction, type TermKind } from "@/server/actions/content";

interface TermRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const SECTIONS: Array<{
  kind: TermKind;
  title: string;
  blurb: string;
  hasDescription: boolean;
}> = [
  {
    kind: "blog-categories",
    title: "Blog categories",
    blurb: "Group posts by topic (shown on blog cards & category pages).",
    hasDescription: true,
  },
  {
    kind: "blog-tags",
    title: "Blog tags",
    blurb: "Free-form labels. New tags are also created automatically from the post editor.",
    hasDescription: false,
  },
  {
    kind: "resource-categories",
    title: "Resource categories",
    blurb: "Group study material in the resource library.",
    hasDescription: true,
  },
];

export default async function TaxonomyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string; kind?: string }>;
}) {
  const { status, msg, kind } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="Categories & tags" />;

  const [blogCategories, blogTags, resourceCategories] = await Promise.all([
    supabase
      .from("blog_categories")
      .select("id, name, slug, description")
      .order("name"),
    supabase.from("blog_tags").select("id, name, slug").order("name"),
    supabase
      .from("resource_categories")
      .select("id, name, slug, description")
      .order("name"),
  ]);

  const terms: Record<TermKind, TermRow[]> = {
    "blog-categories": (blogCategories.data ?? []) as unknown as TermRow[],
    "blog-tags": (blogTags.data ?? []) as unknown as TermRow[],
    "resource-categories": (resourceCategories.data ?? []) as unknown as TermRow[],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Categories & tags</h1>
        <p className="text-sm text-muted">
          A term still used by content cannot be deleted — remove it from those items first.
        </p>
      </div>

      {status && !kind ? <StatusNotice status={status} msg={msg} /> : null}

      {SECTIONS.map((section) => {
        const rows = terms[section.kind];
        const isActiveNotice = !kind || kind === section.kind;

        return (
          <section key={section.kind} aria-labelledby={`taxonomy-${section.kind}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 id={`taxonomy-${section.kind}`} className="text-lg font-bold">
                  {section.title}
                </h2>
                <p className="text-sm text-muted">{section.blurb}</p>
              </div>
              <span className="text-xs text-muted">{rows.length} total</span>
            </div>

            {status && isActiveNotice ? (
              <div className="mt-3">
                <StatusNotice status={status} msg={msg} />
              </div>
            ) : null}

            <div className="mt-3 grid gap-6 lg:grid-cols-2">
              <div className={CARD_CLASS}>
                <h3 className="text-sm font-bold">Add {section.title.replace(/s$/, "")}</h3>
                <form action={createTermAction.bind(null, section.kind)} className="mt-3 space-y-3">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`${section.kind}-name`}>
                      Name *
                    </label>
                    <input
                      id={`${section.kind}-name`}
                      name="name"
                      required
                      maxLength={80}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`${section.kind}-slug`}>
                      Slug (optional — generated from name)
                    </label>
                    <input
                      id={`${section.kind}-slug`}
                      name="slug"
                      maxLength={100}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      className={INPUT_CLASS}
                    />
                  </div>
                  {section.hasDescription ? (
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`${section.kind}-desc`}>
                        Description (optional)
                      </label>
                      <input
                        id={`${section.kind}-desc`}
                        name="description"
                        maxLength={300}
                        className={INPUT_CLASS}
                      />
                    </div>
                  ) : null}
                  <button type="submit" className={PRIMARY_BUTTON}>
                    Add
                  </button>
                </form>
              </div>

              <div className={CARD_CLASS}>
                <h3 className="text-sm font-bold">Existing ({rows.length})</h3>
                {rows.length === 0 ? (
                  <p className={HINT_CLASS}>Nothing here yet.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-border">
                    {rows.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{row.name}</p>
                          <p className="truncate text-xs text-muted">/{row.slug}</p>
                        </div>
                        <ConfirmForm
                          action={deleteTermAction.bind(null, section.kind)}
                          message={`Delete "${row.name}"? It must not be used by any content.`}
                        >
                          <input type="hidden" name="id" value={row.id} />
                          <button type="submit" className={DANGER_BUTTON}>
                            Delete
                          </button>
                        </ConfirmForm>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
