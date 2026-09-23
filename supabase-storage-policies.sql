-- Run in the Supabase SQL Editor after confirming the bucket name is `media`.
-- Public SELECT is intentional: product media URLs are displayed on the storefront.
-- No browser INSERT/UPDATE/DELETE policy is granted. Netlify Functions use the
-- service-role key, which bypasses RLS, after validating the admin session.
alter table storage.objects enable row level security;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
on storage.objects for select
to public
using (bucket_id = 'media');

-- Remove any existing permissive browser write policies for the media bucket
-- in the Supabase dashboard. Do not create INSERT, UPDATE, or DELETE policies
-- for anon or authenticated roles.
