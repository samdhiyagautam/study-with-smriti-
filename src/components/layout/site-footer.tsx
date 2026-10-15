import Image from "next/image";
import Link from "next/link";
import { CurrentYear } from "@/components/ui/current-year";
import { FOOTER_LINKS, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="wash mt-auto border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="inline-flex rounded-md bg-logo-bg px-1 py-0.5">
            <Image
              src="/logo/logo-letterhead.png"
              alt={`${SITE.name} — ${SITE.tagline}`}
              width={2450}
              height={407}
              className="h-10 w-auto"
            />
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            Online live classes and learning resources for Classes 8, 9 and 10
            government school students. <br />
            <span lang="hi">{SITE.tagline}</span>
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            <li>
              Email:{" "}
              <a
                className="text-primary underline underline-offset-2"
                href={`mailto:${SITE.email}`}
              >
                {SITE.email}
              </a>
            </li>
            <li>
              Phone:{" "}
              {SITE.phones.map((phone, index) => (
                <span key={phone}>
                  {index > 0 ? " · " : ""}
                  <a
                    className="text-primary underline underline-offset-2"
                    href={`tel:+91${phone}`}
                  >
                    {phone}
                  </a>
                </span>
              ))}
            </li>
            <li>{SITE.address}</li>
          </ul>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text">
            Explore
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_LINKS.explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Support and legal">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text">
            Support
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_LINKS.support.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-text">
            Legal
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:px-6">
          <p>
            © <CurrentYear /> {SITE.name}. All rights reserved.
          </p>
          <p>
            <Link href="/admin" className="hover:text-primary">
              Owner login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
