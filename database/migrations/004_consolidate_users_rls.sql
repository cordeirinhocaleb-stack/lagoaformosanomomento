-- ============================================================================
-- LAGO FORMO NO MOMENTO - RLS OPTIMIZATION (USERS TABLE)
-- Version: 1.182
-- Date: 2026-01-06
-- Description: Consolidates redundant policies on public.users to improve 
--              performance and resolve Supabase Advisor warnings.
-- ============================================================================

-- 1. Ensure the helper function exists and is optimized
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- SECURITY DEFINER allows bypassing RLS for this specific check
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid() LIMIT 1;
    RETURN user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. DROP all redundant or conflicting policies on the users table
DO $$ 
DECLARE 
    policy_names TEXT[] := ARRAY[
        'User Update Own Profile',
        'Users editable by themselves or Admins',
        'admin_users_manage',
        'own_profile_update',
        'public_profiles_readable',
        'Users viewable by everyone'
    ];
    pNAME TEXT;
BEGIN
    FOREACH pNAME IN ARRAY policy_names LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pNAME);
    END LOOP;
END $$;

-- 3. CREATE clean, non-overlapping policies

-- SELECT: Public reading of basic profile info
CREATE POLICY "users_read_all" ON public.users 
    FOR SELECT 
    USING (true);

-- UPDATE: Consolidated update policy for users and staff
-- This single policy covers both self-service and administrative management
CREATE POLICY "users_update_all" ON public.users 
    FOR UPDATE 
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        public.check_user_role(ARRAY['Admin', 'Administrador', 'Desenvolvedor'])
    );

-- DELETE: Management reserved for Admins/Developers
CREATE POLICY "users_delete_admin" ON public.users 
    FOR DELETE 
    TO authenticated
    USING (
        public.check_user_role(ARRAY['Admin', 'Administrador', 'Desenvolvedor'])
    );

-- INSERT: Manual insertion reserved for staff
-- Note: User signup via Supabase Auth usually handles the initial record via triggers, 
-- but this policy governs manual DB operations.
CREATE POLICY "users_insert_admin" ON public.users 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        public.check_user_role(ARRAY['Admin', 'Administrador', 'Desenvolvedor'])
    );

-- 4. Refresh schema cache
NOTIFY pgrst, 'reload schema';
