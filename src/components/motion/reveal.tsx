"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper.
 *
 * Safety rules:
 * - Content is rendered visible by default; the hidden state is applied by JS
 *   only when the block is clearly below the fold — so no-JS, reduced-motion
 *   and no-IntersectionObserver visitors always see everything.
 * - Reduced-motion users are skipped entirely (matchMedia check).
 */
export function Reveal({
  children,
  className = "",
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  /** Hidden-state direction: up (default), left, right or scale. */
  variant?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    // Only animate content that starts below the fold — never hide what the
    // visitor can already see.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.12) return;

    const pendingClass =
      variant === "left"
        ? "reveal-pending-left"
        : variant === "right"
          ? "reveal-pending-right"
          : variant === "scale"
            ? "reveal-pending-scale"
            : "reveal-pending";
    element.classList.add(pendingClass);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.remove(pendingClass);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [variant]);

  return (
    <div ref={ref} className={`reveal-root ${className}`}>
      {children}
    </div>
  );
}
