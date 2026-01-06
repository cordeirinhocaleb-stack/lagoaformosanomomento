-- ============================================================================
-- LAGO FORMO NO MOMENTO - PERFORMANCE OPTIMIZATION (ULTRA-SAFE INDEXES)
-- Version: 1.185
-- Date: 2026-01-06
-- Description: Adds indexes to critical columns using DYNAMIC SQL to prevent
--              any compile-time "column does not exist" errors.
-- ============================================================================

DO $$ 
BEGIN 
    -- 1. NEWS TABLE INDEXES
    -- Standard sorting (created_at)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'news' AND indexname = 'idx_news_created_at_desc') THEN
            EXECUTE 'CREATE INDEX idx_news_created_at_desc ON public.news (created_at DESC)';
        END IF;
    END IF;

    -- Standard sorting (createdAt)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='createdAt') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'news' AND indexname = 'idx_news_createdat_camel') THEN
            EXECUTE 'CREATE INDEX idx_news_createdat_camel ON public.news ("createdAt" DESC)';
        END IF;
    END IF;

    -- Status + Date (created_at)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='status') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'news' AND indexname = 'idx_news_status_created_at') THEN
            EXECUTE 'CREATE INDEX idx_news_status_created_at ON public.news (status, created_at DESC)';
        END IF;
    END IF;

    -- Status + Date (createdAt)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='status') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='createdAt') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'news' AND indexname = 'idx_news_status_createdat_camel') THEN
            EXECUTE 'CREATE INDEX idx_news_status_createdat_camel ON public.news (status, "createdAt" DESC)';
        END IF;
    END IF;

    -- Priority
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='news' AND column_name='is_featured') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'news' AND indexname = 'idx_news_featured_priority') THEN
            EXECUTE 'CREATE INDEX idx_news_featured_priority ON public.news (is_featured, featured_priority DESC)';
        END IF;
    END IF;

    -- 2. JOBS TABLE INDEXES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='jobs' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'jobs' AND indexname = 'idx_jobs_created_at') THEN
            EXECUTE 'CREATE INDEX idx_jobs_created_at ON public.jobs (created_at DESC)';
        END IF;
    END IF;

    -- 3. AUDIT LOG INDEXES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='audit_log' AND column_name='created_at') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'audit_log' AND indexname = 'idx_audit_log_created_at') THEN
            EXECUTE 'CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC)';
        END IF;
    END IF;

    -- 4. ADVERTISERS
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='advertisers' AND column_name='status') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'advertisers' AND indexname = 'idx_advertisers_status') THEN
            EXECUTE 'CREATE INDEX idx_advertisers_status ON public.advertisers (status)';
        END IF;
    END IF;

END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
