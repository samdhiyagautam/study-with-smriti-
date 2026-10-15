import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ResourceCard } from "@/components/content/cards";
import { EmptyState, Pagination } from "@/components/ui/layout-primitives";
import { getFacets, getResources } from "@/lib/content/queries";
import type { ResourceQuery } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Learning resources — notes, worksheets & practice material",
  description:
    "Searchable library of subject-wise notes, worksheets, exam preparation material and practice questions for Classes 8, 9 and 10.",
  alternates: { canonical: "/resources" },
};

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function SelectFilter({
  id,
  label,
  name,
  options,
  current,
}: {
  id: string;
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  current: string;
}) {
  if (options.length === 0) return null;
  return (
    <div className="min-w-40 flex-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={current}
        className="mt-1.5 h-11 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm outline-none focus:border-primary"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

async function ResourceLibrary({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(first(params.page)) || 1);
  const query: ResourceQuery = {
    page,
    q: first(params.q) || undefined,
    category: first(params.category) || undefined,
    subject: first(params.subject) || undefined,
    classLevel: first(params.class_level) || undefined,
  };

  const [results, facets] = await Promise.all([
    getResources(query),
    getFacets(),
  ]);

  const hasFilters = Boolean(query.q || query.category || query.subject || query.classLevel);

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/resources"
        className="glass grid gap-4 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-4">
          <label htmlFor="resource-search" className="block text-sm font-medium">
            Search resources
          </label>
          <input
            id="resource-search"
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="e.g. class 10 maths notes, worksheets, science questions"
            className="mt-1.5 h-11 w-full rounded-lg border border-border-strong bg-bg px-3.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <SelectFilter
          id="resource-category"
          label="Category"
          name="category"
          current={query.category ?? ""}
          options={facets.categories.map((category) => ({
            value: category.slug,
            label: category.name,
          }))}
        />
        <SelectFilter
          id="resource-subject"
          label="Subject"
          name="subject"
          current={query.subject ?? ""}
          options={facets.subjects.map((subject) => ({
            value: subject,
            label: subject,
          }))}
        />
        <SelectFilter
          id="resource-class"
          label="Class"
          name="class_level"
          current={query.classLevel ?? ""}
          options={facets.classLevels.map((level) => ({
            value: level,
            label: level === "8-10" ? "Classes 8–10" : `Class ${level}`,
          }))}
        />

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="h-11 flex-1 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-fg hover:bg-primary-hover"
          >
            Apply filters
          </button>
          {hasFilters ? (
            <Link
              href="/resources"
              className="h-11 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-surface"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <p className="text-sm text-muted" role="status">
        {results.total} {results.total === 1 ? "resource" : "resources"} found
        {query.q ? ` for “${query.q}”` : ""}
      </p>

      {results.items.length === 0 ? (
        <EmptyState
          title="No resources match your filters"
          description={
            hasFilters
              ? "Try fewer filters or a different search term."
              : "Study material published from the admin panel will appear here."
          }
          action={
            hasFilters ? (
              <Link
                href="/resources"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg"
              >
                Clear filters
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.items.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={results.totalPages} basePath="/resources" />
    </div>
  );
}

export default function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <h1 className="text-3xl font-bold sm:text-4xl">Learning resources</h1>
          <p className="mt-3 max-w-3xl text-muted sm:text-lg">
            Subject-wise notes, worksheets, exam preparation material and
            practice questions for Classes 8, 9 and 10 — searchable and filterable.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex text-sm text-muted">
            <li>
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <span aria-hidden="true" className="mx-1.5">
                /
              </span>
            </li>
            <li aria-current="page" className="text-text">
              Learning Resources
            </li>
          </ol>
        </nav>

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="space-y-6" aria-hidden="true">
                <div className="h-40 animate-pulse rounded-xl border border-border bg-surface" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-56 animate-pulse rounded-xl border border-border bg-surface"
                    />
                  ))}
                </div>
              </div>
            }
          >
            <ResourceLibrary searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
