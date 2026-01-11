import React, { useRef, useEffect, useState } from 'react';
import { NewsItem, ContentBlock } from '../../../../types';
import { SmartBlockRenderer } from '../../../../components/admin/editor/blocks/SmartBlockRenderer';
import { sanitize } from '../../../../utils/sanitizer';
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
                        case 'list':
                            const variant = block.settings?.editorialVariant || 'bullets_clean';
                            const settings = block.settings || {};
                            const perStyle = settings.perStyle || {};
                            const config = perStyle[variant] || {};
                            const listStyle = settings.listStyle || 'bullet';

                            // Recriando lógica de classes do itemList.tsx
                            let variantClasses = "";
                            const spacingClass = config.spacing === 'compact' ? 'space-y-1' : config.spacing === 'relaxed' ? 'space-y-4' : 'space-y-2';
                            const colorClass = config.markerColor && config.markerColor !== 'default' ? `marker:text-${config.markerColor}-600` : '';
                            const sizeClass = config.fontSize === 'sm' ? 'text-sm' : config.fontSize === 'lg' ? 'text-lg' : fontSizeClass; // Usa fonte do artigo se não especificado
                            const weightClass = config.weight === 'bold' ? 'font-bold' : '';
                            const rowStyle = config.rowStyle || 'none';
                            const rowClass = rowStyle === 'divided' ? 'divide-y divide-zinc-100 dark:divide-zinc-800' :
                                rowStyle === 'striped' ? 'even:bg-zinc-50 dark:even:bg-zinc-800/50' :
                                    rowStyle === 'boxed' ? 'space-y-2 [&>li]:bg-zinc-50 dark:[&>li]:bg-zinc-800/50 [&>li]:p-2 [&>li]:rounded-lg' : '';

                            if (variant === 'checklist_pro') {
                                variantClasses = "pl-2";
                            } else if (variant === 'executive_summary') {
                                variantClasses = "border-l-4 border-zinc-900 dark:border-zinc-100 pl-4 py-2 bg-zinc-50 dark:bg-zinc-900/30";
                            } else if (variant === 'bullets_clean') {
                                variantClasses = "pl-5 list-disc marker:text-zinc-400";
                            } else if (variant === 'bullets_square') {
                                variantClasses = "pl-5 list-square marker:text-zinc-900 dark:marker:text-zinc-100";
                            } else if (variant === 'numbered_steps') {
                                variantClasses = "pl-5 list-decimal marker:font-bold marker:text-zinc-900 dark:marker:text-zinc-100";
                            } else if (variant === 'timeline_dots') {
                                variantClasses = "pl-4 border-l border-zinc-200 dark:border-zinc-700 relative";
                            } else if (variant === 'list_bullets_classic') {
                                variantClasses = "pl-6 border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-600 dark:text-zinc-400";
                            } else if (variant === 'list_check_circle') {
                                variantClasses = "bg-green-50/50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30 text-green-900 dark:text-green-300 font-medium";
                            } else if (variant === 'list_numbered_modern') {
                                variantClasses = "font-mono text-sm bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-lg border-l-4 border-blue-500 text-blue-800 dark:text-blue-300";
                            } else if (variant === 'list_timeline_vertical') {
                                variantClasses = "pl-6 border-l-[3px] border-purple-400 relative before:content-[''] before:absolute before:left-[-5px] before:top-0 before:w-2 before:h-2 before:rounded-full before:bg-purple-600";
                            } else if (variant === 'list_cards_shadow') {
                                variantClasses = "shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow";
                            }

                            // Ajuste fino para Numeração e Marcadores
                            const isOrdered = variant === 'numbered_steps' || variant === 'list_numbered_modern' || listStyle === 'ordered';
                            if (isOrdered) {
                                variantClasses += " list-decimal list-inside";
                            } else if (listStyle === 'square') {
                                variantClasses = variantClasses.replace('list-disc', '').replace('list-decimal', '') + " list-none pl-6 relative not-prose [&>li]:relative [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-[-1rem] [&>li]:before:top-3 [&>li]:before:w-1.5 [&>li]:before:h-1.5 [&>li]:before:bg-zinc-800 dark:[&>li]:before:bg-zinc-200 [&>li]:before:block";
                            } else if (listStyle === 'check') {
                                // Versão Pública: Suporta os estados checked/failed salvos via data-state
                                variantClasses = variantClasses.replace('list-disc', '').replace('list-decimal', '') +
                                    " list-none pl-8 relative not-prose " +
                                    // Default State (Red Square)
                                    "[&>li]:relative [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-[-1.5rem] [&>li]:before:top-[0.4em] [&>li]:before:w-4 [&>li]:before:h-4 [&>li]:before:border-2 [&>li]:before:border-red-500 [&>li]:before:rounded-sm [&>li]:before:bg-white dark:[&>li]:before:bg-zinc-800 " +
                                    // Checked State (Green + Icon)
                                    "[&>li[data-state='checked']]:before:bg-green-500 [&>li[data-state='checked']]:before:border-green-500 [&>li[data-state='checked']]:before:content-['✓'] [&>li[data-state='checked']]:before:text-white [&>li[data-state='checked']]:before:text-[10px] [&>li[data-state='checked']]:before:flex [&>li[data-state='checked']]:before:items-center [&>li[data-state='checked']]:before:justify-center " +
                                    // Failed State (Red + X)
                                    "[&>li[data-state='failed']]:before:bg-red-500 [&>li[data-state='failed']]:before:border-red-500 [&>li[data-state='failed']]:before:content-['✕'] [&>li[data-state='failed']]:before:text-white [&>li[data-state='failed']]:before:text-[10px] [&>li[data-state='failed']]:before:flex [&>li[data-state='failed']]:before:items-center [&>li[data-state='failed']]:before:justify-center";
                            } else if (listStyle === 'bullet') {
                                if (!variantClasses.includes('list-')) { variantClasses += " list-disc list-inside"; }
                            }

                            const finalClasses = `${variantClasses} ${spacingClass} ${colorClass} ${sizeClass} ${weightClass} ${rowClass} mb-8 w-full`;
                            const ListTag = isOrdered ? 'ol' : 'ul';

                            return <ListTag className={finalClasses} dangerouslySetInnerHTML={{ __html: block.content }} />;
                        case 'image':
                            return (
                                <figure className="my-10 space-y-4">
                                    <img src={block.content} loading="lazy" className="w-full h-auto object-cover rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800" alt="" />
                                    {block.settings?.caption && <figcaption className="text-center text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{block.settings.caption}</figcaption>}
                                </figure>
                            );
                        case 'quote':
                            const quoteVariant = block.settings?.editorialVariant || 'impact_quote';
                            const qSettings = block.settings || {};
                            const qPerStyle = qSettings.perStyle || {};
                            const qStyle = qPerStyle[quoteVariant] || {};

                            // Replicando estilos de quoteAspas.tsx
                            const fluidStyles: React.CSSProperties = { width: '100%', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' };

                            if (quoteVariant === 'impact_quote') {
                                const iq = { ...{ borderPosition: 'left', borderWidth: 8, color: '#dc2626', backgroundSubtle: true, bigQuotes: true, quoteSize: 'lg', authorAlign: 'right' }, ...qStyle };
                                const iqColor = iq.color;
                                return (
                                    <div className="my-10 relative rounded-2xl overflow-hidden transition-all" style={{
                                        ...fluidStyles,
                                        borderLeft: iq.borderPosition === 'left' ? `${iq.borderWidth}px solid ${iqColor}` : 'none',
                                        borderRight: iq.borderPosition === 'right' ? `${iq.borderWidth}px solid ${iqColor}` : 'none',
                                        backgroundColor: iq.backgroundSubtle ? `${iqColor}0D` : 'transparent',
                                        padding: '2.5rem',
                                    }}>
                                        {iq.bigQuotes && <i className="fas fa-quote-left absolute top-4 left-4 opacity-20 text-6xl pointer-events-none" style={{ color: iqColor }}></i>}
                                        <div style={{ fontSize: iq.quoteSize === 'xl' ? '1.5rem' : iq.quoteSize === 'sm' ? '1rem' : '1.25rem', fontFamily: 'Merriweather, serif', fontStyle: 'italic', fontWeight: 900, lineHeight: 1.2, color: '#111827' }} dangerouslySetInnerHTML={{ __html: block.content }} />
                                        {iq.author && <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] opacity-60 not-italic break-words" style={{ textAlign: iq.authorAlign, color: iqColor }}>— {iq.author}</p>}
                                    </div>
                                );
                            } else if (quoteVariant === 'vintage_letter') {
                                const vl = { ...{ paperTexture: true, tilt: 0, borderStyle: 'dashed' }, ...qStyle };
                                return (
                                    <div className="my-12 relative transition-all" style={{
                                        ...fluidStyles,
                                        backgroundColor: '#fdf6e3',
                                        padding: '40px',
                                        border: `2px ${vl.borderStyle} #d4c4a8`,
                                        color: '#433422',
                                        fontFamily: 'Merriweather, serif',
                                        transform: `rotate(${vl.tilt * 0.5}deg)`,
                                        boxShadow: vl.paperTexture ? 'inset 0 0 40px rgba(0,0,0,0.05)' : 'none'
                                    }}>
                                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                                        {vl.signature && <cite className="block text-right mt-8 font-serif italic text-lg opacity-60 break-words">— {vl.signature}</cite>}
                                    </div>
                                );
                            } else if (quoteVariant === 'quote_modern_accent') {
                                return (
                                    <div className="my-10 pl-8 border-l-[12px] border-red-600 font-sans text-2xl font-bold text-gray-800 leading-snug" style={fluidStyles} dangerouslySetInnerHTML={{ __html: block.content }} />
                                );
                            } else if (quoteVariant === 'quote_breaking_card') {
                                return (
                                    <div className="my-10 bg-red-50 border-l-[6px] border-red-700 p-8 rounded-r-3xl shadow-sm" style={fluidStyles}>
                                        <div className="inline-block bg-red-700 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-3">Citação</div>
                                        <div
                                            className="font-serif text-lg md:text-xl leading-relaxed text-zinc-800"
                                            dangerouslySetInnerHTML={{ __html: sanitize(block.content) }}
                                        />
                                    </div>
                                );
                            } else {
                                // Default/Fallback Quote
                                return (
                                    <blockquote className="border-l-[10px] border-red-600 bg-gray-50 dark:bg-zinc-900/40 p-8 md:p-12 rounded-r-2xl my-10 relative overflow-hidden group">
                                        <i className="fas fa-quote-right text-gray-200 dark:text-zinc-800 text-7xl absolute -bottom-8 right-4 pointer-events-none opacity-50"></i>
                                        <div className="text-xl md:text-2xl font-black italic text-zinc-900 dark:text-zinc-100 relative z-10 font-serif leading-tight" dangerouslySetInnerHTML={{ __html: block.content }} />
                                    </blockquote>
                                );
                            }

                        case 'separator':
                            const sSettings = block.settings || {};
                            const color = sSettings.color || '#e2e8f0';
                            const thickness = sSettings.thickness || 1;
                            const lineStyle = sSettings.lineStyle || 'solid';
                            const iconName = sSettings.iconName || 'fa-star';
                            const iconPosition = sSettings.iconPosition || 'none';
                            const iconSize = sSettings.iconSize || 14;
                            const opacity = sSettings.opacity !== undefined ? sSettings.opacity : 1;
                            const orientation = sSettings.orientation || 'horizontal';
                            const height = sSettings.height || 60;

                            const IconComponent = () => (
                                <div className="flex items-center justify-center shrink-0 transition-transform duration-700 hover:[transform:rotateY(360deg)] px-2 cursor-pointer" style={{ color, fontSize: `${iconSize}px`, opacity }}>
                                    {iconName === 'site_logo' ? (
                                        <img
                                            src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"
                                            alt="Logo"
                                            style={{ width: `${iconSize * 1.5}px`, height: 'auto', display: 'block' }}
                                        />
                                    ) : (
                                        <i className={`fas ${iconName}`}></i>
                                    )}
                                </div>
                            );

                            if (orientation === 'vertical') {
                                return (
                                    <div className="py-6 flex flex-col items-center justify-center w-full" style={{ height: `${height}px` }}>
                                        <div style={{
                                            width: `${thickness}px`,
                                            flex: 1,
                                            backgroundColor: color,
                                            opacity: opacity,
                                            borderRadius: '999px'
                                        }}></div>

                                        {iconPosition !== 'none' && (
                                            <div className="py-2 transform -rotate-90 md:rotate-0">
                                                <IconComponent />
                                            </div>
                                        )}

                                        <div style={{
                                            width: `${thickness}px`,
                                            flex: 1,
                                            backgroundColor: color,
                                            opacity: opacity,
                                            borderRadius: '999px'
                                        }}></div>
                                    </div>
                                );
                            }
                            const Line = () => (
                                <div className="flex-1" style={{
                                    height: lineStyle === 'double' ? `${thickness * 3}px` : `${thickness}px`,
                                    borderBottom: lineStyle !== 'double' ? `${thickness}px ${lineStyle} ${color}` : 'none',
                                    borderTop: lineStyle === 'double' ? `${thickness}px double ${color}` : 'none',
                                    opacity, borderRadius: '999px'
                                }}></div>
                            );

                            return (
                                <div className="py-8 w-full max-w-[90%] mx-auto flex items-center justify-center">
                                    {iconPosition === 'left' && <><IconComponent /><Line /></>}
                                    {iconPosition === 'right' && <><Line /><IconComponent /></>}
                                    {iconPosition === 'center' && <><Line /><IconComponent /><Line /></>}
                                    {(iconPosition === 'none' || !iconPosition) && <Line />}
                                </div>
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
                                    if (!url) { return null; }
                                    // 1. If it's already an ID (11 chars or more)
                                    // We allow 'pending_' prefix here to ensure it doesn't try to extract from a pending string
                                    if (/^[a-zA-Z0-9_-]{11,}$/.test(url) && !url.includes('pending_')) { return url; }
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