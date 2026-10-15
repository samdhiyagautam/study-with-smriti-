import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogListing, BlogListingFallback } from "@/components/content/blog-listing";
import { Breadcrumb, PageHeader } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Blog — study tips, subject guides & app news",
  description:
    "Study advice, subject guides, exam preparation tips and Study with Smriti app updates for Classes 8, 9 and 10 students.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <PageHeader
        title="Blog"
        description="Study tips, subject guides, exam preparation and app news for Classes 8, 9 and 10."
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "Blog" }]} />
        <div className="mt-8">
          <Suspense fallback={<BlogListingFallback />}>
            <BlogListing searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
