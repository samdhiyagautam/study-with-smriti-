import type { Metadata } from "next";
import { Suspense } from "react";
import { PageDocument, PageDocumentFallback } from "@/components/content/page-document";
import { GooglePlayButton } from "@/components/content/home-sections";
import { Breadcrumb, PageHeader, SectionHeading } from "@/components/ui/layout-primitives";
import { getSiteSettings } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "App features — Study with Smriti",
  description:
    "Live classes, syllabus-aligned content and learning resources for Classes 8, 9 and 10 in the Study with Smriti Android app.",
  alternates: { canonical: "/features" },
};

export const dynamic = "force-dynamic";

const COMPATIBILITY = [
  ["Platform", "Android"],
  ["Available on", "Google Play Store"],
  ["Classes supported", "8, 9 and 10"],
  ["Languages", "Hindi and English [PLACEHOLDER — confirm]"],
  ["Minimum Android version", "[PLACEHOLDER — confirm from Play Console]"],
  ["App size", "[PLACEHOLDER — confirm from Play Console]"],
];

async function PlayCta() {
  const settings = await getSiteSettings();
  return <GooglePlayButton playUrl={settings.googlePlayUrl} />;
}

function PlayCtaFallback() {
  return <div className="h-12 w-64 animate-pulse rounded-lg bg-border" aria-hidden="true" />;
}

export default function FeaturesPage() {
  return (
    <>
      <PageHeader
        title="App features"
        description="Everything the Study with Smriti Android app offers for Classes 8, 9 and 10 learners."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "App Features" }]} />

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Suspense fallback={<PlayCtaFallback />}>
            <PlayCta />
          </Suspense>
          <span className="text-sm text-muted">
            Free to download · Android · [PLACEHOLDER — confirm pricing model]
          </span>
        </div>

        <div className="mt-10">
          <Suspense fallback={<PageDocumentFallback />}>
            <PageDocument slug="features" />
          </Suspense>
        </div>

        {/* Screenshots — intentionally empty until real assets are supplied */}
        <section aria-labelledby="screenshots" className="mt-14">
          <SectionHeading
            id="screenshots"
            eyebrow="Preview"
            title="App screenshots"
            description="Add real screenshots from the admin panel (Admin → Media) — none are bundled yet, so none are shown here."
          />
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-dashed border-border-strong bg-surface p-6 sm:grid-cols-4">
            {[1, 2, 3, 4].map((slot) => (
              <div
                key={slot}
                className="flex aspect-[9/16] items-center justify-center rounded-lg bg-card text-center text-xs text-muted"
              >
                Screenshot {slot}
                <br />
                [pending]
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="compatibility" className="mt-14">
          <SectionHeading
            id="compatibility"
            eyebrow="Compatibility"
            title="Device & version information"
          />
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">App compatibility details</caption>
              <tbody className="divide-y divide-border">
                {COMPATIBILITY.map(([label, value]) => (
                  <tr key={label} className="bg-card">
                    <th scope="row" className="w-64 px-4 py-3 font-semibold">
                      {label}
                    </th>
                    <td className="px-4 py-3 text-muted">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
