-- ===========================================================================
-- Study with Smriti — Seed data (reproducible, no secrets, no personal data)
-- All text marked [PLACEHOLDER] must be reviewed/replaced by the owner.
-- Run after migrations:  psql -f supabase/seed.sql   (or via SQL editor)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Public site settings
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value, is_public) values
  ('site_name',        '"Study with Smriti"', true),
  ('tagline',          '"अब कर लो तैयारी जीत की"', true),
  ('google_play_url',  '""', true),
  ('contact_email',    '"studywithsmritioffice1@gmail.com"', true),
  ('contact_phones',   '["9905917516", "6200398012"]', true),
  ('contact_address',  '"3rd Floor, Rohini Complex, Opposite Hotel Apsara, Circular Road, Lalpur, Bokaro"', true),
  ('social_links',     '{"facebook": "", "instagram": "", "youtube": "", "telegram": ""}', true),
  ('analytics_enabled','false', true),
  ('footer_note',      '""', false)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Blog categories & tags
-- ---------------------------------------------------------------------------
insert into public.blog_categories (name, slug, description) values
  ('Study Tips',      'study-tips',      'Practical study habits and exam strategies'),
  ('Subject Guides',  'subject-guides',  'Concept explainers for school subjects'),
  ('App Updates',     'app-updates',     'News about the Study with Smriti Android app'),
  ('Announcements',   'announcements',   'Notices for students and schools')
on conflict (slug) do nothing;

insert into public.blog_tags (name, slug) values
  ('Class 8', 'class-8'),
  ('Class 9', 'class-9'),
  ('Class 10', 'class-10'),
  ('Maths', 'maths'),
  ('Science', 'science'),
  ('English', 'english'),
  ('Hindi', 'hindi'),
  ('Computer', 'computer'),
  ('SST', 'sst'),
  ('Exam Preparation', 'exam-preparation')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Resource categories
-- ---------------------------------------------------------------------------
insert into public.resource_categories (name, slug, description) values
  ('Notes & Study Guides', 'notes-study-guides', 'Subject-wise notes for classes 8, 9 and 10'),
  ('Exam Preparation',     'exam-preparation',   'Sample papers, revision checklists and exam tips'),
  ('Practice Questions',   'practice-questions', 'Chapter-wise practice questions and quizzes'),
  ('Worksheets',           'worksheets',         'Printable worksheets for classroom practice')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- FAQs — [PLACEHOLDER] wording, owner must review before publishing
-- ---------------------------------------------------------------------------
insert into public.faqs (question, answer, category, sort_order, is_published) values
  ('What is Study with Smriti?',
   '[PLACEHOLDER — owner review] Study with Smriti is an Android educational app that runs online live classes for Classes 8, 9 and 10 students, covering subjects such as Maths, Science, English, Hindi, Computer and SST.',
   'About the app', 10, false),
  ('How do I download the app?',
   '[PLACEHOLDER — owner review] The app is available on Google Play. Add the exact Play Store link in Admin → Settings once verified.',
   'Download', 20, false),
  ('Are the classes free?',
   '[PLACEHOLDER — owner review] Confirm the current fee structure (if any) before publishing this answer.',
   'Classes', 30, false),
  ('Which classes and subjects are covered?',
   '[PLACEHOLDER — owner review] Classes 8, 9 and 10. Subjects vary by school — confirm the current subject list.',
   'Classes', 40, false),
  ('How do I report a problem or get support?',
   'You can reach us through the Contact page, by email at studywithsmritioffice1@gmail.com, or by calling 9905917516 / 6200398012.',
   'Support', 50, true)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Example post, kept as a DRAFT so the admin panel has something to edit.
-- Only "published" rows are ever visible to visitors (enforced by RLS).
-- ---------------------------------------------------------------------------
insert into public.blog_posts (
  slug, title, excerpt, content, category_id, status, seo_title, seo_description
)
select
  'welcome-study-with-smriti',
  'Welcome to the Study with Smriti learning blog',
  '[PLACEHOLDER] Replace this draft with your first real article.',
  '[{"type":"paragraph","content":[{"type":"text","text":"This is a sample draft article. Publish or delete it from the admin panel."}]}]'::jsonb,
  c.id,
  'draft',
  'Welcome to Study with Smriti',
  '[PLACEHOLDER] Meta description for the welcome article.'
from public.blog_categories c
where c.slug = 'announcements'
on conflict (slug) do nothing;
