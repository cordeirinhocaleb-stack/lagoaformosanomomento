import React, { useRef, useEffect, useState } from 'react';
import { NewsItem, ContentBlock } from '../../../../types';
import { SmartBlockRenderer } from '../../../../components/admin/editor/blocks/SmartBlockRenderer';
import EngagementBlock from '../../../../components/blocks/EngagementBlock';
import GalleryRenderer from '../../../../components/news/GalleryRenderer';

// Import New Renderers
import { RenderParagraph } from './renderers/RenderParagraph';
import { RenderHeading } from './renderers/RenderHeading';
import { RenderList } from './renderers/RenderList';
import { RenderQuote } from './renderers/RenderQuote';
import { RenderDivider } from './renderers/RenderDivider';
import { RenderVideo } from './renderers/RenderVideo';

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
            content.style.transform = `scale(${s})`;
            if (s > 1) {
                wrapper.style.width = `${s * 100}%`;
                wrapper.style.height = `${state.current.originalHeight * s}px`;
                wrapper.style.overflow = 'visible';
            } else {
                wrapper.style.width = '100%';
                wrapper.style.height = 'auto';
            }
        };

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                state.current.isZooming = true;
                state.current.initialDist = getDistance(e.touches);
                state.current.initialScale = state.current.scale;
                if (state.current.scale === 1) {
                    state.current.originalHeight = content.offsetHeight;
                }
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (state.current.isZooming && e.touches.length === 2) {
                if (e.cancelable) { e.preventDefault(); }
                const dist = getDistance(e.touches);
                const delta = dist / state.current.initialDist;
                let newScale = state.current.initialScale * delta;
                newScale = Math.min(Math.max(1, newScale), 4);
                state.current.scale = newScale;
                requestAnimationFrame(updateLayout);
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (e.touches.length < 2) {
                state.current.isZooming = false;
                if (state.current.scale < 1.1) {
                    state.current.scale = 1;
                    content.style.transition = 'transform 0.3s ease-out';
                    wrapper.style.transition = 'width 0.3s ease-out, height 0.3s ease-out';
                    updateLayout();
                    setTimeout(() => {
                        content.style.transition = '';
                        wrapper.style.transition = '';
                    }, 300);
                }
            }
        };

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
                            return <RenderHeading block={block} />;
                        case 'paragraph':
                            return <RenderParagraph block={block} fontSizeClass={fontSizeClass} />;
                        case 'list':
                            return <RenderList block={block} fontSizeClass={fontSizeClass} />;
                        case 'image':
                            return (
                                <figure className="my-10 space-y-4">
                                    <img src={block.content} loading="lazy" className="w-full h-auto object-cover rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800" alt="" />
                                    {block.settings?.caption && <figcaption className="text-center text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{block.settings.caption}</figcaption>}
                                </figure>
                            );
                        case 'quote':
                            return <RenderQuote block={block} />;
                        case 'separator':
                            return <RenderDivider block={block} />;
                        case 'video':
                            return <RenderVideo block={block} />;
                        case 'video_link':
                            // This case is largely redundant with 'video' but kept for legacy/specific URL handling not covered by RenderVideo logic yet if distinct
                            // Actually RenderVideo handles youtube/generic detection robustly.
                            // But purely for safety with existing data, we map it to RenderVideo too or simplified embed.
                            // For now, let's keep the existing simpler logic for video_link if different, or map it.
                            if (!block.content) { return null; }
                            const getEmbedUrl = (url: string) => {
                                const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
                                if (youtubeMatch) { return `https://www.youtube.com/embed/${youtubeMatch[1]}`; }
                                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
                                if (vimeoMatch) { return `https://player.vimeo.com/video/${vimeoMatch[1]}`; }
                                const dailymotionMatch = url.match(/dailymotion\.com\/video\/([^_]+)/);
                                if (dailymotionMatch) { return `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`; }
                                return null;
                            };
                            const publicEmbedUrl = getEmbedUrl(block.content);
                            if (!publicEmbedUrl) { return null; }
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
        <div ref={wrapperRef} className="w-full transition-all ease-linear origin-top-left">
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