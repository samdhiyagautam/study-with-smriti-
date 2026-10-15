import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
}) {
  return (
    <Tag
      className={`rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  level = 2,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  id?: string;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-secondary dark:text-brand-green">
            {eyebrow}
          </p>
        ) : null}
        <Heading
          id={id}
          className="text-2xl font-bold leading-snug sm:text-3xl"
        >
          {title}
        </Heading>
        {description ? (
          <p className="mt-2 text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border-strong bg-surface px-6 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {breadcrumbs ? <Breadcrumb items={breadcrumbs} /> : null}
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-muted sm:text-lg">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Breadcrumb({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? new URL(item.href, siteUrl).toString() : undefined,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <li>
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <span aria-hidden="true">/</span>
              {item.href && index < items.length - 1 ? (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-text">
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    const query = params.toString();
    return `${basePath}${query ? `?${query}` : ""}`;
  };

  const label = (page: number) => `Page ${page}`;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
        >
          ← Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-border px-3 py-2 text-sm text-muted opacity-50">
          ← Previous
        </span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
        page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className="rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-fg"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(page)}
            aria-label={label(page)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
        >
          Next →
        </Link>
      ) : (
        <span className="rounded-lg border border-border px-3 py-2 text-sm text-muted opacity-50">
          Next →
        </span>
      )}
    </nav>
  );
}
