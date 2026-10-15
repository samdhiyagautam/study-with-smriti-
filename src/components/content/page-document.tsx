import { notFound } from "next/navigation";
import { RichText } from "@/components/content/rich-text";
import { getPageBySlug } from "@/lib/content/queries";

/** Streams a CMS page document (about, features, legal, …) with a skeleton. */
export async function PageDocument({ slug }: { slug: string }) {
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="max-w-3xl">
      <RichText html={page.content} />
    </article>
  );
}

export function PageDocumentFallback() {
  return (
    <div className="max-w-3xl space-y-4" aria-hidden="true">
      {[92, 100, 78, 96, 88, 60].map((width, index) => (
        <div
          key={index}
          className="h-5 animate-pulse rounded bg-border"
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  );
}
