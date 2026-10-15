/**
 * Renders TipTap HTML that was sanitized server-side before storage
 * (see src/lib/sanitize.ts). Never pass unsanitized input to this component.
 */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose-sws ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
