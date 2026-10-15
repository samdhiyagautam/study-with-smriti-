import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s · Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

/**
 * Metadata for the whole /admin tree: never indexed (also mirrored in
 * robots.txt and the meta robots above).
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
