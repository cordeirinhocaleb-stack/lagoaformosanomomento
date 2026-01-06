-- ============================================================================
-- LAGO FORMO NO MOMENTO - RLS PERFORMANCE & CONSOLIDATION
-- Version: 1.189
-- Date: 2026-01-06
-- Description: Consolidates redundant policies and optimizes auth calls
--              to resolve Supabase Advisor 0003 and 0006 warnings.
-- ============================================================================

-- 1. OPTIMIZED ROLE CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = (SELECT auth.uid()) 
      AND role = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. DYNAMIC CLEANUP OF OLD POLICIES
DO $$ 
DECLARE 
    tbl_name TEXT;
    p_name TEXT;
    target_tables TEXT[] := ARRAY[
        'users', 'news', 'advertisers', 'jobs', 'system_settings', 
        'social_posts', 'error_reports', 'audit_log', 'audit_logs', 
        'support_tickets', 'support_messages', 'engagement_interactions', 'daily_bread'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY target_tables LOOP
        FOR p_name IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl_name) LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_name, tbl_name);
        END LOOP;
    END LOOP;
END $$;

-- 3. UNIFIED POLICIES - USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));
CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));
CREATE POLICY "users_delete" ON public.users FOR DELETE TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));

-- 4. UNIFIED POLICIES - CONTENT (NEWS, DAILY BREAD)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content_select_public" ON public.news FOR SELECT USING (status = 'published' OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "content_staff_all" ON public.news FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));

ALTER TABLE public.daily_bread ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bread_select_public" ON public.daily_bread FOR SELECT USING (true);
CREATE POLICY "bread_staff_all" ON public.daily_bread FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));

-- 5. UNIFIED POLICIES - BUSINESS (ADS, JOBS)
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biz_select_public" ON public.advertisers FOR SELECT USING ("isActive" = true OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "biz_staff_all" ON public.advertisers FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select_public" ON public.jobs FOR SELECT USING ("isActive" = true OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "jobs_staff_all" ON public.jobs FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

-- 6. UNIFIED POLICIES - SYSTEM & SUPPORT
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "system_select_staff" ON public.audit_log FOR SELECT TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "system_insert_trigger" ON public.audit_log FOR INSERT WITH CHECK (true); -- Allow triggers

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select_public" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "settings_staff_all" ON public.system_settings FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));

ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "errors_insert_auth" ON public.error_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "errors_staff_all" ON public.error_reports FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_select_own" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()) OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "support_insert_auth" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "support_staff_all" ON public.support_tickets FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_staff_all" ON public.social_posts FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));

-- 7. CLEANUP AUDIT_LOGS (PLURAL) IF EXISTS
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, changed_at)
        SELECT user_id, table_name, record_id, action, changed_at FROM public.audit_logs ON CONFLICT DO NOTHING;
        DROP TABLE public.audit_logs CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Could not migrate audit_logs, skipping...'; END $$;

-- 8. REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';
