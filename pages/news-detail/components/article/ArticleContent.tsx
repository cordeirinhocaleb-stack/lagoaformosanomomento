import React, { useRef, useEffect, useState } from 'react';
import { NewsItem, ContentBlock } from '../../../../types';
import GalleryRenderer from '../../../../components/news/GalleryRenderer';
import EngagementBlock from '../../../../components/blocks/EngagementBlock';

interface ArticleContentProps {
    news: NewsItem;
    forcedFontSize?: 'base' | 'lg' | 'xl';
}

const ArticleContent: React.FC<ArticleContentProps> = ({ news, forcedFontSize = 'lg' }) => {
    const fontSizeClass = {
        base: 'text-[16px] md:text-[17px] leading-relaxed',
        lg: 'text-[18px] md:text-[20px] leading-relaxed',
        xl: 'text-[24px] md:text-[28px] leading-snug font-medium'
    }[forcedFontSize];

    // wrapperRef: Controla o espaço físico ocupado na página (empurra footer/scroll)
    const wrapperRef = useRef<HTMLDivElement>(null);
    // contentRef: Aplica a escala visual
    const contentRef = useRef<HTMLDivElement>(null);

    // Estado interno para controle de gestos sem re-render
    const state = useRef({
        scale: 1,
        initialDist: 0,
        initialScale: 1,
        originalHeight: 0,
        isZooming: false
    });

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const content = contentRef.current;
        if (!wrapper || !content) { return; }

        const getDistance = (touches: TouchList) => {
            return Math.hypot(
                touches[0].clientX - touches[1].clientX,
                touches[0].clientY - touches[1].clientY
            );
        };

        const updateLayout = () => {
            const s = state.current.scale;

            // Aplica transformação visual
            content.style.transform = `scale(${s})`;

            // Ajusta o container físico para forçar o scroll nativo e empurrar conteúdo
            if (s > 1) {
                wrapper.style.width = `${s * 100}%`; // Expande para direita (scroll horizontal)
                wrapper.style.height = `${state.current.originalHeight * s}px`; // Empurra conteúdo para baixo
                wrapper.style.overflow = 'visible'; // Permite que o conteúdo expandido seja visto
            } else {
                // Reset limpo
                wrapper.style.width = '100%';
                wrapper.style.height = 'auto';
            }
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                state.current.isZooming = true;
                state.current.initialDist = getDistance(e.touches);
                state.current.initialScale = state.current.scale;

                // Captura altura original apenas se estivermos começando do estado normal
                if (state.current.scale === 1) {
                    state.current.originalHeight = content.offsetHeight;
                }
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (state.current.isZooming && e.touches.length === 2) {
                // Previne zoom da página inteira, queremos apenas o elemento
                if (e.cancelable) { e.preventDefault(); }

                const dist = getDistance(e.touches);
                const delta = dist / state.current.initialDist;

                // Limites de zoom: min 1x, max 4x
                let newScale = state.current.initialScale * delta;
                newScale = Math.min(Math.max(1, newScale), 4);

                state.current.scale = newScale;

                requestAnimationFrame(updateLayout);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            // Se soltou e restou menos de 2 dedos, finaliza gesto
            if (e.touches.length < 2) {
                state.current.isZooming = false;

                // Se a escala ficou muito pequena (efeito elástico), reseta
                if (state.current.scale < 1.1) {
                    state.current.scale = 1;

                    // Animação suave de retorno
                    content.style.transition = 'transform 0.3s ease-out';
                    wrapper.style.transition = 'width 0.3s ease-out, height 0.3s ease-out';

                    updateLayout();

                    // Remove transição após terminar
                    setTimeout(() => {
                        content.style.transition = '';
                        wrapper.style.transition = '';
                    }, 300);
                }
            }
        };

        // Listeners com { passive: false } para permitir preventDefault no zoom
        wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
        wrapper.addEventListener('touchmove', onTouchMove, { passive: false });
        wrapper.addEventListener('touchend', onTouchEnd);

        return () => {
            wrapper.removeEventListener('touchstart', onTouchStart);
            wrapper.removeEventListener('touchmove', onTouchMove);
            wrapper.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    const renderBlock = (block: ContentBlock, index: number) => {
        const headingId = block.type === 'heading' ? `heading-block-${index}` : undefined;

        return (
            <div key={block.id} id={headingId} className="w-full scroll-mt-32">
                {(() => {
                    switch (block.type) {
                        case 'heading':
                            return <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-zinc-100 mt-12 mb-6 border-l-[6px] border-red-600 pl-5 py-1 leading-tight">{block.content}</h2>;
                        case 'paragraph':
                            return <div className={`${fontSizeClass} text-zinc-800 dark:text-zinc-300 mb-8 ${block.settings?.style === 'serif' ? 'font-serif' : 'font-sans'}`} dangerouslySetInnerHTML={{ __html: block.content }} />;
                        case 'image':
                            return (
                                <figure className="my-10 space-y-4">
                                    <img src={block.content} loading="lazy" className="w-full h-auto object-cover rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800" alt="" />
                                    {block.settings?.caption && <figcaption className="text-center text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{block.settings.caption}</figcaption>}
                                </figure>
                            );
                        case 'quote':
                            return (
                                <blockquote className="border-l-[10px] border-red-600 bg-gray-50 dark:bg-zinc-900/40 p-8 md:p-12 rounded-r-2xl my-10 relative overflow-hidden group">
                                    <i className="fas fa-quote-right text-gray-200 dark:text-zinc-800 text-7xl absolute -bottom-8 right-4 pointer-events-none opacity-50"></i>
                                    <p className="text-xl md:text-2xl font-black italic text-zinc-900 dark:text-zinc-100 relative z-10 font-serif leading-tight">"{block.content}"</p>
                                </blockquote>
                            );
                        case 'video':
                            // Check if it's a YouTube video (via source flag OR content detection)
                            const isYouTube = block.videoSource === 'youtube' ||
                                block.youtubeMeta ||
                                (typeof block.content === 'string' && (block.content.includes('youtube.com') || block.content.includes('youtu.be')));

                            // Pending State Handling
                            if (typeof block.content === 'string' && block.content.includes('pending_')) {
                                return (
                                    <div key={block.id} className="my-10 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-8 text-center aspect-video flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Processando Vídeo</h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Este conteúdo estará disponível em breve.</p>
                                    </div>
                                );
                            }

                            // Helper to determine container classes based on style
                            const isShorts = block.settings?.style === 'shorts';
                            const videoContainerClass = isShorts
                                ? "aspect-[9/16] w-[320px] mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black border border-gray-100 dark:border-zinc-800"
                                : "aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-gray-100 dark:border-zinc-800";

                            if (isYouTube) {
                                // Robust ID helper
                                const getYouTubeId = (url: string | undefined) => {
                                    if (!url) return null;
                                    // 1. If it's already an ID (11 chars or more)
                                    // We allow 'pending_' prefix here to ensure it doesn't try to extract from a pending string
                                    if (/^[a-zA-Z0-9_-]{11,}$/.test(url) && !url.includes('pending_')) return url;
                                    // 2. Extract from various URL formats
                                    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11,})/);
                                    return match ? match[1] : null;
                                };

                                const youtubeId = getYouTubeId(block.content);

                                // Fallback: If ID extraction fails but we have content, it might be a glitched upload (Cloudinary).
                                // Render as standard video to ensure visibility.
                                if (!youtubeId && block.content && (block.content.startsWith('http') || block.content.startsWith('//'))) {
                                    // Let it fall through to the standard video renderer below
                                } else if (!youtubeId) {
                                    return null;
                                } else {
                                    return (
                                        <div className="my-10">
                                            {block.settings?.videoTitle && (
                                                <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 mb-4">{block.settings.videoTitle}</h4>
                                            )}
                                            <div className={videoContainerClass}>
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                            </div>
                                            {block.settings?.caption && (
                                                <p className="text-center font-serif italic mt-4 text-zinc-500 dark:text-zinc-400 text-sm border-l-2 border-red-500 pl-4">{block.settings.caption}</p>
                                            )}
                                        </div>
                                    );
                                }
                            }

                            // Cloudinary or direct video URL
                            if (block.content) {
                                const effects = block.settings?.effects || {};
                                const filterString = `brightness(${effects.brightness || 100}%) contrast(${effects.contrast || 100}%) saturate(${effects.saturation || 100}%) blur(${effects.blur || 0}px) sepia(${effects.sepia || 0}%) opacity(${effects.opacity || 100}%)`;

                                return (
                                    <div className="my-10">
                                        {block.settings?.videoTitle && (
                                            <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 mb-4">{block.settings.videoTitle}</h4>
                                        )}
                                        <div className={videoContainerClass}>
                                            <video
                                                src={block.content}
                                                className="w-full h-full object-cover"
                                                controls
                                                muted={block.settings?.muted ?? false}
                                                loop={block.settings?.loop ?? false}
                                                autoPlay={block.settings?.autoplay ?? false}
                                                playsInline
                                                style={{ filter: filterString }}
                                            />
                                        </div>
                                        {block.settings?.caption && (
                                            <p className="text-center font-serif italic mt-4 text-zinc-500 dark:text-zinc-400 text-sm border-l-2 border-red-500 pl-4">{block.settings.caption}</p>
                                        )}
                                    </div>
                                );
                            }

                            return null;
                        case 'video_link':
                            if (!block.content) return null;
                            const getEmbedUrl = (url: string) => {
                                const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                                if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                                const dailymotionMatch = url.match(/dailymotion\.com\/video\/([^_]+)/);
                                if (dailymotionMatch) return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`;
                                return null;
                            };
                            const publicEmbedUrl = getEmbedUrl(block.content);
                            if (!publicEmbedUrl) return null;
                            return (
                                <div className="my-10">
                                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-gray-100 dark:border-zinc-800">
                                        <iframe
                                            src={publicEmbedUrl}
                                            className="w-full h-full"
                                            allowFullScreen
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    </div>
                                </div>
                            );
                        case 'gallery':
                            return <GalleryRenderer block={block} />;
                        case 'engagement':
                            return <EngagementBlock block={block} newsId={news.id} />;
                        case 'smart_block':
                            return <div className="my-8" dangerouslySetInnerHTML={{ __html: block.content }} />;
                        default:
                            return null;
                    }
                })()}
            </div>
        );
    };

    return (
        // Wrapper externo: Gerencia o espaço físico (Height/Width) e Scroll
        <div ref={wrapperRef} className="w-full transition-all ease-linear origin-top-left">
            {/* Wrapper interno: Aplica a escala visual */}
            <div
                ref={contentRef}
                className="prose-editorial max-w-none dark:prose-invert origin-top-left will-change-transform"
                style={{ transformOrigin: '0 0' }}
            >
                {news.blocks && news.blocks.length > 0
                    ? news.blocks.map((block, i) => renderBlock(block, i))
                    : <div className={fontSizeClass} dangerouslySetInnerHTML={{ __html: news.content }} />
                }
            </div>
        </div>
    );
};

export default ArticleContent;