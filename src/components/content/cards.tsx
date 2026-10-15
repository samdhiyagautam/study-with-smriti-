import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/layout-primitives";
import type { Announcement, PostSummary, ResourceSummary } from "@/lib/content/types";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Card as="article" className="flex h-full flex-col">
      {post.featuredImageUrl ? (
        <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
          <div className="relative -mx-5 -mt-5 mb-4 aspect-video overflow-hidden rounded-t-2xl bg-surface">
            <Image
              src={post.featuredImageUrl}
              alt={post.featuredImageAlt ?? ""}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        </Link>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {post.category ? <Badge tone="blue">{post.category.name}</Badge> : null}
        <time dateTime={post.publishedAt ?? undefined}>
          {formatDate(post.publishedAt)}
        </time>
      </div>

      <h3 className="mt-3 text-lg font-bold leading-snug">
        <Link href={`/blog/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h3>

      {post.excerpt ? (
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{post.excerpt}</p>
      ) : (
        <div className="flex-1" />
      )}

      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Read article <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}

export function ResourceCard({ resource }: { resource: ResourceSummary }) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="green">{resource.category?.name ?? "Resource"}</Badge>
        {resource.fileType === "pdf" ? <Badge tone="error">PDF</Badge> : null}
      </div>

      <h3 className="mt-3 text-lg font-bold leading-snug">
        <Link href={`/resources/${resource.slug}`} className="hover:text-primary">
          {resource.title}
        </Link>
      </h3>

      {resource.description ? (
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
          {resource.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        {resource.subject ? <Badge tone="neutral">{resource.subject}</Badge> : null}
        {resource.classLevel ? (
          <Badge tone="neutral">Class {resource.classLevel}</Badge>
        ) : null}
        <Link
          href={`/resources/${resource.slug}`}
          className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          Open <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  );
}

export function AnnouncementItem({ announcement }: { announcement: Announcement }) {
  const label =
    announcement.type === "app_update"
      ? "App update"
      : announcement.type === "resource_notice"
        ? "New resource"
        : "Announcement";

  return (
    <li className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <div className="w-24 shrink-0 pt-0.5 text-xs font-semibold uppercase tracking-wide text-secondary dark:text-brand-green">
        {label}
      </div>
      <div>
        <p className="font-semibold">{announcement.title}</p>
        <p className="mt-1 text-sm text-muted">{announcement.body}</p>
        <time
          dateTime={announcement.publishedAt ?? undefined}
          className="mt-1.5 block text-xs text-muted"
        >
          {formatDate(announcement.publishedAt)}
        </time>
      </div>
    </li>
  );
}

/** Static skeleton shown while a Suspense-enclosed section streams. */
export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}
