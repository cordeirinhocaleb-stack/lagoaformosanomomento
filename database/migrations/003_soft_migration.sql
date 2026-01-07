-- SOFT MIGRATION (v1.177)
-- Description: Adds missing snake_case columns required by V2 features (like Banner System)
--              WITHOUT removing existing camelCase columns.
--              Safe to run multiple times (idempotent).

-- ============================================================================
-- 1. NEWS TABLE - Add V2 Banner Columns
-- ============================================================================
DO $$ 
BEGIN 
    -- Banner System (snake_case required by new logic)
    BEGIN ALTER TABLE public.news ADD COLUMN banner_images JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_image_layout TEXT DEFAULT 'carousel'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_video_source TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_video_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_youtube_video_id TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_youtube_status TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_youtube_metadata JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_smart_playback BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_playback_segments JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_segment_duration INTEGER DEFAULT 10; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_transition TEXT DEFAULT 'fade'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN banner_duration INTEGER DEFAULT 4000; EXCEPTION WHEN duplicate_column THEN END;

    -- Video Logic
    BEGIN ALTER TABLE public.news ADD COLUMN video_start INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN video_end INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;

    -- Social
    BEGIN ALTER TABLE public.news ADD COLUMN social_distribution JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    
    -- SEO
    BEGIN ALTER TABLE public.news ADD COLUMN seo JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN is_breaking BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN is_featured BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN featured_priority INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    
    -- Sync existing data logic (Optional: copy data from camelCase if needed, but risky for now. keeping it strictly additive)
END $$;

-- ============================================================================
-- 2. USERS TABLE - Add Missing standard columns
-- ============================================================================
DO $$ 
BEGIN 
    BEGIN ALTER TABLE public.users ADD COLUMN avatar_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- ============================================================================
-- 3. ADVERTISERS TABLE 
-- ============================================================================
DO $$ 
BEGIN 
    BEGIN ALTER TABLE public.advertisers ADD COLUMN logo_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN banner_url TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN company_name TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN trade_name TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- Notify
NOTIFY pgrst, 'reload schema';
