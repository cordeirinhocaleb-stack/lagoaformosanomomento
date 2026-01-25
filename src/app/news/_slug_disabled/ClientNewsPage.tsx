'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import NewsDetailPage from '@/components/news-detail/NewsDetailPage';
import LoadingScreen from '@/components/common/LoadingScreen';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ClientNewsPage() {
    const params = useParams();
    const router = useRouter();
    const ctrl = useAppControllerContext();

    // We need to wait for the app to initialize the news list
    const isLoading = ctrl.showLoading || !ctrl.isInitialized;
    const [notFound, setNotFound] = useState(false);

    // Slug from URL
    const slug = params?.slug as string;

    useEffect(() => {
        if (isLoading) return;

        if (!slug) {
            setNotFound(true);
            return;
        }

        // Try to find the news item
        // Logic: ID match OR Slug match OR SEO Slug match
        const foundItem = ctrl.news.find(n =>
            n.id === slug ||
            n.slug === slug ||
            n.seo?.slug === slug
        );

        if (foundItem) {
            ctrl.setSelectedNews(foundItem);
            // Also ensure the view state is correct, though page component is handling render
            ctrl.setView('details');
        } else {
            // Not found after data load
            console.warn(`[NewsSlugPage] News item not found for slug: ${slug}`);
            setNotFound(true);
        }
    }, [isLoading, slug, ctrl.news, ctrl.setSelectedNews, ctrl.setView]);

    // Handle "Voltar" action - Go back to home
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
                    onAdminClick={() => ctrl.updateHash('/admin')}
                    onHomeClick={() => ctrl.updateHash('/')}
                    latestNews={ctrl.tickerNews}
                    externalNews={ctrl.marqueeNews}
                    user={ctrl.user}
                    onOpenProfile={() => ctrl.modals.setShowProfileModal(true)}
                    selectedCategory={ctrl.selectedCategory}
                    onSelectCategory={ctrl.handleCategorySelection}
                    selectedRegion={ctrl.selectedRegion}
                    onSelectRegion={ctrl.handleRegionSelection}
                />
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-gray-50">
                    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase">Notícia não encontrada</h1>
                        <p className="text-gray-500 mb-8">Esta notícia pode ter sido removida ou o link está incorreto.</p>
                        <button
                            onClick={handleBack}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase hover:bg-red-600 transition-colors"
                        >
                            Voltar ao Início
                        </button>
                    </div>
                </div>
                <Footer settings={ctrl.systemSettings} />
            </div>
        );
    }

    // Double check if selectedNews is set (it should set in the useEffect)
    // But we can also use 'foundItem' logic directly to render immediately if we wanted, 
    // but using global state 'ctrl.selectedNews' keeps consistancy.
    // However, for this page component, we can render directly found item to avoid flicker if 'ctrl.selectedNews' update is async.

    // Fallback: search again or use selectedNews.
    const itemToRender = ctrl.selectedNews || ctrl.news.find(n => n.id === slug || n.slug === slug || n.seo?.slug === slug);

    if (!itemToRender) return null; // Should be handled by notFound state

    return (
        <NewsDetailPage
            news={itemToRender}
            allNews={ctrl.news} // For related news logic
            onBack={handleBack}
            onNewsClick={(n) => {
                const link = n.seo?.slug || n.slug || n.id;
                router.push(`/news/${link}`);
            }}
            advertisers={ctrl.advertisers}
            onAdvertiserClick={(ad) => {
                // Common logic from page.tsx (should probably be a helper)
                ctrl.setSelectedAdvertiser(ad);
                router.push(`/advertiser/${ad.id}`);
            }}
            selectedCategory={ctrl.selectedCategory}
            onSelectCategory={(id) => {
                ctrl.handleCategorySelection(id);
                // Ensure we navigate to home to see the filtered grid
                router.push('/');
            }}
            selectedRegion={ctrl.selectedRegion}
            onSelectRegion={(region) => {
                ctrl.handleRegionSelection(region);
                // Ensure we navigate to home to see the filtered grid
                router.push('/');
            }}
            user={ctrl.user}
            onAdminClick={() => { if (ctrl.user?.role !== 'Leitor') router.push('/admin'); else ctrl.modals.setShowProfileModal(true); }}
            adConfig={ctrl.adConfig}
            onPricingClick={() => ctrl.modals.setShowPricingModal(true)}
            settings={ctrl.systemSettings}
            // Staff props
            onEditNews={(n) => {
                ctrl.setAdminNewsToEdit(n);
                ctrl.setView('admin');
                router.push('/admin');
            }}
            onUpdateUser={async (u) => {
                // Simplified version of handleProfileUpdate
                ctrl.setUsers(p => p.map(x => x.id === u.id ? u : x));
                if (ctrl.user?.id === u.id) ctrl.setUser(u);
            }}
            onLogin={() => ctrl.modals.setShowLoginModal(true)}
        />
    );
}
