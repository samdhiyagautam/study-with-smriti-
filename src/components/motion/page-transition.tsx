"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Cinematic page transition: remounting on route change replays a short
 * fade-up animation. Instant for reduced-motion users (global CSS rule).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
