-- =====================================================
-- LAGOA FORMOSA NO MOMENTO - RESGATE TOTAL (SUPABASE)
-- Versão: 1.102.1 (ULTRA RECURSION FIX & SCHEMA SYNC)
-- Data: 04/01/2026 - 14:30
-- =====================================================

-- 1. LIMPEZA DE POLÍTICAS ANTIGAS (SCRUBBER)
-- Este bloco remove TODAS as políticas de segurança existentes para evitar conflitos de nomes
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('users', 'news', 'advertisers', 'jobs', 'system_settings')) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. FUNÇÕES DE SUPORTE ATUALIZADAS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Só tenta atualizar se a coluna existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME AND column_name = 'updatedAt') THEN
        NEW."updatedAt" = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- FUNÇÃO DE CHECAGEM DE ROLE (SECURITY DEFINER + BYPASS RLS)
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- O uso de SELECT sem RLS aqui é garantido pelo SECURITY DEFINER
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid() LIMIT 1;
    RETURN user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. SINCRONIZAÇÃO DE COLUNAS (Tabela News)
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS lead TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "isBreaking" BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "featuredPriority" INTEGER DEFAULT 0;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{"slug":"","metaTitle":"","metaDescription":"","focusKeyword":""}'::jsonb;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Lagoa Formosa';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Urbana';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "imageCredits" TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "mediaType" TEXT DEFAULT 'image';

-- Colunas de Banner
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerImages" TEXT[] DEFAULT '{}';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerMediaType" TEXT DEFAULT 'image';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerVideoUrl" TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerVideoSource" TEXT DEFAULT 'cloudinary';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerYoutubeMeta" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerLayout" TEXT DEFAULT 'classic';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerTransition" TEXT DEFAULT 'fade';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "bannerDuration" INTEGER DEFAULT 5;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "videoStart" INTEGER DEFAULT 0;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "videoEnd" INTEGER;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "isBannerAnimated" BOOLEAN DEFAULT true;

-- Datas Capsuladas
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. SINCRONIZAÇÃO DE COLUNAS (Outras Tabelas)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
ALTER TABLE public.advertisers ADD COLUMN IF NOT EXISTS "ownerId" UUID;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- 5. NOVAS POLÍTICAS DE SEGURANÇA (RESILIENTES)
-- Habilitar RLS em tudo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 5.1 Usuários: Leitura básica permitida para todos (Evita recursão no login)
CREATE POLICY "public_profiles_readable" ON public.users FOR SELECT USING (true);
CREATE POLICY "own_profile_update" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_users_manage" ON public.users FOR ALL USING (public.check_user_role(ARRAY['Admin', 'Desenvolvedor']));

-- 5.2 Notícias: Leitura pública de publicadas, gestão completa por staff
CREATE POLICY "news_read_public" ON public.news FOR SELECT USING (status = 'published' OR public.check_user_role(ARRAY['Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter']));
CREATE POLICY "news_staff_all" ON public.news FOR ALL USING (public.check_user_role(ARRAY['Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter']));

-- 5.3 Anunciantes e Empregos
CREATE POLICY "ads_read_public" ON public.advertisers FOR SELECT USING ("isActive" = true OR public.check_user_role(ARRAY['Admin', 'Desenvolvedor']));
CREATE POLICY "ads_staff_all" ON public.advertisers FOR ALL USING (public.check_user_role(ARRAY['Admin', 'Desenvolvedor']));
CREATE POLICY "jobs_read_public" ON public.jobs FOR SELECT USING ("isActive" = true OR public.check_user_role(ARRAY['Admin', 'Desenvolvedor']));
CREATE POLICY "jobs_staff_all" ON public.jobs FOR ALL USING (public.check_user_role(ARRAY['Admin', 'Desenvolvedor']));

-- 5.4 Configurações
CREATE POLICY "settings_read_public" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON public.system_settings FOR ALL USING (public.check_user_role(ARRAY['Admin', 'Desenvolvedor']));

-- 6. GARANTIR TRIGGERS
DROP TRIGGER IF EXISTS tr_update_users_updated_at ON public.users;
CREATE TRIGGER tr_update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_news_updated_at ON public.news;
CREATE TRIGGER tr_update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_update_settings_updated_at ON public.system_settings;
CREATE TRIGGER tr_update_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. DADOS DE TESTE (Notícia modelo para validar colunas)
INSERT INTO public.news (title, lead, content, category, author, status, "isFeatured")
VALUES ('Sistema Restaurado', 'O portal Lagoa Formosa no Momento agora conta com banco de dados sincronizado.', 'As notícias voltaram a carregar com sucesso após a correção das políticas RLS.', 'Geral', 'Antigravity', 'published', true)
ON CONFLICT DO NOTHING;
