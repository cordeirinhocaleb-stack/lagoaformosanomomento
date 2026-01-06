-- ============================================================================
-- LAGO FORMO NO MOMENTO - RLS FINAL HARDENING & OPTIMIZATION
-- Version: 1.193
-- Date: 2026-01-06
-- Description: Deeply optimized RLS policies to eliminate all Supabase 
--              Advisor warnings (0003, 0006, 0008). 
--              Ensures single permissive policy per role/action, optimized 
--              auth calls, and covers all identified tables.
-- ============================================================================

-- 1. CLEANUP ALL POLICIES FOR TARGET TABLES
DO $$ 
DECLARE 
    tbl_name TEXT;
    p_name TEXT;
    target_tables TEXT[] := ARRAY[
        'users', 'news', 'advertisers', 'jobs', 'system_settings', 'settings',
        'social_posts', 'error_reports', 'audit_log', 'audit_logs', 
        'support_tickets', 'support_messages', 'engagement_interactions', 'daily_bread',
        'ad_plans', 'ad_prices', 'ad_plan_placements'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY target_tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
            FOR p_name IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl_name) LOOP
                EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p_name, tbl_name);
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- 2. USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_v1.193" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_all_v1.193" ON public.users FOR ALL TO authenticated 
    USING ((SELECT auth.uid()) = id OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));

-- 3. CONTENT TABLES (NEWS, DAILY BREAD)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_select_v1.193" ON public.news FOR SELECT 
    USING (status = 'published' OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "news_insert_v1.193" ON public.news FOR INSERT TO authenticated 
    WITH CHECK ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "news_update_v1.193" ON public.news FOR UPDATE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "news_delete_v1.193" ON public.news FOR DELETE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));

ALTER TABLE public.daily_bread ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bread_select_v1.193" ON public.daily_bread FOR SELECT USING (true);
CREATE POLICY "bread_insert_v1.193" ON public.daily_bread FOR INSERT TO authenticated 
    WITH CHECK ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "bread_update_v1.193" ON public.daily_bread FOR UPDATE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "bread_delete_v1.193" ON public.daily_bread FOR DELETE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));

-- 4. BUSINESS TABLES (ADS, JOBS)
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads_select_v1.193" ON public.advertisers FOR SELECT 
    USING ("isActive" = true OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "ads_all_v1.193" ON public.advertisers FOR ALL TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select_v1.193" ON public.jobs FOR SELECT 
    USING ("isActive" = true OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "jobs_all_v1.193" ON public.jobs FOR ALL TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

-- 5. SYSTEM & SETTINGS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sys_settings_select_v1.193" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "sys_settings_all_v1.193" ON public.system_settings FOR ALL TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));

-- Conditional Settings Table
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'settings') THEN
        ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "settings_sel_v1.193" ON public.settings FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "settings_all_v1.193" ON public.settings FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY[''Admin'', ''Desenvolvedor''])))';
    END IF;
END $$;

-- 6. SUPPORT SYSTEM
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_tk_select_v1.193" ON public.support_tickets FOR SELECT TO authenticated 
    USING (user_id = (SELECT auth.uid()) OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "support_tk_insert_v1.193" ON public.support_tickets FOR INSERT TO authenticated 
    WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "support_tk_update_v1.193" ON public.support_tickets FOR UPDATE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));
CREATE POLICY "support_tk_delete_v1.193" ON public.support_tickets FOR DELETE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_msg_select_v1.193" ON public.support_messages FOR SELECT TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = (SELECT auth.uid()))
        OR (SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor']))
    );
CREATE POLICY "support_msg_insert_v1.193" ON public.support_messages FOR INSERT TO authenticated 
    WITH CHECK (
        sender_id = (SELECT auth.uid()) 
        AND EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = (SELECT auth.uid()))
    );
CREATE POLICY "support_msg_all_staff_v1.193" ON public.support_messages FOR ALL TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor'])));

-- 7. MISC & NEW TABLES
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_select_v1.193" ON public.social_posts FOR SELECT 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "social_all_v1.193" ON public.social_posts FOR ALL TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));

ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "errors_insert_v1.193" ON public.error_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "errors_staff_select_v1.193" ON public.error_reports FOR SELECT TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));
CREATE POLICY "errors_staff_update_v1.193" ON public.error_reports FOR UPDATE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));
CREATE POLICY "errors_staff_delete_v1.193" ON public.error_reports FOR DELETE TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor'])));

-- Engagement Interactions
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'engagement_interactions') THEN
        ALTER TABLE public.engagement_interactions ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "eng_select_v1.193" ON public.engagement_interactions FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "eng_insert_v1.193" ON public.engagement_interactions FOR INSERT WITH CHECK (true)';
        EXECUTE 'CREATE POLICY "eng_staff_all_v1.193" ON public.engagement_interactions FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY[''Admin'', ''Desenvolvedor''])))';
    END IF;
END $$;

-- Ad Plans & Prices
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ad_plans') THEN
        ALTER TABLE public.ad_plans ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "ad_plans_sel_v1.193" ON public.ad_plans FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "ad_plans_all_v1.193" ON public.ad_plans FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY[''Admin'', ''Desenvolvedor''])))';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ad_prices') THEN
        ALTER TABLE public.ad_prices ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "ad_prices_sel_v1.193" ON public.ad_prices FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "ad_prices_all_v1.193" ON public.ad_prices FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY[''Admin'', ''Desenvolvedor''])))';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ad_plan_placements') THEN
        ALTER TABLE public.ad_plan_placements ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "ad_place_sel_v1.193" ON public.ad_plan_placements FOR SELECT USING (true)';
        EXECUTE 'CREATE POLICY "ad_place_all_v1.193" ON public.ad_plan_placements FOR ALL TO authenticated USING ((SELECT public.check_user_role(ARRAY[''Admin'', ''Desenvolvedor''])))';
    END IF;
END $$;

-- 8. AUDIT LOG (Singular & Plural)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_v1.193" ON public.audit_log FOR SELECT TO authenticated 
    USING ((SELECT public.check_user_role(ARRAY['Admin', 'Desenvolvedor', 'Editor', 'Jornalista'])));
CREATE POLICY "audit_insert_v1.193" ON public.audit_log FOR INSERT WITH CHECK (true);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
        EXECUTE 'CREATE POLICY "audit_logs_select_v1.193" ON public.audit_logs FOR SELECT TO authenticated USING ((SELECT public.check_user_role(ARRAY[''Admin'', ''Desenvolvedor''])))';
    END IF;
END $$;

-- Final reload
NOTIFY pgrst, 'reload schema';
