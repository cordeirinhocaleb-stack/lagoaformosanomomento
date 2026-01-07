-- ============================================================================
-- SECURITY HARDENING - RLS FIXES
-- Version: 1.194
-- Date: 2026-01-07
-- Description: Fixes permissive RLS policies to satisfy Supabase Security Advisor.
--              1. audit_log: Restricts INSERTS to owner only (anti-spoofing).
--              2. error_reports: Prevents user_id spoofing (Anonymous or Self).
--              3. engagement_interactions: Default Deny (Unused table in src).
-- ============================================================================

-- 1. AUDIT LOG (Anti-Spoofing)
DROP POLICY IF EXISTS "audit_insert_v1.193" ON public.audit_log;

CREATE POLICY "audit_insert_v1.194" ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
);

-- 2. ERROR REPORTS (Context Integrity)
DROP POLICY IF EXISTS "errors_insert_v1.193" ON public.error_reports;

CREATE POLICY "errors_insert_v1.194" ON public.error_reports FOR INSERT
WITH CHECK (
    -- CASE 1: Authenticated User reporting for themselves
    (auth.role() = 'authenticated' AND user_id = auth.uid())
    OR
    -- CASE 2: Anonymous User reporting (user_id must be null)
    (auth.role() = 'anon' AND user_id IS NULL)
);

-- 3. ENGAGEMENT INTERACTIONS (Default Deny)
-- No reference found in source code (services/content/contentService.ts uses news.blocks).
-- Removing loose policy in favor of standard 'deny all' until needed.
DROP POLICY IF EXISTS "eng_insert_v1.193" ON public.engagement_interactions;
