import type { Faq } from "@/lib/content/types";

/** Accessible native disclosure (works without JavaScript). */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details
          key={faq.id}
          className="group rounded-xl border border-border bg-card px-5 py-4 open:shadow-sm"
        >
          <summary className="cursor-pointer list-none font-semibold">
            <span className="flex items-start justify-between gap-4">
              {faq.question}
              <span
                aria-hidden="true"
                className="mt-0.5 text-primary transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
