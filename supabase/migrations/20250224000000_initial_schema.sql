-- =====================================================
-- LAGOA FORMOSA NO MOMENTO - SCHEMA INICIAL
-- Migration: 20250224000000_initial_schema
-- Descrição: Criação das tabelas principais do sistema
-- =====================================================

-- Tabela de Configurações do Sistema
-- Armazena todas as configurações globais (Cloudinary, Supabase, Footer, etc)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por chave
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir configuração padrão do Cloudinary (vazia inicialmente)
INSERT INTO system_settings (key, value, updated_by)
VALUES (
    'cloudinary',
    '{
        "images": {
            "cloudName": "",
            "uploadPreset": ""
        },
        "videos": {
            "cloudName": "",
            "uploadPreset": ""
        }
    }'::jsonb,
    'system'
) ON CONFLICT (key) DO NOTHING;

-- Inserir configuração padrão do Footer
INSERT INTO system_settings (key, value, updated_by)
VALUES (
    'footer',
    '{
        "phone": "",
        "email": "",
        "socialLinks": {
            "instagram": "",
            "facebook": "",
            "whatsapp": "",
            "youtube": ""
        }
    }'::jsonb,
    'system'
) ON CONFLICT (key) DO NOTHING;

-- Inserir configuração padrão de features
INSERT INTO system_settings (key, value, updated_by)
VALUES (
    'features',
    '{
        "jobsModuleEnabled": false,
        "enableOmnichannel": false
    }'::jsonb,
    'system'
) ON CONFLICT (key) DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE system_settings IS 'Armazena todas as configurações globais do sistema LFNM';
COMMENT ON COLUMN system_settings.key IS 'Chave única identificadora da configuração (ex: cloudinary, footer, features)';
COMMENT ON COLUMN system_settings.value IS 'Valor da configuração em formato JSON';
COMMENT ON COLUMN system_settings.updated_by IS 'Usuário que realizou a última atualização';
