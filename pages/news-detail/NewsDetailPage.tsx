
import React, { useMemo, useState, useRef } from 'react';
import { NewsItem, Advertiser, User, AdPricingConfig } from '../../types';
import CategoryMenu, { RegionFilterType } from '../../components/layout/CategoryMenu';
import { calculateReadTime, generateTOC } from './utils/article';
import { useReadingProgress } from './hooks/useReadingProgress';

// Componentes do Módulo
import ArticleHero from './components/article/ArticleHero';
import ArticleContent from './components/article/ArticleContent';
import AdvertisersFooter from './components/article/AdvertisersFooter';
import LeftAdsRail from './components/layout/LeftAdsRail';
import RightToolsRail from './components/layout/RightToolsRail';
import BackToTopButton from './components/tools/BackToTopButton';
import FontSizeControls from './components/tools/FontSizeControls';
import AuthorProfileModal from '../../components/common/AuthorProfileModal';
import PartnersStrip from '../../components/home/PartnersStrip';

interface NewsDetailProps {
    news: NewsItem;
    allNews?: NewsItem[];
    onNewsClick?: (news: NewsItem) => void;
    onBack: () => void;
    advertisers?: Advertiser[];
    onAdvertiserClick?: (ad: Advertiser) => void;
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
    selectedRegion: RegionFilterType;
    onSelectRegion: (region: RegionFilterType) => void;
    user?: User | null;
    onAdminClick?: () => void;
    onUpdateUser?: (u: User) => void;
    adConfig?: AdPricingConfig;

    // Novas funções para Staff
    onEditNews?: (item: NewsItem) => void;
    onDeactivateNews?: (item: NewsItem) => void;
    onPricingClick?: () => void; // Added Prop
}

const NewsDetailPage: React.FC<NewsDetailProps> = (props) => {
    const {
        news, allNews = [], onNewsClick, onBack,
        advertisers = [], onAdvertiserClick,
        selectedCategory, onSelectCategory,
        selectedRegion, onSelectRegion,
        user, onAdminClick, onUpdateUser,
        adConfig, onEditNews, onDeactivateNews,
        onPricingClick // Destructure
    } = props;

    const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('base');
    const [readingMode, setReadingMode] = useState(false);
    const [showAuthorProfile, setShowAuthorProfile] = useState(false);

    const articleRef = useRef<HTMLDivElement>(null);
    const progress = useReadingProgress(articleRef);

    const toc = useMemo(() => generateTOC(news), [news]);
    const readTime = useMemo(() => calculateReadTime(news), [news]);

    // Lógica de Permissão Staff - Desenvolvedor e Editor-Chefe têm acesso total
    const canManage = useMemo(() => {
        if (!user) { return false; }
        const isHighStaff = ['Desenvolvedor', 'Editor-Chefe'].includes(user.role);
        const isAuthor = user.id === news.authorId;
        const isEditorialStaff = ['Repórter', 'Jornalista'].includes(user.role);

        // High Staff pode editar TUDO. Editorial Staff só o que é seu.
        return isHighStaff || (isEditorialStaff && isAuthor);
    }, [user, news]);

    const handleAuthorProfile = (id: string) => {
        setShowAuthorProfile(true);
    };

    return (
        <div className={`bg-white dark:bg-zinc-950 min-h-screen font-sans transition-all duration-500 flex flex-col ${readingMode ? 'reading-focus' : ''}`}>

            {showAuthorProfile && (
                <AuthorProfileModal
                    authorId={news.authorId}
                    authorName={news.author}
                    currentUser={user || null}
                    allUsers={[]}
                    allNews={allNews}
                    onClose={() => setShowAuthorProfile(false)}
                    onNewsClick={onNewsClick || (() => { })}
                    onUpdateUser={onUpdateUser}
                />
            )}

            <ScrollProgress progress={progress} />

            <div className={`sticky top-0 z-[90] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-zinc-800 transition-all duration-500 ${readingMode ? '-translate-y-full' : ''}`}>
                <CategoryMenu
                    selectedCategory={selectedCategory}
                    onSelectCategory={onSelectCategory}
                    selectedRegion={selectedRegion}
                    onSelectRegion={onSelectRegion}
                    user={user}
                    onAdminClick={onAdminClick || (() => { })}
                />
            </div>

            {!readingMode && (
                <PartnersStrip
                    advertisers={advertisers}
                    onAdvertiserClick={onAdvertiserClick || (() => { })}
                />
            )}

            {/* STAFF CONTROL BAR - FLUTUANTE (Responsivo) */}
            {canManage && (
                <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-[95%] md:w-auto animate-fade-in-up">
                    <div className="bg-black/90 backdrop-blur-xl border-2 border-red-600 rounded-2xl md:rounded-full px-4 py-3 md:px-6 md:py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6 shadow-2xl">
                        <div className="flex items-center gap-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-white/20 pb-2 md:pb-0 md:pr-6 justify-center md:justify-start">
                            <div className="flex flex-col text-center md:text-left">
                                <span className="text-red-500 text-[8px] font-black uppercase tracking-widest italic">Staff Tools</span>
                                <span className="text-white text-[10px] font-bold uppercase truncate max-w-[100px]">{user?.name.split(' ')[0]} ({user?.role})</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                            <button
                                onClick={() => onEditNews?.(news)}
                                className="flex-1 md:flex-none bg-white text-black hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl md:rounded-full text-[9px] font-[1000] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
                            >
                                <i className="fas fa-pen-nib group-hover:animate-almost-fall"></i> Editar Direto
                            </button>

                            <button
                                onClick={() => onDeactivateNews?.(news)}
                                className="flex-1 md:flex-none bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-600/30 px-4 py-2 rounded-xl md:rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <i className="fas fa-ban"></i> Desativar
                            </button>
                        </div>

                        <button
                            onClick={onBack}
                            className="absolute -top-3 -right-3 md:static w-8 h-8 bg-white text-black md:bg-white/10 md:text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg md:shadow-none"
                            title="Voltar"
                        >
                            <i className="fas fa-chevron-left text-xs"></i>
                        </button>
                    </div>
                </div>
            )}

            <div ref={articleRef} className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 md:pt-10">
                    <aside className={`lg:col-span-2 hidden lg:block transition-all duration-500 ${readingMode ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="sticky top-28">
                            <LeftAdsRail
                                advertisers={advertisers}
                                onAdvertiserClick={onAdvertiserClick || (() => { })}
                                onPlanRequest={onPricingClick}
                            />
                        </div>
                    </aside>

                    <main className={`${readingMode ? 'lg:col-span-12 max-w-3xl mx-auto' : 'lg:col-span-7'} space-y-6`}>
                        <ArticleHero
                            news={news}
                            readTime={readTime}
                            onBack={onBack}
                            onAuthorClick={handleAuthorProfile}
                        />

                        {!readingMode && (
                            <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4 border-y border-gray-100 dark:border-zinc-900 bg-gray-50/30 dark:bg-zinc-900/10 px-4 rounded-2xl">
                                <div className="flex items-center gap-6 text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                                    <span className="flex items-center gap-2">
                                        <i className="fas fa-clock text-red-600"></i> {readTime} MIN LEITURA
                                    </span>
                                    <span className="hidden sm:inline opacity-20 text-lg">|</span>
                                    <span className="hidden sm:inline">REDAÇÃO LFNM</span>
                                </div>
                                <FontSizeControls current={fontSize} set={setFontSize} inline />
                            </div>
                        )}

                        <div className="py-4">
                            <ArticleContent news={news} forcedFontSize={fontSize} />
                            {!readingMode && allNews.length > 0 && (
                                <section className="mt-20 pt-16 border-t-4 border-red-600">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-zinc-100 mb-8">Continue por dentro</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {allNews.filter(n => n.category === news.category && n.id !== news.id && n.status !== 'archived').slice(0, 2).map(rn => (
                                            <div key={rn.id} onClick={() => onNewsClick?.(rn)} className="group cursor-pointer flex gap-4 items-center p-4 rounded-3xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all border border-transparent hover:border-gray-100 dark:hover:border-zinc-800">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 shadow-lg">
                                                    <img src={rn.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                                                </div>
                                                <h5 className="text-[12px] font-black leading-tight group-hover:text-red-600 dark:text-zinc-200 transition-colors line-clamp-2 uppercase italic tracking-tighter">{rn.title}</h5>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                            {!readingMode && (
                                <AdvertisersFooter
                                    advertisers={advertisers}
                                    onAdvertiserClick={onAdvertiserClick || (() => { })}
                                    onPlanRequest={onPricingClick}
                                />
                            )}
                        </div>
                    </main>

                    <aside className={`lg:col-span-3 transition-all duration-500 ${readingMode ? 'fixed top-1/2 right-4 -translate-y-1/2 z-[200]' : ''}`}>
                        <div className={`${!readingMode ? 'sticky top-28' : ''}`}>
                            <RightToolsRail
                                news={news} toc={toc} isMini={readingMode}
                                fontSize={fontSize} setFontSize={setFontSize}
                                readingMode={readingMode} setReadingMode={setReadingMode}
                                onAuthorClick={handleAuthorProfile} advertisers={advertisers}
                                onAdvertiserClick={onAdvertiserClick} adConfig={adConfig}
                            />
                        </div>
                    </aside>
                </div>
            </div>

            {!readingMode && (
                <div className="bg-gray-50 dark:bg-zinc-900 py-16 text-center border-t border-gray-100 dark:border-zinc-800 mt-16">
                    <button onClick={onBack} className="bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl active:scale-95 text-[10px]">
                        Voltar ao Portal
                    </button>
                </div>
            )}

            <BackToTopButton />
        </div>
    );
};

const ScrollProgress = ({ progress }: { progress: number }) => (
    <div className="fixed top-[50px] md:top-[60px] left-0 h-1.5 bg-transparent z-[100] w-full pointer-events-none">
        <div className="h-full bg-red-600 transition-all duration-150 ease-out shadow-[0_0_15px_rgba(220,38,38,0.8)] relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex items-center justify-center">
                <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-12 h-12 md:w-14 md:h-14 object-contain animate-coin drop-shadow-[0_2px_10px_rgba(220,38,38,0.6)]" alt="Progresso" />
            </div>
        </div>
    </div>
);

export default NewsDetailPage;
