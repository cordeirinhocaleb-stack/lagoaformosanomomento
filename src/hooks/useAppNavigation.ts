import { useState, useEffect, useCallback } from 'react';
import { User, NewsItem } from '../types';

export type AppView = 'home' | 'admin' | 'details' | 'advertiser' | 'jobs' | 'auth_callback';

interface UseAppNavigationProps {
    isInitialized: boolean;
    user: User | null;
    news: NewsItem[];
    setSelectedNews: (news: NewsItem | null) => void;
    setShowLoginModal: (show: boolean) => void;
    setShowProfileModal: (show: boolean) => void;
}

export const useAppNavigation = ({
    isInitialized,
    user,
    news,
    setSelectedNews,
    setShowLoginModal,
    setShowProfileModal
}: UseAppNavigationProps) => {
    const [view, setView] = useState<AppView>('home');

    const getSafeHash = useCallback(() => {
        try { return window.location.hash; } catch { return ''; }
    }, []);

    const updateHash = useCallback((hash: string) => {
        const target = hash.startsWith('#') ? hash : `#${hash}`;
        try {
            if (getSafeHash() !== target) {window.location.hash = target;}
        } catch { }
    }, [getSafeHash]);

    useEffect(() => {
        if (!isInitialized) {return;}

        const handleHashChange = () => {
            const hash = getSafeHash();
            if (!hash) {return;}

            if (hash.includes('access_token')) {
                setView('auth_callback');
                return;
            }

            if (hash === '#/admin') {
                if (user) {
                    if (user.role === 'Leitor') {
                        setView('home');
                        updateHash('/');
                        setShowProfileModal(true);
                    } else {
                        setView('admin');
                    }
                } else {
                    setShowLoginModal(true);
                }
            } else if (hash.startsWith('#/news/')) {
                const id = hash.split('/').pop();
                const item = news.find(n => n.id === id);
                if (item) {
                    setSelectedNews(item);
                    setView('details');
                } else {
                    setView('home');
                    updateHash('/');
                }
            } else if (hash === '#/jobs') {
                setView('jobs');
            } else {
                setView('home');
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [news, user, isInitialized, getSafeHash, updateHash, setSelectedNews, setShowLoginModal, setShowProfileModal]);

    const handleBackToHome = useCallback(() => {
        setView('home');
        setSelectedNews(null);
        updateHash('/');
    }, [setSelectedNews, updateHash]);

    return {
        view,
        setView,
        updateHash,
        handleBackToHome,
        getSafeHash
    };
};
