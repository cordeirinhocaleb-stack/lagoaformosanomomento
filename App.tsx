import React, { useEffect } from 'react';
import { BUILD_NUMBER } from './src/version';

// Components
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
import SessionExpiredModal from './components/common/SessionExpiredModal';
import ErrorReportPanel from './components/ErrorReportPanel';

// Pages
import Home from './pages/Home';
import Admin from './pages/Admin/index';
import ConstructionPage from './pages/ConstructionPage';
import NewsDetail from './pages/news-detail/NewsDetailPage';
import AdvertiserPage from './pages/Advertiser';
import Jobs from './pages/Jobs';
import ErrorPage from './pages/ErrorPage';

// Services
import { createNews, updateNews, deleteNews, updateUser, upsertAdvertiser } from './services/supabaseService';
import { useAppController } from './hooks/useAppController';

const App: React.FC = () => {
    const ctrl = useAppController();
    const { modals } = ctrl;

    // Version Enforcement & Cache Busting
    useEffect(() => {
        const storedVersion = localStorage.getItem('app_version');
        const currentVersion = String(BUILD_NUMBER);

        if (storedVersion !== currentVersion) {
            console.warn(`[System] Version Override: ${storedVersion || 'Unknown'} -> ${currentVersion}`);

            // 1. SELECTIVE Clear Storage (Preserve critical user agreements)
            const keysToPreserve = [
                'app_version', // Will be set below
                'lfnm_theme',
                'lfnm_last_version'
            ];

            // Add all terms_accepted keys to preserve list
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('lfnm_terms_accepted_')) {
                    keysToPreserve.push(key);
                }
            }

            // Remove what's not in preserve list
            Object.keys(localStorage).forEach(key => {
                if (!keysToPreserve.includes(key)) {
                    localStorage.removeItem(key);
                }
            });

            sessionStorage.clear();

            // 2. Set New Version
            localStorage.setItem('app_version', currentVersion);

            // 3. Force Reload to ensure clean memory
            window.location.reload();
        }
    }, []);

    return (
        <ErrorBoundary onError={ctrl.triggerErrorModal}>
            <div className={`min-h-screen flex flex-col w-full overflow-x-hidden ${ctrl.user?.themePreference === 'dark' ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
                <NetworkStatusBanner onReconnect={ctrl.handleNetworkReconnect} />
                {ctrl.showLoading && <LoadingScreen onFinished={() => { }} />}

                {!ctrl.showLoading && (
                    <>
                        <ChangelogModal isOpen={modals.showChangelog} onClose={ctrl.handleCloseChangelog} />
                        {ctrl.showSessionExpiredModal && (
                            <SessionExpiredModal onClose={() => { ctrl.setShowSessionExpiredModal(false); ctrl.handleLogout(); }} />
                        )}
                        {ctrl.errorModal.open && (
                            <ErrorAlertModal
                                error={ctrl.errorModal.error}
                                context={ctrl.errorModal.context}
                                severity={ctrl.errorModal.severity}
                                onClose={() => ctrl.setErrorModal(prev => ({ ...prev, open: false }))}
                                onSendReport={async () => { console.log('Relatório enviado'); }}
                            />
                        )}
                        {modals.showPricingModal && (
                            <PricingModal
                                config={ctrl.adConfig} user={ctrl.user}
                                onClose={() => modals.setShowPricingModal(false)}
                                onSelectPlan={(_planId) => {
                                    modals.setShowPricingModal(false);
                                    if (!ctrl.user) { modals.setShowLoginModal(true); }
                                    else if (ctrl.user.role !== 'Leitor') { ctrl.setView('admin'); ctrl.updateHash('/admin'); }
                                }}
                                onUpdateUser={async (u) => {
                                    ctrl.setUsers(p => p.map(x => x.id === u.id ? u : x));
                                    ctrl.setUser(u);
                                    localStorage.setItem('lfnm_user', JSON.stringify(u));
                                    if (ctrl.dataSource === 'database') { await updateUser(u); }
                                }}
                            />
                        )}

                        <PromoPopupHost popupSet={ctrl.adConfig.popupSet} currentContext={ctrl.currentContext} mode="live" />
                        <ActivityToastHost />

                        {(() => {
                            const bypassRoles = ['Admin', 'Administrador', 'Desenvolvedor', 'Editor-Chefe', 'Editor'];
                            const isBypassRole = ctrl.user && bypassRoles.includes(ctrl.user.role);
                            const isLocal = window.location.hostname.includes('localhost');
                            const shouldShowConstruction = ctrl.isInitialized && ctrl.systemSettings.maintenanceMode && !isBypassRole && !isLocal;

                            if (ctrl.isInitialized && ctrl.systemSettings.maintenanceMode) {
                                console.log("🚧 [MAINTENANCE DEBUG]", { isInitialized: ctrl.isInitialized, maintenanceMode: ctrl.systemSettings.maintenanceMode, isBypassRole, isLocal, user: ctrl.user?.role });
                            }

                            return shouldShowConstruction ? (
                                <ConstructionPage
                                    user={ctrl.user}
                                    onLogin={(u) => {
                                        ctrl.setUser(u);
                                        if (bypassRoles.includes(u.role)) {
                                            ctrl.setView('home');
                                            ctrl.updateHash('/');
                                        }
                                    }}
                                    onLogout={ctrl.handleLogout}
                                    onShowLogin={() => modals.setShowLoginModal(true)}
                                    disableSignup={!ctrl.systemSettings.registrationEnabled}
                                />
                            ) : null;
                        })()}

                        {(!ctrl.systemSettings.maintenanceMode || (ctrl.user && ['Admin', 'Administrador', 'Desenvolvedor', 'Editor-Chefe', 'Editor'].includes(ctrl.user.role)) || window.location.hostname.includes('localhost')) && (
                            <div className="w-full flex flex-col min-h-screen animate-fadeIn">
                                {ctrl.view !== 'admin' && (
                                    <Header
                                        onAdminClick={() => { if (ctrl.user) { if (ctrl.user.role === 'Leitor') { modals.setShowProfileModal(true); } else { ctrl.setView('admin'); ctrl.updateHash('/admin'); } } else { modals.setShowLoginModal(true); } }}
                                        onHomeClick={() => ctrl.setView('home')}
                                        latestNews={ctrl.tickerNews} brazilNews={ctrl.marqueeNews}
                                        user={ctrl.user} onOpenProfile={() => modals.setShowProfileModal(true)}
                                        selectedCategory={ctrl.selectedCategory} onSelectCategory={ctrl.handleCategorySelection}
                                        selectedRegion={ctrl.selectedRegion} onSelectRegion={ctrl.handleRegionSelection}
                                    />
                                )}

                                {ctrl.view === 'admin' && ctrl.user && ctrl.user.role !== 'Leitor' ? (
                                    <Admin
                                        user={ctrl.user} newsHistory={ctrl.news} allUsers={ctrl.users}
                                        advertisers={ctrl.advertisers} adConfig={ctrl.adConfig} systemSettings={ctrl.systemSettings}
                                        jobs={ctrl.systemJobs} auditLogs={ctrl.auditLogs}
                                        onAddNews={async (n) => { ctrl.setNews(p => [n, ...p]); await createNews(n); }}
                                        onUpdateNews={async (n) => { ctrl.setNews(p => p.map(x => x.id === n.id ? n : x)); await updateNews(n); }}
                                        onDeleteNews={async (id) => { ctrl.setNews(p => p.filter(x => x.id !== id)); await deleteNews(id); }}
                                        onUpdateUser={async (u) => { ctrl.setUsers(p => p.map(x => x.id === u.id ? u : x)); await updateUser(u); }}
                                        onUpdateAdvertiser={async (a) => { ctrl.setAdvertisers(p => p.map(x => x.id === a.id ? a : x)); await upsertAdvertiser(a); }}
                                        onUpdateAdConfig={(c) => ctrl.setAdConfig(c)}
                                        onUpdateSystemSettings={ctrl.handleUpdateSystemSettings}
                                        onLogout={ctrl.handleLogout}
                                        onNavigateHome={() => ctrl.setView('home')}
                                        initialNewsToEdit={ctrl.adminNewsToEdit}
                                    />
                                ) : (
                                    <div className="w-full flex-grow flex flex-col md:w-[94%] md:max-w-[1550px] md:mx-auto relative bg-white border-gray-100 shadow-2xl border-x">
                                        <span className="absolute bottom-2 right-2 text-[10px] font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-full border border-gray-200 backdrop-blur-sm z-10">
                                            V. {ctrl.CURRENT_VERSION}
                                        </span>
                                        <main className="flex-grow w-full">
                                            {ctrl.view === 'home' && (
                                                <Home
                                                    news={ctrl.news} advertisers={ctrl.advertisers} user={ctrl.user}
                                                    onNewsClick={(n) => { ctrl.setSelectedNews(n); ctrl.setView('details'); ctrl.updateHash(`/news/${n.id}`); }}
                                                    onAdvertiserClick={(ad) => { if (ad.redirectType === 'external') { window.open(ad.externalUrl, '_blank'); } else { ctrl.setSelectedAdvertiser(ad); ctrl.setView('advertiser'); } }}
                                                    onAdminClick={() => { if (ctrl.user?.role !== 'Leitor') { ctrl.setView('admin'); } else { modals.setShowProfileModal(true); } }}
                                                    onPricingClick={() => modals.setShowPricingModal(true)}
                                                    onJobsClick={() => { ctrl.setView('jobs'); ctrl.updateHash('/jobs'); }}
                                                    adConfig={ctrl.adConfig} externalCategories={ctrl.externalCategories}
                                                    selectedCategory={ctrl.selectedCategory} onSelectCategory={ctrl.handleCategorySelection}
                                                    selectedRegion={ctrl.selectedRegion} onSelectRegion={(r) => { ctrl.setSelectedRegion(r); ctrl.setView('home'); ctrl.setShouldScrollToGrid(true); }}
                                                    shouldScrollToGrid={ctrl.shouldScrollToGrid} onScrollConsumed={() => ctrl.setShouldScrollToGrid(false)}
                                                />
                                            )}
                                            {ctrl.view === 'details' && ctrl.selectedNews && (
                                                <NewsDetail
                                                    news={ctrl.selectedNews} allNews={ctrl.news}
                                                    onNewsClick={(n) => ctrl.setSelectedNews(n)}
                                                    onBack={() => ctrl.setView('home')} advertisers={ctrl.advertisers}
                                                    selectedCategory={ctrl.selectedCategory} onSelectCategory={ctrl.handleCategorySelection}
                                                    user={ctrl.user} selectedRegion={ctrl.selectedRegion} onSelectRegion={ctrl.handleRegionSelection}
                                                    adConfig={ctrl.adConfig} onUpdateUser={ctrl.handleProfileUpdate}
                                                    onPricingClick={() => modals.setShowPricingModal(true)}
                                                    onEditNews={ctrl.handleEditNews}
                                                />
                                            )}
                                            {ctrl.view === 'jobs' && <Jobs jobs={ctrl.systemJobs} onBack={() => ctrl.setView('home')} isEnabled={ctrl.systemSettings.jobsModuleEnabled} />}
                                            {ctrl.view === 'advertiser' && ctrl.selectedAdvertiser && <AdvertiserPage advertiser={ctrl.selectedAdvertiser} onBack={() => ctrl.setView('home')} />}
                                            {ctrl.view === 'error' && (
                                                <ErrorPage
                                                    error={ctrl.fatalError?.error}
                                                    stack={ctrl.fatalError?.stack}
                                                    user={ctrl.user}
                                                    systemSettings={ctrl.systemSettings}
                                                    onBack={() => { ctrl.setFatalError(null); ctrl.setView('home'); ctrl.updateHash('/'); window.location.reload(); }}
                                                />
                                            )}
                                        </main>
                                        <Footer settings={ctrl.systemSettings} />
                                    </div>
                                )}
                                {modals.showProfileModal && ctrl.user && (
                                    <MyAccountModal
                                        user={ctrl.user}
                                        onClose={() => modals.setShowProfileModal(false)}
                                        onUpdateUser={ctrl.handleProfileUpdate}
                                        onLogout={ctrl.handleLogout}
                                        adConfig={ctrl.adConfig}
                                        onOpenTerms={modals.openTermsModal}
                                    />
                                )}
                            </div>
                        )}

                        <AuthModalsContainer
                            modals={modals}
                            user={ctrl.user}
                            users={ctrl.users}
                            systemSettings={ctrl.systemSettings}
                            setUser={ctrl.setUser}
                            setUsers={ctrl.setUsers}
                            setView={(v) => ctrl.setView(v as any)}
                            updateHash={ctrl.updateHash}
                            handleBackToHome={() => ctrl.setView('home')}
                            triggerErrorModal={ctrl.triggerErrorModal}
                            onCheckEmail={(_email: string) => Promise.resolve(true)}
                        />
                    </>
                )}
                <ErrorReportPanel user={ctrl.user} />
            </div>
        </ErrorBoundary>
    );
};
export default App;
