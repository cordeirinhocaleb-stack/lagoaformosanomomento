'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import NewsDetailPage from '@/components/news-detail/NewsDetailPage';
import LoadingScreen from '@/components/common/LoadingScreen';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthModalsContainer from '@/components/common/AuthModalsContainer';
import MyAccountModal from '@/components/common/MyAccountModal';
import { incrementNewsView } from '@/services/content/contentService';

function NewsViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ctrl = useAppControllerContext();
    const trackedRef = useRef<string | null>(null);

    // We need to wait for the app to initialize the news list
    const isLoading = ctrl.showLoading || !ctrl.isInitialized;
    const [notFound, setNotFound] = useState(false);

    // Slug from Query Param
    const slug = searchParams.get('slug');

    useEffect(() => {
        if (isLoading) return;

        if (!slug) {
            setNotFound(true);
            return;
        }

        // Try to find the news item
        // Logic: ID match OR Slug match OR SEO Slug match
        const foundItem = ctrl.allNewsMerged.find(n =>
            n.id === slug ||
            n.slug === slug ||
            n.seo?.slug === slug
        );

        if (foundItem) {
            ctrl.setSelectedNews(foundItem);
            ctrl.setView('details');

            // Increment view count if not already tracked in this session/mount
            if (trackedRef.current !== foundItem.id) {
                incrementNewsView(foundItem.id).catch(err => console.error("View track error:", err));
                trackedRef.current = foundItem.id;
            }
        } else {
            console.warn(`[NewsViewPage] News item not found for slug: ${slug}`);
            setNotFound(true);
        }
    }, [isLoading, slug, ctrl.allNewsMerged, ctrl.setSelectedNews, ctrl.setView]);

    const handleBack = () => {
        ctrl.setSelectedNews(null);
        ctrl.setView('home');
        router.push('/');
    };

    if (isLoading) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    if (notFound) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header
                    onAdminClick={() => { if (ctrl.user) { if (ctrl.user.role === 'Leitor') { ctrl.modals.setShowProfileModal(true); } else { ctrl.updateHash('/admin'); } } else { ctrl.modals.setShowLoginModal(true); } }}
                    onHomeClick={() => ctrl.updateHash('/')}
                    latestNews={ctrl.tickerNews}
                    externalNews={ctrl.marqueeNews}
                    user={ctrl.user}
                    onOpenProfile={() => ctrl.modals.setShowProfileModal(true)}
                    selectedCategory={ctrl.selectedCategory}
                    onSelectCategory={(id) => {
                        ctrl.handleCategorySelection(id);
                        router.push('/');
                    }}
                    selectedRegion={ctrl.selectedRegion}
                    onSelectRegion={(region) => {
                        ctrl.handleRegionSelection(region);
                        router.push('/');
                    }}
                />
                <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 text-center bg-gray-50 dark:bg-zinc-950">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-white/5">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Matéria não encontrada</h1>
                        <p className="text-gray-500 dark:text-zinc-400 mb-8 text-sm font-medium">Esta notícia pode ter sido removida ou o link está incorreto.</p>
                        <button
                            onClick={handleBack}
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg"
                        >
                            Voltar ao Início
                        </button>
                    </div>
                </div>
                <Footer settings={ctrl.systemSettings} />
            </div>
        );
    }

    const itemToRender = ctrl.selectedNews || ctrl.news.find(n => n.id === slug || n.slug === slug || n.seo?.slug === slug);

    if (!itemToRender) return <LoadingScreen onFinished={() => { }} />;

    return (
        <div className="w-full flex flex-col min-h-screen animate-fadeIn">
            <Header
                onAdminClick={() => { if (ctrl.user) { if (ctrl.user.role === 'Leitor') { ctrl.modals.setShowProfileModal(true); } else { ctrl.updateHash('/admin'); } } else { ctrl.modals.setShowLoginModal(true); } }}
                onHomeClick={() => ctrl.updateHash('/')}
                latestNews={ctrl.tickerNews}
                externalNews={ctrl.marqueeNews}
                user={ctrl.user}
                onOpenProfile={() => ctrl.modals.setShowProfileModal(true)}
                selectedCategory={ctrl.selectedCategory}
                onSelectCategory={(id) => {
                    ctrl.handleCategorySelection(id);
                    router.push('/');
                }}
                selectedRegion={ctrl.selectedRegion}
                onSelectRegion={(region) => {
                    ctrl.handleRegionSelection(region);
                    router.push('/');
                }}
                onJobsClick={() => ctrl.updateHash('/jobs')}
            />

            <div className="w-full flex-grow flex flex-col px-4 md:px-0 md:w-[94%] md:max-w-[1550px] mx-auto self-center relative bg-white border-gray-100 shadow-2xl border-x">
                <main className="flex-grow w-full">
                    <NewsDetailPage
                        news={itemToRender}
                        allNews={ctrl.news}
                        onBack={handleBack}
                        onNewsClick={(n) => {
                            const link = n.seo?.slug || n.slug || n.id;
                            router.push(`/news/view?slug=${link}`);
                        }}
                        advertisers={ctrl.advertisers}
                        onAdvertiserClick={(ad) => {
                            ctrl.handleAdvertiserClick(ad);
                            if (ad.redirectType === 'external' && ad.externalUrl) {
                                window.open(ad.externalUrl, '_blank');
                            } else if (ad.redirectType === 'whatsapp' && ad.internalPage?.whatsapp) {
                                const phone = ad.internalPage.whatsapp.replace(/\D/g, '');
                                const message = ad.internalPage?.whatsappMessage || "Oi eu vim pelo lagoaformosanomomento, gostei da sua publicacao e estou interassado";
                                window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                            } else if (ad.redirectType === 'instagram' && ad.internalPage?.instagram) {
                                const user = ad.internalPage.instagram.replace('@', '').trim();
                                window.open(`https://instagram.com/${user}`, '_blank');
                            } else {
                                ctrl.modals.openAdvertiserInfo({
                                    id: ad.id,
                                    name: ad.name,
                                    phone: ad.phone,
                                    whatsapp: ad.internalPage?.whatsapp,
                                    whatsappMessage: ad.internalPage?.whatsappMessage,
                                    address: ad.address,
                                    logoUrl: ad.logoUrl,
                                    category: ad.category,
                                    location: ad.internalPage?.location
                                });
                            }
                        }}
                        selectedCategory={ctrl.selectedCategory}
                        onSelectCategory={(id) => {
                            ctrl.handleCategorySelection(id);
                            router.push('/');
                        }}
                        selectedRegion={ctrl.selectedRegion}
                        onSelectRegion={(region) => {
                            ctrl.handleRegionSelection(region);
                            router.push('/');
                        }}
                        user={ctrl.user}
                        onAdminClick={() => { if (ctrl.user?.role !== 'Leitor') router.push('/admin'); else ctrl.modals.setShowProfileModal(true); }}
                        adConfig={ctrl.adConfig}
                        onPricingClick={() => ctrl.modals.setShowPricingModal(true)}
                        settings={ctrl.systemSettings}
                        onEditNews={(n) => {
                            ctrl.setAdminNewsToEdit(n);
                            ctrl.setView('admin');
                            router.push('/admin');
                        }}
                        onUpdateUser={async (u) => {
                            ctrl.setUsers(p => p.map(x => x.id === u.id ? u : x));
                            if (ctrl.user?.id === u.id) ctrl.setUser(u);
                        }}
                        onLogin={() => ctrl.modals.setShowLoginModal(true)}
                    />
                </main>
            </div>

            <Footer settings={ctrl.systemSettings} />

            {ctrl.modals.showProfileModal && ctrl.user && (
                <MyAccountModal
                    user={ctrl.user}
                    onClose={() => ctrl.modals.setShowProfileModal(false)}
                    onUpdateUser={ctrl.handleProfileUpdate}
                    onLogout={ctrl.handleLogout}
                    adConfig={ctrl.adConfig}
                    systemSettings={ctrl.systemSettings}
                    onOpenTerms={ctrl.modals.openTermsModal}
                />
            )}

            <AuthModalsContainer
                modals={ctrl.modals}
                user={ctrl.user}
                users={ctrl.users}
                systemSettings={ctrl.systemSettings}
                setUser={ctrl.setUser}
                setUsers={ctrl.setUsers}
                setView={() => { }}
                updateHash={ctrl.updateHash}
                handleBackToHome={() => ctrl.updateHash('/')}
                triggerErrorModal={ctrl.triggerErrorModal}
                onCheckEmail={(_email: string) => Promise.resolve(true)}
            />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingScreen onFinished={() => { }} />}>
            <NewsViewContent />
        </Suspense>
    );
}
