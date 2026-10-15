import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementItem, ListSkeleton } from "@/components/content/cards";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, EmptyState, PageHeader } from "@/components/ui/layout-primitives";
import { getAnnouncements } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Announcements & app updates",
  description:
    "Latest announcements, new learning resources and Study with Smriti app updates.",
  alternates: { canonical: "/announcements" },
};

async function AnnouncementList() {
  const announcements = await getAnnouncements(30);

  if (announcements.length === 0) {
    return (
      <EmptyState
        title="No announcements right now"
        description="Notices and app updates published by the team will appear here."
      />
    );
  }

  return (
    <ul className="rounded-xl border border-border bg-card px-5 sm:px-6">
      {announcements.map((announcement) => (
        <AnnouncementItem key={announcement.id} announcement={announcement} />
      ))}
    </ul>
  );
}

export default function AnnouncementsPage() {
  return (
    <>
      <PageHeader
        title="Announcements & app updates"
        description="Notices for students and schools, new resources and Android app updates."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: "Announcements" }]} />

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="blue">Announcement</Badge>
          <Badge tone="green">App update</Badge>
          <Badge tone="warning">New resource</Badge>
        </div>

        <div className="mt-6">
          <Suspense fallback={<ListSkeleton count={5} />}>
            <AnnouncementList />
          </Suspense>
        </div>
      </div>
    </>
  );
}
