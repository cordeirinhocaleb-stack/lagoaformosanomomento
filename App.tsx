import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingScreen from './components/common/LoadingScreen';
import MyAccountModal from './components/common/MyAccountModal';
import PricingModal from './components/common/PricingModal';
import ErrorAlertModal from './components/common/ErrorAlertModal';
import AuthModalsContainer from './components/common/AuthModalsContainer';
import PromoPopupHost from './components/home/popup/PromoPopupHost';
import ActivityToastHost from './components/common/ActivityToastHost';
import NetworkStatusBanner from './components/common/NetworkStatusBanner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ChangelogModal from './components/common/ChangelogModal';
import AccessDeniedModal from './components/common/AccessDeniedModal';
import SuccessModal from './components/common/SuccessModal';
import ErrorReportPanel from './components/ErrorReportPanel';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin/index';
import ConstructionPage from './pages/ConstructionPage'; // Added import
import NewsDetail from './pages/news-detail/NewsDetailPage';
import AdvertiserPage from './pages/Advertiser';
import Jobs from './pages/Jobs';

// Imports de Tipos
import { NewsItem, User, Advertiser, Job, AdPricingConfig, SystemSettings, PopupTargetPage } from './types';
import { RegionFilterType } from './components/layout/CategoryMenu';

// Config & Hooks
import { DEFAULT_SETTINGS, INITIAL_AD_CONFIG } from './config/systemDefaults';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useInactivityTimer } from './hooks/useInactivityTimer';
import { useAppNavigation } from './src/hooks/useAppNavigation';
import SessionExpiredModal from './components/common/SessionExpiredModal';
import { useModals } from './hooks/useModals';
import { useAuth } from './hooks/useAuth';
import { useDataHandlers } from './hooks/useDataHandlers';

// Services
import { getExternalNews } from './services/geminiService';
import {
    getSupabase,
    checkConnection,
    createUser,
    updateUser,
    createNews,
    updateNews,
    deleteNews,
    upsertAdvertiser,
    saveSystemSetting,
    getSystemSetting,
    sendErrorReport,
    checkEmailExists // Importar fallback
} from './services/supabaseService';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRegion, setSelectedRegion] = useState<RegionFilterType>('Lagoa Formosa');
    const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
    const [shouldScrollToGrid, setShouldScrollToGrid] = useState(false);
    // Deep Linking State for Admin
    const [adminNewsToEdit, setAdminNewsToEdit] = useState<NewsItem | null>(null);

    // Versão atual do sistema (Sincronizada via Vite/package.json)
    const CURRENT_VERSION = import.meta.env.PACKAGE_VERSION || 'DEV';

    // Estados de Dados (Restaurados)
    const [news, setNews] = useState<NewsItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
    const [systemJobs, setSystemJobs] = useState<Job[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [dataSource, setDataSource] = useState<'database' | 'mock' | 'missing_tables'>('mock');

    const [externalCategories, setExternalCategories] = useState<Record<string, any[]>>({});
    const [adConfig, setAdConfig] = useState<AdPricingConfig>(INITIAL_AD_CONFIG);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);

    // Modais e UI
    const [showChangelog, setShowChangelog] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorDetails, setErrorDetails] = useState<{ message: string; stack?: string } | null>(null);
    const [errorModal, setErrorModal] = useState<{ open: boolean; error: any; context: string; severity: 'info' | 'warning' | 'critical' }>({ open: false, error: null, context: '', severity: 'critical' });
    const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
    const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [accessDeniedConfig, setAccessDeniedConfig] = useState({ title: '', message: '' });
    const [showAccessDenied, setShowAccessDenied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [pendingManualEmail, setPendingManualEmail] = useState('');

    // Estados de Modais Faltantes
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Hooks de Modularização
    const modals = useModals();

    // Callbacks de Inicialização
    const handleDataLoaded = useCallback(async (response: any) => {
        setNews(response.data.news);
        setAdvertisers(response.data.advertisers);
        setUsers(response.data.users);
        setSystemJobs(response.data.jobs);
        setAuditLogs(response.data.auditLogs || []);
        setDataSource(response.source);

        if (response.source === 'database') {
            const remoteAdConfig = await getSystemSetting('ad_config');
            if (remoteAdConfig) setAdConfig({ ...INITIAL_AD_CONFIG, ...remoteAdConfig });
        }

        // Carregar notícias externas
        getExternalNews().then(setExternalCategories);
    }, []);

    const handleUserRestored = useCallback((restoredUser: User | null) => {
        setUser(restoredUser);
        if (!restoredUser) {
            // Cleanup em caso de logout detectado
            localStorage.removeItem('lfnm_user');
        }
    }, []);

    // Verificação de Novas Versões (Changelog)
    useEffect(() => {
        const lastVersion = localStorage.getItem('lfnm_last_version');
        if (lastVersion !== CURRENT_VERSION) {
            // Pequeno delay para não sobrepor o carregamento inicial
            const timer = setTimeout(() => setShowChangelog(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [CURRENT_VERSION]);

    const handleCloseChangelog = () => {
        setShowChangelog(false);
        localStorage.setItem('lfnm_last_version', CURRENT_VERSION);
    };

    // Watchdog timer moved after initialization (see later in file)

    // Funções Helper (Restauradas)
    const triggerErrorModal = useCallback((error: any, context: string = 'System Error', severity: 'info' | 'warning' | 'critical' = 'critical') => {
        // Log based on severity/environment
        if (severity === 'critical') console.error(`🛡️ CRITICAL ERROR[${context}]: `, error);
        else console.warn(`🛡️ Warning[${context}]: `, error);

        // PRODUCTION FILTER: Only show modal for CRITICAL errors
        // Inclui dev.webgho.com como ambiente de "produção" para fins de UI limpa
        const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname.includes('webgho.com');

        if (isProduction && severity !== 'critical') {
            return; // Suppress UI for non-critical errors in prod/staging
        }

        setErrorModal({ open: true, error, context, severity });
    }, []);

    // Hook de Inicialização e Lógica Pesada
    const { isLoading: showLoading, isInitialized, loadRemoteData } = useAppInitialization({
        onDataLoaded: handleDataLoaded,
        onUserRestored: handleUserRestored,
        onAuthChallenge: (gUser) => {
            if (systemSettings.registrationEnabled) {
                setPendingGoogleUser(gUser);
                setShowRoleSelector(true);
            } else {
                setAccessDeniedConfig({
                    title: 'CADASTRO DESATIVADO',
                    message: 'O cadastro de novos usuários está temporariamente desativado. Entre em contato com o administrador para solicitar inclusão.'
                });
                setShowAccessDenied(true);
                const sb = getSupabase();
                if (sb) sb.auth.signOut();
            }
        },
        onSettingsLoaded: setSystemSettings,
        onError: (e) => {
            const errorMsg = e.message || '';
            if (errorMsg.includes('Conta não registrada') || errorMsg.includes('Acesso Negado')) {
                setAccessDeniedConfig({
                    title: 'ACESSO NEGADO',
                    message: 'Esta conta não possui um registro ativo no portal. Solicite acesso ao administrador.'
                });
                setShowAccessDenied(true);
            } else {
                triggerErrorModal(e, 'Inicialização');
            }
        },
        currentVersion: CURRENT_VERSION
    });

    const { view, setView, updateHash, handleBackToHome } = useAppNavigation({
        isInitialized,
        user,
        news,
        setSelectedNews,
        setShowLoginModal,
        setShowProfileModal
    });



    const internalNews = useMemo(() => news.filter(n => n.source === 'site' || !n.source), [news]);

    // Ticker News: Somente Lagoa Formosa e Região (Plantão Vermelho)
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
        if (user?.themePreference === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [user?.themePreference]);



    const handleNetworkReconnect = () => {
        loadRemoteData();
        getExternalNews().then(setExternalCategories);
        // Tenta relogar via token existente no cliente Supabase se necessário
        const sb = getSupabase();
        if (sb) sb.auth.getSession().then(({ data }) => {
            // Removido bypass de usuário sem banco para segurança estrita
            if (data.session?.user && !user) {
                console.log("🔄 Reconnect detectado, aguardando sincronização oficial...");
            }
        });
    };



    const handleLogout = async () => {
        // 1. Limpeza imediata do estado local
        setUser(null);
        localStorage.removeItem('lfnm_user');
        sessionStorage.removeItem('lfnm_user');
        setShowProfileModal(false);

        try {
            // 2. Tenta fazer o logout no servidor (Supabase)
            const sb = getSupabase();
            if (sb) {
                await sb.auth.signOut();
            }
        } catch (e) {
            console.warn("⚠️ Erro ao deslogar do Supabase:", e);
        }

        // 3. Força a limpeza total e volta para a home
        // Em vez de reload(), vamos resetar a view e limpar a hash para garantir
        setView('home');
        updateHash('/');
        window.location.reload(); // Recarrega para limpar Singletons e Listeners
    };

    // Escudo de Eventos Globais
    useEffect(() => {
        const globalErrorHandler = (e: ErrorEvent) => triggerErrorModal(e.error, 'Window Error');
        const globalRejectionHandler = (e: PromiseRejectionEvent) => {
            // Detecção específica de erros de Auth do Supabase que indicam sessão inválida
            const reason = e.reason?.toString() || '';
            if (reason.includes('AuthSessionMissingError') || reason.includes('AuthApiError: invalid_grant')) {
                console.warn("⚠️ Sessão não encontrada ou inválida. Assumindo estado deslogado.");
                // Correção 3: Não forçar logout/reload, Apenas ignora ou limpa estado local se necessário
                // handleLogout(); // <--- REMOVIDO PARA EVITAR RELOAD LOOP
                if (user) setUser(null); // Apenas desloga o estado React, sem reload
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
    }, [triggerErrorModal]);

    // Auto-Logout por inatividade (30 minutos)
    useInactivityTimer(30 * 60 * 1000, () => {
        if (user) {
            setShowSessionExpiredModal(true);
        }
    });

    // Routing Logic delegated to useAppNavigation hook

    const handleUpdateSystemSettings = async (newSettings: SystemSettings) => {
        setSystemSettings(newSettings);
        if (dataSource === 'database') {
            await saveSystemSetting('general_settings', newSettings);
        }
    };

    const handleProfileUpdate = async (u: User) => {
        setUsers(p => p.map(x => x.id === u.id ? u : x));
        if (user?.id === u.id) {
            setUser(u);
            localStorage.setItem('lfnm_user', JSON.stringify(u));
        }
        if (dataSource === 'database') await updateUser(u);
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
        if (view === 'admin') return 'admin_area';
        if (view === 'jobs') return 'jobs_board';
        if (view === 'details') return 'news_detail';
        return 'home';
    }, [view]);

    // Force auth callback view if hash contains token (fallback in case hook is slow)
    useEffect(() => {
        if (window.location.hash.includes('access_token')) {
            // Early detection can happen here if needed
        }
    }, []);

    return (
        <ErrorBoundary onError={triggerErrorModal}>
            <div className={`min-h-screen flex flex-col w-full overflow-x-hidden ${user?.themePreference === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
                <NetworkStatusBanner onReconnect={handleNetworkReconnect} />
                {showLoading && <LoadingScreen onFinished={() => { }} />}

                {!showLoading && (
                    <>
                        <ChangelogModal
                            isOpen={showChangelog}
                            onClose={handleCloseChangelog}
                        />

                        {/* Session Expired Modal */}
                        {showSessionExpiredModal && (
                            <SessionExpiredModal
                                onClose={() => {
                                    setShowSessionExpiredModal(false);
                                    handleLogout();
                                }}
                            />
                        )}

                        {/* Global Error Modal */}
                        {errorModal.open && (
                            <ErrorAlertModal
                                error={errorModal.error}
                                context={errorModal.context}
                                severity={errorModal.severity}
                                onClose={() => setErrorModal(prev => ({ ...prev, open: false }))}
                                onSendReport={async () => { console.log('Relatório enviado'); }}
                            />
                        )}

                        {showPricingModal && (
                            <PricingModal
                                config={adConfig}
                                user={user}
                                onClose={() => setShowPricingModal(false)}
                                onSelectPlan={(planId) => {
                                    setShowPricingModal(false);
                                    if (!user) modals.setShowLoginModal(true);
                                    else if (user.role !== 'Leitor') { setView('admin'); updateHash('/admin'); }
                                }}
                                onUpdateUser={async (u) => {
                                    setUsers(p => p.map(x => x.id === u.id ? u : x));
                                    setUser(u);
                                    localStorage.setItem('lfnm_user', JSON.stringify(u));
                                    if (dataSource === 'database') await updateUser(u);
                                }}
                            />
                        )}

                        <PromoPopupHost popupSet={adConfig.popupSet} currentContext={currentContext} mode="live" />
                        <ActivityToastHost />

                        <AuthModalsContainer
                            modals={{
                                ...modals,
                                // Override setters to sync with local state if needed, or prefer using 'modals' state
                                // For now, we pass the local states that we restored to keep it working
                                showLoginModal, setShowLoginModal,
                                showRoleSelector, setShowRoleSelector,
                                showSuccessModal, setShowSuccessModal,
                                showAccessDenied, setShowAccessDenied,
                                pendingGoogleUser, setPendingGoogleUser,
                                pendingManualEmail, setPendingManualEmail,
                                successMessage: typeof successMessage === 'string' ? successMessage : successMessage.message,
                                setSuccessMessage: (msg: string) => setSuccessMessage({ title: 'SUCESSO', message: msg }),
                                accessDeniedConfig, setAccessDeniedConfig
                            } as any}
                            user={user}
                            users={users}
                            systemSettings={systemSettings}
                            setUser={setUser}
                            setUsers={setUsers}
                            setView={(v) => setView(v as any)}
                            updateHash={updateHash}
                            handleBackToHome={() => setView('home')}
                            triggerErrorModal={triggerErrorModal}
                            onCheckEmail={checkEmailExists}
                        />

                        {isInitialized && systemSettings.maintenanceMode && process.env.NODE_ENV !== 'development' && (!user || user.role === 'Leitor') ? (
                            <ConstructionPage
                                user={user}
                                onLogin={(u) => { setUser(u); if (u.role !== 'Leitor') setView('admin'); }}
                                onLogout={handleLogout}
                                onShowLogin={() => setShowLoginModal(true)}
                                disableSignup={!systemSettings.registrationEnabled}
                            />
                        ) : (
                            <div className="w-full flex flex-col min-h-screen animate-fadeIn">
                                {view !== 'admin' && (
                                    <Header
                                        onAdminClick={() => { if (user) { if (user.role === 'Leitor') setShowProfileModal(true); else { setView('admin'); updateHash('/admin'); } } else setShowLoginModal(true); }}
                                        onHomeClick={() => setView('home')}
                                        latestNews={tickerNews} brazilNews={marqueeNews}
                                        user={user} onOpenProfile={() => setShowProfileModal(true)}
                                        selectedCategory={selectedCategory} onSelectCategory={handleCategorySelection}
                                        selectedRegion={selectedRegion} onSelectRegion={handleRegionSelection}
                                    />
                                )}

                                {view === 'admin' && user && user.role !== 'Leitor' ? (
                                    <Admin
                                        user={user} newsHistory={news} allUsers={users}
                                        advertisers={advertisers} adConfig={adConfig} systemSettings={systemSettings}
                                        jobs={systemJobs} auditLogs={auditLogs}
                                        onAddNews={async (n) => { setNews(p => [n, ...p]); await createNews(n); }}
                                        onUpdateNews={async (n) => { setNews(p => p.map(x => x.id === n.id ? n : x)); await updateNews(n); }}
                                        onDeleteNews={async (id) => { setNews(p => p.filter(x => x.id !== id)); await deleteNews(id); }}
                                        onUpdateUser={async (u) => { setUsers(p => p.map(x => x.id === u.id ? u : x)); await updateUser(u); }}
                                        onUpdateAdvertiser={async (a) => { setAdvertisers(p => p.map(x => x.id === a.id ? a : x)); await upsertAdvertiser(a); }}
                                        onUpdateAdConfig={(c) => setAdConfig(c)}
                                        onUpdateSystemSettings={handleUpdateSystemSettings}
                                        onLogout={handleLogout}
                                        onNavigateHome={() => setView('home')}
                                        initialNewsToEdit={adminNewsToEdit} // Pass deep linked news
                                    />
                                ) : (
                                    <div className="w-full flex-grow flex flex-col md:w-[94%] md:max-w-[1550px] md:mx-auto relative bg-white border-gray-100 shadow-2xl border-x">
                                        <span className="absolute bottom-2 right-2 text-[10px] font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-full border border-gray-200 backdrop-blur-sm z-10">
                                            v{CURRENT_VERSION}
                                        </span>
                                        <main className="flex-grow w-full">
                                            {view === 'home' && (
                                                <Home
                                                    news={news} advertisers={advertisers} user={user}
                                                    onNewsClick={(n) => { setSelectedNews(n); setView('details'); updateHash(`/ news / ${n.id} `); }}
                                                    onAdvertiserClick={(ad) => { if (ad.redirectType === 'external') window.open(ad.externalUrl, '_blank'); else { setSelectedAdvertiser(ad); setView('advertiser'); } }}
                                                    onAdminClick={() => { if (user?.role !== 'Leitor') setView('admin'); else setShowProfileModal(true); }}
                                                    onPricingClick={() => setShowPricingModal(true)}
                                                    onJobsClick={() => { setView('jobs'); updateHash('/jobs'); }}
                                                    adConfig={adConfig} externalCategories={externalCategories}
                                                    selectedCategory={selectedCategory} onSelectCategory={handleCategorySelection}
                                                    selectedRegion={selectedRegion} onSelectRegion={(r) => { setSelectedRegion(r); setView('home'); setShouldScrollToGrid(true); }}
                                                    shouldScrollToGrid={shouldScrollToGrid} onScrollConsumed={() => setShouldScrollToGrid(false)}
                                                />
                                            )}
                                            {view === 'details' && selectedNews && (
                                                <NewsDetail
                                                    news={selectedNews}
                                                    allNews={news}
                                                    onNewsClick={(n) => setSelectedNews(n)}
                                                    onBack={() => setView('home')} advertisers={advertisers}
                                                    selectedCategory={selectedCategory} onSelectCategory={handleCategorySelection}
                                                    user={user} selectedRegion={selectedRegion} onSelectRegion={handleRegionSelection}
                                                    adConfig={adConfig}
                                                    onUpdateUser={handleProfileUpdate}
                                                    onPricingClick={() => setShowPricingModal(true)}
                                                    onEditNews={handleEditNews}
                                                />
                                            )}
                                            {view === 'jobs' && <Jobs jobs={systemJobs} onBack={() => setView('home')} isEnabled={systemSettings.jobsModuleEnabled} />}
                                            {view === 'advertiser' && selectedAdvertiser && <AdvertiserPage advertiser={selectedAdvertiser} onBack={() => setView('home')} />}
                                        </main>
                                        <Footer settings={systemSettings} />
                                    </div>
                                )}
                                {showProfileModal && user && (
                                    <MyAccountModal
                                        user={user}
                                        onClose={() => setShowProfileModal(false)}
                                        onUpdateUser={handleProfileUpdate}
                                        onLogout={handleLogout}
                                        adConfig={adConfig}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}
                <ErrorReportPanel user={user} />
            </div>
        </ErrorBoundary >
    );
};


export default App;
