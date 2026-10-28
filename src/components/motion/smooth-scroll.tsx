"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lenis-style inertial wheel smoothing for the public site.
 *
 * Safety rules:
 * - Never runs inside /admin (forms, tables and editor scroll behaviour stay
 *   completely native).
 * - Disabled for prefers-reduced-motion users and on touch-first devices,
 *   where native scrolling is fastest and most accessible.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let destroyed = false;
    let rafId = 0;
    const cleanups: Array<() => void> = [];

    import("lenis")
      .then(({ default: Lenis }) => {
        if (destroyed) return;
        const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
        document.documentElement.classList.add("lenis", "lenis-smooth");
        const raf = (time: number) => {
          lenis.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);
        cleanups.push(() => {
          cancelAnimationFrame(rafId);
          lenis.destroy();
          document.documentElement.classList.remove("lenis", "lenis-smooth");
        });
      })
      .catch(() => {
        // Dynamic import failed — native scrolling is the perfect fallback.
      });

    return () => {
      destroyed = true;
      for (const cleanup of cleanups) cleanup();
    };
  }, [pathname]);

  return null;
}
