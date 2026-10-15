import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqList } from "@/components/content/faq-list";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumb, EmptyState, PageHeader, SectionHeading } from "@/components/ui/layout-primitives";
import { getFaqs } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers about the Study with Smriti app, live classes, downloads, learning resources and support.",
  alternates: { canonical: "/faq" },
};

export const dynamic = "force-dynamic";

async function Faqs() {
  const faqs = await getFaqs();

  if (faqs.length === 0) {
    return (
      <EmptyState
        title="No questions published yet"
        description="FAQs added in the admin panel will appear here."
      />
    );
  }

  const grouped = faqs.reduce<Record<string, typeof faqs>>((accumulator, faq) => {
    const key = faq.category ?? "General";
    (accumulator[key] ??= []).push(faq);
    return accumulator;
  }, {});

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} aria-labelledby={`faq-${category}`}>
          <SectionHeading id={`faq-${category}`} title={category} level={3} />
          <FaqList faqs={items} />
        </section>
      ))}
    </div>
  );
}

function FaqsFallback() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="h-16 animate-pulse rounded-xl border border-border bg-surface" />
      ))}
    </div>
  );
}

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="Frequently asked questions"
        description="Everything about the app, live classes, downloads, resources and getting help."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "FAQ" }]} />
        <div className="mt-8">
          <Suspense fallback={<FaqsFallback />}>
            <Faqs />
          </Suspense>
        </div>

        <div className="glass lift mt-12 rounded-2xl p-6 text-center">
          <p className="font-semibold">Still have a question?</p>
          <p className="mt-1 text-sm text-muted">
            Our team can help with classes, downloads and study material.
          </p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href="/contact">Contact &amp; support</ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
