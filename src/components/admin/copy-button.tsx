"use client";

import { useState } from "react";
import { SECONDARY_BUTTON } from "@/components/admin/field-styles";

/** Copies the given value to the clipboard with an accessible confirmation. */
export function CopyButton({ value, label = "Copy link" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={SECONDARY_BUTTON}
      onClick={() => {
        void navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => {
            setCopied(false);
          });
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
