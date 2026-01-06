-- =====================================================
-- FIELD-LEVEL PERMISSIONS SYSTEM
-- Version: 1.175
-- Date: 2026-01-05
-- =====================================================

-- Tabela para controle granular de acesso a campos
CREATE TABLE IF NOT EXISTS field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  table_name TEXT NOT NULL,
  field_name TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  mask_type TEXT DEFAULT 'full',  -- 'full', 'partial_cpf', 'partial_cnpj', 'partial_email', 'partial_phone', 'hidden'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint de unicidade
  UNIQUE(role, table_name, field_name),
  
  -- Constraints de validação
  CHECK (mask_type IN ('full', 'partial_cpf', 'partial_cnpj', 'partial_email', 'partial_phone', 'hidden'))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_field_permissions_role ON field_permissions(role);
CREATE INDEX IF NOT EXISTS idx_field_permissions_table ON field_permissions(table_name);
CREATE INDEX IF NOT EXISTS idx_field_permissions_lookup ON field_permissions(role, table_name, field_name);

-- Comentários
COMMENT ON TABLE field_permissions IS 'Controle granular de permissões de visualização e edição de campos';
COMMENT ON COLUMN field_permissions.mask_type IS 'Tipo de máscara para visualização: full (completo), partial_* (parcial), hidden (oculto)';

-- =====================================================
-- DADOS INICIAIS DE PERMISSÕES
-- =====================================================

-- Limpa dados existentes (apenas para setup inicial)
TRUNCATE field_permissions;

-- ADMIN: Acesso total a todos os campos
INSERT INTO field_permissions (role, table_name, field_name, can_view, can_edit, mask_type) VALUES
  ('Admin', 'users', 'cpf', true, true, 'full'),
  ('Admin', 'users', 'email', true, true, 'full'),
  ('Admin', 'users', 'phone', true, true, 'full'),
  ('Admin', 'users', 'role', true, true, 'full'),
  ('Admin', 'users', 'status', true, true, 'full'),
  ('Admin', 'users', 'document', true, true, 'full');

-- DESENVOLVEDOR: Acesso total + campos técnicos
INSERT INTO field_permissions (role, table_name, field_name, can_view, can_edit, mask_type) VALUES
  ('Desenvolvedor', 'users', 'cpf', true, true, 'full'),
  ('Desenvolvedor', 'users', 'email', true, true, 'full'),
  ('Desenvolvedor', 'users', 'phone', true, true, 'full'),
  ('Desenvolvedor', 'users', 'role', true, true, 'full'),
  ('Desenvolvedor', 'users', 'status', true, true, 'full'),
  ('Desenvolvedor', 'users', 'document', true, true, 'full');

-- JORNALISTA: Visualização limitada, sem edição de roles/status
INSERT INTO field_permissions (role, table_name, field_name, can_view, can_edit, mask_type) VALUES
  ('Jornalista', 'users', 'cpf', true, false, 'partial_cpf'),
  ('Jornalista', 'users', 'email', true, false, 'full'),
  ('Jornalista', 'users', 'phone', true, false, 'partial_phone'),
  ('Jornalista', 'users', 'role', true, false, 'full'),
  ('Jornalista', 'users', 'status', true, false, 'full'),
  ('Jornalista', 'users', 'document', false, false, 'hidden');

-- ANUNCIANTE: Pode editar próprios dados de contato
INSERT INTO field_permissions (role, table_name, field_name, can_view, can_edit, mask_type) VALUES
  ('Anunciante', 'users', 'cpf', true, false, 'partial_cpf'),
  ('Anunciante', 'users', 'email', true, true, 'full'),
  ('Anunciante', 'users', 'phone', true, true, 'full'),
  ('Anunciante', 'users', 'role', true, false, 'full'),
  ('Anunciante', 'users', 'status', true, false, 'full'),
  ('Anunciante', 'users', 'document', true, false, 'partial_cpf');

-- LEITOR: Visualização muito limitada
INSERT INTO field_permissions (role, table_name, field_name, can_view, can_edit, mask_type) VALUES
  ('Leitor', 'users', 'cpf', false, false, 'hidden'),
  ('Leitor', 'users', 'email', true, true, 'partial_email'),
  ('Leitor', 'users', 'phone', true, true, 'partial_phone'),
  ('Leitor', 'users', 'role', true, false, 'full'),
  ('Leitor', 'users', 'status', true, false, 'full'),
  ('Leitor', 'users', 'document', false, false, 'hidden');

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE field_permissions ENABLE ROW LEVEL SECURITY;

-- Apenas admins e desenvolvedores podem visualizar permissões
CREATE POLICY "Admins can view permissions" ON field_permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'Desenvolvedor')
    )
  );

-- Apenas admins podem modificar permissões
CREATE POLICY "Only admins can modify permissions" ON field_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

-- =====================================================
-- FUNÇÃO HELPER PARA CONSULTAR PERMISSÕES
-- =====================================================

CREATE OR REPLACE FUNCTION get_field_permission(
  p_role TEXT,
  p_table_name TEXT,
  p_field_name TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'canView', can_view,
    'canEdit', can_edit,
    'maskType', mask_type
  ) INTO result
  FROM field_permissions
  WHERE role = p_role
    AND table_name = p_table_name
    AND field_name = p_field_name;
  
  -- Fallback se não encontrar
  IF result IS NULL THEN
    result := json_build_object(
      'canView', true,
      'canEdit', false,
      'maskType', 'full'
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
