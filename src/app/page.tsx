import type { Metadata } from "next";
import { Suspense } from "react";
import {
  AnnouncementsSection,
  AnnouncementsFallback,
  ContactCtaFallback,
  ContactCtaSection,
  FaqFallback,
  FaqSection,
  HeroSection,
  LatestPostsFallback,
  LatestPostsSection,
  LatestResourcesFallback,
  LatestResourcesSection,
} from "@/components/content/home-sections";
import { SectionHeading } from "@/components/ui/layout-primitives";
import { Reveal } from "@/components/motion/reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — Online Live Classes for Classes 8, 9 & 10`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

// Home pulls live CMS content on every request — publishing in the admin
// panel updates this page immediately, with no redeploy.
export const dynamic = "force-dynamic";

const SUBJECTS = [
  { name: "Maths", note: "Concepts, practice & problem solving" },
  { name: "Science", note: "Physics, Chemistry and Biology basics" },
  { name: "English", note: "Grammar, reading and writing skills" },
  { name: "Hindi", note: "व्याकरण, पठन और लेखन" },
  { name: "Computer", note: "Digital literacy fundamentals" },
  { name: "SST", note: "History, Civics, Geography & Economics" },
];

const STEPS = [
  {
    title: "Download the app",
    body: "Get Study with Smriti from Google Play on your Android phone. [PLACEHOLDER — confirm onboarding steps with the owner]",
  },
  {
    title: "Join your live classes",
    body: "Attend scheduled online live classes for your class and subject. [PLACEHOLDER — confirm schedule & joining process]",
  },
  {
    title: "Revise with resources",
    body: "Use notes, worksheets and practice material from the learning resource library on this site.",
  },
];

const BENEFITS = [
  {
    title: "Classes where teachers are unavailable",
    body: "The programme was created to address the unavailability of subject teachers in government schools.",
  },
  {
    title: "Aligned to your school syllabus",
    body: "Learning content is designed to follow the syllabus followed by your school.",
  },
  {
    title: "Learn in your language",
    body: "Classes and material are available in Hindi and English. [PLACEHOLDER — confirm in-app language options]",
  },
  {
    title: "Study anywhere, on a phone",
    body: "Everything works on an Android phone, so learning continues at home or on the go.",
  },
];

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroWithFallback />}>
        <HeroSection />
      </Suspense>

      {/* Subjects — verified from project documents */}
      <section aria-labelledby="subjects-heading" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          id="subjects-heading"
          eyebrow="Subjects"
          title="What we teach"
          description="Subjects covered across Classes 8, 9 and 10 (the exact mix may vary by school)."
        />
        <Reveal>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS.map((subject) => (
              <li key={subject.name} className="glass lift rounded-2xl p-5">
                <p className="flex items-center gap-2 font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-green" aria-hidden="true" />
                  {subject.name}
                </p>
                <p className="mt-1 text-sm text-muted">{subject.note}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="wash border-y border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading id="how-heading" eyebrow="How it works" title="Start learning in three steps" />
          <Reveal>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="glass lift relative rounded-2xl p-6">
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-fg"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-3 font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-heading" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          id="benefits-heading"
          eyebrow="Why it helps"
          title="Built for students who need extra support"
        />
        <Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="glass lift rounded-2xl p-6">
                <h3 className="font-bold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Suspense fallback={<LatestPostsFallback />}>
        <LatestPostsSection />
      </Suspense>

      <Suspense fallback={<LatestResourcesFallback />}>
        <LatestResourcesSection />
      </Suspense>

      <Suspense fallback={<AnnouncementsFallback />}>
        <AnnouncementsSection />
      </Suspense>

      <Suspense fallback={<FaqFallback />}>
        <FaqSection />
      </Suspense>

      <Suspense fallback={<ContactCtaFallback />}>
        <ContactCtaSection />
      </Suspense>
    </>
  );
}

/** Hero skeleton matching the real hero's footprint. */
function HeroWithFallback() {
  return (
    <section className="cinema wash relative overflow-hidden border-b border-border">
      <span aria-hidden="true" className="grain" />
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6" aria-hidden="true">
        <div className="h-4 w-52 animate-pulse rounded bg-border" />
        <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-border" />
        <div className="mt-4 h-7 w-1/2 animate-pulse rounded bg-border" />
        <div className="mt-6 h-20 w-2/3 animate-pulse rounded bg-border" />
      </div>
    </section>
  );
}
