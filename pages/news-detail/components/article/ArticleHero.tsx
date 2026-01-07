import React, { useState, useMemo, useEffect } from 'react';
import { NewsItem } from '../../../../types';

interface ArticleHeroProps {
    news: NewsItem;
    readTime: number;
    onBack: () => void;
    onAuthorClick?: (authorId: string) => void;
}

const YouTubeFacade: React.FC<{ url: string; videoStart?: number; videoEnd?: number }> = ({ url, videoStart, videoEnd }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const getVideoId = (link: string) => {
        const match = link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    };
    const videoId = getVideoId(url);
    if (!videoId) {return null;}
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    if (isPlaying) {
        let params = `?autoplay=1&mute=0&rel=0&iv_load_policy=3&modestbranding=1`;
        if (videoStart && videoStart > 0) {params += `&start=${videoStart}`;}
        if (videoEnd && videoEnd > 0) {params += `&end=${videoEnd}`;}
        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}${params}`}
                className="w-full h-full absolute inset-0"
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                frameBorder="0" loading="lazy" allowFullScreen
            />
        );
    }

    return (
        <div
            className="w-full h-full absolute inset-0 bg-cover bg-center cursor-pointer group flex items-center justify-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
            onClick={() => setIsPlaying(true)}
        >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] scale-100 group-hover:scale-110 transition-transform z-10 relative border-4 border-white/20">
                <i className="fas fa-play ml-1 text-2xl md:text-3xl"></i>
            </div>
        </div>
    );
};

const ArticleHero: React.FC<ArticleHeroProps> = ({ news, readTime, onBack, onAuthorClick }) => {
    const [activeIdx, setActiveIdx] = useState(0);
    const bannerList = useMemo(() => {
        if (news.bannerMediaType === 'video') {return [];}

        let images = news.bannerImages && news.bannerImages.length > 0 ? news.bannerImages : [news.imageUrl];

        // Filter out empty strings and local_ paths (which are invalid for public view)
        images = images.filter(url => url && !url.startsWith('local_'));

        // Fallback to default Unsplash image if empty
        if (images.length === 0) {
            return ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'];
        }

        return images;
    }, [news.bannerImages, news.imageUrl, news.bannerMediaType]);

    useEffect(() => {
        // Trigger slideshow if:
        // 1. Not video
        // 2. More than 1 image
        // 3. Layout allows movement (Carousel, Fade, or Legacy Single)
        // 4. Transition not 'none'
        const isSlideshowLayout =
            news.bannerImageLayout === 'carousel' ||
            news.bannerImageLayout === 'fade' ||
            news.bannerLayout === 'single' ||
            !news.bannerLayout;

        if (news.bannerMediaType !== 'video' && bannerList.length > 1 && isSlideshowLayout && news.bannerTransition !== 'none') {
            const timer = setInterval(() => setActiveIdx(p => (p + 1) % bannerList.length), news.bannerDuration || 4000);
            return () => clearInterval(timer);
        }
    }, [bannerList, news.bannerMediaType, news.bannerDuration, news.bannerLayout, news.bannerImageLayout, news.bannerTransition]);

    // Helper to get effect styles
    const getEffectsStyle = (index: number = 0) => {
        // First try bannerEffects (for images)
        let effects = news.bannerEffects as any;

        // Handle array (New System) vs Object (Legacy)
        if (Array.isArray(effects)) {
            effects = effects[index];
        }

        // Fallback to video settings if no image effects found (or if video mode)
        if (!effects && news.bannerVideoSettings?.effects) {
            effects = news.bannerVideoSettings.effects;
        }

        if (!effects) {return {};}

        return {
            filter: `
                brightness(${effects.brightness || 1}) 
                contrast(${effects.contrast || 1}) 
                saturate(${effects.saturation || 1}) 
                blur(${effects.blur || 0}px) 
                sepia(${effects.sepia || 0}) 
                opacity(${effects.opacity !== undefined ? effects.opacity : 1})
            `.replace(/\s+/g, ' ').trim()
        };
    };

    const dateFull = new Date(news.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeFull = new Date(news.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const renderMedia = () => {
        if (news.bannerMediaType === 'video' && news.bannerVideoUrl) {
            return <div className="absolute inset-0 bg-black"><YouTubeFacade url={news.bannerVideoUrl} videoStart={news.videoStart} videoEnd={news.videoEnd} /></div>;
        }

        const layout = news.bannerImageLayout || news.bannerLayout || 'carousel';

        // CAROUSEL / FADE
        if (layout === 'carousel' || layout === 'fade') {
            return bannerList.map((url, i) => (
                <img key={i} src={url} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === activeIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} style={getEffectsStyle(i)} alt="" />
            ));
        }

        // SPLIT (2 Images)
        if (layout === 'split') {
            return (
                <div className="absolute inset-0 grid grid-cols-2 h-full gap-0.5 bg-zinc-900">
                    {bannerList.slice(0, 2).map((url, i) => (
                        <div key={i} className="relative h-full overflow-hidden group/split">
                            <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover/split:scale-110" style={getEffectsStyle(i)} alt="" />
                        </div>
                    ))}
                    {bannerList.length < 2 && <div className="bg-zinc-900"></div>}
                </div>
            );
        }

        // GRID (4 Images)
        if (layout === 'grid') {
            return (
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 h-full gap-0.5 bg-zinc-900">
                    {bannerList.slice(0, 4).map((url, i) => (
                        <div key={i} className="relative w-full h-full overflow-hidden group/grid">
                            <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover/grid:scale-110" style={getEffectsStyle(i)} alt="" />
                        </div>
                    ))}
                </div>
            );
        }

        // MOSAIC (3 Images - 1 Big, 2 Small)
        if (layout === 'mosaic') {
            return (
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-2 h-full gap-0.5 bg-zinc-900">
                    <div className="col-span-8 row-span-2 relative overflow-hidden group/mos">
                        <img src={bannerList[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover/mos:scale-105" style={getEffectsStyle(0)} alt="" />
                    </div>
                    <div className="col-span-4 row-span-1 relative overflow-hidden group/mos">
                        {bannerList[1] && <img src={bannerList[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover/mos:scale-110" style={getEffectsStyle(1)} alt="" />}
                    </div>
                    <div className="col-span-4 row-span-1 relative overflow-hidden group/mos">
                        {bannerList[2] && <img src={bannerList[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover/mos:scale-110" style={getEffectsStyle(2)} alt="" />}
                    </div>
                </div>
            );
        }

        // Default Fallback
        return <img src={bannerList[0]} className="absolute inset-0 w-full h-full object-cover" style={getEffectsStyle(0)} alt="" />;
    };

    return (
        <div className="relative w-full h-[40vh] md:h-[55vh] bg-black overflow-hidden group rounded-b-[2rem] shadow-xl">
            {renderMedia()}

            {/* Softer Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent pointer-events-none z-20"></div>

            <div className="absolute bottom-0 left-0 w-full z-30 p-6 md:p-10">
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center gap-2 mb-4 animate-slideUp">
                        <div className="bg-red-600 text-white px-3 py-1 skew-x-[-12deg] shadow-lg">
                            <span className="block skew-x-[12deg] text-[9px] md:text-[11px] font-[1000] uppercase tracking-widest">{news.category}</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-md text-[8px] font-black uppercase flex items-center gap-1.5">
                            <i className="fas fa-location-dot text-red-500"></i> {news.city || 'Lagoa Formosa'}
                        </div>
                    </div>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-[1000] text-white uppercase italic tracking-tighter leading-[0.95] mb-6 drop-shadow-2xl animate-fadeInUp">
                        {news.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-[9px] md:text-[11px] font-bold uppercase tracking-wider animate-fadeInUp delay-200">
                        <button
                            onClick={() => onAuthorClick?.(news.authorId)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white hover:text-black transition-all p-1 pr-3 rounded-full backdrop-blur-md border border-white/10 group/author"
                        >
                            <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-black border border-red-600 text-[10px] group-hover/author:scale-110 transition-transform">
                                {news.author.charAt(0)}
                            </div>
                            <span className="font-black italic">Por {news.author}</span>
                        </button>

                        <div className="hidden md:block h-5 w-px bg-white/20"></div>

                        <div className="flex items-center gap-3">
                            <span>{dateFull}</span>
                            <span className="opacity-40">|</span>
                            <span>{timeFull}</span>
                        </div>

                        <div className="hidden md:block h-5 w-px bg-white/20"></div>

                        <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1.5 rounded-full border border-white/10">
                            <i className="fas fa-book-open text-blue-400"></i>
                            <span>{readTime} MIN</span>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={onBack} className="absolute top-6 left-6 z-50 w-10 h-10 bg-black/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all shadow-xl active:scale-90 group">
                <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            </button>
        </div>
    );
};

export default ArticleHero;