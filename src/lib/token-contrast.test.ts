import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color";

/**
 * Parses the design tokens straight from globals.css so the test always
 * verifies the real values shipped to the browser (both themes).
 */
function parseTokens(): Record<"light" | "dark", Record<string, string>> {
  const css = fs.readFileSync(
    path.resolve(process.cwd(), "src/app/globals.css"),
    "utf8",
  );

  const grab = (selector: string): Record<string, string> => {
    const index = css.indexOf(selector);
    expect(index, `selector ${selector} not found`).toBeGreaterThan(-1);
    const start = css.indexOf("{", index);
    const end = css.indexOf("}", start);
    const body = css.slice(start + 1, end);
    const tokens: Record<string, string> = {};
    for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[match[1].trim()] = match[2].trim();
    }
    return tokens;
  };

  return { light: grab(":root {"), dark: grab('[data-theme="dark"] {') };
}

const PAIRS: Array<{
  name: string;
  fg: string;
  bg: string;
  min: number;
}> = [
  { name: "body text on background", fg: "--text", bg: "--bg", min: 4.5 },
  { name: "body text on surface", fg: "--text", bg: "--surface", min: 4.5 },
  { name: "body text on card", fg: "--text", bg: "--card", min: 4.5 },
  { name: "muted text on background", fg: "--muted", bg: "--bg", min: 4.5 },
  { name: "muted text on surface", fg: "--muted", bg: "--surface", min: 4.5 },
  {
    name: "primary button label",
    fg: "--primary-fg",
    bg: "--primary",
    min: 4.5,
  },
  {
    name: "primary button label (hover)",
    fg: "--primary-fg",
    bg: "--primary-hover",
    min: 4.5,
  },
  { name: "link / primary on background", fg: "--primary", bg: "--bg", min: 4.5 },
  {
    name: "primary on primary-soft (active nav, badges)",
    fg: "--primary",
    bg: "--primary-soft",
    min: 4.5,
  },
  {
    name: "secondary button label",
    fg: "--secondary-fg",
    bg: "--secondary",
    min: 4.5,
  },
  {
    name: "secondary button label (hover)",
    fg: "--secondary-fg",
    bg: "--secondary-hover",
    min: 4.5,
  },
  {
    name: "secondary accent text on background",
    fg: "--secondary",
    bg: "--bg",
    min: 4.5,
  },
  { name: "success on background", fg: "--success", bg: "--bg", min: 4.5 },
  { name: "warning on background", fg: "--warning", bg: "--bg", min: 4.5 },
  { name: "error on background", fg: "--error", bg: "--bg", min: 4.5 },
  { name: "error on error-soft (badges)", fg: "--error", bg: "--error-soft", min: 4.5 },
  { name: "danger button label", fg: "--error-fg", bg: "--error", min: 4.5 },
  { name: "focus ring vs background", fg: "--focus", bg: "--bg", min: 3 },
  {
    name: "border-strong vs background (visible edges)",
    fg: "--border-strong",
    bg: "--bg",
    min: 1.4,
  },
];

describe.each(["light", "dark"] as const)("theme: %s", (theme) => {
  const tokens = parseTokens()[theme];

  it("defines every token used by the pair checks", () => {
    for (const pair of PAIRS) {
      expect(tokens[pair.fg], `${pair.fg} missing in ${theme}`).toBeTruthy();
      expect(tokens[pair.bg], `${pair.bg} missing in ${theme}`).toBeTruthy();
    }
  });

  it.each(PAIRS)("$name meets WCAG target ($min:1)", ({ fg, bg, min }) => {
    const ratio = contrastRatio(tokens[fg], tokens[bg]);
    expect(
      ratio,
      `${theme}: ${fg} (${tokens[fg]}) on ${bg} (${tokens[bg]}) = ${ratio.toFixed(2)}`,
    ).toBeGreaterThanOrEqual(min);
  });

  // The sampled logo green (#8bc53f) is a light, decorative green: in light
  // mode it is only used for bars/underlines (never as text — --secondary is
  // used instead). In dark mode it is dark enough to carry text.
  if (theme === "dark") {
    it("brand-green works as text on the dark background", () => {
      expect(
        contrastRatio(tokens["--brand-green"], tokens["--bg"]),
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});
