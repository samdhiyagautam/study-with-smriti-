import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatDate, PostCard, CardGridSkeleton } from "@/components/content/cards";
import { RichText } from "@/components/content/rich-text";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, SectionHeading } from "@/components/ui/layout-primitives";
import { getPostBySlug, getRelatedPosts, getSiteSettings } from "@/lib/content/queries";
import type { Post } from "@/lib/content/types";

/** Fresh CMS content on every request; no redeploy needed after publishing. */

async function RelatedPosts({ post }: { post: Post }) {
  const related = await getRelatedPosts(post, 3);
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-12">
      <SectionHeading
        id="related-heading"
        eyebrow="Keep reading"
        title="Related articles"
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((item) => (
          <PostCard key={item.slug} post={item} />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // Thrown during metadata generation so the response is a real HTTP 404
  // (throwing after streaming starts would produce a soft 404 with status 200).
  if (!post) notFound();

  const settings = await getSiteSettings();
  const title = post.seoTitle || post.title;
  const description =
    post.seoDescription ||
    post.excerpt ||
    `${post.title} — article on the ${settings.siteName} blog.`;
  const url = `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: settings.siteName,
      publishedTime: post.publishedAt ?? undefined,
      authors: post.authorName ? [post.authorName] : undefined,
      images: post.featuredImageUrl
        ? [{ url: post.featuredImageUrl, alt: post.featuredImageAlt ?? post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    author: post.authorName ? { "@type": "Organization", name: post.authorName } : undefined,
    publisher: { "@type": "Organization", name: settings.siteName },
    image: post.featuredImageUrl ?? undefined,
    mainEntityOfPage: `/blog/${post.slug}`,
    keywords: post.tags.map((tag) => tag.name).join(", "),
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Blog", href: "/blog" },
          ...(post.category
            ? [
                {
                  label: post.category.name,
                  href: `/blog/category/${post.category.slug}`,
                },
              ]
            : []),
          { label: post.title },
        ]}
      />

      <header className="mt-6 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <Link href={`/blog/category/${post.category.slug}`}>
              <Badge tone="blue">{post.category.name}</Badge>
            </Link>
          ) : null}
          <time dateTime={post.publishedAt ?? undefined} className="text-sm text-muted">
            {formatDate(post.publishedAt)}
          </time>
          {post.authorName ? (
            <span className="text-sm text-muted">· {post.authorName}</span>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>
        ) : null}
      </header>

      {post.featuredImageUrl && post.featuredImageAlt ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS-supplied URL; replace with next/image if same-origin
        <img
          src={post.featuredImageUrl}
          alt={post.featuredImageAlt}
          className="mt-8 w-full rounded-xl"
          loading="lazy"
        />
      ) : null}

      <div className="mt-8">
        <RichText html={post.content} />
      </div>

      {post.tags.length > 0 ? (
        <footer className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <span className="text-sm font-semibold">Tags:</span>
          {post.tags.map((tag) => (
            <Link key={tag.slug} href={`/blog/tag/${tag.slug}`}>
              <Badge tone="green">#{tag.name}</Badge>
            </Link>
          ))}
        </footer>
      ) : null}

      <Suspense
        fallback={
          <div className="mt-16 border-t border-border pt-12">
            <CardGridSkeleton />
          </div>
        }
      >
        <RelatedPosts post={post} />
      </Suspense>
    </article>
  );
}
