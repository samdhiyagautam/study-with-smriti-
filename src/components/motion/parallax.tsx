"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll parallax layer for the hero — drifts and (optionally) fades out with
 * scroll progress, producing the depth effect seen on premium investment-site
 * heroes. Safety rules:
 * - transform/opacity only, driven by rAF-throttled passive scroll listener.
 * - Skipped entirely for reduced-motion users and coarse-pointer (touch)
 *   devices.
 */
export function Parallax({
  children,
  speed = 1,
  fade = true,
  className = "",
}: {
  children: ReactNode;
  /** Positive eases up+fade; negative drifts the other way for depth. */
  speed?: number;
  fade?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId = 0;
    let queued = false;

    const update = () => {
      queued = false;
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / (window.innerHeight * 1.15)),
      );
      element.style.transform = `translate3d(0, ${(progress * 52 * speed).toFixed(1)}px, 0)`;
      if (fade) {
        element.style.opacity = (1 - progress * 0.8).toFixed(3);
      }
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
  }, [speed, fade]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform, opacity" }}>
      {children}
    </div>
  );
}
