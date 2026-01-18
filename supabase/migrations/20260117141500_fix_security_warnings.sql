-- Fix security warnings identified by Supabase Linter

-- 1. Function Search Path Mutable
-- Set explicit search_path for security defined functions to prevent malicious path hijacking
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_auth_user() SET search_path = public, auth, extensions;

-- 2. RLS Policy Cleanup
-- The trigger handle_new_auth_user runs as SECURITY DEFINER, so it doesn't need an INSERT policy on public.users.
-- Allowing public INSERT on users is a security risk.
DROP POLICY IF EXISTS "users_insert_v2" ON public.users;

-- 3. Engagement Interactions
-- To satisfy the linter and add mild validation, ensuring 'type' is present for inserts.
-- Assuming 'type' column exists. If not, we will check generic constraint.
-- Ideally we just keep it if it's strictly public, but let's restrict to anon/auth roles to be cleaner?
-- Or allow only if required fields are present.
-- For now, we will leave engagement_interactions alone unless explicitly asked to lock it down, 
-- as blocking it might break analytics. 
-- The user showed the warning but usually 'INSERT true' is valid for public logs. 
-- However, we can TRY to tighten it.
-- Let's just address the Function paths and Users policy first, which are critical.

-- If engagement_interactions warning persists, we can add a check like (char_length(type) > 0)

