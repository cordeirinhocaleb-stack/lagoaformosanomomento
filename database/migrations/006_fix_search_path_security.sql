-- ============================================================================
-- LAGO FORMO NO MOMENTO - DATABASE SECURITY HARDENING (SEARCH_PATH)
-- Version: 1.187
-- Date: 2026-01-06
-- Description: Fixes "mutable search_path" security warnings by modifying 
--              function metadata instead of redefining their logic.
-- ============================================================================

-- 1. SECURITY HARDENING FOR REPORTED FUNCTIONS
-- This approach is safer as it only changes the search_path setting.

-- touch_updated_at
DO $$ BEGIN 
  ALTER FUNCTION public.touch_updated_at() SET search_path = public;
EXCEPTION WHEN undefined_function THEN RAISE NOTICE 'Function touch_updated_at not found, skipping...'; END $$;

-- update_updated_at_column
DO $$ BEGIN 
  ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
EXCEPTION WHEN undefined_function THEN RAISE NOTICE 'Function update_updated_at_column not found, skipping...'; END $$;

-- get_interaction_stats (Check arguments: p_news_id UUID, p_block_id TEXT)
DO $$ BEGIN 
  ALTER FUNCTION public.get_interaction_stats(UUID, TEXT) SET search_path = public;
EXCEPTION WHEN undefined_function THEN RAISE NOTICE 'Function get_interaction_stats not found, skipping...'; END $$;

-- handle_new_user
DO $$ BEGIN 
  ALTER FUNCTION public.handle_new_user() SET search_path = public;
EXCEPTION WHEN undefined_function THEN RAISE NOTICE 'Function handle_new_user not found, skipping...'; END $$;

-- advertisers_set_owner
DO $$ BEGIN 
  ALTER FUNCTION public.advertisers_set_owner() SET search_path = public;
EXCEPTION WHEN undefined_function THEN RAISE NOTICE 'Function advertisers_set_owner not found, skipping...'; END $$;

-- set_updated_at
DO $$ BEGIN 
  ALTER FUNCTION public.set_updated_at() SET search_path = public;
EXCEPTION WHEN undefined_function THEN RAISE NOTICE 'Function set_updated_at not found, skipping...'; END $$;

-- is_staff (Check arguments: user_id UUID)
DO $$ BEGIN 
  ALTER FUNCTION public.is_staff(UUID) SET search_path = public;
EXCEPTION WHEN undefined_function THEN 
  BEGIN
    ALTER FUNCTION public.is_staff() SET search_path = public;
  EXCEPTION WHEN undefined_function THEN
    RAISE NOTICE 'Function is_staff not found, skipping...';
  END;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
