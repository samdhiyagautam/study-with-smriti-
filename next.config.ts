import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * cacheComponents (partial prerendering) is intentionally OFF:
   * with it, the static shell flushes with HTTP 200 before dynamic segments
   * throw notFound(), producing soft-404s (bad for SEO and crawlers).
   * Standard rendering returns real 404s and still prerenders the pages that
   * use no dynamic APIs.
   */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
};

export default nextConfig;
