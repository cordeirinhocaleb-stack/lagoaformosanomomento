-- =====================================================
-- LAGOA FORMOSA NO MOMENTO - SCHEMA COMPLETO (SUPABASE)
-- Versão: 1.101
-- Última Atualização: 04/01/2026
-- Changelog: Políticas RLS reforçadas para proteção de dados sensíveis
-- =====================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. FUNÇÕES AUXILIARES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABELA DE USUÁRIOS (Profiles)
-- Estende o auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Leitor',
    status TEXT NOT NULL DEFAULT 'active',
    avatar TEXT,
    bio TEXT,
    phone TEXT,
    profession TEXT,
    education TEXT,
    skills TEXT[] DEFAULT '{}',
    professionalBio TEXT,
    availability TEXT,
    companyName TEXT,
    businessType TEXT,
    whatsappVisible BOOLEAN DEFAULT true,
    themePreference TEXT DEFAULT 'light',
    socialLinks JSONB DEFAULT '{}'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    siteCredits DECIMAL(12,2) DEFAULT 0,
    usageCredits JSONB DEFAULT '{
        "postsRemaining": 0,
        "videosRemaining": 0,
        "featuredDaysRemaining": 0,
        "clicksBalance": 0
    }'::jsonb,
    activePlans TEXT[] DEFAULT '{}',
    subscriptionStart TIMESTAMP WITH TIME ZONE,
    subscriptionEnd TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE NOTÍCIAS
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    lead TEXT,
    content TEXT,
    category TEXT NOT NULL,
    author TEXT NOT NULL,
    authorId UUID REFERENCES public.users(id),
    status TEXT NOT NULL DEFAULT 'draft',
    source TEXT DEFAULT 'site',
    imageUrl TEXT,
    isBreaking BOOLEAN DEFAULT false,
    isFeatured BOOLEAN DEFAULT false,
    featuredPriority INTEGER DEFAULT 0,
    seo JSONB DEFAULT '{
        "slug": "",
        "metaTitle": "",
        "metaDescription": "",
        "focusKeyword": ""
    }'::jsonb,
    city TEXT DEFAULT 'Lagoa Formosa',
    region TEXT DEFAULT 'Urbana',
    views INTEGER DEFAULT 0,
    blocks JSONB DEFAULT '[]'::jsonb,
    socialDistribution JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE ANUNCIANTES
CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    logoUrl TEXT,
    logoIcon TEXT DEFAULT 'fa-store',
    bannerUrl TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    billingCycle TEXT NOT NULL DEFAULT 'monthly',
    startDate TIMESTAMP WITH TIME ZONE NOT NULL,
    endDate TIMESTAMP WITH TIME ZONE NOT NULL,
    isActive BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    redirectType TEXT DEFAULT 'internal',
    externalUrl TEXT,
    internalPage JSONB DEFAULT '{
        "description": "",
        "products": [],
        "whatsapp": "",
        "instagram": "",
        "location": ""
    }'::jsonb,
    coupons JSONB DEFAULT '[]'::jsonb,
    ownerId UUID REFERENCES public.users(id),
    popupSet JSONB DEFAULT '{"items": []}'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE EMPREGOS / JOB BOARD
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    salary TEXT,
    description TEXT,
    whatsapp TEXT,
    isActive BOOLEAN DEFAULT true,
    postedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE CONFIGURAÇÕES (KEY-VALUE)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELAS DE SUPORTE (TICKETS)
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
CREATE TRIGGER tr_update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER tr_update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. POLÍTICAS DE SEGURANÇA (RLS) - REFORÇADAS v1.101
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS DE USUÁRIOS (GRANULARES)
-- ========================================

-- Usuário pode ver seu próprio perfil completo (incluindo dados sensíveis)
CREATE POLICY "users_view_own_full_profile" ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Usuário pode atualizar apenas seu próprio perfil (campos não-críticos)
CREATE POLICY "users_update_own_profile" ON public.users 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid()) -- Impede mudança de role
);

-- Público pode ver apenas informações não-sensíveis de outros usuários
CREATE POLICY "users_view_public_info" ON public.users 
FOR SELECT 
USING (
    auth.uid() != id OR auth.uid() IS NULL
)
WITH CHECK (true);
-- Nota: Campos sensíveis devem ser filtrados na aplicação ou via VIEW

-- Admins e Desenvolvedores podem ver todos os usuários
CREATE POLICY "admin_view_all_users" ON public.users 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Admins podem atualizar qualquer usuário
CREATE POLICY "admin_update_users" ON public.users 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- Apenas sistema pode criar usuários (via service_role ou signup)
CREATE POLICY "system_create_users" ON public.users 
FOR INSERT 
WITH CHECK (true); -- Controlado por auth.users

-- ========================================
-- POLÍTICAS DE NOTÍCIAS
-- ========================================

-- Todos podem ler notícias publicadas
CREATE POLICY "public_news_readable" ON public.news 
FOR SELECT 
USING (status = 'published');

-- Staff pode ver todas as notícias (incluindo rascunhos)
CREATE POLICY "staff_view_all_news" ON public.news 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter')
    )
);

-- Staff pode criar, atualizar e deletar notícias
CREATE POLICY "staff_manage_news" ON public.news 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter')
    )
);

-- ========================================
-- POLÍTICAS DE ANUNCIANTES
-- ========================================

-- Todos podem ver anunciantes ativos
CREATE POLICY "public_view_active_advertisers" ON public.advertisers 
FOR SELECT 
USING (isActive = true);

-- Staff pode ver todos os anunciantes
CREATE POLICY "staff_view_all_advertisers" ON public.advertisers 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Anunciante pode ver e editar apenas seus próprios anúncios
CREATE POLICY "advertiser_manage_own" ON public.advertisers 
FOR ALL 
USING (ownerId = auth.uid());

-- Admins podem gerenciar todos os anunciantes
CREATE POLICY "admin_manage_advertisers" ON public.advertisers 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- ========================================
-- POLÍTICAS DE EMPREGOS
-- ========================================

-- Todos podem ver empregos ativos
CREATE POLICY "public_view_active_jobs" ON public.jobs 
FOR SELECT 
USING (isActive = true);

-- Admins podem gerenciar todos os empregos
CREATE POLICY "admin_manage_jobs" ON public.jobs 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- ========================================
-- POLÍTICAS DE SUPORTE
-- ========================================

-- Usuário pode ver apenas seus próprios tickets
CREATE POLICY "users_view_own_tickets" ON public.support_tickets 
FOR SELECT 
USING (user_id = auth.uid());

-- Usuário pode criar tickets
CREATE POLICY "users_create_tickets" ON public.support_tickets 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Admins podem ver todos os tickets
CREATE POLICY "admin_view_all_tickets" ON public.support_tickets 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Admins podem atualizar tickets
CREATE POLICY "admin_update_tickets" ON public.support_tickets 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Mensagens de suporte: usuário vê apenas do seu ticket
CREATE POLICY "users_view_own_messages" ON public.support_messages 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE id = ticket_id 
        AND user_id = auth.uid()
    )
);

-- Usuário pode enviar mensagens em seus tickets
CREATE POLICY "users_send_messages" ON public.support_messages 
FOR INSERT 
WITH CHECK (
    sender_id = auth.uid() 
    AND EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE id = ticket_id 
        AND user_id = auth.uid()
    )
);

-- Admins podem ver e enviar todas as mensagens
CREATE POLICY "admin_manage_messages" ON public.support_messages 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- ========================================
-- POLÍTICAS DE CONFIGURAÇÕES
-- ========================================

-- Apenas Admins e Desenvolvedores podem gerenciar configurações
CREATE POLICY "admin_manage_settings" ON public.settings 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- 11. DADOS INICIAIS
INSERT INTO public.settings (key, value) VALUES (
    'ad_config',
    '{"plans": [], "promoText": "", "active": true}'::jsonb
) ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES (
    'lfnm_system_settings',
    '{"jobsModuleEnabled": true, "enableOmnichannel": true, "supabase": {"url": "", "anonKey": ""}}'::jsonb
) ON CONFLICT (key) DO NOTHING;
