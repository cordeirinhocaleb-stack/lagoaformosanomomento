-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE RLS
-- Versão: 1.0
-- Data: 2026-01-25
-- =====================================================
-- 
-- OBJETIVO: Resolver 46 avisos de performance do Supabase Linter
-- 
-- PROBLEMAS RESOLVIDOS:
-- 1. Auth RLS Initialization Plan (8 avisos)
--    - Otimizar auth.uid() para (select auth.uid())
-- 2. Multiple Permissive Policies (38 avisos)
--    - Consolidar políticas duplicadas
-- 
-- INSTRUÇÕES:
-- 1. Faça backup do banco antes de executar
-- 2. Execute em ambiente de desenvolvimento primeiro
-- 3. Teste todas as funcionalidades de autenticação
-- 4. Verifique com Supabase Linter após aplicação
-- =====================================================

-- =====================================================
-- PARTE 1: REMOVER POLÍTICAS DUPLICADAS
-- =====================================================

-- Tabela: users
DROP POLICY IF EXISTS "Admins can select all users" ON public.users;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "users_update_v2" ON public.users;

-- Tabela: news
DROP POLICY IF EXISTS "News editable by Staff" ON public.news;
DROP POLICY IF EXISTS "News viewable by everyone" ON public.news;
DROP POLICY IF EXISTS "news_select_v1.193" ON public.news;
DROP POLICY IF EXISTS "news_insert_v1.193" ON public.news;
DROP POLICY IF EXISTS "news_update_v1.193" ON public.news;
DROP POLICY IF EXISTS "news_delete_v1.193" ON public.news;

-- Tabela: advertisers
DROP POLICY IF EXISTS "Advertisers editable by Staff" ON public.advertisers;
DROP POLICY IF EXISTS "Advertisers viewable by everyone" ON public.advertisers;
DROP POLICY IF EXISTS "Permitir leitura pública de anunciantes" ON public.advertisers;
DROP POLICY IF EXISTS "ads_all_v1.193" ON public.advertisers;
DROP POLICY IF EXISTS "ads_delete_policy" ON public.advertisers;
DROP POLICY IF EXISTS "ads_staff_master_policy" ON public.advertisers;

-- Tabela: audit_log
DROP POLICY IF EXISTS "Audit viewable by Admin" ON public.audit_log;
DROP POLICY IF EXISTS "audit_select_v1.193" ON public.audit_log;

-- Tabela: system_settings
DROP POLICY IF EXISTS "Settings editable by Admin" ON public.system_settings;
DROP POLICY IF EXISTS "Settings viewable by Staff" ON public.system_settings;
DROP POLICY IF EXISTS "allow_public_read_settings" ON public.system_settings;
DROP POLICY IF EXISTS "sys_settings_staff_write" ON public.system_settings;

-- Tabela: jobs
DROP POLICY IF EXISTS "Jobs viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Permitir leitura pública de vagas" ON public.jobs;
DROP POLICY IF EXISTS "jobs_staff_all" ON public.jobs;

-- Tabela: engagement_interactions
DROP POLICY IF EXISTS "Public Interaction Insert" ON public.engagement_interactions;
DROP POLICY IF EXISTS "Public Interaction Select" ON public.engagement_interactions;
DROP POLICY IF EXISTS "eng_staff_all_v1.193" ON public.engagement_interactions;

-- Tabela: terms_acceptances
DROP POLICY IF EXISTS "terms_select_admin" ON public.terms_acceptances;
DROP POLICY IF EXISTS "terms_select_own" ON public.terms_acceptances;

-- =====================================================
-- PARTE 2: CRIAR POLÍTICAS OTIMIZADAS - USERS
-- =====================================================

-- Users: SELECT consolidado (Admin + Own Profile)
CREATE POLICY "users_select_policy" ON public.users
FOR SELECT
USING (
    -- Usuário pode ver seu próprio perfil
    id = (select auth.uid())
    OR
    -- Admins podem ver todos
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Users: UPDATE consolidado (Admin + Own Profile)
CREATE POLICY "users_update_policy" ON public.users
FOR UPDATE
USING (
    -- Usuário pode atualizar seu próprio perfil
    id = (select auth.uid())
    OR
    -- Admins podem atualizar qualquer perfil
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor')
    )
)
WITH CHECK (
    -- Usuário não pode mudar seu próprio role
    (id = (select auth.uid()) AND role = (SELECT role FROM public.users WHERE id = (select auth.uid())))
    OR
    -- Admins podem fazer qualquer mudança
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- =====================================================
-- PARTE 3: CRIAR POLÍTICAS OTIMIZADAS - NEWS
-- =====================================================

-- News: SELECT consolidado (Public + Staff)
CREATE POLICY "news_select_policy" ON public.news
FOR SELECT
USING (
    -- Todos podem ver notícias publicadas
    status = 'published'
    OR
    -- Staff pode ver todas (incluindo rascunhos)
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter')
    )
);

-- News: INSERT (Staff only)
CREATE POLICY "news_insert_policy" ON public.news
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter')
    )
);

-- News: UPDATE (Staff only)
CREATE POLICY "news_update_policy" ON public.news
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter')
    )
);

-- News: DELETE (Staff only)
CREATE POLICY "news_delete_policy" ON public.news
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Editor', 'Desenvolvedor', 'Editor-Chefe', 'Repórter')
    )
);

-- =====================================================
-- PARTE 4: CRIAR POLÍTICAS OTIMIZADAS - ADVERTISERS
-- =====================================================

-- Advertisers: SELECT consolidado (Public + Staff)
CREATE POLICY "advertisers_select_policy" ON public.advertisers
FOR SELECT
USING (
    -- Todos podem ver anunciantes ativos
    "isActive" = true
    OR
    -- Staff pode ver todos
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
    OR
    -- Owner pode ver seus próprios anúncios
    "ownerId" = (select auth.uid())
);

-- Advertisers: INSERT (Staff + Owner)
CREATE POLICY "advertisers_insert_policy" ON public.advertisers
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
    OR
    "ownerId" = (select auth.uid())
);

-- Advertisers: UPDATE (Staff + Owner)
CREATE POLICY "advertisers_update_policy" ON public.advertisers
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
    OR
    "ownerId" = (select auth.uid())
);

-- Advertisers: DELETE (Staff only)
CREATE POLICY "advertisers_delete_policy" ON public.advertisers
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- =====================================================
-- PARTE 5: CRIAR POLÍTICAS OTIMIZADAS - AUDIT_LOG
-- =====================================================

-- Audit Log: SELECT (Admin only)
CREATE POLICY "audit_log_select_policy" ON public.audit_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- =====================================================
-- PARTE 6: CRIAR POLÍTICAS OTIMIZADAS - SYSTEM_SETTINGS
-- =====================================================

-- System Settings: SELECT consolidado (Public + Staff)
CREATE POLICY "system_settings_select_policy" ON public.system_settings
FOR SELECT
USING (
    -- Configurações públicas podem ser vistas por todos
    "isPublic" = true
    OR
    -- Staff pode ver todas as configurações
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- System Settings: INSERT/UPDATE/DELETE (Admin only)
CREATE POLICY "system_settings_write_policy" ON public.system_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- =====================================================
-- PARTE 7: CRIAR POLÍTICAS OTIMIZADAS - JOBS
-- =====================================================

-- Jobs: SELECT consolidado (Public + Staff)
CREATE POLICY "jobs_select_policy" ON public.jobs
FOR SELECT
USING (
    -- Todos podem ver vagas ativas
    "isActive" = true
    OR
    -- Staff pode ver todas
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Jobs: INSERT/UPDATE/DELETE (Staff only)
CREATE POLICY "jobs_write_policy" ON public.jobs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- =====================================================
-- PARTE 8: CRIAR POLÍTICAS OTIMIZADAS - ENGAGEMENT_INTERACTIONS
-- =====================================================

-- Engagement Interactions: SELECT (Public + Staff)
CREATE POLICY "engagement_select_policy" ON public.engagement_interactions
FOR SELECT
USING (
    -- Usuário pode ver suas próprias interações
    user_id = (select auth.uid())
    OR
    -- Staff pode ver todas
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- Engagement Interactions: INSERT (Authenticated users)
CREATE POLICY "engagement_insert_policy" ON public.engagement_interactions
FOR INSERT
WITH CHECK (
    -- Usuário autenticado pode criar interações
    user_id = (select auth.uid())
    OR
    -- Staff pode criar qualquer interação
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe')
    )
);

-- =====================================================
-- PARTE 9: CRIAR POLÍTICAS OTIMIZADAS - TERMS_ACCEPTANCES
-- =====================================================

-- Terms Acceptances: SELECT (Own + Admin)
CREATE POLICY "terms_select_policy" ON public.terms_acceptances
FOR SELECT
USING (
    -- Usuário pode ver suas próprias aceitações
    user_id = (select auth.uid())
    OR
    -- Admin pode ver todas
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = (select auth.uid())
        AND role IN ('Admin', 'Desenvolvedor')
    )
);

-- =====================================================
-- PARTE 10: ÍNDICES DE PERFORMANCE
-- =====================================================

-- Índices para otimizar verificações de role
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE role IN ('Admin', 'Desenvolvedor', 'Editor-Chefe', 'Editor', 'Repórter');
CREATE INDEX IF NOT EXISTS idx_users_id_role ON public.users(id, role);

-- Índices para otimizar verificações de ownership
CREATE INDEX IF NOT EXISTS idx_advertisers_owner ON public.advertisers("ownerId");
CREATE INDEX IF NOT EXISTS idx_engagement_user ON public.engagement_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_terms_user ON public.terms_acceptances(user_id);

-- Índices para otimizar verificações de status
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news(status);
CREATE INDEX IF NOT EXISTS idx_advertisers_active ON public.advertisers("isActive");
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs("isActive");
CREATE INDEX IF NOT EXISTS idx_settings_public ON public.system_settings("isPublic");

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Listar todas as políticas ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Executar Supabase Linter para verificar se avisos foram resolvidos
-- 2. Testar todas as funcionalidades:
--    - Login/Logout
--    - CRUD de News (como Admin, Editor, User)
--    - CRUD de Advertisers (como Admin, Owner, User)
--    - Visualização de Audit Log (como Admin, User)
--    - Leitura de System Settings (como Admin, User, Anon)
-- 3. Monitorar performance das queries RLS
-- 4. Verificar logs de erro
-- 
-- ROLLBACK (se necessário):
-- Execute: supabase/migrations/20260117141500_fix_security_warnings.sql
-- =====================================================
