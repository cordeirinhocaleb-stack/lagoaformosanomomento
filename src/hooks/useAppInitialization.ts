
import { useState, useEffect } from 'react';
import { User, SystemSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/config/systemDefaults';
import { initSupabase, fetchSiteData } from '@/services/supabaseService';
import { mapDbToUser } from '@/services/users/userService';
import { loadSystemSettings } from '@/services/settingsService';
import { getExternalNews } from '@/services/geminiService';
import { logger as DebugLogger } from '@/services/core/debugLogger';

interface AppInitializationProps {
    onDataLoaded: (data: unknown) => void;
    onUserRestored: (user: User | null) => void;
    onAuthChallenge: (user: unknown) => void;
    onSettingsLoaded: (settings: SystemSettings) => void;
    onError: (error: unknown) => void;
    currentVersion: string; // Nova prop
}

export const useAppInitialization = ({
    onDataLoaded,
    onUserRestored,
    onAuthChallenge,
    onSettingsLoaded,
    onError,
    currentVersion
}: AppInitializationProps) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Helper de carregamento de dados
    const loadRemoteData = async (): Promise<SystemSettings | null> => {
        try {
            DebugLogger.log("🔄 Sincronizando dados do Supabase...");

            // Reduz timeout para 10 segundos para feedback mais rápido
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: Supabase não respondeu em 10 segundos')), 10000)
            );

            // Tenta buscar dados do site (públicos)
            const response = await Promise.race([
                fetchSiteData(),
                timeoutPromise
            ]) as { source: string; data: any } | null;

            let finalSettings: SystemSettings | null = null;

            if (response) {
                DebugLogger.log(`✅ Dados recebidos do Supabase (fonte: ${response.source})`);
                onDataLoaded(response);

                // Carrega configurações apenas se tiver resposta do banco
                if (response.source === 'database') {
                    try {
                        const remoteSettings = await loadSystemSettings();
                        if (remoteSettings) {
                            onSettingsLoaded(remoteSettings);
                            finalSettings = remoteSettings;
                        }
                    } catch (settingsError) {
                        DebugLogger.warn("⚠️ Erro ao carregar configurações remotas:", settingsError);
                    }
                }
            } else {
                DebugLogger.warn("⚠️ Supabase retornou null - dados podem estar vazios.");
                onDataLoaded({
                    source: 'empty',
                    data: { news: [], advertisers: [], users: [], jobs: [] }
                });
            }
            return finalSettings;
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Erro desconhecido';
            DebugLogger.error("❌ Erro ao carregar dados do Supabase:", errorMessage);

            onDataLoaded({
                source: 'error',
                data: { news: [], advertisers: [], users: [], jobs: [] }
            });
            return null;
        }
    };

    useEffect(() => {
        let isMounted = true;
        let newsInterval: ReturnType<typeof setInterval>;
        const isInitialSessionCheck = true;  // Flag para diferenciar carregamento inicial de novo login

        const initializeSystem = async () => {
            // [NOVO] Verificação Estrita de Versão
            // Se a versão do código mudou, atualiza mas NÃO recarrega para evitar loop
            const storedVersion = localStorage.getItem('lfnm_app_version');
            if (storedVersion !== currentVersion) {
                DebugLogger.log(`🚀 Versão alterada (${storedVersion} -> ${currentVersion}). Atualizando versão...`);
                // localStorage.clear(); // REMOVIDO: Causava perda de dados e loop infinito
                localStorage.setItem('lfnm_app_version', currentVersion);
                // window.location.reload(); // REMOVIDO: Causava loop infinito
                // return; // REMOVIDO: Permite que o fluxo continue normalmente
            }

            try {
                // 1. Restaurar User do LocalStorage (Otimista)
                const cachedUserStr = localStorage.getItem('lfnm_user') || sessionStorage.getItem('lfnm_user');
                if (cachedUserStr) {
                    try {
                        const u = JSON.parse(cachedUserStr);
                        onUserRestored(u);
                    } catch (parseError) {
                        console.warn("⚠️ Erro ao parsear usuário do cache:", parseError);
                        localStorage.removeItem('lfnm_user');
                    }
                }

                // 2. Carregar Configurações Locais
                const localSettingsRaw = localStorage.getItem('lfnm_system_settings');
                let localSettings = DEFAULT_SETTINGS;
                try {
                    if (localSettingsRaw) {
                        const parsed = JSON.parse(localSettingsRaw);
                        localSettings = {
                            ...DEFAULT_SETTINGS,
                            ...parsed,
                            supabase: {
                                // CRÍTICO: Sempre usa credenciais padrão se localStorage estiver vazio ou inválido
                                url: (parsed.supabase?.url && typeof parsed.supabase.url === 'string' && parsed.supabase.url.startsWith('http'))
                                    ? parsed.supabase.url
                                    : DEFAULT_SETTINGS.supabase?.url || '',
                                anonKey: (parsed.supabase?.anonKey && typeof parsed.supabase.anonKey === 'string' && parsed.supabase.anonKey.length > 20)
                                    ? parsed.supabase.anonKey
                                    : DEFAULT_SETTINGS.supabase?.anonKey || ''
                            }
                        };
                    }
                } catch (e) {
                    localSettings = DEFAULT_SETTINGS;
                }

                // [FIX] Force update credentials if they don't match DEFAULT (to fix stale cache issues)
                if (DEFAULT_SETTINGS.supabase?.anonKey && localSettings.supabase?.anonKey !== DEFAULT_SETTINGS.supabase.anonKey) {
                    DebugLogger.log("🔄 Atualizando credenciais do Supabase (Cache Stale detected)...");
                    localSettings.supabase = { ...localSettings.supabase, ...DEFAULT_SETTINGS.supabase };
                    localStorage.setItem('lfnm_system_settings', JSON.stringify(localSettings));
                }

                DebugLogger.log(`🔑 Usando Supabase: ${localSettings.supabase?.url}`);

                // Se a URL estiver vazia após o parse de um localStorage que existia, limpa para forçar reset
                if (localSettingsRaw && (!localSettings.supabase?.url || localSettings.supabase.url === "")) {
                    DebugLogger.warn("⚠️ Configurações do Supabase inválidas no cache. Limpando...");
                    localStorage.removeItem('lfnm_system_settings');
                }

                onSettingsLoaded(localSettings);

                // 3. CRÍTICO: Carregar dados mock IMEDIATAMENTE para evitar tela vazia
                DebugLogger.log("📦 Carregando dados iniciais (mock)...");
                onDataLoaded({
                    source: 'mock',
                    data: {
                        news: [],
                        advertisers: [],
                        users: [],
                        jobs: []
                    }
                });

                // 4. Inicializar Supabase & Auth Listener
                try {
                    const sbUrl = localSettings.supabase?.url || DEFAULT_SETTINGS.supabase?.url || '';
                    const sbKey = localSettings.supabase?.anonKey || DEFAULT_SETTINGS.supabase?.anonKey || '';

                    const sbClient = initSupabase(sbUrl, sbKey);
                    if (sbClient) {
                        // Helper para restaurar perfil do usuário do banco
                        const restoreUserProfile = async (authUser: { id: string }) => {
                            try {
                                DebugLogger.log(`[AUTH] 🔍 Sincronizando perfil para o usuário: ${authUser.id}`);
                                const { data: profile, error: profileError } = await sbClient
                                    .from('users')
                                    .select('*')
                                    .eq('id', authUser.id)
                                    .maybeSingle();

                                if (profileError) throw profileError;

                                // Verificação de Perfil Completo:
                                // Um perfil é considerado completo se:
                                // 1. Existe no banco
                                // 2. Tem role definida (qualquer role válida)
                                // 3. OU tem algum campo adicional preenchido (phone, document, city, etc)
                                // Isso evita re-abrir o cadastro para usuários que já completaram
                                const hasBasicInfo = profile && profile.role && profile.name;
                                const hasAdditionalInfo = profile && (profile.phone || profile.document || profile.city || profile.state);
                                const isProfileComplete = hasBasicInfo && (hasAdditionalInfo || profile.role !== 'Leitor');

                                if (isProfileComplete) {
                                    DebugLogger.log(`[AUTH] ✅ Perfil completo recuperado: ${profile.name}`);
                                    const user = mapDbToUser(profile);
                                    onUserRestored(user);
                                    localStorage.setItem('lfnm_user', JSON.stringify(user));
                                } else if (profile && profile.role) {
                                    // Perfil existe e tem role, mas sem dados adicionais
                                    // Isso pode ser um Leitor que ainda não preencheu tudo
                                    // Aceitar mesmo assim (não forçar recadastro)
                                    DebugLogger.log(`[AUTH] ✅ Perfil básico aceito: ${profile.name} (${profile.role})`);
                                    const user = mapDbToUser(profile);
                                    onUserRestored(user);
                                    localStorage.setItem('lfnm_user', JSON.stringify(user));
                                } else {
                                    DebugLogger.log(`[AUTH] ⚠️ Perfil incompleto ou inexistente (Novo Usuário): ${authUser.id}`);
                                    onAuthChallenge(authUser);
                                }
                            } catch (e: unknown) {
                                DebugLogger.warn("⚠️ Erro ao restaurar perfil via Auth Listener:", e);
                                // Se o erro for 403 (Forbidden), as permissões RLS podem estar bloqueando o acesso
                                // devido a um estado inconsistente. Tentamos forçar re-cadastro.
                                const isForbidden = e && typeof e === 'object' && ('status' in e && e.status === 403 || 'message' in e && (e.message as string)?.includes('403'));
                                if (isForbidden) {
                                    onAuthChallenge(authUser);
                                }
                            }
                        };

                        sbClient.auth.onAuthStateChange((event, session) => {
                            DebugLogger.log(`[AUTH] 🔄 Evento: ${event}`, { session: !!session });

                            if (event === 'SIGNED_IN' && session?.user) {
                                restoreUserProfile(session.user);
                                loadRemoteData();
                            } else if (event === 'SIGNED_OUT') {
                                onUserRestored(null);
                                localStorage.removeItem('lfnm_user');
                                sessionStorage.removeItem('lfnm_user');
                                loadRemoteData();
                            }
                        });

                        // Carregamento Inicial (Sessão Existente)
                        const { data: { session } } = await sbClient.auth.getSession();
                        if (session?.user) {
                            DebugLogger.log(`[AUTH] 🔄 Sessão ativa detectada: ${session.user.email}`);
                            // AQUARDA a sincronização oficial para que a UI não carregue com cache antigo
                            await restoreUserProfile(session.user);
                        }

                        // Sempre carrega dados remotos (ou aguarda se prod)
                        await loadRemoteData();
                    }
                } catch (supabaseError) {
                    DebugLogger.warn("⚠️ Erro ao inicializar Supabase:", supabaseError);
                }

                // 4. Marca como inicializado
                if (isMounted) {
                    setIsInitialized(true);
                    setIsLoading(false);
                    DebugLogger.log("✅ Aplicação inicializada com sucesso.");
                }

            } catch (initError) {
                DebugLogger.error("❌ Erro crítico na inicialização:", initError);
                onError(initError);

                // CRÍTICO: Mesmo com erro, marca como inicializado para não travar
                if (isMounted) {
                    setIsInitialized(true);
                    setIsLoading(false);
                }
            }
        };

        initializeSystem();

        // Intervalo de RSS
        newsInterval = setInterval(() => getExternalNews(), 3600000);

        return () => {
            isMounted = false;
            if (newsInterval) { clearInterval(newsInterval); }
        };
    }, []);

    return { isInitialized, isLoading, loadRemoteData };
};
