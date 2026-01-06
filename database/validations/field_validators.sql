-- =====================================================
-- DATABASE FIELD VALIDATORS
-- Version: 1.175
-- Date: 2026-01-05
-- =====================================================

-- =====================================================
-- CUSTOM DOMAINS
-- =====================================================

-- Domain para CPF (apenas 11 dígitos)
CREATE DOMAIN cpf_br AS TEXT
  CHECK (VALUE IS NULL OR VALUE ~ '^\d{11}$');

COMMENT ON DOMAIN cpf_br IS 'CPF brasileiro (11 dígitos sem formatação)';

-- Domain para CNPJ (apenas 14 dígitos)
CREATE DOMAIN cnpj_br AS TEXT
  CHECK (VALUE IS NULL OR VALUE ~ '^\d{14}$');

COMMENT ON DOMAIN cnpj_br IS 'CNPJ brasileiro (14 dígitos sem formatação)';

-- Domain para email
CREATE DOMAIN email_address AS TEXT
  CHECK (VALUE IS NULL OR VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

COMMENT ON DOMAIN email_address IS 'Email válido (RFC compliant)';

-- Domain para telefone BR
CREATE DOMAIN phone_br AS TEXT
  CHECK (VALUE IS NULL OR VALUE ~ '^\d{10,11}$');

COMMENT ON DOMAIN phone_br IS 'Telefone brasileiro (10 ou 11 dígitos sem formatação)';

-- Domain para CEP
CREATE DOMAIN cep_br AS TEXT
  CHECK (VALUE IS NULL OR VALUE ~ '^\d{8}$');

COMMENT ON DOMAIN cep_br IS 'CEP brasileiro (8 dígitos sem formatação)';

-- =====================================================
-- FUNÇÕES DE VALIDAÇÃO
-- =====================================================

-- Função de validação de CPF com dígito verificador
CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT) RETURNS BOOLEAN AS $$
DECLARE
  digits INT[];
  sum1 INT := 0;
  sum2 INT := 0;
  digit1 INT;
  digit2 INT;
  i INT;
BEGIN
  -- Remove não-dígitos
  cpf := regexp_replace(cpf, '\D', '', 'g');
  
  -- Verifica tamanho
  IF length(cpf) <> 11 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica sequências inválidas (111.111.111-11, etc)
  IF cpf ~ '^(\d)\1{10}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Converte para array de inteiros
  FOR i IN 1..11 LOOP
    digits[i] := substring(cpf, i, 1)::INT;
  END LOOP;
  
  -- Valida primeiro dígito
  FOR i IN 1..9 LOOP
    sum1 := sum1 + (digits[i] * (11 - i));
  END LOOP;
  
  digit1 := 11 - (sum1 % 11);
  IF digit1 >= 10 THEN
    digit1 := 0;
  END IF;
  
  IF digits[10] <> digit1 THEN
    RETURN FALSE;
  END IF;
  
  -- Valida segundo dígito
  FOR i IN 1..10 LOOP
    sum2 := sum2 + (digits[i] * (12 - i));
  END LOOP;
  
  digit2 := 11 - (sum2 % 11);
  IF digit2 >= 10 THEN
    digit2 := 0;
  END IF;
  
  RETURN digits[11] = digit2;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_cpf IS 'Valida CPF com algoritmo de dígito verificador';

-- Função de validação de CNPJ com dígito verificador
CREATE OR REPLACE FUNCTION validate_cnpj(cnpj TEXT) RETURNS BOOLEAN AS $$
DECLARE
  digits INT[];
  weights1 INT[] := ARRAY[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  weights2 INT[] := ARRAY[6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum INT;
  digit1 INT;
  digit2 INT;
  i INT;
BEGIN
  -- Remove não-dígitos
  cnpj := regexp_replace(cnpj, '\D', '', 'g');
  
  -- Verifica tamanho
  IF length(cnpj) <> 14 THEN
    RETURN FALSE;
  END IF;
  
  -- Verifica sequências inválidas
  IF cnpj ~ '^(\d)\1{13}$' THEN
    RETURN FALSE;
  END IF;
  
  -- Converte para array
  FOR i IN 1..14 LOOP
    digits[i] := substring(cnpj, i, 1)::INT;
  END LOOP;
  
  -- Valida primeiro dígito
  sum := 0;
  FOR i IN 1..12 LOOP
    sum := sum + (digits[i] * weights1[i]);
  END LOOP;
  
  digit1 := CASE WHEN sum % 11 < 2 THEN 0 ELSE 11 - (sum % 11) END;
  
  IF digits[13] <> digit1 THEN
    RETURN FALSE;
  END IF;
  
  -- Valida segundo dígito
  sum := 0;
  FOR i IN 1..13 LOOP
    sum := sum + (digits[i] * weights2[i]);
  END LOOP;
  
  digit2 := CASE WHEN sum % 11 < 2 THEN 0 ELSE 11 - (sum % 11) END;
  
  RETURN digits[14] = digit2;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_cnpj IS 'Valida CNPJ com algoritmo de dígito verificador';

-- =====================================================
-- APLICAÇÃO DE VALIDATORS NA TABELA USERS
-- =====================================================

-- Adiciona constraints de validação
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_cpf;
ALTER TABLE users ADD CONSTRAINT valid_cpf 
  CHECK (cpf IS NULL OR validate_cpf(cpf));

ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_email_format;
ALTER TABLE users ADD CONSTRAINT valid_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_phone_format;
ALTER TABLE users ADD CONSTRAINT valid_phone_format 
  CHECK (phone IS NULL OR phone ~ '^\d{10,11}$');

ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_cep_format;
ALTER TABLE users ADD CONSTRAINT valid_cep_format 
  CHECK ("zipCode" IS NULL OR "zipCode" ~ '^\d{8}$');

-- Constraints de comprimento de texto (250 caracteres)
ALTER TABLE users DROP CONSTRAINT IF EXISTS text_length_name;
ALTER TABLE users ADD CONSTRAINT text_length_name 
  CHECK (length(name) <= 250);

ALTER TABLE users DROP CONSTRAINT IF EXISTS text_length_street;
ALTER TABLE users ADD CONSTRAINT text_length_street 
  CHECK (street IS NULL OR length(street) <= 250);

ALTER TABLE users DROP CONSTRAINT IF EXISTS text_length_city;
ALTER TABLE users ADD CONSTRAINT text_length_city 
  CHECK (city IS NULL OR length(city) <= 250);

ALTER TABLE users DROP CONSTRAINT IF EXISTS text_length_profession;
ALTER TABLE users ADD CONSTRAINT text_length_profession 
  CHECK (profession IS NULL OR length(profession) <= 250);

ALTER TABLE users DROP CONSTRAINT IF EXISTS text_length_company_name;
ALTER TABLE users ADD CONSTRAINT text_length_company_name 
  CHECK ("companyName" IS NULL OR length("companyName") <= 250);

-- Constraints de valores válidos
ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_role;
ALTER TABLE users ADD CONSTRAINT valid_role 
  CHECK (role IN ('Leitor', 'Anunciante', 'Jornalista', 'Admin', 'Desenvolvedor'));

ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE users ADD CONSTRAINT valid_status 
  CHECK (status IN ('active', 'inactive', 'pending', 'blocked'));

-- =====================================================
-- TRIGGER DE VALIDAÇÃO PRÉ-INSERT/UPDATE
-- =====================================================

CREATE OR REPLACE FUNCTION validate_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitiza email (lowercase)
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(trim(NEW.email));
  END IF;
  
  -- Remove formatação de CPF (mantém apenas dígitos)
  IF NEW.cpf IS NOT NULL THEN
    NEW.cpf := regexp_replace(NEW.cpf, '\D', '', 'g');
  END IF;
  
  -- Remove formatação de telefone
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := regexp_replace(NEW.phone, '\D', '', 'g');
  END IF;
  
  -- Remove formatação de CEP
  IF NEW."zipCode" IS NOT NULL THEN
    NEW."zipCode" := regexp_replace(NEW."zipCode", '\D', '', 'g');
  END IF;
  
  -- Limita comprimento de textos
  IF NEW.name IS NOT NULL THEN
    NEW.name := substring(NEW.name, 1, 250);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_user_data_trigger ON users;
CREATE TRIGGER validate_user_data_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_data();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON CONSTRAINT valid_cpf ON users IS 'Valida CPF com algoritmo de dígito verificador';
COMMENT ON CONSTRAINT valid_email_format ON users IS 'Valida formato de email (RFC compliant)';
COMMENT ON CONSTRAINT text_length_name ON users IS 'Limita nome a 250 caracteres';
