/**
 * SERVIÇO DE GERENCIAMENTO DE CONFIGURAÇÕES DO SISTEMA
 * Responsável por salvar e carregar configurações do banco de dados Supabase
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SystemSettings } from '../types';
import { getSupabase, initSupabase } from './core/supabaseClient';
import { DEFAULT_SETTINGS } from '../config/systemDefaults';

/**
 * Inicializa o cliente Supabase com as credenciais fornecidas
 * Estratégia Multinível: Core Singleton -> Params -> LocalStorage -> DefaultSettings
 */
const getSupabaseClient = (url?: string, anonKey?: string): SupabaseClient | null => {
    try {
        // 1. Prioridade: Se credenciais específicas foram passadas, forçamos a inicialização delas
        if (url && anonKey) {
            const client = initSupabase(url, anonKey);
            if (client) { return client; }
        }

        // 2. Tenta pegar a instância global unificada (Core Singleton já existente)
        const coreClient = getSupabase();
        if (coreClient) { return coreClient; }

        // 3. Fallback: Tenta carregar do localStorage
        const savedSettings = localStorage.getItem('lfnm_system_settings');
        if (savedSettings) {
            try {
                const settings: SystemSettings = JSON.parse(savedSettings);
                if (settings.supabase?.url && settings.supabase?.anonKey) {
                    const client = initSupabase(settings.supabase.url, settings.supabase.anonKey);
                    if (client) { return client; }
                }
            } catch (e) {
                console.warn('[SettingsService] Erro ao carregar do cache local:', e);
            }
        }

        // 4. Última Estância: Usar credenciais padrão do sistema (Hardcoded)
        if (DEFAULT_SETTINGS.supabase?.url && DEFAULT_SETTINGS.supabase?.anonKey) {
            return initSupabase(DEFAULT_SETTINGS.supabase.url, DEFAULT_SETTINGS.supabase.anonKey);
        }

        return null;
    } catch (error) {
        console.error('[SettingsService] Erro crítico ao recuperar client Supabase:', error);
        return null;
    }
};

/**
 * Salva as configurações do Cloudinary no banco de dados
 * @deprecated Use saveSystemSettings instead to maintain consolidation
 */
export const saveCloudinarySettings = async (
    cloudinaryConfig: SystemSettings['cloudinary'],
    userName: string = 'admin'
): Promise<{ success: boolean; message: string }> => {
    const currentSettings = await loadSystemSettings() || DEFAULT_SETTINGS;
    const newSettings = { ...currentSettings, cloudinary: cloudinaryConfig };
    return saveSystemSettings(newSettings, userName);
};

/**
 * Salva todas as configurações do sistema no banco de dados
 */
export const saveSystemSettings = async (
    settings: SystemSettings,
    userName: string = 'admin'
): Promise<{ success: boolean; message: string }> => {
    try {
        // Tenta inicializar com as credenciais que estão vindo das próprias settings
        const client = getSupabaseClient(settings.supabase?.url, settings.supabase?.anonKey);

        if (!client) {
            // Fallback para localStorage
            localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));
            return {
                success: true,
                message: 'Configurações salvas localmente (Supabase não configurado)'
            };
        }

        // Salva tudo unificado em 'general_settings'
        const { error } = await client
            .from('system_settings')
            .upsert({
                key: 'general_settings',
                value: settings,
                updated_by: userName,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'key'
            });

        if (error) {
            throw error;
        }

        // Atualiza também o localStorage para cache local
        localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));

        return {
            success: true,
            message: 'Todas as configurações foram salvas no banco de dados!'
        };
    } catch (error: any) {
        console.error('[SettingsService] Erro ao salvar configurações:', error);
        return {
            success: false,
            message: `Erro ao salvar: ${error.message || 'Erro desconhecido'}`
        };
    }
};

/**
 * Carrega as configurações do sistema do banco de dados
 */
export const loadSystemSettings = async (): Promise<SystemSettings | null> => {
    try {
        const client = getSupabaseClient();

        if (!client) {
            // Fallback para localStorage
            const saved = localStorage.getItem('lfnm_system_settings');
            return saved ? JSON.parse(saved) : null;
        }

        // Busca todas as configurações do banco para garantir compatibilidade
        const { data, error } = await client
            .from('system_settings')
            .select('key, value');

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            // Tenta localStorage se o banco estiver vazio
            const saved = localStorage.getItem('lfnm_system_settings');
            return saved ? JSON.parse(saved) : null;
        }

        // Procura pela chave consolidada
        const general = data.find((item: any) => item.key === 'general_settings');

        if (general) {
            const settings = { ...DEFAULT_SETTINGS, ...general.value };

            // Credenciais Supabase e Webhook costumam ficar no local por segurança em alguns casos, 
            // mas se estiverem no banco, o spread acima já pegou.

            // Atualiza cache local
            localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));
            return settings;
        }

        // Fallback robusto: se não achar 'general_settings', reconstrói a partir das chaves individuais
        const legacySettings: any = { ...DEFAULT_SETTINGS };
        data.forEach((item: any) => {
            if (item.key === 'cloudinary') { legacySettings.cloudinary = item.value; }
            else if (item.key === 'footer') { legacySettings.footer = item.value; }
            else if (item.key === 'features') {
                legacySettings.jobsModuleEnabled = item.value.jobsModuleEnabled;
                legacySettings.enableOmnichannel = item.value.enableOmnichannel;
                legacySettings.maintenanceMode = item.value.maintenanceMode;
                legacySettings.registrationEnabled = item.value.registrationEnabled;
                legacySettings.purchasingEnabled = item.value.purchasingEnabled;
            }
        });

        localStorage.setItem('lfnm_system_settings', JSON.stringify(legacySettings));
        return legacySettings as SystemSettings;

    } catch (error) {
        console.error('[SettingsService] Erro ao carregar configurações:', error);
        const saved = localStorage.getItem('lfnm_system_settings');
        return saved ? JSON.parse(saved) : null;
    }
};

/**
 * Carrega apenas as configurações do Cloudinary
 */
export const loadCloudinarySettings = async (): Promise<SystemSettings['cloudinary'] | null> => {
    const settings = await loadSystemSettings();
    return settings?.cloudinary || null;
};

/**
 * Recupera o histórico de alterações das configurações
 */
export const getSettingsHistory = async (limit: number = 5): Promise<any[]> => {
    // Retornando array vazio para evitar erro de query ja que a tabela audit nao existe nesta versao
    return [];
};
