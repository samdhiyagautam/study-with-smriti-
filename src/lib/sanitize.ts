import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * Server-side sanitization for ALL rich text coming out of the admin editor
 * before it is stored or rendered. Runs where the client cannot tamper with it.
 *
 * Note: the database also stores only what server actions write — the public
 * site renders this sanitized HTML via RichText.
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== "string") return "";

  return sanitizeHtml(input, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
      "h2", "h3", "h4", "blockquote", "code", "pre", "hr", "img", "figure",
      "figcaption", "span",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      span: ["class"],
    },
    allowedClasses: {
      span: ["placeholder", "mark"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http", "data"] },
    // Never allow script/style/iframes or event handlers (sanitize-html
    // strips these by default; listed explicitly for clarity).
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
    enforceHtmlBoundary: true,
  });
}

/** Plain-text fields: strip control characters, keep it simple and safe. */
export function sanitizePlainText(input: string, maxLength = 5000): string {
  return input
    // Strip C0/C1 control characters that have no place in plain text.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, maxLength)
    .trim();
}

/** URL-like fields: only http(s) and relative paths. */
export function sanitizeUrl(input: string, maxLength = 500): string {
  const value = input.trim().slice(0, maxLength);
  if (value === "") return "";
  if (/^(https?:\/\/|\/)/i.test(value)) return value;
  return "";
}
