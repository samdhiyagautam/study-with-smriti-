import Link from "next/link";
import { PostCard } from "@/components/content/cards";
import { EmptyState, Pagination } from "@/components/ui/layout-primitives";
import { getPosts } from "@/lib/content/queries";

export interface BlogListingProps {
  /** Promise from the page's searchParams */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  basePath?: string;
  /** Preset filters for category/tag landing pages */
  preset?: { category?: string; tag?: string };
  heading?: string;
}

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function BlogListing({
  searchParams,
  basePath = "/blog",
  preset,
  heading,
}: BlogListingProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(first(params.page)) || 1);
  const q = first(params.q);
  const category = preset?.category ?? first(params.category);
  const tag = preset?.tag ?? first(params.tag);

  const { items, totalPages, total } = await getPosts({
    page,
    q: q || undefined,
    category: category || undefined,
    tag: tag || undefined,
  });

  const filterSummary = [
    category ? `category: ${category}` : null,
    tag ? `tag: ${tag}` : null,
    q ? `search: “${q}”` : null,
  ].filter(Boolean);

  const toolbar = (
    <form
      method="get"
      action={basePath}
      className="glass flex flex-wrap items-end gap-3 rounded-2xl p-4"
    >
      {preset?.category ? <input type="hidden" name="category" value={preset.category} /> : null}
      {preset?.tag ? <input type="hidden" name="tag" value={preset.tag} /> : null}

      <div className="min-w-52 flex-1">
        <label htmlFor="blog-search" className="block text-sm font-medium">
          Search articles
        </label>
        <input
          id="blog-search"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="e.g. maths, exam tips, class 10"
          className="mt-1.5 h-11 w-full rounded-lg border border-border-strong bg-bg px-3.5 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        className="glow h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-fg transition-all duration-300 hover:bg-primary-hover active:scale-[0.98]"
      >
        Search
      </button>
      {q || category || tag ? (
        <Link
          href={basePath}
          className="h-11 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-surface"
        >
          Clear filters
        </Link>
      ) : null}
    </form>
  );

  return (
    <div className="space-y-6">
      {toolbar}

      <p className="text-sm text-muted" role="status">
        {total} {total === 1 ? "article" : "articles"}
        {filterSummary.length > 0 ? ` · ${filterSummary.join(" · ")}` : ""}
        {heading ? ` · ${heading}` : ""}
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="No articles found"
          description={
            q || category || tag
              ? "Try a different search term or clear the filters."
              : "Articles published from the admin panel will appear here."
          }
          action={
            q || category || tag ? (
              <Link
                href={basePath}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg"
              >
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}

export function BlogListingFallback() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="h-20 animate-pulse rounded-xl border border-border bg-surface" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
