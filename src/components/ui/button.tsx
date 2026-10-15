import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 text-center";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover glow",
  secondary: "bg-secondary text-secondary-fg hover:bg-secondary-hover",
  outline:
    "border border-border-strong bg-transparent text-text hover:border-primary/50 hover:bg-surface",
  ghost: "bg-transparent text-primary hover:bg-primary-soft",
  danger: "bg-error text-error-fg hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className = "",
): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...props} />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
