-- ===========================================================================
-- Study with Smriti — Migration 0002: storage buckets & storage policies
-- Buckets:
--   site-media      public images (logo, screenshots, blog/media images)
--   resource-files  private PDFs served through signed URLs
-- SVG is deliberately NOT allowed (XSS risk); max size 5 MB.
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media', 'site-media', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-files', 'resource-files', false, 5242880,
  array['application/pdf']
)
on conflict (id) do nothing;

-- site-media: anyone may read; only admins may write ------------------------
drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read" on storage.objects
  for select using (bucket_id = 'site-media');

drop policy if exists "site_media_admin_insert" on storage.objects;
create policy "site_media_admin_insert" on storage.objects
  for insert with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site_media_admin_update" on storage.objects;
create policy "site_media_admin_update" on storage.objects
  for update using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site_media_admin_delete" on storage.objects;
create policy "site_media_admin_delete" on storage.objects
  for delete using (bucket_id = 'site-media' and public.is_admin());

-- resource-files: private (admins + service role only) ----------------------
drop policy if exists "resource_files_admin_select" on storage.objects;
create policy "resource_files_admin_select" on storage.objects
  for select using (bucket_id = 'resource-files' and public.is_admin());

drop policy if exists "resource_files_admin_insert" on storage.objects;
create policy "resource_files_admin_insert" on storage.objects
  for insert with check (bucket_id = 'resource-files' and public.is_admin());

drop policy if exists "resource_files_admin_delete" on storage.objects;
create policy "resource_files_admin_delete" on storage.objects
  for delete using (bucket_id = 'resource-files' and public.is_admin());
