
import React, { useRef, useState, useEffect } from 'react';
import { NewsItem } from '../../types';

interface NewsCardProps {
    news: NewsItem;
    featured?: boolean;
    onClick?: (news: NewsItem) => void;
    isZoomed?: boolean;
    onZoomChange?: (isZoomed: boolean) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, featured, onClick, isZoomed, onZoomChange }) => {
    const [speedLevel, setSpeedLevel] = useState(1);
    const scrollSpeedRef = useRef(0.5);

    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);

    // Estados
    const [isHovering, setIsHovering] = useState(false);
    const [internalMobileActive, setInternalMobileActive] = useState(false);

    // O estado 'active' unificado
    const isMobileActive = isZoomed !== undefined ? isZoomed : internalMobileActive;

    const setMobileActive = (active: boolean) => {
        if (onZoomChange) {
            onZoomChange(active);
        } else {
            setInternalMobileActive(active);
        }
    };

    const lastTapRef = useRef<number>(0);

    const executeNavigation = () => {
        if (onClick) {onClick(news);}
    };

    const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        // Lógica de Double Tap (2x Rápido = Abre a Notícia)
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Se estava expandido, recolhe visualmente antes de navegar para evitar glitches
            if (isMobileActive) {setMobileActive(false);}
            executeNavigation();
            lastTapRef.current = 0; // Reset
        } else {
            // Single Tap Logic
            lastTapRef.current = now;

            if (isMobileActive) {
                // Lógica: 1 vez novamente para fechar
                setMobileActive(false);
            } else {
                // Lógica: 1 vez Toque para Expandir
                setMobileActive(true);

                // Reset de scroll ao abrir
                if (contentRef.current) {
                    contentRef.current.scrollTop = 0;
                }

                // Scroll suave para garantir que o card expandido esteja visível e centralizado
                if (containerRef.current) {
                    setTimeout(() => {
                        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            }
        }
    };

    const handleDoubleClick = () => {
        executeNavigation();
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        // No desktop, o mouse leave desativa. No mobile não.
        if (window.matchMedia('(min-width: 1024px)').matches) {
            if (isMobileActive) {setMobileActive(false);}
        }
    };

    const isInternal = news.source === 'site' || !news.source;
    const displayContent = isInternal ? (news.content || news.lead) : news.lead;

    // Auto-Scroll Animation
    useEffect(() => {
        const isActive = isHovering || isMobileActive;

        const scrollContent = () => {
            if (contentRef.current && isActive) {
                const currentScroll = contentRef.current.scrollTop;
                const maxScroll = contentRef.current.scrollHeight - contentRef.current.clientHeight;

                if (Math.ceil(currentScroll) >= maxScroll - 1) {
                    cancelAnimationFrame(animationRef.current);
                    return;
                }

                contentRef.current.scrollTop += scrollSpeedRef.current;
                animationRef.current = requestAnimationFrame(scrollContent);
            }
        };

        if (isActive) {
            animationRef.current = requestAnimationFrame(scrollContent);
        } else {
            cancelAnimationFrame(animationRef.current);
        }

        return () => cancelAnimationFrame(animationRef.current);
    }, [isHovering, isMobileActive]);

    // Speed Control
    const updateSpeed = (percentage: number) => {
        let level = 1;
        if (percentage > 0.75) {level = 4;}
        else if (percentage > 0.50) {level = 3;}
        else if (percentage > 0.25) {level = 2;}

        setSpeedLevel(level);
        scrollSpeedRef.current = level * 0.5;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { top, height } = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - top;
        updateSpeed(Math.max(0, Math.min(1, y / height)));
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const { top, height } = e.currentTarget.getBoundingClientRect();
        const touchY = e.touches[0].clientY;
        const y = touchY - top;
        updateSpeed(Math.max(0, Math.min(1, y / height)));
    };

    const baseClasses = "relative overflow-hidden cursor-pointer transition-all duration-500 ease-out z-0";

    const activeClasses = isMobileActive
        ? "z-[20] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-red-600 ring-2 ring-red-100"
        : (isHovering ? "scale-[1.05] z-40 shadow-xl" : "hover:scale-[1.02]");

    const heightClasses = isMobileActive
        ? 'h-[500px] md:h-[600px]'
        : (featured ? 'h-[200px] md:h-[280px] lg:h-[320px] xl:h-[360px]' : 'h-full min-h-[200px]');

    const containerClasses = `${baseClasses} ${activeClasses}`;

    const TeleprompterJSX = (
        <div
            className={`absolute inset-0 z-30 flex items-center justify-center p-6 transition-opacity duration-300 bg-black/95 ${isActive => isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseEnter={() => setIsHovering(true)}
            style={{ opacity: (isHovering || isMobileActive) ? 1 : 0, pointerEvents: (isHovering || isMobileActive) ? 'auto' : 'none' }}
        >
            <div className="w-full max-w-3xl h-full relative flex gap-4">
                <div
                    ref={contentRef}
                    className="flex-1 h-full overflow-hidden relative mask-fade-vertical"
                >
                    <div className="pb-20 pt-10 text-center">
                        <div className="mb-4 flex justify-center">
                            <span className={`text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full tracking-[0.3em] border ${isInternal ? 'bg-red-600 border-red-600' : 'bg-blue-600 border-blue-600'}`}>
                                {isInternal ? 'Matéria Completa' : 'Resumo Externo'}
                            </span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
                            {news.title}
                        </h3>
                        <div className={`w-6 h-1 mx-auto mb-4 rounded-full ${isInternal ? 'bg-red-600' : 'bg-blue-600'}`}></div>
                        <div
                            className="text-sm md:text-lg font-serif text-gray-200 leading-relaxed max-w-2xl mx-auto drop-shadow-md text-justify [&_p]:mb-3 [&_h1]:text-white [&_h1]:font-bold [&_h2]:text-white [&_h2]:font-bold [&_h2]:mt-4 [&_img]:hidden [&_iframe]:hidden [&_video]:hidden"
                            dangerouslySetInnerHTML={{ __html: displayContent }}
                        />
                        {!isInternal && (
                            <div className="mt-6 p-4 border border-white/20 rounded-xl bg-white/5">
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">Fonte Externa</p>
                                <div className="text-white text-xs font-bold">Esta notícia é um resumo. Leia na íntegra no site oficial.</div>
                            </div>
                        )}
                        <div className="mt-12 text-white/30 text-[8px] font-mono uppercase tracking-[0.2em] animate-pulse">
                            • Fim da Transmissão •<br /><span className="text-[6px]">Toque 1x para fechar</span>
                        </div>
                    </div>
                </div>
                {/* Speedometer */}
                <div className="w-10 h-full rounded-full bg-zinc-900/50 backdrop-blur border border-white/10 flex flex-col items-center justify-between p-1.5 overflow-hidden shadow-2xl relative ml-2">
                    <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-emerald-500/10 via-yellow-500/10 to-red-600/20 pointer-events-none"></div>
                    {[1, 2, 3, 4].map((level) => {
                        let activeColorClass = "";
                        if (level === 1) {activeColorClass = "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]";}
                        else if (level === 2) {activeColorClass = "bg-yellow-500 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.8)]";}
                        else if (level === 3) {activeColorClass = "bg-orange-500 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.8)]";}
                        else {activeColorClass = "bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.8)]";}

                        return (
                            <div key={level} className={`flex-1 w-full rounded-full flex items-center justify-center transition-all duration-200 relative z-10 border ${speedLevel === level ? `${activeColorClass} text-white scale-110 font-black` : 'bg-transparent border-transparent text-zinc-600 font-bold hover:text-white hover:bg-white/10'}`}>
                                <span className="text-[9px] tracking-tighter">{level}x</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Helper to extract effects
    const getEffectsStyle = () => {
        // If hovering/active, let the CSS classes handle the "dimmed" state (grayscale)
        // We explicitly return undefined to allow Tailwind's 'grayscale' class to work if it relies on the style attribute being empty,
        // OR we can explicitly enforce grayscale here.
        // However, since 'style' overrides 'class', if we return a filter here, the 'grayscale' class might be ignored.
        if (isHovering || isMobileActive) {return {};}

        let effects = news.bannerEffects as any;

        if (Array.isArray(effects)) {
            effects = effects[0]; // Always use first image effect for card cover
        }

        // Fallback for video settings if needed
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

    return (
        <div
            ref={containerRef}
            onClick={handleContainerClick}
            onDoubleClick={handleDoubleClick}
            onMouseLeave={handleMouseLeave}
            className={`${containerClasses} ${heightClasses} rounded-xl shadow-sm border border-gray-100 ${featured ? 'bg-black' : 'bg-white'} group`}
        >
            <div className={`w-full ${featured ? 'h-full absolute inset-0' : 'h-32 md:h-40 lg:h-48'} overflow-hidden relative shrink-0`}>
                <img
                    src={news.imageUrl}
                    alt={news.title}
                    style={getEffectsStyle()}
                    loading="lazy"
                    className={`w-full h-full object-cover object-center transition-all duration-700 ${(isHovering || isMobileActive) ? 'scale-110 opacity-20 grayscale' : ''}`}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://placehold.co/800x600/000000/FFFFFF?text=LFNM"; }}
                />
                {!featured && (
                    <div className={`absolute top-2 left-0 transition-opacity ${(isHovering || isMobileActive) ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="bg-red-600 text-white px-2 py-0.5 text-[7px] font-black uppercase tracking-widest shadow-md rounded-r-md">{news.category}</div>
                    </div>
                )}
                {featured && (
                    <div className={`absolute top-4 left-4 z-20 flex items-center gap-2 transition-opacity duration-300 ${(isHovering || isMobileActive) ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                        <span className="text-white text-[8px] font-black uppercase tracking-[0.2em] drop-shadow-md">{news.isBreaking ? 'AOVIVO' : 'LFNM'}</span>
                    </div>
                )}
            </div>

            {featured ? (
                <div className={`absolute inset-0 z-20 transition-all duration-500 ${(isHovering || isMobileActive) ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 text-white">
                        <div className="flex flex-col items-start gap-2 mb-2">
                            <div className="bg-red-600 text-white text-[8px] font-black px-3 py-0.5 uppercase tracking-widest skew-x-[-15deg] shadow-lg border-l-2 border-white inline-block">
                                <span className="skew-x-[15deg] block">{news.category}</span>
                            </div>
                        </div>
                        <h3 className="text-lg md:text-xl font-[1000] leading-[0.95] uppercase italic mb-2 line-clamp-3 drop-shadow-md tracking-tighter">
                            {news.title}
                        </h3>
                        <div className="flex justify-between items-end border-t border-white/20 pt-2 opacity-80">
                            <span className="text-[7px] font-black uppercase tracking-widest">{news.author}</span>
                            <span className="text-[7px] font-bold uppercase">{new Date(news.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`p-4 flex flex-col justify-between flex-grow relative overflow-hidden bg-white h-full transition-opacity duration-500 ${(isHovering || isMobileActive) ? 'opacity-0' : 'opacity-100'}`}>
                    <div>
                        <h3 className="text-base md:text-lg font-black text-gray-900 leading-tight mb-2 line-clamp-3 uppercase italic tracking-tight">{news.title}</h3>
                        <p className="text-[9px] text-gray-500 line-clamp-3 mb-3 leading-relaxed font-bold border-l-2 border-gray-200 pl-2">{news.lead}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-2 mt-auto">
                        <span className="text-[7px] font-black text-gray-400 uppercase italic tracking-tighter">{news.author}</span>
                        <span className="text-[7px] font-bold text-gray-300 uppercase">{new Date(news.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            {TeleprompterJSX}
            <style>{`
        .mask-fade-vertical {
            mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
      `}</style>
        </div>
    );
};

export default NewsCard;
