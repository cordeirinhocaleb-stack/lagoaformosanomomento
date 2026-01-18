import React, { useMemo } from 'react';
import { NewsItem, Advertiser, AdPricingConfig } from '../../../../types';
import ShareBar from '../tools/ShareBar';
import ReadingModeToggle from '../tools/ReadingModeToggle';
import PrintButton from '../tools/PrintButton';
import SavePostButton from '../tools/SavePostButton';
import { useActiveHeading } from '../../hooks/useActiveHeading';

interface RightToolsRailProps {
    news: NewsItem;
    toc: { id: string; text: string }[];
    isMini?: boolean;
    fontSize: number;
    setFontSize: (val: number | ((prev: number) => number)) => void;
    readingMode: boolean;
    setReadingMode: (val: boolean) => void;
    onAuthorClick?: (id: string) => void;
    advertisers?: Advertiser[];
    onAdvertiserClick?: (ad: Advertiser) => void;
    adConfig?: AdPricingConfig;
}

const RightToolsRail: React.FC<RightToolsRailProps> = ({
    news, toc, isMini, readingMode, setReadingMode, onAuthorClick,
    advertisers = [], onAdvertiserClick, adConfig
}) => {
    const headingIds = toc.map(t => t.id);
    const activeId = useActiveHeading(headingIds);

    // Filtra Parceiros Master Ativos
    const masterPartners = useMemo(() => {
        if (!adConfig) { return []; }
        const now = new Date();
        return advertisers.filter(ad => {
            if (!ad.isActive) { return false; }
            if (new Date(ad.endDate) < now) { return false; }
            if (new Date(ad.startDate) > now) { return false; }

            const plan = adConfig.plans.find(p => p.id === ad.plan);
            return plan && plan.features.placements && plan.features.placements.includes('master_carousel');
        }).sort(() => Math.random() - 0.5);
    }, [advertisers, adConfig]);

    if (isMini) {
        return (
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-full p-2 shadow-2xl flex flex-col gap-4 animate-fadeInRight">
                <button onClick={() => setReadingMode(false)} className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <i className="fas fa-times"></i>
                </button>
                <SavePostButton newsId={news.id} mini />
            </div>
        );
    }

    return (
        <div className="space-y-6">







        </div>
    );
};

export default RightToolsRail;