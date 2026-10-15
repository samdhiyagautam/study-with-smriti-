import type { Metadata } from "next";
import { Suspense } from "react";
import { PageDocument, PageDocumentFallback } from "@/components/content/page-document";
import { Breadcrumb, PageHeader, SectionHeading } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "About Study with Smriti",
  description:
    "The mission behind Study with Smriti: online live classes for Classes 8, 9 and 10 government school students in Bokaro district.",
  alternates: { canonical: "/about" },
};

const MISSION = [
  {
    title: "Our purpose",
    body: "Run high-quality online live classes for government school students who would otherwise go without certain subject teachers.",
  },
  {
    title: "Who we serve",
    body: "Students of Classes 8, 9 and 10 in government schools of Bokaro district, Jharkhand.",
  },
  {
    title: "How we teach",
    body: "Scheduled live online classes with content designed to follow each school's syllabus, supported by notes and practice material.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Study with Smriti"
        description="Why this programme exists, who it serves and how it works."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "About" }]} />
      </div>

      <section aria-labelledby="mission" className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
        <SectionHeading
          id="mission"
          eyebrow="Mission"
          title="Education that reaches every classroom"
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {MISSION.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense fallback={<PageDocumentFallback />}>
          <PageDocument slug="about" />
        </Suspense>

        <p className="mt-8 rounded-lg border border-border bg-highlight px-4 py-3 text-sm text-muted">
          [PLACEHOLDER — owner review] Background details, programme history and
          partnerships may only be published after verification. Do not add
          accreditations, results or statistics that are not documented.
        </p>
      </section>
    </>
  );
}
