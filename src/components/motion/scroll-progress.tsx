"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Slim reading-progress bar pinned under the very top of the viewport.
 * Driven by scroll position (never self-animating) and only touches
 * transform, so it is cheap and participates in no layout.
 */
export function ScrollProgress() {
  const pathname = usePathname();
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const fill = fillRef.current;
    if (!fill) return;

    let rafId = 0;
    let queued = false;

    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = `scaleX(${progress.toFixed(4)})`;
    };

    const onScroll = () => {
      if (!queued) {
        queued = true;
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      ref={fillRef}
      className="progress-fill"
      role="presentation"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
