'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import InstagramPostDetail from '@/components/instagram/InstagramPostDetail';
import LoadingScreen from '@/components/common/LoadingScreen';

function InstagramViewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ctrl = useAppControllerContext();

    const postId = searchParams.get('id');
    const token = ctrl.systemSettings.instagramToken;

    if (!postId || !token) {
        if (!ctrl.isInitialized) return <LoadingScreen onFinished={() => { }} />;
        router.push('/');
        return null;
    }

    return (
        <InstagramPostDetail
            postId={postId}
            token={token}
            settings={ctrl.systemSettings}
            user={ctrl.user}
            tickerNews={ctrl.tickerNews}
            marqueeNews={ctrl.marqueeNews}
            onAdminClick={() => { if (ctrl.user) { if (ctrl.user.role === 'Leitor') { ctrl.modals.setShowProfileModal(true); } else { ctrl.updateHash('/admin'); } } else { ctrl.modals.setShowLoginModal(true); } }}
            onHomeClick={() => router.push('/')}
            selectedCategory={ctrl.selectedCategory}
            onSelectCategory={ctrl.handleCategorySelection}
            selectedRegion={ctrl.selectedRegion}
            onSelectRegion={ctrl.handleRegionSelection}
            // Novas Props para Layout de Notícia
            advertisers={ctrl.advertisers}
            allNews={ctrl.news}
            onAdvertiserClick={ctrl.setSelectedAdvertiser}
            adConfig={ctrl.adConfig}
            onPricingClick={() => ctrl.modals.setShowPricingModal(true)}
            onLogin={() => ctrl.modals.setShowLoginModal(true)}
        />
    );
}

export default function Page() {
    return (
        <Suspense fallback={<LoadingScreen onFinished={() => { }} />}>
            <InstagramViewContent />
        </Suspense>
    );
}
