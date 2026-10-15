import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageDocument, PageDocumentFallback } from "@/components/content/page-document";
import { Breadcrumb, PageHeader } from "@/components/ui/layout-primitives";
import { getPageBySlug } from "@/lib/content/queries";

/**
 * Editable legal pages (privacy, terms, copyright, children's privacy).
 * One allow-listed dynamic route keeps them all CMS-managed while any other
 * unknown path still 404s correctly.
 */
const ALLOWED_SLUGS = [
  "privacy-policy",
  "terms-and-conditions",
  "copyright",
  "children-privacy",
] as const;

type LegalSlug = (typeof ALLOWED_SLUGS)[number];

const TITLES: Record<LegalSlug, { title: string; description: string }> = {
  "privacy-policy": {
    title: "Privacy Policy",
    description: "How the Study with Smriti website handles your information.",
  },
  "terms-and-conditions": {
    title: "Terms and Conditions",
    description: "Terms of use for the Study with Smriti website.",
  },
  copyright: {
    title: "Copyright and content ownership",
    description: "Ownership of website and educational content.",
  },
  "children-privacy": {
    title: "Children's privacy information",
    description: "Privacy information for students, parents and guardians.",
  },
};

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!(ALLOWED_SLUGS as readonly string[]).includes(slug)) {
    return { title: "Page not found" };
  }

  const fallback = TITLES[slug as LegalSlug];
  const page = await getPageBySlug(slug);

  const title = page?.seoTitle || page?.title || fallback.title;
  const description = page?.seoDescription || page?.description || fallback.description;

  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    // Draft/placeholder legal text is owner-reviewed content; public pages
    // stay indexable once published, and admin/preview routes never are.
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(ALLOWED_SLUGS as readonly string[]).includes(slug)) notFound();

  const fallback = TITLES[slug as LegalSlug];

  return (
    <>
      <PageHeader
        title={fallback.title}
        description={fallback.description}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: fallback.title }]} />

        <div className="mt-8">
          <Suspense fallback={<PageDocumentFallback />}>
            <PageDocument slug={slug} />
          </Suspense>
        </div>

        <p className="mt-10 rounded-lg border border-border bg-highlight px-4 py-3 text-sm text-muted">
          [PLACEHOLDER — legal review required] This text is a starting point
          prepared for this project and is not legal advice. It must be reviewed
          and approved by the owner (or a qualified professional) before being
          presented as final.
        </p>
      </div>
    </>
  );
}
