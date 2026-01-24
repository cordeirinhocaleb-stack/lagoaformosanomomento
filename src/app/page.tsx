'use client';

import React from 'react';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Home from '@/components/home/HomeContent';
import LoadingScreen from '@/components/common/LoadingScreen';
import ChangelogModal from '@/components/common/ChangelogModal';
import SessionExpiredModal from '@/components/common/SessionExpiredModal';
import ErrorAlertModal from '@/components/common/ErrorAlertModal';
import AuthModalsContainer from '@/components/common/AuthModalsContainer';
import PromoPopupHost from '@/components/home/popup/PromoPopupHost';
import ActivityToastHost from '@/components/common/ActivityToastHost';
import NetworkStatusBanner from '@/components/common/NetworkStatusBanner';
import ErrorReportPanel from '@/components/ErrorReportPanel';
import PricingModal from '@/components/common/PricingModal';
import MyAccountModal from '@/components/common/MyAccountModal';
import ConstructionPage from '@/components/common/ConstructionPage';
import { updateUser, incrementAdvertiserClick } from '@/services/supabaseService';
import { trackVisit } from '@/services/stats/siteStatsService';

export default function HomePage() {
    const ctrl = useAppControllerContext();
    const { modals } = ctrl;

    React.useEffect(() => {
        trackVisit();
    }, []);

    if (ctrl.showLoading) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    const bypassRoles = ['Admin', 'Administrador', 'Desenvolvedor', 'Editor-Chefe', 'Editor'];
    const isBypassRole = ctrl.user && bypassRoles.includes(ctrl.user.role);
    const isLocal = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
    const shouldShowConstruction = ctrl.isInitialized && ctrl.systemSettings.maintenanceMode && !isBypassRole && !isLocal;

    if (shouldShowConstruction) {
        return (
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
        );
    }

    return (
        <div className="w-full flex flex-col min-h-screen animate-fadeIn">
            <NetworkStatusBanner onReconnect={ctrl.handleNetworkReconnect} />
            <ChangelogModal isOpen={modals.showChangelog} onClose={ctrl.handleCloseChangelog} user={ctrl.user} />

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
                        else if (ctrl.user.role !== 'Leitor') { ctrl.updateHash('/admin'); }
                    }}
                    onUpdateUser={async (u) => {
                        ctrl.setUsers(p => p.map(x => x.id === u.id ? u : x));
                        ctrl.setUser(u);
                        localStorage.setItem('lfnm_user', JSON.stringify(u));
                        if (ctrl.dataSource === 'database') { await updateUser(u); }
                    }}
                />
            )}

            <PromoPopupHost popupSet={ctrl.contractPopupSet} currentContext={ctrl.currentContext} mode="live" />
            <ActivityToastHost />

            <Header
                onAdminClick={() => { if (ctrl.user) { if (ctrl.user.role === 'Leitor') { modals.setShowProfileModal(true); } else { ctrl.updateHash('/admin'); } } else { modals.setShowLoginModal(true); } }}
                onHomeClick={() => ctrl.updateHash('/')}
                latestNews={ctrl.tickerNews}
                externalNews={ctrl.marqueeNews}
                user={ctrl.user} onOpenProfile={() => modals.setShowProfileModal(true)}
                selectedCategory={ctrl.selectedCategory} onSelectCategory={ctrl.handleCategorySelection}
                selectedRegion={ctrl.selectedRegion} onSelectRegion={ctrl.handleRegionSelection}
            />

            <div className="w-full flex-grow flex flex-col md:w-[94%] md:max-w-[1550px] mx-auto self-center relative bg-white border-gray-100 shadow-2xl border-x">
                <span className="absolute bottom-2 right-2 text-[10px] font-bold text-gray-500 bg-white/50 px-2 py-1 rounded-full border border-gray-200 backdrop-blur-sm z-10">
                    V. {ctrl.CURRENT_VERSION}
                </span>
                <main className="flex-grow w-full">
                    <Home
                        news={ctrl.news} advertisers={ctrl.advertisers} user={ctrl.user}
                        onNewsClick={(n) => {
                            ctrl.setSelectedNews(n);
                            const link = n.seo?.slug || n.slug || n.id;
                            ctrl.updateHash(`/news/${link}`);
                        }}
                        onAdvertiserClick={(ad) => {
                            // Registra o clique sem esperar (fire and forget)
                            incrementAdvertiserClick(ad.id).catch(console.error);

                            if (ad.redirectType === 'external' && ad.externalUrl) {
                                window.open(ad.externalUrl, '_blank');
                            } else if (ad.redirectType === 'whatsapp' && ad.internalPage?.whatsapp) {
                                const phone = ad.internalPage.whatsapp.replace(/\D/g, '');
                                window.open(`https://wa.me/55${phone}`, '_blank');
                            } else if (ad.redirectType === 'instagram' && ad.internalPage?.instagram) {
                                const user = ad.internalPage.instagram.replace('@', '').trim();
                                window.open(`https://instagram.com/${user}`, '_blank');
                            } else {
                                ctrl.setSelectedAdvertiser(ad);
                                ctrl.updateHash(`/advertiser/${ad.id}`);
                            }
                        }}
                        onAdminClick={() => { if (ctrl.user?.role !== 'Leitor') { ctrl.updateHash('/admin'); } else { modals.setShowProfileModal(true); } }}
                        onPricingClick={() => modals.setShowPricingModal(true)}
                        onJobsClick={() => { ctrl.updateHash('/jobs'); }}
                        adConfig={ctrl.adConfig} externalCategories={ctrl.externalCategories}
                        contractBanners={ctrl.contractBanners}
                        selectedCategory={ctrl.selectedCategory} onSelectCategory={ctrl.handleCategorySelection}
                        selectedRegion={ctrl.selectedRegion} onSelectRegion={(r) => { ctrl.setSelectedRegion(r); ctrl.setShouldScrollToGrid(true); }}
                        shouldScrollToGrid={ctrl.shouldScrollToGrid} onScrollConsumed={() => ctrl.setShouldScrollToGrid(false)}
                    />
                </main>
            </div>

            <Footer settings={ctrl.systemSettings} />

            {modals.showProfileModal && ctrl.user && (
                <MyAccountModal
                    user={ctrl.user}
                    onClose={() => modals.setShowProfileModal(false)}
                    onUpdateUser={ctrl.handleProfileUpdate}
                    onLogout={ctrl.handleLogout}
                    adConfig={ctrl.adConfig}
                    systemSettings={ctrl.systemSettings}
                    onOpenTerms={modals.openTermsModal}
                />
            )}

            <AuthModalsContainer
                modals={modals}
                user={ctrl.user}
                users={ctrl.users}
                systemSettings={ctrl.systemSettings}
                setUser={ctrl.setUser}
                setUsers={ctrl.setUsers}
                setView={() => { }} // Not used in App Router routing
                updateHash={ctrl.updateHash}
                handleBackToHome={() => ctrl.updateHash('/')}
                triggerErrorModal={ctrl.triggerErrorModal}
                onCheckEmail={(_email: string) => Promise.resolve(true)}
            />

            <ErrorReportPanel user={ctrl.user} />
        </div>
    );
}
