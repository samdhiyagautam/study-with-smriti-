import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/layout-primitives";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="text-center text-sm font-semibold uppercase tracking-wide text-secondary dark:text-brand-green">
        Error 404
      </p>
      <div className="mt-6">
        <EmptyState
          title="This page could not be found"
          description="The link may be outdated, or the page may have moved. Try the learning resources or the blog instead."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/">Go to home</ButtonLink>
              <ButtonLink href="/resources" variant="outline">
                Learning resources
              </ButtonLink>
            </div>
          }
        />
      </div>
    </div>
  );
}
