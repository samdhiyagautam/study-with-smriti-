import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/components/content/cards";
import { RichText } from "@/components/content/rich-text";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Breadcrumb, EmptyState } from "@/components/ui/layout-primitives";
import { getResourceBySlug, resolveFileUrl } from "@/lib/content/queries";
import { SITE } from "@/lib/site";

/** Detail pages read the CMS on every request — published edits go live
 *  immediately, with no redeploy (Next 16 blocking routes). */
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) return { title: "Resource not found" };

  const title = resource.seoTitle || resource.title;
  const description =
    resource.seoDescription ||
    resource.description ||
    `${resource.title} — learning resource for Classes 8, 9 and 10.`;

  return {
    title,
    description,
    alternates: { canonical: `/resources/${resource.slug}` },
    openGraph: { type: "article", title, description },
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  if (!resource) notFound();

  const fileUrl = await resolveFileUrl(resource.fileUrl);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: resource.title,
    description: resource.description ?? undefined,
    educationalLevel:
      resource.classLevel === "8-10"
        ? ["8", "9", "10"]
        : resource.classLevel
          ? [resource.classLevel]
          : undefined,
    inLanguage: "en-IN",
    url: `/resources/${resource.slug}`,
    publisher: { "@type": "Organization", name: SITE.name },
    datePublished: resource.publishedAt ?? undefined,
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Learning Resources", href: "/resources" },
          ...(resource.category
            ? [
                {
                  label: resource.category.name,
                  href: `/resources?category=${resource.category.slug}`,
                },
              ]
            : []),
          { label: resource.title },
        ]}
      />

      <header className="mt-6 border-b border-border pb-8">
        <div className="flex flex-wrap gap-2">
          {resource.category ? <Badge tone="blue">{resource.category.name}</Badge> : null}
          {resource.subject ? <Badge tone="green">{resource.subject}</Badge> : null}
          {resource.classLevel ? (
            <Badge tone="neutral">
              {resource.classLevel === "8-10"
                ? "Classes 8–10"
                : `Class ${resource.classLevel}`}
            </Badge>
          ) : null}
          {resource.fileType === "pdf" ? <Badge tone="error">PDF</Badge> : null}
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
          {resource.title}
        </h1>

        {resource.description ? (
          <p className="mt-4 text-lg leading-relaxed text-muted">{resource.description}</p>
        ) : null}

        {resource.publishedAt ? (
          <time
            dateTime={resource.publishedAt}
            className="mt-4 block text-sm text-muted"
          >
            Published {formatDate(resource.publishedAt)}
          </time>
        ) : null}
      </header>

      <div className="mt-8">
        <RichText html={resource.content} />
      </div>

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-bold">Get this resource</h2>
        {fileUrl && resource.fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            data-analytics="resource-download"
            className={`${buttonClasses("secondary", "md")} mt-4`}
          >
            {resource.fileType === "pdf" ? "Download PDF" : "Open resource"}
          </a>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No file is attached to this resource yet. The team can add a PDF from
            the admin panel.{" "}
            <span className="text-xs">[PLACEHOLDER]</span>
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-4 text-sm">
          <Link href="/resources" className="text-primary hover:underline">
            ← Back to all resources
          </Link>
          <Link href="/contact" className="text-primary hover:underline">
            Report a problem with this resource
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <EmptyState
          title="Need more material?"
          description="Browse the full library of notes, worksheets and practice questions."
          action={
            <Link
              href="/resources"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg"
            >
              Back to resources
            </Link>
          }
        />
      </div>
    </article>
  );
}
