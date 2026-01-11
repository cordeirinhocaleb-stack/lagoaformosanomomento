import { useState, useEffect, useMemo, useCallback } from 'react';
import { APP_VERSION } from '../src/version';
import {
    NewsItem,
    User,
    Advertiser,
    Job,
    AdPricingConfig,
    SystemSettings,
    PopupTargetPage,
    AppView
} from '../types';
import { RegionFilterType } from '../components/layout/CategoryMenu';
import { DEFAULT_SETTINGS, INITIAL_AD_CONFIG } from '../config/systemDefaults';

// Hooks
import { useAppInitialization } from './useAppInitialization';
import { useInactivityTimer } from './useInactivityTimer';
import { useAppNavigation } from '../src/hooks/useAppNavigation';
import { useModals } from './useModals';

// Services
import { getExternalNews } from '../services/geminiService';
import {
    getSupabase,
    updateUser,
    createNews,
    updateNews,
    deleteNews,
    upsertAdvertiser,
    saveSystemSetting,
    getSystemSetting
} from '../services/supabaseService';

export const useAppController = () => {
    const CURRENT_VERSION = APP_VERSION;
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<AppView>('home');
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState<RegionFilterType>('Lagoa Formosa');
    const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
    const [shouldScrollToGrid, setShouldScrollToGrid] = useState(false);
    const [adminNewsToEdit, setAdminNewsToEdit] = useState<NewsItem | null>(null);

    const [news, setNews] = useState<NewsItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
    const [systemJobs, setSystemJobs] = useState<Job[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [dataSource, setDataSource] = useState<'database' | 'mock' | 'missing_tables'>('mock');

    const [externalCategories, setExternalCategories] = useState<Record<string, any[]>>({});
    const [adConfig, setAdConfig] = useState<AdPricingConfig>(INITIAL_AD_CONFIG);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

    const [errorModal, setErrorModal] = useState<{ open: boolean; error: any; context: string; severity: 'info' | 'warning' | 'critical' }>({ open: false, error: null, context: '', severity: 'critical' });
    const [fatalError, setFatalError] = useState<{ error: any; stack: string } | null>(null);
    const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

    const modals = useModals();

    const handleDataLoaded = useCallback(async (response: any) => {
        setNews(response.data.news);
        setAdvertisers(response.data.advertisers);
        setUsers(response.data.users);
        setSystemJobs(response.data.jobs);
        setAuditLogs(response.data.auditLogs || []);
        setDataSource(response.source);

        if (response.source === 'database') {
            const remoteAdConfig = await getSystemSetting('ad_config');
            if (remoteAdConfig) { setAdConfig({ ...INITIAL_AD_CONFIG, ...remoteAdConfig }); }
        }
        getExternalNews().then(setExternalCategories);
    }, []);

    const handleUserRestored = useCallback((restoredUser: User | null) => {
        setUser(restoredUser);
        if (!restoredUser) { localStorage.removeItem('lfnm_user'); }
    }, []);

    useEffect(() => {
        const lastVersion = localStorage.getItem('lfnm_last_version');
        if (lastVersion !== CURRENT_VERSION) {
            const timer = setTimeout(() => modals.setShowChangelog(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [CURRENT_VERSION, modals.setShowChangelog]);

    const handleCloseChangelog = () => {
        modals.setShowChangelog(false);
        localStorage.setItem('lfnm_last_version', CURRENT_VERSION);
    };

    const triggerErrorModal = useCallback((error: any, context: string = 'System Error', severity: 'info' | 'warning' | 'critical' = 'critical') => {
        if (severity === 'critical') {
            console.error(`🛡️ CRITICAL ERROR[${context}]: `, error); // eslint-disable-line no-console
            // If it's a critical initialization error or similar, we might want the full page error instead
            if (context === 'Inicialização' || context === 'Window Error') {
                setFatalError({ error, stack: error?.stack || 'No stack available' });
                setView('error');
                return;
            }
        } else { console.warn(`🛡️ Warning[${context}]: `, error); } // eslint-disable-line no-console

        const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname.includes('webgho.com');
        if (isProduction && severity !== 'critical') { return; }

        setErrorModal({ open: true, error, context, severity });
    }, [setView]);

    const onAuthChallenge = useCallback(async (gUser: any) => {
        if (systemSettings.registrationEnabled) {
            modals.setPendingGoogleUser(gUser);
            modals.setShowRoleSelector(true);
        } else {
            modals.setAccessDeniedConfig({
                title: 'CADASTRO DESATIVADO',
                message: 'O cadastro de novos usuários está temporariamente desativado. Entre em contato com o administrador para solicitar inclusão.'
            });
            modals.setShowAccessDenied(true);
            const sb = getSupabase();
            if (sb) {
                try {
                    const { data: { session } } = await sb.auth.getSession();
                    if (session) { await sb.auth.signOut(); }
                } catch (e) { console.warn("⚠️ Erro ao deslogar no desafio:", e); } // eslint-disable-line no-console
            }
        }
    }, [systemSettings.registrationEnabled, modals]);

    const { isLoading: showLoading, isInitialized, loadRemoteData } = useAppInitialization({
        onDataLoaded: handleDataLoaded,
        onUserRestored: handleUserRestored,
        onAuthChallenge,
        onSettingsLoaded: setSystemSettings,
        onError: (e) => {
            const errorMsg = e.message || '';
            if (errorMsg.includes('Conta não registrada') || errorMsg.includes('Acesso Negado')) {
                modals.setAccessDeniedConfig({
                    title: 'ACESSO NEGADO',
                    message: 'Esta conta não possui um registro ativo no portal. Solicite acesso ao administrador.'
                });
                modals.setShowAccessDenied(true);
            } else {
                triggerErrorModal(e, 'Inicialização');
            }
        },
        currentVersion: CURRENT_VERSION
    });

    const { updateHash, handleBackToHome } = useAppNavigation({
        isInitialized,
        user,
        news,
        view,
        setView,
        setSelectedNews,
        setShowLoginModal: modals.setShowLoginModal,
        setShowProfileModal: modals.setShowProfileModal
    });

    const internalNews = useMemo(() => news.filter(n => n.source === 'site' || !n.source), [news]);
    const tickerNews = useMemo(() => {
        return internalNews.filter(n =>
            n.city === 'Lagoa Formosa' ||
            n.city === 'Patos de Minas' ||
            n.region === 'Lagoa Formosa' ||
            (!n.city && !n.region)
        ).slice(0, 15);
    }, [internalNews]);

    const marqueeNews = useMemo(() => {
        const allowedCategories = ['Política', 'Agro', 'Agronegócio', 'Tecnologia'];
        return Object.entries(externalCategories)
            .filter(([cat]) => allowedCategories.includes(cat))
            .flatMap(([_, items]) => items)
            .sort(() => 0.5 - Math.random()).slice(0, 15);
    }, [externalCategories]);

    useEffect(() => {
        if (user?.themePreference === 'dark') { document.documentElement.classList.add('dark'); }
        else { document.documentElement.classList.remove('dark'); }
    }, [user?.themePreference]);

    const handleNetworkReconnect = () => {
        loadRemoteData();
        getExternalNews().then(setExternalCategories);
        const sb = getSupabase();
        if (sb) {
            sb.auth.getSession().then(({ data }) => {
                if (data.session?.user && !user) {
                    console.log("🔄 Reconnect detectado, aguardando sincronização oficial..."); // eslint-disable-line no-console
                }
            });
        }
    };

    const handleLogout = async () => {
        setUser(null);
        localStorage.removeItem('lfnm_user');
        sessionStorage.removeItem('lfnm_user');
        modals.setShowProfileModal(false);
        try {
            const sb = getSupabase();
            if (sb) {
                const { data: { session } } = await sb.auth.getSession();
                if (session) { await sb.auth.signOut(); }
            }
        } catch (e) { console.warn("⚠️ Erro ao deslogar:", e); } // eslint-disable-line no-console
        setView('home');
        updateHash('/');
        window.location.reload();
    };

    useEffect(() => {
        const globalErrorHandler = (e: ErrorEvent) => triggerErrorModal(e.error, 'Window Error');
        const globalRejectionHandler = (e: PromiseRejectionEvent) => {
            const reason = e.reason?.toString() || '';
            if (reason.includes('AuthSessionMissingError') || reason.includes('AuthApiError: invalid_grant')) {
                console.warn("⚠️ Sessão inválida. Assumindo estado deslogado."); // eslint-disable-line no-console
                if (user) { setUser(null); }
                return;
            }
            triggerErrorModal(e.reason, 'Promise Rejection');
        };
        window.addEventListener('error', globalErrorHandler);
        window.addEventListener('unhandledrejection', globalRejectionHandler);
        return () => {
            window.removeEventListener('error', globalErrorHandler);
            window.removeEventListener('unhandledrejection', globalRejectionHandler);
        };
    }, [triggerErrorModal, user]);

    useInactivityTimer(30 * 60 * 1000, () => {
        if (user) { setShowSessionExpiredModal(true); }
    });

    const handleUpdateSystemSettings = async (newSettings: SystemSettings) => {
        setSystemSettings(newSettings);
        if (dataSource === 'database') { await saveSystemSetting('general_settings', newSettings); }
    };

    const handleProfileUpdate = async (u: User) => {
        setUsers(p => p.map(x => x.id === u.id ? u : x));
        if (user?.id === u.id) {
            setUser(u);
            localStorage.setItem('lfnm_user', JSON.stringify(u));
        }
        if (dataSource === 'database') { await updateUser(u); }
    };

    const handleEditNews = (newsItem: NewsItem) => {
        setAdminNewsToEdit(newsItem);
        setView('admin');
    };

    const handleCategorySelection = (id: string) => {
        if (id === 'jobs_view_trigger') { setView('jobs'); updateHash('/jobs'); }
        else { setSelectedCategory(id); setView('home'); setShouldScrollToGrid(true); }
    };

    const handleRegionSelection = (region: RegionFilterType) => {
        setSelectedRegion(region);
        setView('home');
        setShouldScrollToGrid(true);
    };

    const currentContext: PopupTargetPage = useMemo(() => {
        if (view === 'admin') { return 'admin_area'; }
        if (view === 'jobs') { return 'jobs_board'; }
        if (view === 'details') { return 'news_detail'; }
        return 'home';
    }, [view]);

    // Force auth callback view if hash contains token (fallback)
    useEffect(() => { if (window.location.hash.includes('access_token')) { } }, []);

    return {
        user, setUser,
        selectedNews, setSelectedNews,
        selectedCategory, setSelectedCategory,
        selectedRegion, setSelectedRegion,
        selectedAdvertiser, setSelectedAdvertiser,
        shouldScrollToGrid, setShouldScrollToGrid,
        adminNewsToEdit, setAdminNewsToEdit,
        news, setNews,
        users, setUsers,
        advertisers, setAdvertisers,
        systemJobs, setSystemJobs,
        auditLogs, setAuditLogs,
        dataSource, setDataSource,
        externalCategories,
        adConfig, setAdConfig,
        systemSettings, setSystemSettings,
        errorModal, setErrorModal,
        fatalError, setFatalError,
        showSessionExpiredModal, setShowSessionExpiredModal,
        modals,
        CURRENT_VERSION,
        showLoading, isInitialized,
        view, setView, updateHash, handleBackToHome,
        internalNews, tickerNews, marqueeNews,
        handleCloseChangelog,
        handleNetworkReconnect,
        handleLogout,
        handleUpdateSystemSettings,
        handleProfileUpdate,
        handleEditNews,
        handleCategorySelection,
        handleRegionSelection,
        triggerErrorModal,
        currentContext
    };
};
