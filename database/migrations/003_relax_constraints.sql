-- =====================================================
-- RELAX SECURITY CONSTRAINTS (USER REQUEST)
-- Version: 1.177
-- Date: 05/01/2026
-- Description: Adjust constraints and ensure required columns exist.
-- =====================================================

-- 1. Ensure required columns exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='cpf') THEN
    ALTER TABLE users ADD COLUMN cpf TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='advertisers' AND column_name='cnpj') THEN
    ALTER TABLE advertisers ADD COLUMN cnpj TEXT;
  END IF;
END $$;

-- 2. Drop strict CPF/CNPJ validation constraints (if they exist)
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_cpf;
ALTER TABLE advertisers DROP CONSTRAINT IF EXISTS valid_cnpj;

-- 3. Remove strict formatting constraints (allow any format, just check length if cleaned)
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_phone_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_cep_format;

-- 4. Add relaxed length checks (optional)
-- We check if the constraint exists before adding, to avoid errors if re-running
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_cpf_length') THEN
        ALTER TABLE users ADD CONSTRAINT valid_cpf_length 
        CHECK (cpf IS NULL OR length(regexp_replace(cpf, '\D', '', 'g')) = 11);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_phone_length') THEN
        ALTER TABLE users ADD CONSTRAINT valid_phone_length 
        CHECK (phone IS NULL OR length(regexp_replace(phone, '\D', '', 'g')) BETWEEN 10 AND 11);
    END IF;
END $$;

-- 5. Comment: This migration relaxes strict validation while preserving basic length checks.
COMMENT ON CONSTRAINT valid_cpf_length ON users IS 'Valida apenas o tamanho do CPF (11 dígitos)';
