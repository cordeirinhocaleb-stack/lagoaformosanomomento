
import React, { useMemo, useState, useRef } from 'react';
import { NewsItem, Advertiser, User, AdPricingConfig, SystemSettings } from '../../types';
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
import { AdvertiserCard } from '../../components/common/AdvertiserCard';
import PartnersStrip from '../../components/home/PartnersStrip';
import CommentsSection from './components/article/CommentsSection';
import ShareBar from './components/tools/ShareBar';
import ReadingModeToggle from './components/tools/ReadingModeToggle';
import PrintButton from './components/tools/PrintButton';
import SavePostButton from './components/tools/SavePostButton';
import Footer from '../../components/layout/Footer';

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
    onPricingClick?: () => void;
    onLogin?: () => void; // Prop para abrir modal de login
    settings?: SystemSettings;
}

const NewsDetailPage: React.FC<NewsDetailProps> = (props) => {
    const {
        news, allNews = [], onNewsClick, onBack,
        advertisers = [], onAdvertiserClick,
        selectedCategory, onSelectCategory,
        selectedRegion, onSelectRegion,
        user, onAdminClick, onUpdateUser,
        adConfig, onEditNews, onDeactivateNews,
        onPricingClick, onLogin, settings
    } = props;

    const [fontSize, setFontSize] = useState<number>(0);
    const [readingMode, setReadingMode] = useState(false);
    const [showAuthorProfile, setShowAuthorProfile] = useState(false);

    // Lógica de Recomendações: Prioriza Lagoa Formosa/Região SEMPRE, mas focado nas MAIS RECENTES
    const recommendedNews = useMemo(() => {
        if (!allNews.length) return [];

        const priorityRegions = ['Lagoa Formosa', 'Lagoa Formosa e Região'];

        return [...allNews]
            .filter(n => n.id !== news.id && n.status !== 'archived')
            .sort((a, b) => {
                // 1. Prioridade Global: Lagoa Formosa e Patos
                const aIsPriority = priorityRegions.includes(a.region);
                const bIsPriority = priorityRegions.includes(b.region);

                // Se um for prioridade regional e o outro não, o regional ganha
                if (aIsPriority !== bIsPriority) {
                    return aIsPriority ? -1 : 1;
                }

                // 2. RECÊNCIA (Mais recentes primeiro) - Fator decisivo em qualquer caso
                const parseDate = (item: any) => {
                    const d = item.createdAt || item.created_at || item.updatedAt || 0;
                    return new Date(d).getTime();
                };

                const timeA = parseDate(a);
                const timeB = parseDate(b);

                if (timeA !== timeB) {
                    return timeB - timeA; // Decrescente (Novo -> Antigo)
                }

                // 3. Caso a data seja idêntica, Prioridade por Categoria
                const aSameCat = a.category === news.category;
                const bSameCat = b.category === news.category;
                if (aSameCat !== bSameCat) {
                    return aSameCat ? -1 : 1;
                }

                return 0;
            })
            .slice(0, 4);
    }, [allNews, news.id, news.category]);

    // Filtragem de Anúncios por Localização + Randomização
    const sidebarAds = useMemo(() => {
        return advertisers
            .filter(ad => !ad.displayLocations || ad.displayLocations.includes('article_sidebar'))
            .sort(() => Math.random() - 0.5);
    }, [advertisers]);

    const footerAds = useMemo(() => {
        return advertisers
            .filter(ad => ad.isActive && ad.plan !== 'Master') // Evita duplicação se já for master no topo do footer
            .filter(ad => !ad.displayLocations || ad.displayLocations.includes('article_footer'))
            .sort(() => Math.random() - 0.5);
    }, [advertisers]);

    const masterSupporters = useMemo(() => {
        return advertisers
            .filter(ad => ad.isActive && ad.plan === 'Master')
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
    }, [advertisers]);
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

            <ArticleHero
                news={news}
                readTime={readTime}
                onBack={onBack}
                onAuthorClick={handleAuthorProfile}
            />

            <div ref={articleRef} className="w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-4 flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-6 md:pt-10">
                    <aside className={`lg:col-span-3 transition-all duration-500 ${readingMode ? 'opacity-0' : 'opacity-100'} mb-8 lg:mb-0`}>
                        <div className="sticky top-28">
                            <LeftAdsRail
                                advertisers={sidebarAds}
                                onAdvertiserClick={onAdvertiserClick || (() => { })}
                                onPlanRequest={onPricingClick}
                                adConfig={adConfig}
                            />
                        </div>
                    </aside>

                    <main className={`${readingMode ? 'lg:col-span-12 max-w-3xl mx-auto' : 'lg:col-span-8'} space-y-6`}>

                        {!readingMode && (
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
                                        <ShareBar title={news.title} url={window.location.href} />
                                    </div>
                                    <div className="flex items-center gap-3 ml-auto">
                                        <SavePostButton newsId={news.id} />
                                        <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 mx-2"></div>
                                        <ReadingModeToggle active={readingMode} toggle={() => setReadingMode(!readingMode)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="py-4">
                            <ArticleContent news={news} fontSizeLevel={fontSize} />

                        </div>
                    </main>

                    <aside className={`lg:col-span-1 transition-all duration-500 ${readingMode ? 'fixed top-1/2 right-4 -translate-y-1/2 z-[200]' : ''}`}>
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

            {/* Expansão Full-Width Pós-Artigo */}
            {!readingMode && (
                <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 space-y-16 pb-20">
                    <div className="max-w-4xl mx-auto w-full">
                        {/* Sobre o Autor - Mantido um pouco mais contido para leitura */}
                        <button
                            onClick={() => handleAuthorProfile(news.authorId)}
                            className="w-full text-left bg-zinc-900 dark:bg-zinc-800 text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden group hover:ring-2 hover:ring-red-600 transition-all active:scale-[0.98]"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black shrink-0 border border-white/10 group-hover:border-white/40 transition-colors">
                                    {news.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Sobre o Autor</p>
                                    <h4 className="text-xl font-black uppercase group-hover:text-red-500 transition-colors leading-none my-1">{news.author}</h4>
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-2 flex items-center gap-2">
                                        Ver perfil completo do redator <i className="fas fa-arrow-right animate-bounce-x"></i>
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Recomendações - Tela Cheia (Grid 4 colunas em telas grandes) */}
                    {recommendedNews.length > 0 && (
                        <section className="pt-16 border-t-2 border-gray-100 dark:border-zinc-800">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-3">
                                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Continue por dentro
                                    </h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        As principais notícias de Lagoa Formosa e região para você
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {recommendedNews.map(rn => (
                                    <div key={rn.id} onClick={() => onNewsClick?.(rn)} className="group cursor-pointer space-y-4">
                                        <div className="aspect-[16/10] rounded-[2rem] overflow-hidden bg-gray-100 shadow-md relative">
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-black/60 backdrop-blur-md text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                                                    {rn.region === news.region ? 'Na sua região' : rn.category}
                                                </span>
                                            </div>
                                            <img src={rn.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                        </div>
                                        <h5 className="text-[13px] font-black leading-tight group-hover:text-red-600 dark:text-zinc-200 transition-colors line-clamp-3 uppercase italic tracking-tighter">{rn.title}</h5>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Comentários - Tela Cheia */}
                    <div className="pt-16 border-t-2 border-gray-100 dark:border-zinc-800">
                        {/* Parceiros Master Lado a Lado (Random) */}
                        {masterSupporters.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Parceiros Master</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {masterSupporters.map(ad => (
                                        <AdvertiserCard
                                            key={ad.id}
                                            ad={ad}
                                            onClick={onAdvertiserClick || (() => { })}
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 shadow-sm"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <CommentsSection newsId={news.id} user={user} onLogin={onLogin} />
                    </div>

                    {/* Banner Principal - Apoiadores */}
                    <div className="pt-16 border-t-2 border-gray-100 dark:border-zinc-800">
                        <PartnersStrip
                            advertisers={advertisers}
                            onAdvertiserClick={onAdvertiserClick || (() => { })}
                        />
                    </div>

                    {/* Apoiadores - Tela Cheia */}
                    <div className="pt-16 border-t-2 border-gray-100 dark:border-zinc-800">
                        <AdvertisersFooter
                            advertisers={footerAds}
                            onAdvertiserClick={onAdvertiserClick || (() => { })}
                            onPlanRequest={onPricingClick}
                            fullWidth
                        />
                    </div>
                </div>
            )}

            {!readingMode && (
                <div className="bg-gray-50 dark:bg-zinc-900 py-16 text-center border-t border-gray-100 dark:border-zinc-800 mt-16">
                    <button onClick={onBack} className="bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-2xl active:scale-95 text-[10px]">
                        Voltar ao Portal
                    </button>
                </div>
            )}

            {!readingMode && (
                <Footer settings={settings} />
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
