/** Shared admin form styles (usable from both server and client modules). */

export const LABEL_CLASS = "block text-sm font-semibold";
export const INPUT_CLASS =
  "mt-1.5 w-full rounded-lg border border-border-strong bg-bg px-3.5 py-2.5 text-sm outline-none focus:border-primary disabled:opacity-60";
export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-y`;
export const SELECT_CLASS = INPUT_CLASS;
export const ERROR_CLASS = "mt-1.5 text-sm font-medium text-error";
export const HINT_CLASS = "mt-1.5 text-xs text-muted";
export const CARD_CLASS = "rounded-xl border border-border bg-card p-6";
export const PRIMARY_BUTTON =
  "inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60";
export const SECONDARY_BUTTON =
  "inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface";
export const DANGER_BUTTON =
  "rounded-lg bg-error px-3 py-1.5 text-xs font-semibold text-error-fg hover:opacity-90";
