import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "warning" | "error" | "success";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface text-muted border-border",
    blue: "bg-primary-soft text-primary border-primary/25",
    green: "bg-secondary-soft text-secondary-hover dark:text-brand-green border-secondary/30",
    success: "bg-secondary-soft text-success border-success/30",
    warning: "bg-highlight text-warning border-warning/30",
    error: "bg-error-soft text-error border-error/30",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
