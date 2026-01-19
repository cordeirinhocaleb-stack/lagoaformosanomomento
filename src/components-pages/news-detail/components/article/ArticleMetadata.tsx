import React from 'react';
import { NewsItem } from '@/types';
import FontSizeControls from '../tools/FontSizeControls';
import PrintButton from '../tools/PrintButton';
import ShareBar from '../tools/ShareBar';
import SavePostButton from '../tools/SavePostButton';
import ReadingModeToggle from '../tools/ReadingModeToggle';

interface ArticleMetadataProps {
    news: NewsItem;
    readTime: number;
    fontSize: number;
    setFontSize: (size: number | ((prev: number) => number)) => void;
    readingMode: boolean;
    setReadingMode: (mode: boolean) => void;
}

const ArticleMetadata: React.FC<ArticleMetadataProps> = ({
    news,
    readTime,
    fontSize,
    setFontSize,
    readingMode,
    setReadingMode
}) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4 border-y border-gray-100 dark:border-zinc-900 bg-gray-50/30 dark:bg-zinc-900/10 px-6 rounded-[2rem]">
                <div className="flex items-center gap-6 text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                    <span className="flex items-center gap-2">
                        <i className="fas fa-clock text-red-600"></i> {readTime} MIN LEITURA
                    </span>
                    <span className="hidden sm:inline opacity-20 text-lg">|</span>
                    <span className="hidden sm:inline">REDAÇÃO LFNM</span>
                </div>
                <div className="flex items-center gap-4">
                    <FontSizeControls current={fontSize} set={setFontSize} inline />
                    <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-zinc-800"></div>
                    <PrintButton />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest mr-2">Compartilhar:</span>
                    <ShareBar title={news.title} url={typeof window !== 'undefined' ? window.location.href : ''} />
                </div>
                <div className="flex items-center gap-3 ml-auto">
                    <SavePostButton newsId={news.id} />
                    <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 mx-2"></div>
                    <ReadingModeToggle active={readingMode} toggle={() => setReadingMode(!readingMode)} />
                </div>
            </div>
        </div>
    );
};

export default ArticleMetadata;
