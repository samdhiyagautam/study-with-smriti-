import { AnnouncementItem, CardGridSkeleton, ListSkeleton, PostCard, ResourceCard } from "@/components/content/cards";
import { FaqList } from "@/components/content/faq-list";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { EmptyState, SectionHeading } from "@/components/ui/layout-primitives";
import { getAnnouncements, getFaqs, getPosts, getResources, getSiteSettings } from "@/lib/content/queries";

/** Google Play icon (simple play triangle mark). */
function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.6 2.3a1.5 1.5 0 0 0-.6 1.2v17a1.5 1.5 0 0 0 .6 1.2l10-9.7-10-9.7Zm11.2 8.5 2.9-2.8-9.6-5.5a1.2 1.2 0 0 0-1.2 0l7.9 8.3Zm0 2.4-7.9 8.3a1.2 1.2 0 0 0 1.2 0l9.6-5.5-2.9-2.8Zm4.2-1.2 2.3-1.3c.7-.4.7-1.4 0-1.8l-2.3-1.3-3.2 3.1 3.2 3.1v-1.8Z" />
    </svg>
  );
}

export function GooglePlayButton({
  playUrl,
  size = "lg",
  className = "",
}: {
  playUrl: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (!playUrl) {
    return (
      <span
        className={`${buttonClasses("secondary", size, className)} cursor-not-allowed opacity-70`}
        title="Google Play link pending — set it in Admin → Settings"
        aria-disabled="true"
      >
        <PlayIcon />
        Get it on Google Play
        <span className="sr-only">(link coming soon)</span>
      </span>
    );
  }

  return (
    <a
      href={playUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics="play-cta"
      className={buttonClasses("secondary", size, className)}
    >
      <PlayIcon />
      Get it on Google Play
    </a>
  );
}

export async function HeroSection() {
  const settings = await getSiteSettings();

  return (
    <section className="cinema relative overflow-hidden border-b border-border bg-surface">
      {/* Cinematic backdrop: drifting brand-colour orbs + film grain */}
      <span
        aria-hidden="true"
        className="orb orb-a"
        style={{ top: "-14%", left: "-10%", width: "36rem", height: "36rem" }}
      />
      <span
        aria-hidden="true"
        className="orb orb-b"
        style={{ bottom: "-24%", right: "-8%", width: "32rem", height: "32rem" }}
      />
      <span aria-hidden="true" className="grain" />
      <span aria-hidden="true" className="vignette" />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="anim-up mb-3 inline-flex items-center rounded-full border border-secondary/40 bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary-hover dark:border-brand-green/40 dark:text-brand-green">
            Online live classes · Classes 8, 9 &amp; 10
          </p>
          <h1 className="anim-up anim-up-1 text-gradient text-3xl font-extrabold leading-tight sm:text-5xl">
            {settings.siteName}
          </h1>
          <p className="anim-up anim-up-2 mt-2 text-xl font-semibold text-muted sm:text-2xl" lang="hi">
            {settings.tagline}
          </p>
          <p className="anim-up anim-up-3 mt-5 max-w-xl leading-relaxed text-muted sm:text-lg">
            Quality online live classes and learning resources for government
            school students — Maths, Science, English, Hindi, Computer, SST and
            more, taught in line with your school syllabus.
          </p>

          <div className="anim-up anim-up-4 mt-8 flex flex-wrap items-center gap-3">
            <GooglePlayButton playUrl={settings.googlePlayUrl} />
            <ButtonLink href="/resources" variant="outline" size="lg">
              Explore learning resources
            </ButtonLink>
          </div>

          <dl className="anim-up anim-up-5 mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6 text-center">
            {[
              ["8, 9 & 10", "Classes covered"],
              ["7+", "Subjects taught"],
              ["Syllabus", "Aligned to school syllabus*"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="text-xl font-bold text-primary">{value}</dd>
                <dd className="mt-0.5 text-xs text-muted">{label}</dd>
              </div>
            ))}
          </dl>
          <p className="anim-up anim-up-5 mt-3 text-xs text-muted">
            *Content is designed to follow each school&apos;s syllabus.
            [PLACEHOLDER — owner to confirm before publishing]
          </p>
        </div>

        <div className="anim-up anim-up-4">
          <div className="anim-float">
            <div className="glass rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold">What students get</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Scheduled online live classes for Classes 8, 9 and 10",
                  "Subjects: Maths, Science, English, Hindi, Computer, SST and one foreign language",
                  "Study materials, notes and worksheets in the resource library",
                  "Exam preparation guidance and practice material",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-xs font-bold text-secondary-hover dark:bg-secondary dark:text-secondary-fg" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-border pt-5">
                <ButtonLink href="/features" variant="ghost" size="sm">
                  See all app features →
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function LatestPostsSection() {
  const { items } = await getPosts({ page: 1, perPage: 3 });

  return (
    <section aria-labelledby="latest-posts" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Reveal>
        <SectionHeading
          id="latest-posts"
          eyebrow="From the blog"
          title="Latest articles & study advice"
          action={
            <ButtonLink href="/blog" variant="outline" size="sm">
              View all articles
            </ButtonLink>
          }
        />
        {items.length === 0 ? (
          <EmptyState
            title="No articles published yet"
            description="Articles you publish from the admin panel will appear here."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

export function LatestPostsFallback() {
  return (
    <section aria-labelledby="latest-posts" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading id="latest-posts" eyebrow="From the blog" title="Latest articles & study advice" />
      <CardGridSkeleton />
    </section>
  );
}

export async function LatestResourcesSection() {
  const { items } = await getResources({ page: 1, perPage: 3 });

  return (
    <section aria-labelledby="latest-resources" className="wash border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHeading
            id="latest-resources"
            eyebrow="Resource library"
            title="Notes, worksheets & practice material"
            action={
              <ButtonLink href="/resources" variant="outline" size="sm">
                Browse all resources
              </ButtonLink>
            }
          />
          {items.length === 0 ? (
            <EmptyState
              title="No resources published yet"
              description="Study material you publish from the admin panel will appear here."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((resource) => (
                <ResourceCard key={resource.slug} resource={resource} />
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export function LatestResourcesFallback() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Resource library" title="Notes, worksheets & practice material" />
        <CardGridSkeleton />
      </div>
    </section>
  );
}

export async function AnnouncementsSection() {
  const announcements = await getAnnouncements(4);

  return (
    <section aria-labelledby="announcements" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Reveal>
        <SectionHeading
          id="announcements"
          eyebrow="News"
          title="Announcements & app updates"
          action={
            <ButtonLink href="/announcements" variant="outline" size="sm">
              All announcements
            </ButtonLink>
          }
        />
        {announcements.length === 0 ? (
          <EmptyState
            title="No announcements right now"
            description="App updates and notices published by the team will show up here."
          />
        ) : (
          <ul className="glass rounded-2xl px-5 sm:px-6">
            {announcements.map((announcement) => (
              <AnnouncementItem key={announcement.id} announcement={announcement} />
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}

export function AnnouncementsFallback() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading eyebrow="News" title="Announcements & app updates" />
      <ListSkeleton />
    </section>
  );
}

export async function FaqSection() {
  const faqs = await getFaqs();

  return (
    <section aria-labelledby="faq-heading" className="wash border-t border-border">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <Reveal>
          <SectionHeading
            id="faq-heading"
            eyebrow="Help"
            title="Frequently asked questions"
            description="Answers about the app, classes, downloads and support."
            action={
              <ButtonLink href="/faq" variant="outline" size="sm">
                All FAQs
              </ButtonLink>
            }
          />
          <FaqList faqs={faqs} />
        </Reveal>
      </div>
    </section>
  );
}

export function FaqFallback() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Help" title="Frequently asked questions" />
        <ListSkeleton count={4} />
      </div>
    </section>
  );
}

export async function ContactCtaSection() {
  const settings = await getSiteSettings();

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Reveal>
        <div className="cinema lift relative overflow-hidden rounded-2xl border border-primary/20 bg-primary-soft px-6 py-10 text-center sm:px-10">
          <span
            aria-hidden="true"
            className="orb orb-a"
            style={{ top: "-40%", right: "-12%", width: "24rem", height: "24rem" }}
          />
          <span
            aria-hidden="true"
            className="orb orb-b"
            style={{ bottom: "-45%", left: "-10%", width: "22rem", height: "22rem" }}
          />
          <h2 className="text-2xl font-bold sm:text-3xl">Need help or want to partner with us?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            Questions about classes, the app or learning resources? Reach the team
            directly — we usually reply within a few working days.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact" size="lg">
              Contact &amp; support
            </ButtonLink>
            <a
              href={`mailto:${settings.contactEmail}`}
              className={buttonClasses("outline", "lg")}
            >
              {settings.contactEmail}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">
            Phone:{" "}
            {settings.contactPhones.map((phone, index) => (
              <span key={phone}>
                {index > 0 ? " · " : ""}
                <a href={`tel:+91${phone}`} className="text-primary underline underline-offset-2">
                  {phone}
                </a>
              </span>
            ))}
          </p>
        </div>
      </Reveal>
    </section>
  );
}

export function ContactCtaFallback() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="h-56 animate-pulse rounded-2xl border border-border bg-surface" aria-hidden="true" />
    </section>
  );
}
