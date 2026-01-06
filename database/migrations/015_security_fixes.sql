-- ============================================================================
-- MIGRATION 015: SECURITY HARDENING
-- Date: 2026-01-06
-- Description: Fix "Function Search Path Mutable" warnings by explicitly setting 
--              search_path to 'public' for trigger functions.
-- ============================================================================

-- 1. Fix update_updated_at_column (Known existing function)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql' SET search_path = public;

-- 2. Fix handle_updated_at (Repo warning function)
-- Creating/Replacing with safe default if likely used by other extensions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql' SET search_path = public;

-- 3. Note on RLS Policies (Audit Log)
-- The warning "RLS Policy Always True" for INSERT on audit_log is acknowledged.
-- We explicitly allow anonymous/public inserts (WITH CHECK true) to enable:
-- a) Logging of failed login attempts (Client-side)
-- b) Tracking of non-authenticated engagement interactions
-- No changes made to RLS to prevent regression in these features.

-- 4. Apply explicit permissions just in case
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO PUBLIC;
