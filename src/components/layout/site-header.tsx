"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonClasses } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/site";

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu when navigation happens (state adjustment during render —
  // avoids setState-inside-effect cascades)
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const playReady = SITE.playUrl.length > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo — aspect ratio preserved (2450×407), never stretched */}
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-md"
          aria-label={`${SITE.name} home`}
        >
          <span className="hidden rounded-md bg-logo-bg px-1 py-0.5 sm:inline-flex">
            <Image
              src="/logo/logo-letterhead.png"
              alt={`${SITE.name} — ${SITE.tagline}`}
              width={2450}
              height={407}
              priority
              className="h-9 w-auto"
            />
          </span>
          <span className="inline-flex rounded-md bg-logo-bg p-0.5 sm:hidden">
            <Image
              src="/logo/mark.png"
              alt={SITE.name}
              width={358}
              height={407}
              priority
              className="h-9 w-auto"
            />
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={
                    isActive(pathname, link.href) ? "page" : undefined
                  }
                  className={`rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                    isActive(pathname, link.href)
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-surface hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle idPrefix="nav-theme" />
          {playReady ? (
            <a
              href={SITE.playUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "sm", "hidden md:inline-flex")}
            >
              Get it on Google Play
            </a>
          ) : null}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-border bg-bg lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-4 py-3">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={
                    isActive(pathname, link.href) ? "page" : undefined
                  }
                  className={`block rounded-md px-3 py-2.5 text-base font-medium ${
                    isActive(pathname, link.href)
                      ? "bg-primary-soft text-primary"
                      : "text-text hover:bg-surface"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {playReady ? (
              <li className="pt-2">
                <a
                  href={SITE.playUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("secondary", "md", "w-full")}
                >
                  Get it on Google Play
                </a>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  );
}
