-- =====================================================
-- ENSURE ALL NEWS COLUMNS (Comprehensive Fix)
-- Version: 1.198
-- Date: 06/01/2026
-- Description: Ensures ALL columns used by mapNewsToDb schema exist.
--              Prevents "column not found" errors for image_credits, featured_priority, etc.
-- =====================================================

DO $$
BEGIN
    -- 1. Standard Identity & Content
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='title') THEN
        ALTER TABLE public.news ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='lead') THEN
        ALTER TABLE public.news ADD COLUMN lead TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='content') THEN
        ALTER TABLE public.news ADD COLUMN content TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='category') THEN
        ALTER TABLE public.news ADD COLUMN category TEXT DEFAULT 'Cotidiano';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='status') THEN
        ALTER TABLE public.news ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;

    -- 2. Authorship
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='author_id') THEN
        ALTER TABLE public.news ADD COLUMN author_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='author') THEN
        ALTER TABLE public.news ADD COLUMN author TEXT;
    END IF;

    -- 3. Media & Visuals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='image_url') THEN
        ALTER TABLE public.news ADD COLUMN image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='image_credits') THEN
        ALTER TABLE public.news ADD COLUMN image_credits TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='media_type') THEN
        ALTER TABLE public.news ADD COLUMN media_type TEXT DEFAULT 'image';
    END IF;

    -- 4. Banner System (Complex Fields)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_images') THEN
        ALTER TABLE public.news ADD COLUMN banner_images JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_image_layout') THEN
        ALTER TABLE public.news ADD COLUMN banner_image_layout TEXT DEFAULT 'carousel';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_video_source') THEN
        ALTER TABLE public.news ADD COLUMN banner_video_source TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_video_url') THEN
        ALTER TABLE public.news ADD COLUMN banner_video_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_youtube_video_id') THEN
        ALTER TABLE public.news ADD COLUMN banner_youtube_video_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_youtube_status') THEN
        ALTER TABLE public.news ADD COLUMN banner_youtube_status TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_youtube_metadata') THEN
        ALTER TABLE public.news ADD COLUMN banner_youtube_metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_smart_playback') THEN
        ALTER TABLE public.news ADD COLUMN banner_smart_playback BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_playback_segments') THEN
        ALTER TABLE public.news ADD COLUMN banner_playback_segments JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_segment_duration') THEN
        ALTER TABLE public.news ADD COLUMN banner_segment_duration INTEGER DEFAULT 10;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_transition') THEN
        ALTER TABLE public.news ADD COLUMN banner_transition TEXT DEFAULT 'fade';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='banner_duration') THEN
        ALTER TABLE public.news ADD COLUMN banner_duration INTEGER DEFAULT 4000;
    END IF;

    -- 5. Video Logic
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='video_start') THEN
        ALTER TABLE public.news ADD COLUMN video_start INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='video_end') THEN
        ALTER TABLE public.news ADD COLUMN video_end INTEGER DEFAULT 0;
    END IF;

    -- 6. Engagement & Display
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='views') THEN
        ALTER TABLE public.news ADD COLUMN views INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='tags') THEN
        ALTER TABLE public.news ADD COLUMN tags TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='region') THEN
        ALTER TABLE public.news ADD COLUMN region TEXT DEFAULT 'Região';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='city') THEN
        ALTER TABLE public.news ADD COLUMN city TEXT DEFAULT 'Lagoa Formosa';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='is_breaking') THEN
        ALTER TABLE public.news ADD COLUMN is_breaking BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='is_featured') THEN
        ALTER TABLE public.news ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='featured_priority') THEN
        ALTER TABLE public.news ADD COLUMN featured_priority INTEGER DEFAULT 0;
    END IF;

    -- 7. Structure & SEO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='blocks') THEN
        ALTER TABLE public.news ADD COLUMN blocks JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='social_distribution') THEN
        ALTER TABLE public.news ADD COLUMN social_distribution JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='seo') THEN
        ALTER TABLE public.news ADD COLUMN seo JSONB DEFAULT '{}'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news' AND column_name='source') THEN
        ALTER TABLE public.news ADD COLUMN source TEXT DEFAULT 'site';
    END IF;

END $$;
