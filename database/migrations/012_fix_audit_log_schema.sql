
-- Migration: 012_fix_audit_log_schema
-- Description: Add user_name and relax record_id constraints for audit_log.

-- 1. Add user_name column if it doesn't exist
DO $$ 
BEGIN 
    BEGIN 
        ALTER TABLE public.audit_log ADD COLUMN user_name TEXT; 
    EXCEPTION 
        WHEN duplicate_column THEN NULL; 
    END; 
END $$;

-- 2. Change record_id to TEXT to support pre-UUID actions (like failed creates)
-- or temporary local IDs.
ALTER TABLE public.audit_log ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;

-- 3. Ensure RLS allows insert for authenticated users
DROP POLICY IF EXISTS "audit_insert_v1.194" ON public.audit_log;
CREATE POLICY "audit_insert_v1.201" ON public.audit_log FOR INSERT TO authenticated
WITH CHECK (
    user_id = auth.uid()
);
