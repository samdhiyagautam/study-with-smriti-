"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { signOutAction } from "@/server/actions/auth";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Blog posts" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/taxonomy", label: "Categories & tags" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/audit", label: "Audit log" },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ email, role }: { email: string; role: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/admin" className="flex items-center gap-2 font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-fg">
            SWS
          </span>
          Admin
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted sm:inline">
            {email} · {role}
          </span>
          <ThemeToggle idPrefix="admin-theme" />
          <Link
            href="/"
            target="_blank"
            className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface sm:inline-block"
          >
            View site ↗
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg bg-error px-3 py-1.5 text-xs font-semibold text-error-fg hover:opacity-90"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav
        aria-label="Admin"
        className="mx-auto max-w-7xl overflow-x-auto px-4 pb-2 sm:px-6"
      >
        <ul className="flex min-w-max gap-1">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className={`block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
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
    </header>
  );
}
