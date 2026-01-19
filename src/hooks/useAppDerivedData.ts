import { useMemo } from 'react';
import { NewsItem, Advertiser } from '@/types';

interface UseAppDerivedDataParams {
    news: NewsItem[];
    externalCategories: Record<string, unknown[]>;
    advertisers: Advertiser[];
}

export const useAppDerivedData = ({
    news,
    externalCategories,
    advertisers
}: UseAppDerivedDataParams) => {

    const internalNews = useMemo(() => news.filter(n => n.source === 'site' || !n.source), [news]);

    const tickerNews = useMemo(() => {
        return internalNews.filter(n =>
            n.city === 'Lagoa Formosa' || n.city === 'Patos de Minas' ||
            n.region === 'Lagoa Formosa' || (!n.city && !n.region)
        ).slice(0, 15);
    }, [internalNews]);

    const marqueeNews = useMemo(() => {
        const allowedCategories = ['Política', 'Agro', 'Agronegócio', 'Tecnologia', 'Mundo', 'Cotidiano', 'Brasil'];
        return Object.entries(externalCategories)
            .filter(([cat]) => allowedCategories.includes(cat))
            .flatMap(([_, items]) => items)
            .sort(() => 0.5 - Math.random()).slice(0, 15);
    }, [externalCategories]);

    const activeAdvertisers = useMemo(() => advertisers.filter(a => a.isActive), [advertisers]);

    const contractBanners = useMemo(() => activeAdvertisers.flatMap(a => a.promoBanners || []).filter(b => b.active), [activeAdvertisers]);

    const contractPopupSet = useMemo(() => {
        const items = activeAdvertisers.flatMap(a => a.popupSet?.items || []).filter(i => i.active);
        return { items };
    }, [activeAdvertisers]);

    return {
        internalNews,
        tickerNews,
        marqueeNews,
        activeAdvertisers,
        contractBanners,
        contractPopupSet
    };
};
