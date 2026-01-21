'use client';

import React, { use } from 'react';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import AdvertiserPage from '@/components/advertiser/AdvertiserContent';
import LoadingScreen from '@/components/common/LoadingScreen';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export const dynamicParams = true; // Allow dynamic routes

export default function AdvertiserDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    const ctrl = useAppControllerContext();

    const advertiser = ctrl.advertisers.find(a => a.id === id);

    if (!ctrl.isInitialized || ctrl.showLoading) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    if (!advertiser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
                <h1 className="text-4xl font-black text-zinc-900 mb-4">Anunciante não encontrado</h1>
                <button
                    onClick={() => ctrl.updateHash('/')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                >
                    Voltar para a Home
                </button>
            </div>
        );
    }

    return (
        <AdvertiserPage
            advertiser={advertiser}
            onBack={() => ctrl.updateHash('/')}
        />
    );
}
