'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import AdvertiserPage from '@/components/advertiser/AdvertiserContent';
import LoadingScreen from '@/components/common/LoadingScreen';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

function AdvertiserViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ctrl = useAppControllerContext();

    const isLoading = ctrl.showLoading || !ctrl.isInitialized;
    const [notFound, setNotFound] = useState(false);

    const id = searchParams.get('id');

    useEffect(() => {
        if (isLoading) return;

        if (!id) {
            setNotFound(true);
            return;
        }

        const foundAd = ctrl.advertisers.find(a => a.id === id);

        if (foundAd) {
            ctrl.setSelectedAdvertiser(foundAd);
            ctrl.setView('advertiser');
        } else {
            console.warn(`[AdvertiserViewPage] Advertiser not found for id: ${id}`);
            setNotFound(true);
        }
    }, [isLoading, id, ctrl.advertisers, ctrl.setSelectedAdvertiser, ctrl.setView]);

    const handleBack = () => {
        ctrl.setSelectedAdvertiser(null);
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
                        <div className="w-20 h-20 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center text-4xl mb-6 mx-auto">
                            <i className="fas fa-store-slash"></i>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase">Parceiro não encontrado</h1>
                        <p className="text-gray-500 mb-8">O anunciante que você procura não está disponível.</p>
                        <button
                            onClick={handleBack}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase hover:bg-gray-800 transition-colors"
                        >
                            Voltar ao Início
                        </button>
                    </div>
                </div>
                <Footer settings={ctrl.systemSettings} />
            </div>
        );
    }

    const adToRender = ctrl.selectedAdvertiser || ctrl.advertisers.find(a => a.id === id);

    if (!adToRender) return null;

    return (
        <div className="flex flex-col min-h-screen animate-fadeIn">
            <AdvertiserPage
                advertiser={adToRender}
                onBack={handleBack}
                isModal={false}
            />
            <Footer settings={ctrl.systemSettings} />
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingScreen onFinished={() => { }} />}>
            <AdvertiserViewContent />
        </Suspense>
    );
}
