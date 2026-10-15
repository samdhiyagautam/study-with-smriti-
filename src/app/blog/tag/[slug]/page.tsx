import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogListing, BlogListingFallback } from "@/components/content/blog-listing";
import { Breadcrumb, PageHeader } from "@/components/ui/layout-primitives";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  return {
    title: `Articles tagged ${name}`,
    description: `All published articles tagged “${name}” on the Study with Smriti blog.`,
    alternates: { canonical: `/blog/tag/${slug}` },
  };
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");

  return (
    <>
      <PageHeader
        title={`Tag: ${name}`}
        description={`Articles tagged “${name}”.`}
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: name }]} />
        <div className="mt-8">
          <Suspense fallback={<BlogListingFallback />}>
            <BlogListing
              searchParams={searchParams}
              basePath={`/blog/tag/${slug}`}
              preset={{ tag: slug }}
              heading={name}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}
