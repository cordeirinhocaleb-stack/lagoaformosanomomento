/**
 * SERVIÇO DE GERENCIAMENTO DE CONFIGURAÇÕES DO SISTEMA
 * Responsável por salvar e carregar configurações do banco de dados Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
            if (client) return client;
        }

        // 2. Tenta pegar a instância global unificada (Core Singleton já existente)
        const coreClient = getSupabase();
        if (coreClient) return coreClient;

        // 3. Fallback: Tenta carregar do localStorage
        const savedSettings = localStorage.getItem('lfnm_system_settings');
        if (savedSettings) {
            try {
                const settings: SystemSettings = JSON.parse(savedSettings);
                if (settings.supabase?.url && settings.supabase?.anonKey) {
                    const client = initSupabase(settings.supabase.url, settings.supabase.anonKey);
                    if (client) return client;
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
 */
export const saveCloudinarySettings = async (
    cloudinaryConfig: SystemSettings['cloudinary'],
    userName: string = 'admin'
): Promise<{ success: boolean; message: string }> => {
    try {
        // Tenta pegar o client atual. Não passamos credenciais aqui pois assume-se que já está configurado ou local.
        const client = getSupabaseClient();

        if (!client) {
            // Fallback para localStorage se Supabase não estiver configurado
            const currentSettings = localStorage.getItem('lfnm_system_settings');
            const settings: SystemSettings = currentSettings ? JSON.parse(currentSettings) : {};

            settings.cloudinary = cloudinaryConfig;
            localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));

            return {
                success: true,
                message: 'Configurações salvas localmente (Supabase não configurado)'
            };
        }

        // Salva no banco de dados
        const { error } = await client
            .from('system_settings')
            .upsert({
                key: 'cloudinary',
                value: cloudinaryConfig,
                updated_by: userName
            }, {
                onConflict: 'key'
            });

        if (error) {
            throw error;
        }

        // Atualiza também o localStorage para cache local
        const currentSettings = localStorage.getItem('lfnm_system_settings');
        const settings: SystemSettings = currentSettings ? JSON.parse(currentSettings) : {};
        settings.cloudinary = cloudinaryConfig;
        localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));

        return {
            success: true,
            message: 'Configurações de hospedagem salvas com sucesso no banco de dados!'
        };
    } catch (error: any) {
        console.error('[SettingsService] Erro ao salvar configurações Cloudinary:', error);
        return {
            success: false,
            message: `Erro ao salvar: ${error.message || 'Erro desconhecido'}`
        };
    }
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

        // Salva cada seção das configurações separadamente
        const updates = [];

        // Cloudinary
        if (settings.cloudinary) {
            updates.push(
                client.from('system_settings').upsert({
                    key: 'cloudinary',
                    value: settings.cloudinary,
                    updated_by: userName
                }, { onConflict: 'key' })
            );
        }

        // Footer
        if (settings.footer) {
            updates.push(
                client.from('system_settings').upsert({
                    key: 'footer',
                    value: settings.footer,
                    updated_by: userName
                }, { onConflict: 'key' })
            );
        }

        // Features
        updates.push(
            client.from('system_settings').upsert({
                key: 'features',
                value: {
                    jobsModuleEnabled: settings.jobsModuleEnabled,
                    enableOmnichannel: settings.enableOmnichannel,
                    maintenanceMode: settings.maintenanceMode,
                    registrationEnabled: settings.registrationEnabled,
                    purchasingEnabled: settings.purchasingEnabled
                },
                updated_by: userName
            }, { onConflict: 'key' })
        );

        // Executa todas as atualizações
        const results = await Promise.all(updates);

        // Verifica se houve algum erro
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
            throw new Error(errors[0].error?.message || 'Erro ao salvar configurações');
        }

        // Atualiza localStorage como cache
        localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));

        return {
            success: true,
            message: 'Todas as configurações foram salvas no banco de dados!'
        };
    } catch (error: any) {
        console.error('[SettingsService] Erro ao salvar configurações:', error);
        let errorMsg = 'Erro desconhecido';

        if (typeof error === 'string') errorMsg = error;
        else if (error.message) errorMsg = typeof error.message === 'object' ? JSON.stringify(error.message) : error.message;
        else if (typeof error === 'object') errorMsg = JSON.stringify(error);

        return {
            success: false,
            message: `Erro ao salvar: ${errorMsg}`
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

        // Busca todas as configurações do banco
        const { data, error } = await client
            .from('system_settings')
            .select('key, value');

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            return null;
        }

        // Monta o objeto de configurações
        const settings: Partial<SystemSettings> = {
            supabase: {
                url: '',
                anonKey: ''
            },
            socialWebhookUrl: ''
        };

        data.forEach((item: any) => {
            if (item.key === 'cloudinary') {
                settings.cloudinary = item.value;
            } else if (item.key === 'footer') {
                settings.footer = item.value;
            } else if (item.key === 'features') {
                settings.jobsModuleEnabled = item.value.jobsModuleEnabled;
                settings.enableOmnichannel = item.value.enableOmnichannel;
                settings.maintenanceMode = item.value.maintenanceMode;
                settings.registrationEnabled = item.value.registrationEnabled;
                settings.purchasingEnabled = item.value.purchasingEnabled;
            }
        });

        // Busca credenciais Supabase do localStorage (não devem estar no banco por segurança)
        const localSettings = localStorage.getItem('lfnm_system_settings');
        if (localSettings) {
            const local = JSON.parse(localSettings);
            if (local.supabase) {
                settings.supabase = local.supabase;
            }
            if (local.socialWebhookUrl) {
                settings.socialWebhookUrl = local.socialWebhookUrl;
            }
        }

        // Atualiza cache local
        localStorage.setItem('lfnm_system_settings', JSON.stringify(settings));

        return settings as SystemSettings;
    } catch (error) {
        console.error('[SettingsService] Erro ao carregar configurações:', error);

        // Fallback para localStorage em caso de erro
        const saved = localStorage.getItem('lfnm_system_settings');
        return saved ? JSON.parse(saved) : null;
    }
};

/**
 * Carrega apenas as configurações do Cloudinary
 */
export const loadCloudinarySettings = async (): Promise<SystemSettings['cloudinary'] | null> => {
    try {
        const client = getSupabaseClient();

        if (!client) {
            // Fallback para localStorage
            const saved = localStorage.getItem('lfnm_system_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                return settings.cloudinary || null;
            }
            return null;
        }

        const { data, error } = await client
            .from('system_settings')
            .select('value')
            .eq('key', 'cloudinary')
            .single();

        if (error || !data) {
            // Tenta localStorage como fallback
            const saved = localStorage.getItem('lfnm_system_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                return settings.cloudinary || null;
            }
            return null;
        }

        return data.value;
    } catch (error) {
        console.error('[SettingsService] Erro ao carregar configurações Cloudinary:', error);

        // Fallback para localStorage
        const saved = localStorage.getItem('lfnm_system_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            return settings.cloudinary || null;
        }
        return null;
    }
};

/**
 * Recupera o histórico de alterações das configurações
 */
export const getSettingsHistory = async (limit: number = 5): Promise<import('../types').SettingsAuditItem[]> => {
    try {
        const client = getSupabaseClient();
        if (!client) return [];

        // FIXME: Tabela settings_audit não existe.
        // Retornando array vazio para evitar erro de query e crash loop.
        return [];

        /*
        const { data, error } = await client
            .from('settings_audit')
            .select('*')
            .order('changed_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.warn('[SettingsService] Erro ao buscar histórico:', error);
            return [];
        }

        return data || [];
        */
    } catch (error) {
        console.error('[SettingsService] Erro ao buscar histórico:', error);
        return [];
    }
};
