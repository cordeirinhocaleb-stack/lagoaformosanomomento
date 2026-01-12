-- ============================================================================
-- LAGO FORMO NO MOMENTO - FULL DATABASE SCHEMA (SUPER SQL)
-- Version: 1.180
-- Date: 2026-01-12
-- Description: Consolidated schema including the latest User columns and 
--              Banner systems. Use this script in Supabase SQL Editor.
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
    role TEXT NOT NULL DEFAULT 'Leitor' CHECK (role IN ('Administrador', 'Jornalista', 'Editor', 'Leitor')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- ADD MISSING USER COLUMNS (Idempotent)
DO $$ 
BEGIN 
    BEGIN ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN bio TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN birthdate DATE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN zipcode TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN city TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN state TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN document TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN profession TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN education TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN skills TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "professionalBio" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN availability TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "companyName" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "businessType" TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "whatsappVisible" BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "themePreference" TEXT DEFAULT 'light'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "socialLinks" JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN advertiser_plan TEXT DEFAULT 'free'; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "activePlans" TEXT[]; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "subscriptionStart" TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "subscriptionEnd" TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "usageCredits" JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN "siteCredits" NUMERIC DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN custom_limits JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN terms_accepted BOOLEAN DEFAULT false; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.users ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE; EXCEPTION WHEN duplicate_column THEN END;
END $$;

-- RLS: Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users viewable by everyone" ON public.users;
CREATE POLICY "Users viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users editable by themselves or Admins" ON public.users;
CREATE POLICY "Users editable by themselves or Admins" ON public.users FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador')
);

-- ============================================================================
-- 2. NEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    lead TEXT,
    content TEXT,
    category TEXT DEFAULT 'Cotidiano',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES public.users(id),
    author TEXT,
    image_url TEXT,
    image_credits TEXT,
    media_type TEXT DEFAULT 'image',
    views INTEGER DEFAULT 0,
    tags TEXT[],
    region TEXT DEFAULT 'Região',
    city TEXT DEFAULT 'Lagoa Formosa',
    is_breaking BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    featured_priority INTEGER DEFAULT 0,
    blocks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    seo JSONB DEFAULT '{}'::jsonb
);

-- ADD NEWS COLUMNS (Banner system etc)
DO $$ 
BEGIN 
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
    BEGIN ALTER TABLE public.news ADD COLUMN video_start INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN video_end INTEGER DEFAULT 0; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.news ADD COLUMN social_distribution JSONB DEFAULT '[]'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
END $$;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "News viewable by everyone" ON public.news;
CREATE POLICY "News viewable by everyone" ON public.news FOR SELECT USING (true);

DROP POLICY IF EXISTS "News editable by Staff" ON public.news;
CREATE POLICY "News editable by Staff" ON public.news FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('Administrador', 'Jornalista', 'Editor'))
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
    logo_url TEXT,
    banner_url TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Advertisers viewable by everyone" ON public.advertisers;
CREATE POLICY "Advertisers viewable by everyone" ON public.advertisers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Advertisers editable by Staff" ON public.advertisers;
CREATE POLICY "Advertisers editable by Staff" ON public.advertisers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('Administrador', 'Jornalista', 'Editor'))
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
    type TEXT DEFAULT 'full-time',
    location TEXT DEFAULT 'Lagoa Formosa, MG',
    contact_email TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Jobs viewable by everyone" ON public.jobs;
CREATE POLICY "Jobs viewable by everyone" ON public.jobs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Jobs editable by Staff" ON public.jobs;
CREATE POLICY "Jobs editable by Staff" ON public.jobs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('Administrador', 'Jornalista', 'Editor'))
);

-- ============================================================================
-- 5. AUDIT LOG & SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    changes JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit viewable by Admin" ON public.audit_log FOR SELECT USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador'));
CREATE POLICY "Settings viewable by Staff" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Settings editable by Admin" ON public.system_settings FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'Administrador'));

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_modtime ON public.users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_modtime ON public.news;
CREATE TRIGGER update_news_modtime BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- 7. PERMISSIONS & SCHEMA RELOAD
-- ============================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

NOTIFY pgrst, 'reload schema';
