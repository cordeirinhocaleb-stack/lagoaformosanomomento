-- ============================================================================
-- LAGO FORMO NO MOMENTO - CONSOLIDATED DATABASE SCHEMA (SUPER SQL)
-- Version: 1.176
-- Date: 2026-01-05
-- Description: Full schema definition with idempotency checks (IF NOT EXISTS).
--              Includes Banner System (v1.173) and Security policies.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Administrador', 'Jornalista', 'Editor', 'Leitor')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- RLS: Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users viewable by everyone" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users editable by themselves or Admins" ON public.users
    FOR UPDATE USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador')
    );

-- ============================================================================
-- 2. NEWS TABLE (Main Content)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    lead TEXT,
    content TEXT,
    category TEXT DEFAULT 'Cotidiano',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- Authorship
    author_id UUID REFERENCES public.users(id),
    author TEXT, -- Denormalized name for display
    
    -- Images & Media (Classic)
    image_url TEXT,
    image_credits TEXT,
    media_type TEXT DEFAULT 'image',
    
    -- Banner System (New v1.173 fields - snake_case)
    banner_images JSONB DEFAULT '[]'::jsonb,
    banner_image_layout TEXT DEFAULT 'carousel' CHECK (banner_image_layout IN ('carousel', 'grid', 'fade', 'split', 'mosaic')),
    banner_video_source TEXT CHECK (banner_video_source IS NULL OR banner_video_source IN ('internal', 'youtube')),
    banner_video_url TEXT,
    banner_youtube_video_id TEXT,
    banner_youtube_status TEXT CHECK (banner_youtube_status IS NULL OR banner_youtube_status IN ('uploading', 'processing', 'ready', 'failed')),
    banner_youtube_metadata JSONB DEFAULT '{}'::jsonb,
    banner_smart_playback BOOLEAN DEFAULT false,
    banner_playback_segments JSONB DEFAULT '[]'::jsonb,
    banner_segment_duration INTEGER DEFAULT 10,
    banner_transition TEXT DEFAULT 'fade',
    banner_duration INTEGER DEFAULT 4000,
    
    -- Video Logic
    video_start INTEGER DEFAULT 0,
    video_end INTEGER DEFAULT 0,
    
    -- SEO & Meta
    views INTEGER DEFAULT 0,
    tags TEXT[],
    region TEXT DEFAULT 'Região',
    city TEXT DEFAULT 'Lagoa Formosa',
    is_breaking BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    featured_priority INTEGER DEFAULT 0,
    
    -- Structured Content
    blocks JSONB DEFAULT '[]'::jsonb,
    
    -- Social
    social_distribution JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SEO Objects
    seo JSONB DEFAULT '{}'::jsonb
);

-- ADD COLUMNS SAFELY (Idempotency for existing tables)
DO $$ 
BEGIN 
    -- Banner System Columns
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
END $$;

-- RLS: News
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News viewable by everyone" ON public.news
    FOR SELECT USING (true); -- Public read access

CREATE POLICY "News editable by Staff" ON public.news
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Jornalista', 'Editor')
        )
    );

-- ============================================================================
-- 3. ADVERTISERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    trade_name TEXT,
    cnpj TEXT,
    email TEXT,
    phone TEXT,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    
    -- Branding
    logo_url TEXT,
    banner_url TEXT,
    
    -- Address
    address JSONB DEFAULT '{}'::jsonb,
    
    -- Social
    social_links JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Advertisers
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advertisers viewable by everyone" ON public.advertisers
    FOR SELECT USING (true);

CREATE POLICY "Advertisers editable by Admins Only" ON public.advertisers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador')
    );

-- ============================================================================
-- 4. JOBS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    requirements TEXT[],
    salary_range TEXT,
    type TEXT DEFAULT 'full-time', -- full-time, part-time, freelance
    location TEXT DEFAULT 'Lagoa Formosa, MG',
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- RLS: Jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs viewable by everyone" ON public.jobs
    FOR SELECT USING (true);

CREATE POLICY "Jobs editable by Staff" ON public.jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Jornalista', 'Editor')
        )
    );

-- ============================================================================
-- 5. AUDIT LOG (Security)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    changes JSONB, -- Stores old/new values
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Audit Log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit Log viewable by Admins only" ON public.audit_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador')
    );

CREATE POLICY "Audit Log insertable by system/triggers" ON public.audit_log
    FOR INSERT WITH CHECK (true); -- Allow triggers to insert

-- ============================================================================
-- 6. SYSTEM SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by Staff" ON public.system_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Jornalista', 'Editor')
        )
    );

CREATE POLICY "Settings editable by Admins only" ON public.system_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador')
    );

-- ============================================================================
-- 7. SOCIAL POSTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID REFERENCES public.news(id),
    platform TEXT NOT NULL, -- facebook, instagram, twitter, linkedin
    content TEXT,
    media_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, posted, failed
    external_id TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    posted_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Social Posts
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social Posts viewable by Staff" ON public.social_posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('Administrador', 'Jornalista', 'Editor')
        )
    );

-- ============================================================================
-- 8. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users
DROP TRIGGER IF EXISTS update_users_modtime ON public.users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for news
DROP TRIGGER IF EXISTS update_news_modtime ON public.news;
CREATE TRIGGER update_news_modtime BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for advertisers
DROP TRIGGER IF EXISTS update_advertisers_modtime ON public.advertisers;
CREATE TRIGGER update_advertisers_modtime BEFORE UPDATE ON public.advertisers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- FINALIZATION
-- ============================================================================
-- Permissions Grant (Adjust 'service_role' or 'postgres' as needed for your specific setup if not default Supabase)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Force refresh of schema cache (Supabase sometimes needs this)
NOTIFY pgrst, 'reload schema';

