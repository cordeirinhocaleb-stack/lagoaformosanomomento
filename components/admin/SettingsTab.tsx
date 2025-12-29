
import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../types';
import { checkConnection } from '../../services/supabaseService';
import { testSocialWebhook } from '../../services/integrationService';

interface SettingsTabProps {
  driveConfig: { clientId: string; apiKey: string; appId: string };
  systemSettings: SystemSettings;
  onSave: (driveConfig: { clientId: string; apiKey: string; appId: string }, systemSettings: SystemSettings) => void;
  onExportDB: () => void;
  onExportSchema: () => void;
  gapiInited: boolean;
  gisInited: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ driveConfig, systemSettings, onSave, onExportDB, onExportSchema, gapiInited, gisInited }) => {
  const [config, setConfig] = useState(driveConfig);
  const [settings, setSettings] = useState<SystemSettings>(systemSettings);
  
  // Local State
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setConfig(driveConfig);
    setSettings(systemSettings);
  }, [driveConfig, systemSettings]);

  const testConnection = async () => {
      if (!settings.supabase?.url || !settings.supabase?.anonKey) {
          alert("URL e Key são obrigatórios.");
          return;
      }
      setConnectionStatus('checking');
      const ok = await checkConnection(settings.supabase.url, settings.supabase.anonKey);
      setConnectionStatus(ok ? 'success' : 'error');
  };

  const handleTestWebhook = async () => {
      if (!settings.socialWebhookUrl) return alert("Insira uma URL para testar.");
      setWebhookStatus('testing');
      const ok = await testSocialWebhook(settings.socialWebhookUrl);
      if (ok) {
          setWebhookStatus('success');
          alert("✅ Teste enviado! Verifique seu Make/Zapier.");
      } else {
          setWebhookStatus('error');
          alert("❌ Falha ao enviar. Verifique a URL e CORS.");
      }
      setTimeout(() => setWebhookStatus('idle'), 3000);
  };

  const handleExportSchema = () => {
    const sql = `
-- LFNM: SCHEMA DATABASE COMPLETO
-- Execute este script no 'SQL Editor' do Supabase para corrigir tabelas e permissões.

-- 1. TABELA DE CONFIGURAÇÕES (Para Salvar Webhooks e Integrações)
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELAS PRINCIPAIS
CREATE TABLE IF NOT EXISTS public.news (
    id TEXT PRIMARY KEY, 
    status TEXT NOT NULL DEFAULT 'draft', 
    title TEXT NOT NULL, 
    lead TEXT, 
    content TEXT, 
    category TEXT, 
    "authorId" TEXT, 
    author TEXT, 
    "editorId" TEXT, 
    "editorName" TEXT, 
    "imageUrl" TEXT, 
    "imageCredits" TEXT, 
    "mediaType" TEXT DEFAULT 'image', 
    "videoUrl" TEXT, 
    "galleryUrls" JSONB, 
    city TEXT, 
    region TEXT, 
    "isBreaking" BOOLEAN DEFAULT false, 
    "isFeatured" BOOLEAN DEFAULT false, 
    "featuredPriority" INTEGER DEFAULT 0, 
    seo JSONB, 
    source TEXT DEFAULT 'site', 
    versions JSONB, 
    "socialDistribution" JSONB, 
    views INTEGER DEFAULT 0, 
    "createdAt" TIMESTAMPTZ DEFAULT NOW(), 
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(), 
    "publishedAt" TIMESTAMPTZ, 
    "scheduledAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.advertisers (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL, 
    category TEXT, 
    plan TEXT NOT NULL, 
    "billingCycle" TEXT, 
    "logoIcon" TEXT, 
    "logoUrl" TEXT, 
    "bannerUrl" TEXT, 
    "startDate" DATE, 
    "endDate" DATE, 
    "isActive" BOOLEAN DEFAULT true, 
    views INTEGER DEFAULT 0, 
    clicks INTEGER DEFAULT 0, 
    "redirectType" TEXT, 
    "externalUrl" TEXT, 
    coupons JSONB, 
    "internalPage" JSONB, 
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL, 
    email TEXT NOT NULL UNIQUE, 
    password TEXT, 
    role TEXT NOT NULL, 
    status TEXT NOT NULL DEFAULT 'active', 
    avatar TEXT, 
    bio TEXT, 
    "socialLinks" JSONB, 
    "permissions" JSONB, 
    "twoFactorEnabled" BOOLEAN DEFAULT false, 
    "lastLoginAt" TIMESTAMPTZ,
    "advertiserPlan" TEXT,
    "subscriptionStart" DATE,
    "subscriptionEnd" DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY, 
    title TEXT NOT NULL, 
    company TEXT NOT NULL, 
    location TEXT NOT NULL, 
    type TEXT NOT NULL, 
    salary TEXT, 
    description TEXT NOT NULL, 
    whatsapp TEXT NOT NULL, 
    "postedAt" TIMESTAMPTZ DEFAULT NOW(), 
    "isActive" BOOLEAN DEFAULT true, 
    created_at TIMESTAMPTZ DEFAULT NOW(), 
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUDIT LOGS (Novo)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "userName" TEXT,
    action TEXT NOT NULL,
    "entityId" TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HABILITAR RLS (Segurança)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACESSO (Permissivo para App Client-Side)
-- News
DROP POLICY IF EXISTS "Public Read News" ON public.news;
CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write News" ON public.news;
CREATE POLICY "Public Write News" ON public.news FOR ALL USING (true);

-- Advertisers
DROP POLICY IF EXISTS "Public Read Ads" ON public.advertisers;
CREATE POLICY "Public Read Ads" ON public.advertisers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Ads" ON public.advertisers;
CREATE POLICY "Public Write Ads" ON public.advertisers FOR ALL USING (true);

-- Jobs
DROP POLICY IF EXISTS "Public Read Jobs" ON public.jobs;
CREATE POLICY "Public Read Jobs" ON public.jobs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Jobs" ON public.jobs;
CREATE POLICY "Public Write Jobs" ON public.jobs FOR ALL USING (true);

-- Users
DROP POLICY IF EXISTS "Public Read Users" ON public.users;
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Users" ON public.users;
CREATE POLICY "Public Write Users" ON public.users FOR ALL USING (true);

-- Settings
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Settings" ON public.settings;
CREATE POLICY "Public Write Settings" ON public.settings FOR ALL USING (true);

-- Audit Logs
DROP POLICY IF EXISTS "Public Read Logs" ON public.audit_logs;
CREATE POLICY "Public Read Logs" ON public.audit_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Write Logs" ON public.audit_logs;
CREATE POLICY "Public Write Logs" ON public.audit_logs FOR ALL USING (true);

-- FIM DO SCRIPT
`;
    const blob = new Blob([sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schema_lfnm_full_v4.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("📜 Novo Schema SQL Gerado (Com Auditoria)! Execute no Supabase.");
  };

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto w-full pb-20">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">CONFIGURAÇÕES DO <span className="text-red-600">SISTEMA</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gerenciamento de Integrações e APIs</p>
        </div>
        <button 
            onClick={() => onSave(config, settings)}
            className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
        >
            <i className="fas fa-save"></i> Salvar Alterações
        </button>
      </header>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Supabase Connection */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 -rotate-12">
                <i className="fas fa-bolt text-9xl text-green-500"></i>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-2xl border border-green-100">
                    <i className="fas fa-database"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase italic">Conexão Supabase</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Banco de Dados PostgreSQL & API</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Project URL</label>
                        <input 
                            type="text" 
                            value={settings.supabase?.url || ''}
                            onChange={(e) => setSettings({
                                ...settings, 
                                supabase: { ...settings.supabase!, url: e.target.value }
                            })}
                            placeholder="https://xyz.supabase.co"
                            className="w-full bg-green-50/50 border border-green-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition-all font-mono text-green-900"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">API Key (Anon / Public)</label>
                        <input 
                            type="password" 
                            value={settings.supabase?.anonKey || ''}
                            onChange={(e) => setSettings({
                                ...settings, 
                                supabase: { ...settings.supabase!, anonKey: e.target.value }
                            })}
                            placeholder="eyJh..."
                            className="w-full bg-green-50/50 border border-green-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition-all font-mono text-green-900"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={testConnection}
                        className={`px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-widest transition-all ${
                            connectionStatus === 'checking' ? 'bg-gray-400' :
                            connectionStatus === 'success' ? 'bg-green-500' :
                            connectionStatus === 'error' ? 'bg-red-500' :
                            'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                        {connectionStatus === 'checking' ? 'Testando...' :
                            connectionStatus === 'success' ? 'Conectado!' :
                            connectionStatus === 'error' ? 'Erro de Conexão' :
                            'Testar Conexão'}
                    </button>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                    <div className="border-b border-slate-200 pb-4 mb-2">
                        <h4 className="text-sm font-black text-red-600 uppercase mb-2"> <i className="fas fa-exclamation-triangle mr-1"></i> Configuração Inicial</h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">
                            Para o Supabase, você precisa criar as tabelas e configurar as <strong>Policies (RLS)</strong> para permitir leitura pública.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded">PASSO 1</span>
                                <h3 className="text-sm font-black text-gray-900 uppercase">Schema SQL + Policies</h3>
                            </div>
                            <p className="text-xs text-gray-500">
                                Cria as tabelas e libera acesso público para leitura. (Execute no SQL Editor do Supabase).
                            </p>
                        </div>
                        <button onClick={handleExportSchema} className="bg-white text-green-700 border border-green-200 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-green-50 transition-all shadow-sm">
                            <i className="fas fa-download mr-2"></i> Baixar SQL
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-600 text-white text-[10px] font-black px-2 py-0.5 rounded">PASSO 2</span>
                                <h3 className="text-sm font-black text-gray-900 uppercase">Popular Dados (Seed)</h3>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Use este arquivo no SQL Editor para criar o usuário Admin inicial e posts de exemplo se o banco estiver vazio.
                            </p>
                        </div>
                        <button onClick={onExportDB} className="bg-green-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-green-800 transition-all shadow-md">
                            <i className="fas fa-code mr-2"></i> Gerar Seed
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Social Automation Integration */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                <i className="fas fa-share-alt text-9xl text-pink-600"></i>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 text-2xl border border-pink-100">
                    <i className="fas fa-share-nodes"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase italic">Integração Social (Omnichannel)</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Publicação Automática (Instagram, Facebook, etc)</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase">Habilitar Distribuição em Massa</h3>
                            <p className="text-xs text-gray-500 mt-1">Ao ativar, o botão "Publicar" enviará o conteúdo para todas as redes sociais.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.enableOmnichannel || false}
                                onChange={(e) => setSettings({...settings, enableOmnichannel: e.target.checked})}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                    </div>
                </div>

                {settings.enableOmnichannel && (
                    <div className="animate-fadeIn space-y-4">
                        <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100 mb-4">
                            <p className="text-xs text-pink-800 leading-relaxed font-medium">
                                Para postar em todas as redes ao mesmo tempo, usamos um <strong>Webhook</strong>. 
                                Isso conecta nosso site a serviços como <strong>Make.com</strong>, <strong>Zapier</strong> ou <strong>n8n</strong>, que distribuem o conteúdo para Instagram, Facebook e WhatsApp.
                            </p>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Webhook URL (Seu Link de Automação)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={settings.socialWebhookUrl || ''}
                                    onChange={(e) => setSettings({...settings, socialWebhookUrl: e.target.value})}
                                    className="flex-1 bg-white border border-pink-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-pink-500 text-pink-900 font-mono shadow-inner"
                                    placeholder="Ex: https://hook.us1.make.com/..."
                                />
                                <button 
                                    onClick={handleTestWebhook}
                                    disabled={webhookStatus === 'testing'}
                                    className={`px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm ${
                                        webhookStatus === 'testing' ? 'bg-gray-100 text-gray-400' :
                                        webhookStatus === 'success' ? 'bg-green-500 text-white' :
                                        webhookStatus === 'error' ? 'bg-red-500 text-white' :
                                        'bg-pink-600 text-white hover:bg-pink-700'
                                    }`}
                                >
                                    {webhookStatus === 'testing' ? <i className="fas fa-spinner fa-spin"></i> : 
                                     webhookStatus === 'success' ? <i className="fas fa-check"></i> :
                                     webhookStatus === 'error' ? <i className="fas fa-times"></i> :
                                     'Testar'}
                                </button>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-2 leading-relaxed">
                                Ao clicar em "Publicar", enviaremos um JSON com: <code>title</code>, <code>imageUrl</code>, <code>socialText</code> e <code>url</code> para este endereço.
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Added explicit save button for this section */}
            <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                <button 
                    onClick={() => onSave(config, settings)}
                    className="text-pink-600 hover:text-white hover:bg-pink-600 border border-pink-200 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    Salvar Integração Social
                </button>
            </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-2xl border border-purple-100">
                    <i className="fas fa-toggle-on"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase italic">Módulos & Funcionalidades</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ative ou desative seções do site</p>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-gray-900 uppercase">Sistema de Vagas de Emprego</h3>
                        <p className="text-xs text-gray-500 mt-1">Habilita a visualização do board de oportunidades.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.jobsModuleEnabled}
                            onChange={(e) => setSettings({...settings, jobsModuleEnabled: e.target.checked})}
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>
        </div>

        {/* Google Drive Integration */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
            <i className="fab fa-google-drive text-9xl text-blue-600"></i>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-2xl border border-blue-100">
              <i className="fab fa-google-drive"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase italic">Integração Google Drive</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Armazenamento de Mídia em Nuvem</p>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl relative z-10 w-full">
            <div className={`p-4 rounded-r-xl border-l-4 ${gapiInited && gisInited ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <p className={`text-xs leading-relaxed ${gapiInited && gisInited ? 'text-green-800' : 'text-red-800'}`}>
                <i className={`fas ${gapiInited && gisInited ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                {gapiInited && gisInited ? 
                  "APIs do Google ativas." : 
                  "APIs não carregadas. Verifique credenciais."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Client ID</label>
                <input 
                  type="text" 
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">API Key</label>
                <input 
                  type="password" 
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">App ID (Project ID)</label>
                <input 
                  type="text" 
                  value={config.appId}
                  onChange={(e) => setConfig({...config, appId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => onSave(config, settings)}
                className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2"
              >
                <i className="fas fa-save"></i> Salvar & Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
