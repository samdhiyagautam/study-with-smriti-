import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/lib/site";

/**
 * PLACEHOLDER home page for Milestone M1 (design system + theme).
 * Replaced in M4 with the CMS-driven, admin-editable homepage.
 */
export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Badge tone="blue">Milestone M1 — design system preview</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
            {SITE.name}
          </h1>
          <p className="mt-3 text-xl text-muted" lang="hi">
            {SITE.tagline}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Online live classes for Classes 8, 9 and 10 government school
            students — Maths, Science, English, Hindi, Computer, SST and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/resources" size="lg">
              Explore learning resources
            </ButtonLink>
            <ButtonLink href="/features" variant="outline" size="lg">
              See app features
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            ["Primary blue", "Sampled from the logo wordmark"],
            ["Brand green", "Sampled from the logo swoosh"],
            ["Light · Dark · System", "Theme toggle in the header — try it"],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
