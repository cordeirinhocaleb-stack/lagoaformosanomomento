'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, NewsItem, AppView } from '@/types';

interface UseAppNavigationProps {
    isInitialized: boolean;
    user: User | null;
    news: NewsItem[];
    view: AppView;
    setView: (view: AppView) => void;
    setSelectedNews: (news: NewsItem | null) => void;
    setShowLoginModal: (show: boolean) => void;
    setShowProfileModal: (show: boolean) => void;
}

export const useAppNavigation = ({
    isInitialized,
    user,
    news,
    view,
    setView,
    setSelectedNews,
    setShowLoginModal,
    setShowProfileModal
}: UseAppNavigationProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const updateHash = useCallback((path: string) => {
        // Agora 'path' é uma rota real do Next.js
        router.push(path);
    }, [router]);

    // Sincronizar 'view' do controller com o pathname real do Next.js
    useEffect(() => {
        if (!isInitialized || !pathname) return;

        if (pathname === '/') {
            setView('home');
        } else if (pathname === '/admin') {
            if (user) {
                if (user.role === 'Leitor') {
                    setView('home');
                    router.push('/');
                    setShowProfileModal(true);
                } else {
                    setView('admin');
                }
            } else {
                setShowLoginModal(true);
            }
        } else if (pathname.startsWith('/news/')) {
            const parts = pathname.split('/').filter(Boolean);
            if (parts.length >= 2 && parts[0] === 'news' && parts[1] === 'view') {
                setView('details');
            }
        } else if (pathname === '/jobs') {
            setView('jobs');
        } else if (pathname.startsWith('/advertiser/')) {
            setView('advertiser');
        } else if (pathname.startsWith('/docs')) {
            // Docs portal handle its own internal state
        }
    }, [pathname, isInitialized, user, news, setView, router, setSelectedNews, setShowLoginModal, setShowProfileModal]);

    const handleBackToHome = useCallback(() => {
        setSelectedNews(null);
        router.push('/');
    }, [setSelectedNews, router]);

    const getSafeHash = useCallback(() => {
        try { return typeof window !== 'undefined' ? window.location.hash : ''; } catch { return ''; }
    }, []);

    return {
        view,
        setView,
        updateHash,
        handleBackToHome,
        getSafeHash
    };
};
