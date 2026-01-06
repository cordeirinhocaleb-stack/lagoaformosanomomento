import { useCallback } from 'react';
import { NewsItem, User, Advertiser } from '../types';
import { getExternalNews } from '../services/geminiService';
import { getSupabase, getSystemSetting } from '../services/supabaseService';
import { AdPricingConfig } from '../types';
import { INITIAL_AD_CONFIG } from '../config/systemDefaults';

/**
 * Hook para centralizar handlers de manipulação de dados
 * Responsável por callbacks de inicialização e reconexão
 */

interface UseDataHandlersParams {
    setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
    setAdvertisers: React.Dispatch<React.SetStateAction<Advertiser[]>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setSystemJobs: React.Dispatch<React.SetStateAction<any[]>>;
    setDataSource: React.Dispatch<React.SetStateAction<'database' | 'mock' | 'missing_tables'>>;
    setAdConfig: React.Dispatch<React.SetStateAction<AdPricingConfig>>;
    setExternalCategories: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loadRemoteData: () => Promise<void>;
    user: User | null;
}

export const useDataHandlers = ({
    setNews,
    setAdvertisers,
    setUsers,
    setSystemJobs,
    setDataSource,
    setAdConfig,
    setExternalCategories,
    setUser,
    loadRemoteData,
    user,
}: UseDataHandlersParams) => {

    /**
     * Callback executado após carregar dados iniciais
     * Atualiza estados e carrega notícias externas
     */
    const handleDataLoaded = useCallback(async (response: any) => {
        setNews(response.data.news);
        setAdvertisers(response.data.advertisers);
        setUsers(response.data.users);
        setSystemJobs(response.data.jobs);
        setDataSource(response.source);

        if (response.source === 'database') {
            const remoteAdConfig = await getSystemSetting('ad_config');
            if (remoteAdConfig) setAdConfig({ ...INITIAL_AD_CONFIG, ...remoteAdConfig });
        }

        // Carregar notícias externas
        getExternalNews().then(setExternalCategories);
    }, [setNews, setAdvertisers, setUsers, setSystemJobs, setDataSource, setAdConfig, setExternalCategories]);

    /**
     * Callback executado ao restaurar usuário da sessão
     * Limpa storage se usuário não encontrado
     */
    const handleUserRestored = useCallback((restoredUser: User | null) => {
        setUser(restoredUser);
        if (!restoredUser) {
            // Cleanup em caso de logout detectado
            localStorage.removeItem('lfnm_user');
        }
    }, [setUser]);

    /**
     * Callback executado ao reconectar à rede
     * Recarrega dados remotos e notícias externas
     */
    const handleNetworkReconnect = useCallback(() => {
        loadRemoteData();
        getExternalNews().then(setExternalCategories);

        // Tenta relogar via token existente no cliente Supabase se necessário
        const sb = getSupabase();
        if (sb) {
            sb.auth.getSession().then(({ data }) => {
                // Removido bypass de usuário sem banco para segurança estrita
                if (data.session?.user && !user) {
                    console.log("🔄 Reconnect detectado, aguardando sincronização oficial...");
                }
            });
        }
    }, [loadRemoteData, setExternalCategories, user]);

    return {
        handleDataLoaded,
        handleUserRestored,
        handleNetworkReconnect,
    };
};

export type UseDataHandlersReturn = ReturnType<typeof useDataHandlers>;
