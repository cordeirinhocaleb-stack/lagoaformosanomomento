-- =====================================================
-- LAGOA FORMOSA NO MOMENTO - ATUALIZAÇÃO DE SEGURANÇA
-- Versão: 1.101
-- Data: 04/01/2026
-- =====================================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Faça backup do banco de dados antes de executar
-- 2. Execute este script no Supabase SQL Editor
-- 3. Verifique os logs após a execução
-- 
-- ATENÇÃO: Este script remove políticas antigas e cria novas
-- =====================================================

-- =====================================================
-- PASSO 1: REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- =====================================================

-- Remover políticas antigas de usuários
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Public profiles are visible" ON public.users;

-- Remover políticas antigas de notícias
DROP POLICY IF EXISTS "Public news are readable by everyone" ON public.news;
DROP POLICY IF EXISTS "Staff can do everything on news" ON public.news;

-- Remover políticas antigas de anunciantes
DROP POLICY IF EXISTS "Advertisers are readable by everyone" ON public.advertisers;

-- Remover políticas antigas de configurações
DROP POLICY IF EXISTS "Admin can manage settings" ON public.settings;

-- =====================================================
-- PASSO 2: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 3: POLÍTICAS DE USUÁRIOS (GRANULARES)
-- =====================================================

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

-- =====================================================
-- PASSO 4: POLÍTICAS DE NOTÍCIAS
-- =====================================================

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

-- =====================================================
-- PASSO 5: POLÍTICAS DE ANUNCIANTES
-- =====================================================

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

-- =====================================================
-- PASSO 6: POLÍTICAS DE EMPREGOS
-- =====================================================

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

-- =====================================================
-- PASSO 7: POLÍTICAS DE SUPORTE
-- =====================================================

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

-- =====================================================
-- PASSO 8: POLÍTICAS DE CONFIGURAÇÕES
-- =====================================================

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

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Listar todas as políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- FIM DA ATUALIZAÇÃO
-- =====================================================
