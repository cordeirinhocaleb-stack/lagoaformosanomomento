import { useCallback } from 'react';
import {
    NewsItem,
    User,
    Advertiser,
    AdPricingConfig,
    SystemSettings
} from '@/types';
import {
    updateUser,
    createUser,
    deleteUser,
    createNews,
    updateNews,
    deleteNews,
    upsertAdvertiser,
    deleteAdvertiser,
    saveSystemSetting
} from '@/services/supabaseService';

interface UseAppCrudHandlersParams {
    setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setAdvertisers: React.Dispatch<React.SetStateAction<Advertiser[]>>;
    setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
    setAdConfig: React.Dispatch<React.SetStateAction<AdPricingConfig>>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    user: User | null;
    dataSource: 'database' | 'mock' | 'missing_tables';
    triggerErrorModal: (error: unknown, context: string, severity?: 'info' | 'warning' | 'critical') => void;
}

export const useAppCrudHandlers = ({
    setNews,
    setUsers,
    setAdvertisers,
    setSystemSettings,
    setAdConfig,
    setUser,
    user,
    dataSource,
    triggerErrorModal
}: UseAppCrudHandlersParams) => {

    const handleUpdateSystemSettings = async (newSettings: SystemSettings) => {
        setSystemSettings(newSettings);
        if (dataSource === 'database') { await saveSystemSetting('general_settings', newSettings); }
    };

    const handleUpdateAdConfig = async (newConfig: AdPricingConfig) => {
        setAdConfig(newConfig);
        if (dataSource === 'database') { await saveSystemSetting('ad_config', newConfig); }
    };

    const handleProfileUpdate = async (u: User) => {
        setUsers(p => p.map(x => x.id === u.id ? u : x));
        if (user?.id === u.id) {
            setUser(u);
            localStorage.setItem('lfnm_user', JSON.stringify(u));
        }
        if (dataSource === 'database') { await updateUser(u); }
    };

    const handleCreateNews = async (newsItem: NewsItem) => {
        try {
            if (dataSource === 'database') {
                const created = await createNews(newsItem);
                setNews(prev => [created, ...prev]);
            } else {
                setNews(prev => [newsItem, ...prev]);
            }
        } catch (e) {
            triggerErrorModal(e, 'Criar Notícia');
            throw e;
        }
    };

    const handleUpdateNews = async (newsItem: NewsItem) => {
        try {
            setNews(prev => prev.map(n => n.id === newsItem.id ? newsItem : n));
            if (dataSource === 'database') {
                await updateNews(newsItem);
            }
        } catch (e) {
            triggerErrorModal(e, 'Atualizar Notícia');
            throw e;
        }
    };

    const handleDeleteNews = async (id: string) => {
        try {
            setNews(prev => prev.filter(n => n.id !== id));
            if (dataSource === 'database') {
                await deleteNews(id);
            }
        } catch (e) {
            triggerErrorModal(e, 'Excluir Notícia');
            throw e;
        }
    };

    const handleUpdateAdvertiser = async (adv: Advertiser): Promise<Advertiser | null> => {
        try {
            setAdvertisers(prev => prev.map(a => a.id === adv.id ? adv : a));
            if (dataSource === 'database') {
                await upsertAdvertiser(adv);
            }
            return adv;
        } catch (e) {
            triggerErrorModal(e, 'Atualizar Anunciante');
            return null;
        }
    };

    const handleAddUser = async (u: User) => {
        try {
            setUsers(prev => [...prev, u]);
            if (dataSource === 'database') {
                await createUser(u);
            }
        } catch (e) {
            triggerErrorModal(e, 'Criar Usuário');
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            setUsers(prev => prev.filter(u => u.id !== id));
            if (dataSource === 'database') {
                await deleteUser(id);
            }
        } catch (e) {
            triggerErrorModal(e, 'Excluir Usuário');
        }
    };

    const handleDeleteAdvertiser = async (id: string) => {
        try {
            setAdvertisers(prev => prev.filter(a => a.id !== id));
            if (dataSource === 'database') {
                await deleteAdvertiser(id);
            }
        } catch (e) {
            triggerErrorModal(e, 'Excluir Anunciante');
        }
    };

    return {
        handleUpdateSystemSettings,
        handleUpdateAdConfig,
        handleProfileUpdate,
        handleCreateNews,
        handleUpdateNews,
        handleDeleteNews,
        handleUpdateAdvertiser,
        handleAddUser,
        handleDeleteUser,
        handleDeleteAdvertiser
    };
};
