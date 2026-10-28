import type { MetadataRoute } from "next";
import { getPosts, getResources } from "@/lib/content/queries";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/features", changeFrequency: "monthly", priority: 0.8 },
  { path: "/resources", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/announcements", changeFrequency: "daily", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
  { path: "/copyright", changeFrequency: "yearly", priority: 0.3 },
  { path: "/children-privacy", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Dynamic sitemap: fixed public routes plus every published blog post and
 * learning resource. Database failures degrade gracefully to the static set —
 * the sitemap must never throw.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/+$/, "");

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const { items: posts } = await getPosts({ perPage: 500 });
    for (const post of posts) {
      entries.push({
        url: `${base}/blog/${post.slug}`,
        lastModified: post.publishedAt ?? undefined,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // Database unavailable — static routes only.
  }

  try {
    const { items: resources } = await getResources({ perPage: 500 });
    for (const resource of resources) {
      entries.push({
        url: `${base}/resources/${resource.slug}`,
        lastModified: resource.publishedAt ?? undefined,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Database unavailable — static routes only.
  }

  return entries;
}
