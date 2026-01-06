
import { useState, useEffect } from 'react';
import { User, SystemSettings } from '@/types';
import { DEFAULT_SETTINGS } from '@/config/systemDefaults';
import { initSupabase, fetchSiteData } from '@/services/supabaseService';
import { loadSystemSettings } from '@/services/settingsService';
import { getExternalNews } from '@/services/geminiService';
import { logger as DebugLogger } from '@/services/core/debugLogger';

interface AppInitializationProps {
    onDataLoaded: (data: any) => void;
    onUserRestored: (user: User) => void;
    onAuthChallenge: (user: any) => void;
    onSettingsLoaded: (settings: SystemSettings) => void;
    onError: (error: any) => void;
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
    const loadRemoteData = async () => {
        try {
            console.log("🔄 Sincronizando dados do Supabase...");

            // Reduz timeout para 10 segundos para feedback mais rápido
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: Supabase não respondeu em 10 segundos')), 10000)
            );

            // Tenta buscar dados do site (públicos)
            const response = await Promise.race([
                fetchSiteData(),
                timeoutPromise
            ]) as any; // Cast para evitar erro de tipo implícito

            if (response) {
                console.log(`✅ Dados recebidos do Supabase (fonte: ${response.source})`);
                onDataLoaded(response);

                // Carrega configurações apenas se tiver resposta do banco
                if (response.source === 'database') {
                    try {
                        const remoteSettings = await loadSystemSettings();
                        if (remoteSettings) onSettingsLoaded(remoteSettings);
                    } catch (settingsError) {
                        console.warn("⚠️ Erro ao carregar configurações remotas:", settingsError);
                    }
                }
            } else {
                console.warn("⚠️ Supabase retornou null - dados podem estar vazios.");
                // NÃO carregar mock data aqui para evitar confusão em staging
                onDataLoaded({
                    source: 'empty',
                    data: { news: [], advertisers: [], users: [], jobs: [] }
                });
            }
        } catch (e: any) {
            console.error("❌ Erro ao carregar dados do Supabase:", e.message);

            // CORREÇÃO: Não forçar logout agressivo em caso de erro de conexão/API
            // Apenas loga o erro e define dados vazios para a UI não quebrar

            // Detecção de Sessão Inválida (apenas warning agora)
            const isAuthError = e.message?.includes('JWT') ||
                e.message?.includes('token') ||
                e.code === 'PGRST301' ||
                e.status === 401 ||
                e.status === 403;

            if (isAuthError) {
                console.warn("🔒 Acesso restrito ou sessão inválida. O usuário pode precisar relogar.");
                // Não faz reload, apenas deixa o fluxo seguir (usuário verá estado deslogado ou erro de acesso)
            }

            // Fallback para dados vazios em vez de mock
            onDataLoaded({
                source: 'error',
                data: { news: [], advertisers: [], users: [], jobs: [] }
            });
        }
    };

    useEffect(() => {
        let isMounted = true;
        let newsInterval: any;
        let isInitialSessionCheck = true;  // Flag para diferenciar carregamento inicial de novo login

        const initializeSystem = async () => {
            // [NOVO] Verificação Estrita de Versão
            // Se a versão do código mudou, atualiza mas NÃO recarrega para evitar loop
            const storedVersion = localStorage.getItem('lfnm_app_version');
            if (storedVersion !== currentVersion) {
                console.log(`🚀 Versão alterada (${storedVersion} -> ${currentVersion}). Atualizando versão...`);
                // localStorage.clear(); // REMOVIDO: Causava perda de dados e loop infinito
                localStorage.setItem('lfnm_app_version', currentVersion);
                // window.location.reload(); // REMOVIDO: Causava loop infinito
                // return; // REMOVIDO: Permite que o fluxo continue normalmente
            }

            try {
                // 1. Restaurar User do LocalStorage (Otimista)
                const cachedUserStr = localStorage.getItem('lfnm_user');
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
                    console.warn("⚠️ Erro ao carregar configurações locais:", e);
                    localSettings = DEFAULT_SETTINGS;
                }

                console.log(`🔑 Usando Supabase: ${localSettings.supabase?.url}`);

                // Se a URL estiver vazia após o parse de um localStorage que existia, limpa para forçar reset
                if (localSettingsRaw && (!localSettings.supabase?.url || localSettings.supabase.url === "")) {
                    console.warn("⚠️ Configurações do Supabase inválidas no cache. Limpando...");
                    localStorage.removeItem('lfnm_system_settings');
                }

                onSettingsLoaded(localSettings);

                // 3. CRÍTICO: Carregar dados mock IMEDIATAMENTE para evitar tela vazia
                console.log("📦 Carregando dados iniciais (mock)...");
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
                        const restoreUserProfile = async (userId: string) => {
                            try {
                                const { data: profile } = await sbClient
                                    .from('users')
                                    .select('*')
                                    .eq('id', userId)
                                    .single();

                                if (profile) {
                                    DebugLogger.log(`[AUTH] ✅ Perfil recuperado: ${profile.name}`);
                                    onUserRestored(profile);
                                    localStorage.setItem('lfnm_user', JSON.stringify(profile));
                                } else {
                                    DebugLogger.log(`[AUTH] ⚠️ Perfil não encontrado para ID: ${userId}`);
                                }
                            } catch (e) {
                                console.warn("⚠️ Erro ao restaurar perfil via Auth Listener:", e);
                            }
                        };

                        // ==== Listener de Autenticação Simplificado ====
                        sbClient.auth.onAuthStateChange((event, session) => {
                            DebugLogger.log(`[AUTH] 🔄 Evento: ${event}`, { session: !!session });

                            if (event === 'SIGNED_IN' && session?.user) {
                                restoreUserProfile(session.user.id);
                                loadRemoteData();
                            } else if (event === 'SIGNED_OUT') {
                                onUserRestored(null as any);
                                localStorage.removeItem('lfnm_user');
                                sessionStorage.removeItem('lfnm_user');
                                loadRemoteData();
                            }
                        });

                        // Carregamento Inicial (Sessão Existente)
                        sbClient.auth.getSession().then(({ data: { session } }) => {
                            if (session?.user) {
                                DebugLogger.log(`[AUTH] 🔄 Sessão ativa detectada: ${session.user.email}`);
                                // Forçamos a restauração do perfil para garantir sincronia após login social/redirect
                                restoreUserProfile(session.user.id);
                                loadRemoteData();
                            }
                        });
                    }
                } catch (supabaseError) {
                    console.warn("⚠️ Erro ao inicializar Supabase:", supabaseError);
                }

                // 4. CRÍTICO: Marca como inicializado IMEDIATAMENTE (2 segundos)
                // Isso permite que a interface apareça rapidamente
                setTimeout(() => {
                    if (isMounted) {
                        setIsInitialized(true);
                        setIsLoading(false);
                        console.log("✅ Aplicação inicializada (interface pronta).");
                    }
                }, 2000); // Apenas 2 segundos de loading screen

                // 5. Carregar Dados Remotos em BACKGROUND (não bloqueia a UI)
                // Isso acontece em paralelo com a exibição da interface
                loadRemoteData().then(() => {
                    console.log("✅ Dados carregados em background.");
                }).catch((err) => {
                    console.warn("⚠️ Erro ao carregar dados em background:", err);
                });

            } catch (initError) {
                console.error("❌ Erro crítico na inicialização:", initError);
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
            if (newsInterval) clearInterval(newsInterval);
        };
    }, []);

    return { isInitialized, isLoading, loadRemoteData };
};
