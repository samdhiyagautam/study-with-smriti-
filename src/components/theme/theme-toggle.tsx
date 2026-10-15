"use client";

import { useTheme, type ThemePreference } from "./theme-provider";

const OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  path: (className: string) => React.ReactNode;
}> = [
  {
    value: "light",
    label: "Light mode",
    path: (c) => (
      <svg
        className={c}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark mode",
    path: (c) => (
      <svg
        className={c}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "System theme",
    path: (c) => (
      <svg
        className={c}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </svg>
    ),
  },
];

/**
 * Accessible three-way theme switch (Light / Dark / System).
 * Rendered as a radio group so screen readers announce the current choice.
 */
export function ThemeToggle({ idPrefix = "theme" }: { idPrefix?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
    >
      {OPTIONS.map((option) => {
        const checked = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            id={`${idPrefix}-${option.value}`}
            aria-checked={checked}
            aria-label={option.label}
            title={option.label}
            onClick={() => setPreference(option.value)}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              checked
                ? "bg-primary text-primary-fg"
                : "text-muted hover:bg-border hover:text-text"
            }`}
          >
            {option.path("h-4 w-4")}
          </button>
        );
      })}
    </div>
  );
}
