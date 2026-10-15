import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumb, PageHeader } from "@/components/ui/layout-primitives";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "Contact the Study with Smriti team about classes, the Android app, learning resources or technical support.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact & support"
        description="Questions about classes, the app, resources or something broken? Send us a message — we reply by email."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "Contact" }]} />

        <div className="mt-8 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold">Send a message</h2>
            <div className="glass-strong mt-5 rounded-2xl p-6">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:col-span-2" aria-labelledby="direct-contact">
            <h2 id="direct-contact" className="text-xl font-bold">
              Reach us directly
            </h2>
            <ul className="glass mt-5 space-y-4 rounded-2xl p-6 text-sm">
              <li>
                <p className="font-semibold text-muted">Email</p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-0.5 inline-block font-medium text-primary underline underline-offset-2"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <p className="font-semibold text-muted">Phone</p>
                {SITE.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:+91${phone}`}
                    className="mt-0.5 block font-medium text-primary underline underline-offset-2"
                  >
                    {phone}
                  </a>
                ))}
              </li>
              <li>
                <p className="font-semibold text-muted">Office</p>
                <p className="mt-0.5 leading-relaxed">{SITE.address}</p>
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-border bg-highlight p-5 text-sm text-muted">
              <p className="font-semibold text-text">Before you write…</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  App or download problem? Check the{" "}
                  <Link href="/faq" className="text-primary underline underline-offset-2">
                    FAQ
                  </Link>{" "}
                  first.
                </li>
                <li>
                  Looking for study material? Visit the{" "}
                  <Link
                    href="/resources"
                    className="text-primary underline underline-offset-2"
                  >
                    resource library
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
