-- ============================================================================
-- MIGRATION: 018_add_missing_contact_columns
-- DESCRIPTION: Adiciona colunas de contato (address, phone, email, cpf_cnpj) que faltavam.
-- AUTHOR: Auto-Generated
-- DATE: 2026-01-25
-- ============================================================================

DO $$ 
BEGIN 
    -- Address (JSONB)
    BEGIN ALTER TABLE public.advertisers ADD COLUMN address JSONB DEFAULT '{}'::jsonb; EXCEPTION WHEN duplicate_column THEN END;
    
    -- Contact Info
    BEGIN ALTER TABLE public.advertisers ADD COLUMN phone TEXT; EXCEPTION WHEN duplicate_column THEN END;
    BEGIN ALTER TABLE public.advertisers ADD COLUMN email TEXT; EXCEPTION WHEN duplicate_column THEN END;
    
    -- Document
    BEGIN ALTER TABLE public.advertisers ADD COLUMN cpf_cnpj TEXT; EXCEPTION WHEN duplicate_column THEN END;

END $$;
