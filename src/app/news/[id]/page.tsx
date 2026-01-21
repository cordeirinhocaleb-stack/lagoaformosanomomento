'use client';

import React, { use } from 'react';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import NewsDetail from '@/components/news-detail/NewsDetailPage';
import LoadingScreen from '@/components/common/LoadingScreen';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function NewsDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const ctrl = useAppControllerContext();
    const { modals } = ctrl;

    const currentNews = ctrl.news.find(n => n.id === id);

    if (!ctrl.isInitialized || ctrl.showLoading) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    // Aguarda notícias carregarem
    if (ctrl.news.length === 0) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    if (!currentNews) {
        console.error('Notícia não encontrada:', id, 'Total de notícias:', ctrl.news.length);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
                <h1 className="text-4xl font-black text-zinc-900 mb-4">Notícia não encontrada</h1>
                <button
                    onClick={() => ctrl.updateHash('/')}
                    className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
                >
                    Voltar para a Home
                </button>
            </div>
        );
    }

    return (
        <NewsDetail
            news={currentNews}
            allNews={ctrl.news}
            onNewsClick={(n) => ctrl.updateHash(`/news/${n.id}`)}
            onBack={() => ctrl.updateHash('/')}
            advertisers={ctrl.advertisers}
            selectedCategory={ctrl.selectedCategory}
            onSelectCategory={ctrl.handleCategorySelection}
            user={ctrl.user}
            selectedRegion={ctrl.selectedRegion}
            onSelectRegion={ctrl.handleRegionSelection}
            adConfig={ctrl.adConfig}
            onUpdateUser={ctrl.handleProfileUpdate}
            onPricingClick={() => modals.setShowPricingModal(true)}
            onEditNews={ctrl.handleEditNews}
            onLogin={() => modals.setShowLoginModal(true)}
        />
    );
}
