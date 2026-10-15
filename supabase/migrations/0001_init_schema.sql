-- ===========================================================================
-- Study with Smriti — Migration 0001: core schema, constraints, indexes, RLS
-- Run with: supabase db push  (or paste into the SQL editor in order)
-- Idempotent: safe to re-run.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Role always comes from the database, never from the client/JWT.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('owner', 'admin')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles (minimal admin-role table)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  role       text not null default 'admin' check (role in ('owner', 'admin')),
  full_name  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- site_settings (single-store key/value configuration)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key check (char_length(key) between 1 and 100),
  value      jsonb not null,
  -- only settings flagged public may be read by anonymous visitors
  is_public  boolean not null default false,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- pages (CMS-managed static pages: about, features, legal, …)
-- ---------------------------------------------------------------------------
create table if not exists public.pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null check (char_length(title) between 1 and 200),
  description     text,
  content         jsonb not null default '[]'::jsonb,
  status          text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  seo_title       text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  published_at    timestamptz,
  created_by      uuid references public.profiles (id) on delete set null,
  updated_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists pages_status_idx on public.pages (status);
drop trigger if exists pages_updated_at on public.pages;
create trigger pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- blog
-- ---------------------------------------------------------------------------
create table if not exists public.blog_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(name) between 1 and 80),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.blog_tags (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 1 and 60),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title              text not null check (char_length(title) between 1 and 200),
  excerpt            text check (excerpt is null or char_length(excerpt) <= 500),
  content            jsonb not null default '[]'::jsonb,
  featured_image_url text,
  featured_image_alt text check (featured_image_url is null or char_length(featured_image_alt) between 1 and 300),
  category_id        uuid references public.blog_categories (id) on delete set null,
  author_id          uuid references public.profiles (id) on delete set null,
  status             text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  published_at       timestamptz,
  seo_title          text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description    text check (seo_description is null or char_length(seo_description) <= 170),
  view_count         integer not null default 0 check (view_count >= 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint blog_posts_featured_alt_required
    check (featured_image_url is null or featured_image_alt is not null)
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts (category_id);
create index if not exists blog_posts_author_idx on public.blog_posts (author_id);
create index if not exists blog_posts_search_idx
  on public.blog_posts using gin (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' ||
      coalesce(content #>> '{}', ''))
  );
drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table if not exists public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id  uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);
create index if not exists blog_post_tags_tag_idx on public.blog_post_tags (tag_id);

-- ---------------------------------------------------------------------------
-- learning resources
-- ---------------------------------------------------------------------------
create table if not exists public.resource_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(name) between 1 and 80),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.resources (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title           text not null check (char_length(title) between 1 and 200),
  description     text check (description is null or char_length(description) <= 500),
  body            jsonb not null default '[]'::jsonb,
  category_id     uuid references public.resource_categories (id) on delete set null,
  subject         text check (subject is null or char_length(subject) <= 80),
  class_level     text check (class_level is null or class_level in ('8', '9', '10', '8-10')),
  file_url        text,
  file_type       text check (file_type is null or file_type in ('pdf', 'link', 'none')),
  status          text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  seo_title       text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (seo_description is null or char_length(seo_description) <= 170),
  view_count      integer not null default 0 check (view_count >= 0),
  created_by      uuid references public.profiles (id) on delete set null,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists resources_status_idx on public.resources (status, created_at desc);
create index if not exists resources_category_idx on public.resources (category_id);
create index if not exists resources_subject_idx on public.resources (subject);
create index if not exists resources_class_level_idx on public.resources (class_level);
create index if not exists resources_search_idx
  on public.resources using gin (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(description, '') || ' ' ||
      coalesce(subject, ''))
  );
drop trigger if exists resources_updated_at on public.resources;
create trigger resources_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null check (char_length(question) between 1 and 300),
  answer       text not null check (char_length(answer) between 1 and 5000),
  category     text check (category is null or char_length(category) <= 80),
  sort_order   integer not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists faqs_published_sort_idx on public.faqs (is_published, sort_order);
drop trigger if exists faqs_updated_at on public.faqs;
create trigger faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- announcements / app updates
-- ---------------------------------------------------------------------------
create table if not exists public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null check (char_length(title) between 1 and 200),
  body         text not null check (char_length(body) between 1 and 10000),
  type         text not null default 'announcement'
               check (type in ('announcement', 'app_update', 'resource_notice')),
  status       text not null default 'draft' check (status in ('draft', 'published', 'unpublished')),
  published_at timestamptz,
  expires_at   timestamptz,
  is_archived  boolean not null default false,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists announcements_status_idx
  on public.announcements (status, published_at desc);
create index if not exists announcements_expiry_idx on public.announcements (expires_at);
drop trigger if exists announcements_updated_at on public.announcements;
create trigger announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- media assets
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id          uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  url         text not null,
  file_name   text not null,
  mime_type   text not null check (mime_type in ('image/png', 'image/jpeg', 'image/webp', 'application/pdf')),
  size_bytes  integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  alt_text    text check (mime_type = 'application/pdf' or (alt_text is not null and char_length(alt_text) between 1 and 300)),
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists media_assets_mime_idx on public.media_assets (mime_type);

-- ---------------------------------------------------------------------------
-- contact submissions (private — never readable by the public)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    text not null check (char_length(subject) between 1 and 200),
  message    text not null check (char_length(message) between 1 and 5000),
  status     text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  ip_hash    text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status, created_at desc);
-- rate-limit helper: count recent submissions per hashed IP
create index if not exists contact_submissions_ip_idx
  on public.contact_submissions (ip_hash, created_at desc);
drop trigger if exists contact_submissions_updated_at on public.contact_submissions;
create trigger contact_submissions_updated_at
  before update on public.contact_submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- admin audit log
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null check (char_length(action) between 1 and 60),
  entity     text not null check (char_length(entity) between 1 and 60),
  entity_id  text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_logs_created_idx
  on public.admin_audit_logs (created_at desc);

-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.pages enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.faqs enable row level security;
alter table public.announcements enable row level security;
alter table public.media_assets enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.admin_audit_logs enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner" on public.profiles
  for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists "profiles_insert_service" on public.profiles;
create policy "profiles_insert_service" on public.profiles
  for insert with check (auth.role() = 'service_role');

-- site_settings -------------------------------------------------------------
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (is_public = true);

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- public content tables: anonymous visitors read ONLY published rows ---------
drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read" on public.pages
  for select using (status = 'published');
drop policy if exists "pages_admin_all" on public.pages;
create policy "pages_admin_all" on public.pages
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_categories_public_read" on public.blog_categories;
create policy "blog_categories_public_read" on public.blog_categories
  for select using (true);
drop policy if exists "blog_categories_admin_all" on public.blog_categories;
create policy "blog_categories_admin_all" on public.blog_categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_tags_public_read" on public.blog_tags;
create policy "blog_tags_public_read" on public.blog_tags
  for select using (true);
drop policy if exists "blog_tags_admin_all" on public.blog_tags;
create policy "blog_tags_admin_all" on public.blog_tags
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts
  for select using (status = 'published');
drop policy if exists "blog_posts_admin_all" on public.blog_posts;
create policy "blog_posts_admin_all" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "blog_post_tags_public_read" on public.blog_post_tags;
create policy "blog_post_tags_public_read" on public.blog_post_tags
  for select using (
    exists (select 1 from public.blog_posts p where p.id = post_id and p.status = 'published')
  );
drop policy if exists "blog_post_tags_admin_all" on public.blog_post_tags;
create policy "blog_post_tags_admin_all" on public.blog_post_tags
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "resource_categories_public_read" on public.resource_categories;
create policy "resource_categories_public_read" on public.resource_categories
  for select using (true);
drop policy if exists "resource_categories_admin_all" on public.resource_categories;
create policy "resource_categories_admin_all" on public.resource_categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "resources_public_read" on public.resources;
create policy "resources_public_read" on public.resources
  for select using (status = 'published');
drop policy if exists "resources_admin_all" on public.resources;
create policy "resources_admin_all" on public.resources
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs
  for select using (is_published = true);
drop policy if exists "faqs_admin_all" on public.faqs;
create policy "faqs_admin_all" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
  for select using (
    status = 'published'
    and is_archived = false
    and (published_at is null or published_at <= now())
    and (expires_at is null or expires_at > now())
  );
drop policy if exists "announcements_admin_all" on public.announcements;
create policy "announcements_admin_all" on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read" on public.media_assets
  for select using (true);
drop policy if exists "media_assets_admin_all" on public.media_assets;
create policy "media_assets_admin_all" on public.media_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- contact_submissions: NO public policies at all.
-- Reads/updates/deletes are admin-only; inserts happen exclusively through
-- the server route using the service-role key (bypasses RLS by design).
drop policy if exists "contact_submissions_admin_read" on public.contact_submissions;
create policy "contact_submissions_admin_read" on public.contact_submissions
  for select using (public.is_admin());
drop policy if exists "contact_submissions_admin_update" on public.contact_submissions;
create policy "contact_submissions_admin_update" on public.contact_submissions
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "contact_submissions_admin_delete" on public.contact_submissions;
create policy "contact_submissions_admin_delete" on public.contact_submissions
  for delete using (public.is_admin());

-- admin_audit_logs: admin read; writes go through the service role ----------
drop policy if exists "audit_admin_read" on public.admin_audit_logs;
create policy "audit_admin_read" on public.admin_audit_logs
  for select using (public.is_admin());
drop policy if exists "audit_service_insert" on public.admin_audit_logs;
create policy "audit_service_insert" on public.admin_audit_logs
  for insert with check (auth.role() = 'service_role');
