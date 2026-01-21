import React from 'react';
import { NewsItem, Advertiser, AdPricingConfig, TocItem } from '@/types';
import RightToolsRail from './RightToolsRail';

interface ArticleSidebarProps {
    readingMode: boolean;
    news: NewsItem;
    toc: TocItem[];
    fontSize: number;
    setFontSize: (size: number | ((prev: number) => number)) => void;
    setReadingMode: (mode: boolean) => void;
    handleAuthorProfile: (id: string) => void;
    advertisers: Advertiser[];
    onAdvertiserClick?: (ad: Advertiser) => void;
    adConfig?: AdPricingConfig;
}

const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
    readingMode,
    news,
    toc,
    fontSize,
    setFontSize,
    setReadingMode,
    handleAuthorProfile,
    advertisers,
    onAdvertiserClick,
    adConfig
}) => {
    return (
        <aside className={`lg:col-span-1 transition-all duration-500 ${readingMode ? 'fixed top-1/2 right-4 -translate-y-1/2 z-[200]' : ''}`}>
            <div className={`${!readingMode ? 'sticky top-28' : ''}`}>
                <RightToolsRail
                    news={news}
                    toc={toc}
                    isMini={readingMode}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    readingMode={readingMode}
                    setReadingMode={setReadingMode}
                    onAuthorClick={handleAuthorProfile}
                    advertisers={advertisers}
                    onAdvertiserClick={onAdvertiserClick}
                    adConfig={adConfig}
                />
            </div>
        </aside>
    );
};

export default ArticleSidebar;
