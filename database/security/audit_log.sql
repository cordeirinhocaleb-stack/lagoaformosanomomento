-- =====================================================
-- AUDIT LOG SYSTEM
-- Version: 1.175
-- Date: 2026-01-05
-- =====================================================

-- Tabela para rastreamento de alterações
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,  -- Redundância para histórico
  user_name TEXT,   -- Nome do usuário que fez a alteração
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  action TEXT DEFAULT 'UPDATE',  -- INSERT, UPDATE, DELETE
  changed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  
  -- Índices para consultas rápidas
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_table (table_name, record_id),
  INDEX idx_audit_date (changed_at DESC),
  INDEX idx_audit_field (table_name, field_name)
);

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_field ON audit_log(table_name, field_name);

-- Comentários
COMMENT ON TABLE audit_log IS 'Log de auditoria de alterações em campos sensíveis';
COMMENT ON COLUMN audit_log.old_value IS 'Valor anterior do campo';
COMMENT ON COLUMN audit_log.new_value IS 'Novo valor do campo';
COMMENT ON COLUMN audit_log.action IS 'Tipo de ação: INSERT, UPDATE, DELETE';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins e desenvolvedores podem ver logs
CREATE POLICY "Admins and Devs can view audit logs" ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Admin', 'Desenvolvedor')
    )
  );

-- System pode inserir (via triggers)
CREATE POLICY "System can insert audit logs" ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- Ninguém pode modificar ou deletar logs (imutável)
CREATE POLICY "Audit logs are immutable" ON audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted" ON audit_log
  FOR DELETE
  USING (false);

-- =====================================================
-- TRIGGERS DE AUDITORIA
-- =====================================================

-- Função genérica para auditar mudanças
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  current_user_email TEXT;
  current_user_name TEXT;
BEGIN
  -- Obtém informações do usuário atual
  SELECT id, email, name INTO current_user_id, current_user_email, current_user_name
  FROM users
  WHERE id = auth.uid();
  
  -- Se for UPDATE, registra apenas campos que mudaram
  IF TG_OP = 'UPDATE' THEN
    -- Audita campo 'name' se mudou
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
      VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'name', OLD.name, NEW.name, 'UPDATE');
    END IF;
    
    -- Audita campo 'email' se mudou
    IF OLD.email IS DISTINCT FROM NEW.email THEN
      INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
      VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'email', OLD.email, NEW.email, 'UPDATE');
    END IF;
    
    -- Audita campo 'cpf' se mudou (CRÍTICO)
    IF OLD.cpf IS DISTINCT FROM NEW.cpf THEN
      INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
      VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'cpf', OLD.cpf, NEW.cpf, 'UPDATE');
    END IF;
    
    -- Audita campo 'role' se mudou (CRÍTICO)
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
      VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'role', OLD.role, NEW.role, 'UPDATE');
    END IF;
    
    -- Audita campo 'status' se mudou (CRÍTICO)
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
      VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'status', OLD.status, NEW.status, 'UPDATE');
    END IF;
    
    -- Audita campo 'phone' se mudou
    IF OLD.phone IS DISTINCT FROM NEW.phone THEN
      INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
      VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'phone', OLD.phone, NEW.phone, 'UPDATE');
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Se for INSERT, registra criação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
    VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, NEW.id, 'record_created', NULL, 
            json_build_object('name', NEW.name, 'email', NEW.email, 'role', NEW.role)::text, 'INSERT');
    
    RETURN NEW;
  END IF;
  
  -- Se for DELETE, registra exclusão
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, user_email, user_name, table_name, record_id, field_name, old_value, new_value, action)
    VALUES (current_user_id, current_user_email, current_user_name, TG_TABLE_NAME, OLD.id, 'record_deleted', 
            json_build_object('name', OLD.name, 'email', OLD.email, 'role', OLD.role)::text, NULL, 'DELETE');
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para tabela users
DROP TRIGGER IF EXISTS users_audit_trigger ON users;
CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_changes();

-- =====================================================
-- FUNÇÕES HELPER PARA CONSULTAR AUDIT LOG
-- =====================================================

-- Função para obter histórico de um registro específico
CREATE OR REPLACE FUNCTION get_record_history(
  p_table_name TEXT,
  p_record_id UUID,
  p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
  id UUID,
  user_name TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  action TEXT,
  changed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    audit_log.id,
    audit_log.user_name,
    audit_log.field_name,
    audit_log.old_value,
    audit_log.new_value,
    audit_log.action,
    audit_log.changed_at
  FROM audit_log
  WHERE audit_log.table_name = p_table_name
    AND audit_log.record_id = p_record_id
  ORDER BY audit_log.changed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter alterações de um usuário específico
CREATE OR REPLACE FUNCTION get_user_changes(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  table_name TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  action TEXT,
  changed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    audit_log.id,
    audit_log.table_name,
    audit_log.field_name,
    audit_log.old_value,
    audit_log.new_value,
    audit_log.action,
    audit_log.changed_at
  FROM audit_log
  WHERE audit_log.user_id = p_user_id
  ORDER BY audit_log.changed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter mudanças críticas recentes
CREATE OR REPLACE FUNCTION get_critical_changes(
  p_hours INTEGER DEFAULT 24,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  user_name TEXT,
  user_email TEXT,
  table_name TEXT,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    audit_log.id,
    audit_log.user_name,
    audit_log.user_email,
    audit_log.table_name,
    audit_log.field_name,
    audit_log.old_value,
    audit_log.new_value,
    audit_log.changed_at
  FROM audit_log
  WHERE audit_log.field_name IN ('role', 'status', 'cpf', 'document')
    AND audit_log.changed_at >= NOW() - INTERVAL '1 hour' * p_hours
  ORDER BY audit_log.changed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP AUTOMÁTICO (RETENÇÃO DE 1 ANO)
-- =====================================================

-- Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_log
  WHERE changed_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
