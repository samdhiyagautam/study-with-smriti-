import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/contact-form";
import { Breadcrumb, PageHeader, SectionHeading } from "@/components/ui/layout-primitives";
import { buttonClasses } from "@/components/ui/button";
import { SITE } from "@/lib/site";

/** Google Maps embed / directions built from the verified office address. */
const centreQuery = encodeURIComponent(SITE.address);
const MAP_EMBED_URL = `https://www.google.com/maps?q=${centreQuery}&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${centreQuery}`;
const MAP_OPEN_URL = `https://www.google.com/maps/search/?api=1&query=${centreQuery}`;

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

        {/* Offline centre — verified address, map embed from that address text */}
        <section aria-labelledby="visit-centre" className="mt-14">
          <SectionHeading
            id="visit-centre"
            eyebrow="Offline centre"
            title="Visit our centre in person"
            description="Meet the team at our office. Please call ahead to fix a visit time — centre timings: [PLACEHOLDER — owner to confirm]."
          />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-1 lg:col-span-3">
              <iframe
                src={MAP_EMBED_URL}
                title="Map — Study with Smriti office location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="h-72 w-full rounded-xl sm:h-80"
              />
            </div>

            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary dark:text-brand-green">
                Address
              </p>
              <p className="mt-2 leading-relaxed">{SITE.address}</p>
              <p className="mt-2 text-sm text-muted">
                3rd floor — ring the office bell on arrival.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={MAP_DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("primary", "md")}
                >
                  Get directions
                </a>
                <a
                  href={MAP_OPEN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("outline", "md")}
                >
                  Open in Google Maps
                </a>
              </div>

              <div className="mt-6 border-t border-border pt-4 text-sm text-muted">
                <p className="font-medium text-text">Call us before visiting</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                  {SITE.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:+91${phone}`}
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
