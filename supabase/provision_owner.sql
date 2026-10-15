-- ===========================================================================
-- Study with Smriti — Owner account provisioning (documented, secure process)
--
-- STEP 1 — Disable public sign-ups:
--         Supabase Dashboard → Authentication → Providers → Email
--         → turn OFF "Allow new users to sign up".
--         (Invitations still work.)
--
-- STEP 2 — Invite the owner:
--         Supabase Dashboard → Authentication → Users → "Invite user"
--         → enter the owner email (e.g. studywithsmritioffice1@gmail.com).
--         The owner sets a password through the emailed link.
--
-- STEP 3 — Grant the owner role by running the statement below in the SQL
--         editor, replacing the email with the invited address.
-- ===========================================================================

insert into public.profiles (id, email, role)
select u.id, u.email, 'owner'
from auth.users u
where u.email = 'OWNER_EMAIL_HERE'
on conflict (id) do update set role = excluded.role;

-- To grant additional admins later (never the other way around):
-- insert into public.profiles (id, email, role)
-- select u.id, u.email, 'admin' from auth.users u where u.email = 'OTHER_EMAIL';

-- Verify:
-- select id, email, role from public.profiles;
