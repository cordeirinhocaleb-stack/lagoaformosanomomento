
import React, { useMemo } from 'react';
import { PromoPopupConfig, PopupSize } from '../../../types';
import { getThemeById } from './popupThemes';
import { getMediaThemeById } from './mediaThemes';
import { getOverlayPresetClass } from './overlayPresets';
import { getVideoFrameById } from './videoFrames';
import { getMediaFilterCss } from './mediaFilters';
import { isSafeUrl } from '../../../utils/popupSafety';
import { PopupMediaRenderer } from './mediaPresentations';
import { PopupSpecialEffects } from './PopupSpecialEffects';

interface PromoPopupViewProps {
    config: PromoPopupConfig;
    mode: 'live' | 'preview';
    onClose?: () => void;
    onAction?: () => void;
}

const PromoPopupView: React.FC<PromoPopupViewProps> = ({ config, mode, onClose, onAction }) => {
    const theme = getThemeById(config.theme || 'classic_default');
    const mediaTheme = getMediaThemeById(config.mediaThemeId);
    const overlayPresetClass = getOverlayPresetClass(config.overlayPreset);
    const videoFrame = getVideoFrameById(config.videoFramePreset); // Frame de Vídeo
    const mediaFilterClass = getMediaFilterCss(config.mediaFilter, config.mediaFilterVariant); // Classes de Filtro CSS

    const styles = theme.styles;
    const shape = config.shape || 'default';
    const size = config.size || 'md';
    const position = config.position || 'center';
    const overlay = config.overlay || 'dark';
    const animation = config.animation || 'zoom';

    // Carrossel Automático (SAFE ONLY)
    const imageList = useMemo(() => {
        let rawList: string[] = [];
        if (config.images && config.images.length > 0) { rawList = config.images; }
        else if (config.mediaUrl && config.mediaType === 'image') { rawList = [config.mediaUrl]; }

        // Filtra apenas URLs seguras
        return rawList.filter(url => isSafeUrl(url));
    }, [config.images, config.mediaUrl, config.mediaType]);

    // Classes de Posicionamento (Live vs Preview)
    let positionClasses = '';
    let wrapperClasses = '';

    if (mode === 'live') {
        wrapperClasses = 'fixed inset-0 z-[9999]';
        if (position === 'center') { positionClasses = 'items-center justify-center'; }
        else if (position === 'top-center') { positionClasses = 'items-start justify-center pt-20'; }
        else if (position === 'bottom-center') { positionClasses = 'items-end justify-center pb-8'; }
        else if (position === 'bottom-right') { positionClasses = 'items-end justify-end pb-8 pr-4 md:pr-8'; }
        else if (position === 'bottom-left') { positionClasses = 'items-end justify-start pb-8 pl-4 md:pl-8'; }
        else if (position === 'top-left') { positionClasses = 'items-start justify-start pt-20 pl-4 md:pl-8'; }
        else if (position === 'top-right') { positionClasses = 'items-start justify-end pt-20 pr-4 md:pr-8'; }
        else if (position === 'center-left') { positionClasses = 'items-center justify-start pl-4 md:pl-8'; }
        else if (position === 'center-right') { positionClasses = 'items-center justify-end pr-4 md:pr-8'; }
    } else {
        // Preview Mode: Centralizado no container pai
        wrapperClasses = 'absolute inset-0 z-10';
        positionClasses = 'items-center justify-center';

        // Simulação de posição relativa no preview
        if (position.includes('top')) { positionClasses = 'items-start justify-center pt-4'; }
        if (position.includes('bottom')) { positionClasses = 'items-end justify-center pb-4'; }
    }

    // Classes de Overlay
    let overlayClasses = 'bg-black/80 backdrop-blur-sm';
    if (overlay === 'transparent') { overlayClasses = 'bg-transparent pointer-events-none'; }
    if (overlay === 'blur') { overlayClasses = 'bg-white/30 backdrop-blur-xl'; }

    // Classes de Animação
    let animationClass = mode === 'live' ? 'animate-zoomIn' : '';
    if (mode === 'live') {
        if (animation === 'fade') { animationClass = 'animate-fadeIn'; }
        if (animation === 'slide-up') { animationClass = 'animate-slideUp'; }
        if (animation === 'slide-in-right') { animationClass = 'animate-slideInRight'; }
        if (animation === 'slide-in-left') { animationClass = 'animate-slideInLeft'; }
    }

    // Mapeamento de Tamanhos
    const getSizeClass = (s: PopupSize) => {
        switch (s) {
            case 'xs': return 'max-w-xs';
            case 'sm': return 'max-w-sm';
            case 'md': return 'max-w-md';
            case 'lg': return 'max-w-lg';
            case 'xl': return 'max-w-xl';
            case '2xl': return 'max-w-2xl';
            case 'fullscreen': return 'w-full h-full rounded-none max-w-none';
            case 'banner_top': return 'w-full max-w-4xl fixed top-0 left-1/2 -translate-x-1/2 mt-4';
            case 'banner_bottom': return 'w-full max-w-4xl fixed bottom-0 left-1/2 -translate-x-1/2 mb-4';
            case 'sidebar_left': return 'w-80 h-auto fixed left-4 top-1/2 -translate-y-1/2';
            case 'sidebar_right': return 'w-80 h-auto fixed right-4 top-1/2 -translate-y-1/2';
            default: return 'max-w-md';
        }
    };

    const isSplit = theme.layout === 'split';
    let containerSizeClasses = getSizeClass(size);
    if (isSplit && !containerSizeClasses.includes('max-w') && size !== 'fullscreen') { containerSizeClasses += ' max-w-4xl grid md:grid-cols-2'; }

    if (mode === 'preview') {
        if (size === 'banner_top' || size === 'banner_bottom') { containerSizeClasses = 'w-full max-w-sm'; }
        if (size === 'sidebar_left' || size === 'sidebar_right') { containerSizeClasses = 'w-64'; }
        if (size === 'fullscreen') { containerSizeClasses = 'w-full h-full'; }
    }

    // Renderização de Mídia OTIMIZADA com MEDIA THEMES e VIDEO FRAMES e FILTERS
    const renderMedia = () => {
        // Wrapper do Tema de Mídia (Container Geral)
        const themeContainerClass = `relative w-full h-full overflow-hidden ${mediaTheme.containerClass}`;
        const overlayClass = `absolute inset-0 z-10 pointer-events-none ${mediaTheme.overlayClass}`;
        const mediaClass = `${mediaTheme.mediaClass} ${mediaFilterClass}`;

        // Preset de Overlay (Gradientes, Tinturas, etc) - Camada Superior
        const overlayPresetDiv = <div className={`absolute inset-0 z-20 pointer-events-none ${overlayPresetClass}`}></div>;

        // SEGURANÇA: Só renderiza vídeo se a URL for segura
        if (config.mediaType === 'video' && config.mediaUrl && isSafeUrl(config.mediaUrl)) {
            const videoIdMatch = config.mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            const isYouTube = !!videoId;

            // VIDEO FRAME WRAPPER
            return (
                <div className={`w-full h-full flex items-center justify-center p-2`}>
                    <div className={`relative w-full h-full ${videoFrame.wrapperClass}`}>
                        <div className={`relative w-full h-full overflow-hidden ${videoFrame.innerClass}`}>
                            {overlayPresetDiv}
                            {isYouTube ? (
                                mode === 'preview' ? (
                                    // PREVIEW: Placeholder
                                    <div className="w-full h-full relative bg-black group cursor-default">
                                        <img
                                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                            className={`w-full h-full object-cover ${mediaClass} opacity-70 group-hover:opacity-90 transition-opacity`}
                                            alt="Video Preview"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <div className="w-14 h-14 bg-red-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/20 shadow-xl">
                                                <i className="fas fa-play text-lg ml-1"></i>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // LIVE: Iframe (Filtros CSS aplicados via mediaClass no iframe)
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}`}
                                        className={`w-full h-full object-cover ${mediaClass} pointer-events-none`}
                                        allow="autoplay; encrypted-media"
                                    ></iframe>
                                )
                            ) : (
                                <video
                                    src={config.mediaUrl}
                                    autoPlay
                                    muted
                                    loop
                                    controls={false}
                                    playsInline
                                    className={`w-full h-full object-cover ${mediaClass}`}
                                />
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // NOVO SISTEMA DE APRESENTAÇÃO DE IMAGENS (v2)
        if (imageList.length > 0) {
            // Determina o modo de apresentação. 
            // Se não estiver definido (legacy), usa 'mini_slider' se tiver múltiplas imagens, ou 'hero_single' se for só uma.
            const presentationMode = config.imagePresentation || (imageList.length > 1 ? 'mini_slider' : 'hero_single');

            return (
                <div className={themeContainerClass}>
                    <div className={overlayClass}></div>
                    {overlayPresetDiv}

                    {/* Chama o novo renderizador de apresentações */}
                    <PopupMediaRenderer
                        mode={presentationMode}
                        images={imageList}
                        className={mediaClass} // Passa classes de filtro e brilho para as imagens internas
                        imageStyle={config.media?.imageStyle}
                    />
                </div>
            );
        }

        return null;
    };

    // Shape Styles
    let containerShapeClasses = '';
    let mediaShapeClasses = '';

    if (size !== 'fullscreen') {
        if (shape === 'square') {
            containerShapeClasses = 'rounded-none';
            mediaShapeClasses = 'rounded-none';
        } else if (shape === 'rounded') {
            containerShapeClasses = 'rounded-3xl';
            mediaShapeClasses = 'rounded-t-3xl';
        } else if (shape === 'circle' && !isSplit) {
            containerShapeClasses = 'rounded-full aspect-square flex flex-col items-center justify-center p-12 text-center';
            mediaShapeClasses = 'rounded-full w-40 h-40 mx-auto mb-6 overflow-hidden';
        } else if (shape === 'leaf') {
            containerShapeClasses = 'rounded-tr-[4rem] rounded-bl-[4rem]';
            mediaShapeClasses = 'rounded-tr-[3.5rem]';
        } else if (shape === 'heart') {
            containerShapeClasses = 'rounded-[3rem] rounded-bl-none rounded-tr-none';
        } else if (shape === 'hexagon') {
            containerShapeClasses = 'rounded-xl';
        }
    }

    // Estilos de Fonte Dinâmicos
    const fontStyle = {
        fontFamily: config.fontFamily || 'Inter, sans-serif'
    };

    const fontSizeClass = {
        xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl', '2xl': 'text-3xl'
    }[config.fontSize || 'md'];

    const wrapperPointerEvents = overlay === 'transparent' ? 'pointer-events-none' : 'pointer-events-auto';

    // ========================================================================
    // LAYOUT: BANNER TOP (Image 5 - Breaking News)
    // ========================================================================
    if (theme.layout === 'banner_top') {
        return (
            <div className={`fixed top-0 left-0 w-full z-[9999] p-2 md:p-4 flex justify-center pointer-events-none ${animationClass}`}>
                <div className="flex items-center gap-4 md:gap-8 px-6 py-3 shadow-2xl pointer-events-auto max-w-5xl w-full border-t-2"
                    style={{ backgroundColor: theme.colors?.background, borderColor: theme.colors?.border, ...fontStyle }}>
                    <span className="font-black uppercase text-[10px] md:text-sm tracking-widest whitespace-nowrap" style={{ color: theme.colors?.title }}>
                        {config.title}
                    </span>
                    <span className="flex-1 text-xs md:text-sm font-semibold opacity-90 line-clamp-1" style={{ color: theme.colors?.body }}>
                        {config.description}
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onAction}
                            className="px-4 py-1.5 md:px-6 md:py-2 bg-white text-black text-[9px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                            style={{ backgroundColor: theme.colors?.buttonBg, color: theme.colors?.buttonText }}
                        >
                            {config.buttonText}
                        </button>
                        <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100 transition-opacity" style={{ color: theme.colors?.title }}>
                            <i className="fas fa-times text-sm"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (theme.layout === 'monolith') {
        return (
            <div className={`${wrapperClasses} flex p-4 items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
                {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

                <div
                    className={`relative w-full max-w-2xl aspect-[4/5] md:aspect-square overflow-hidden bg-black text-white shadow-2xl ${animationClass}`}
                    style={{ backgroundColor: theme.colors?.background, borderColor: theme.colors?.border }}
                >
                    {/* Media as Texture Background */}
                    <div className="absolute inset-0 z-0 opacity-60 mix-blend-multiply">
                        {renderMedia()}
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-12">
                        <div>
                            <h2
                                className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter mix-blend-difference"
                                style={{ color: theme.colors?.title, ...fontStyle }}
                            >
                                {config.title.toUpperCase()}
                            </h2>
                            {config.subtitle && (
                                <h3 className="text-xl md:text-2xl font-bold mt-2 opacity-80 mix-blend-difference" style={{ color: theme.colors?.title, ...fontStyle }}>
                                    {config.subtitle}
                                </h3>
                            )}
                        </div>

                        <div className="space-y-6">
                            {config.logoUrl && (
                                <img src={config.logoUrl} alt="Logo" className="h-12 w-auto mb-4 object-contain mix-blend-difference" />
                            )}
                            <p
                                className="text-lg md:text-xl font-medium max-w-md mix-blend-difference"
                                style={{ color: theme.colors?.body, ...fontStyle }}
                            >
                                {config.description}
                            </p>
                            {config.smallNote && (
                                <p className="text-[10px] uppercase tracking-widest opacity-50 mix-blend-difference" style={{ color: theme.colors?.body }}>
                                    {config.smallNote}
                                </p>
                            )}
                            <button
                                onClick={onAction}
                                className="w-full py-6 text-xl font-bold border-t-2 border-white/20 hover:bg-white hover:text-black transition-colors uppercase tracking-widest flex justify-between items-center group"
                                style={{ borderColor: theme.colors?.border, color: theme.colors?.buttonText, backgroundColor: theme.colors?.buttonBg }}
                            >
                                <span>{config.buttonText}</span>
                                <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                            </button>
                        </div>

                        <button onClick={onClose} className="absolute top-0 right-0 p-6 mix-blend-difference text-white hover:rotate-90 transition-transform">
                            <i className="fas fa-times text-4xl"></i>
                        </button>
                    </div>

                    <PopupSpecialEffects effect={theme.specialEffect} />
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: ASYMMETRIC (90/10 Tension)
    // ========================================================================
    if (theme.layout === 'asymmetric') {
        return (
            <div className={`${wrapperClasses} flex ${overlayClasses} ${wrapperPointerEvents}`}>
                {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

                <div className={`relative w-full h-full p-4 md:p-8 flex items-end justify-start pointer-events-none`}>
                    {/* Content Box (10% area) */}
                    <div
                        className={`relative z-50 pointer-events-auto bg-black text-white p-6 md:p-8 max-w-md w-full shadow-2xl ${animationClass}`}
                        style={{ backgroundColor: theme.colors?.background, borderTop: `4px solid ${theme.colors?.border}` }}
                    >
                        <h2
                            className="text-4xl md:text-5xl font-bold mb-1 leading-none tracking-tight"
                            style={{ color: theme.colors?.title, ...fontStyle }}
                        >
                            {config.title}
                        </h2>
                        {config.subtitle && (
                            <h3 className="text-sm font-bold opacity-70 mb-4" style={{ color: theme.colors?.title, ...fontStyle }}>
                                {config.subtitle}
                            </h3>
                        )}
                        <p
                            className="text-sm opacity-80 mb-6 leading-relaxed"
                            style={{ color: theme.colors?.body, ...fontStyle }}
                        >
                            {config.description}
                        </p>
                        {config.smallNote && (
                            <p className="text-[9px] uppercase tracking-widest opacity-40 mb-4" style={{ color: theme.colors?.body }}>
                                {config.smallNote}
                            </p>
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={onAction}
                                className="flex-1 py-3 px-6 bg-yellow-400 text-black font-bold uppercase text-sm tracking-wider hover:bg-white transition-colors"
                                style={{ backgroundColor: theme.colors?.buttonBg, color: theme.colors?.buttonText }}
                            >
                                {config.buttonText}
                            </button>
                            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    {/* Massive Background Media (90% area) - Fixed/Absolute behind */}
                    <div className="absolute inset-0 z-0 pointer-events-auto">
                        <div className="w-full h-full opacity-80">
                            {renderMedia()}
                        </div>
                        {/* Marquee Effect Optional */}
                        <div className="absolute bottom-[20%] left-0 w-full overflow-hidden opacity-20 pointer-events-none">
                            <div className="whitespace-nowrap animate-marquee text-[10rem] font-black uppercase text-transparent stroke-white" style={{ WebkitTextStroke: '2px white' }}>
                                {config.title} {config.title} {config.title}
                            </div>
                        </div>
                        <PopupSpecialEffects effect={theme.specialEffect} />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: FRAGMENTED (Void State)
    // ========================================================================
    if (theme.layout === 'fragmented') {
        return (
            <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
                {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

                <div className={`relative w-full max-w-4xl h-[60vh] pointer-events-none ${animationClass}`}>
                    {/* Layer 1: Media (Floating somewhere) */}
                    <div className="absolute top-0 right-0 w-2/3 h-2/3 z-0 pointer-events-auto overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
                        {renderMedia()}
                    </div>

                    {/* Layer 2: Text Block (Floating left) */}
                    <div
                        className="absolute bottom-10 left-4 md:left-10 z-10 max-w-sm pointer-events-auto mix-blend-hard-light backdrop-blur-md p-8"
                        style={{ backgroundColor: `${theme.colors?.background}99` }} // Add opacity
                    >
                        <h2
                            className="text-5xl md:text-6xl font-thin tracking-tighter mb-4"
                            style={{ color: theme.colors?.title, ...fontStyle }}
                        >
                            {config.title}
                        </h2>
                        <p
                            className="text-lg font-light mb-8 border-l-2 pl-4 border-current opacity-80"
                            style={{ color: theme.colors?.body, ...fontStyle }}
                        >
                            {config.description}
                        </p>
                        <button
                            onClick={onAction}
                            className="px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] border border-current hover:bg-current hover:text-black transition-colors"
                            style={{ color: theme.colors?.buttonText, borderColor: theme.colors?.border }}
                        >
                            {config.buttonText}
                        </button>
                    </div>

                    {/* Layer 3: Close Button (Random spot) */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 z-50 pointer-events-auto w-16 h-16 flex items-center justify-center bg-black text-white hover:bg-red-600 transition-colors"
                    >
                        <i className="fas fa-times text-2xl"></i>
                    </button>

                    <PopupSpecialEffects effect={theme.specialEffect} />
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: COVER (Full Image / Banner Style)
    // ========================================================================
    if (theme.layout === 'cover') {
        return (
            <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
                {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

                <div
                    className={`relative w-full text-white shadow-2xl overflow-hidden pointer-events-auto group ${animationClass}`}
                    style={{
                        maxWidth: size === 'fullscreen' ? '100%' : '550px',
                        height: size === 'fullscreen' ? '100%' : '750px',
                        maxHeight: '90vh',
                        borderRadius: theme.styles?.container?.includes('rounded') ? '24px' : '0px'
                    }}
                >
                    {/* 1. Full Background Media */}
                    <div className="absolute inset-0 z-0 select-none">
                        {renderMedia()}
                    </div>

                    {/* 2. Gradient Overlay for readability */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* 3. Content - Bottom Aligned */}
                    <div className="absolute bottom-0 left-0 w-full z-20 p-8 md:p-12 flex flex-col items-start">
                        {/* Optional Badge */}
                        <div className="mb-4 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                            Destaque
                        </div>

                        <h2
                            className="text-4xl md:text-6xl font-black leading-[0.9] mb-4 tracking-tight drop-shadow-xl"
                            style={{ color: theme.colors?.title, ...fontStyle }}
                        >
                            {config.title}
                        </h2>

                        <p
                            className="text-lg md:text-xl font-medium opacity-90 mb-8 max-w-sm drop-shadow-md leading-relaxed"
                            style={{ color: theme.colors?.body, ...fontStyle }}
                        >
                            {config.description}
                        </p>

                        <button
                            onClick={onAction}
                            className="w-full md:w-auto px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300"
                            style={{ backgroundColor: theme.colors?.buttonBg, color: theme.colors?.buttonText }}
                        >
                            {config.buttonText}
                        </button>
                    </div>

                    {/* 4. Close Button - Floating Top Right */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>

                    <PopupSpecialEffects effect={theme.specialEffect} />
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: FEATURE LIST (Image 5 - Premium plan)
    // ========================================================================
    if (theme.layout === 'feature_list') {
        const features = config.description.split('|').map(f => f.trim());
        return (
            <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
                {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

                <div
                    className={`relative w-full max-w-md p-8 shadow-2xl overflow-hidden pointer-events-auto ${animationClass}`}
                    style={{
                        backgroundColor: theme.colors?.background,
                        borderRadius: '24px',
                        border: theme.colors.border ? `1px solid ${theme.colors.border}` : 'none'
                    }}
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        <i className="fas fa-times text-xl"></i>
                    </button>

                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-8" style={{ color: theme.colors?.title, ...fontStyle }}>
                        {config.title}
                    </h2>

                    <div className="space-y-4 mb-10">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10" style={{ backgroundColor: `${theme.colors?.buttonBg}20` }}>
                                    <i className="fas fa-check text-[10px]" style={{ color: theme.colors?.buttonBg }}></i>
                                </div>
                                <span className="text-sm font-bold opacity-90" style={{ color: theme.colors?.body, ...fontStyle }}>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onAction}
                        className="w-full py-4 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl"
                        style={{ backgroundColor: theme.colors?.buttonBg, color: theme.colors?.buttonText, borderRadius: '12px' }}
                    >
                        {config.buttonText}
                    </button>

                    <PopupSpecialEffects effect={theme.specialEffect} />
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: COUNTDOWN (Image 5 - Limited Offer)
    // ========================================================================
    if (theme.layout === 'countdown') {
        return (
            <div className={`${wrapperClasses} flex items-center justify-center ${overlayClasses} ${wrapperPointerEvents}`}>
                {overlay !== 'transparent' && onClose && <div className="absolute inset-0" onClick={onClose}></div>}

                <div
                    className={`relative w-full max-w-sm p-8 text-center shadow-2xl pointer-events-auto ${animationClass}`}
                    style={{ backgroundColor: theme.colors?.background, borderRadius: '32px' }}
                >
                    <div className="mb-6 flex justify-center">
                        <div className="w-16 h-1 w-1 bg-white/20 rounded-full"></div>
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-wider mb-2" style={{ color: theme.colors?.title, ...fontStyle }}>
                        {config.title}
                    </h2>

                    <p className="text-sm font-bold opacity-80 mb-8" style={{ color: theme.colors?.body, ...fontStyle }}>
                        {config.description}
                    </p>

                    {/* DUMMY COUNTDOWN BOXES */}
                    <div className="flex justify-center gap-4 mb-10">
                        {['23', '59', '42'].map((unit, i) => (
                            <div key={i} className="flex flex-col gap-1 items-center">
                                <div className="w-14 h-16 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl font-black border border-white/10"
                                    style={{ color: theme.colors?.title }}>
                                    {unit}
                                </div>
                                <span className="text-[8px] font-bold uppercase opacity-50" style={{ color: theme.colors?.body }}>
                                    {i === 0 ? 'Horas' : i === 1 ? 'Minutos' : 'Segundos'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onAction}
                        className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                        style={{ backgroundColor: theme.colors?.buttonBg, color: theme.colors?.buttonText, borderRadius: 'full' }}
                    >
                        {config.buttonText}
                    </button>

                    <button onClick={onClose} className="mt-6 text-xs font-black uppercase opacity-40 hover:opacity-100 transition-opacity" style={{ color: theme.colors?.body }}>
                        Não, obrigado
                    </button>

                    <PopupSpecialEffects effect={theme.specialEffect} />
                </div>
            </div>
        );
    }

    return (
        <div className={`${wrapperClasses} flex p-4 ${positionClasses} ${overlayClasses} ${wrapperPointerEvents} transition-all duration-500`}>
            {overlay !== 'transparent' && onClose && (
                <div className="absolute inset-0" onClick={onClose}></div>
            )}

            <div
                className={`relative w-full ${containerSizeClasses} ${animationClass} ${styles.container} ${shape !== 'default' ? containerShapeClasses : ''} shadow-2xl pointer-events-auto`}
                style={{
                    backgroundColor: theme.colors?.background,
                    borderColor: theme.colors?.border
                }}
            >
                {/* Accent: Badge */}
                {theme.headerAccent === 'badge' && (
                    <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg" style={{ backgroundColor: theme.colors.buttonBg, color: theme.colors.buttonText }}>
                        Destaque
                    </div>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
                    className={`absolute z-[100] transition-all flex items-center justify-center group active:scale-90 shadow-xl
                        ${config.closeButtonStyle === 'square' ? 'top-0 right-0 w-12 h-12 rounded-none' :
                            config.closeButtonStyle === 'circle' ? '-top-4 -right-4 w-10 h-10 rounded-full' :
                                'top-4 right-4 w-8 h-8 rounded-lg'}`}
                    title="Fechar"
                    style={{
                        backgroundColor: theme.colors?.buttonBg,
                        color: theme.colors?.buttonText
                    }}
                >
                    <i className="fas fa-times text-lg group-hover:rotate-90 transition-transform duration-300"></i>
                </button>

                {(config.mediaUrl || (config.images && config.images.length > 0)) && theme.id !== 'creative_terminal' && (
                    <div className={`${styles.mediaContainer} ${isSplit ? 'h-64 md:h-full' : ''} relative ${shape !== 'default' && !isSplit ? mediaShapeClasses : ''} ${size === 'fullscreen' ? 'h-1/2' : ''} p-2 bg-transparent border-0`}>
                        {/* RenderMedia agora inclui o wrapper do tema visual e video frame */}
                        {renderMedia()}
                    </div>
                )}

                <div className={`relative z-10 ${styles.contentContainer} ${shape === 'circle' ? 'p-0' : ''} ${size === 'fullscreen' ? 'h-1/2 flex flex-col justify-center items-center' : ''}`}>
                    {theme.buttonPosition === 'top' && (
                        <button
                            onClick={onAction}
                            className={`w-full py-4 mb-6 transition-all flex items-center justify-center gap-2 ${styles.button} ${size === 'fullscreen' ? 'max-w-md mx-auto text-xl py-6' : ''}`}
                            style={{
                                backgroundColor: theme.colors?.buttonBg,
                                color: theme.colors?.buttonText
                            }}
                        >
                            {config.buttonText} {theme.category !== 'Criativo' && <i className="fas fa-arrow-right"></i>}
                        </button>
                    )}

                    <h2
                        className={`leading-none mb-1 ${styles.title} ${size === 'fullscreen' ? 'text-5xl md:text-7xl' : ''}`}
                        style={{
                            ...fontStyle,
                            fontSize: config.fontSize ? undefined : 'inherit',
                            color: theme.colors?.title
                        }}
                    >
                        {config.title}
                    </h2>
                    {config.subtitle && (
                        <h3 className={`font-bold opacity-80 mb-3 ${size === 'fullscreen' ? 'text-2xl' : 'text-sm'}`}
                            style={{ color: theme.colors?.title, ...fontStyle }}>
                            {config.subtitle}
                        </h3>
                    )}
                    <p
                        className={`whitespace-pre-line ${styles.description} ${size === 'fullscreen' ? 'text-xl max-w-2xl mx-auto' : ''} ${fontSizeClass}`}
                        style={{
                            ...fontStyle,
                            color: theme.colors?.body
                        }}
                    >
                        {config.description}
                    </p>
                    {config.smallNote && (
                        <p className="mt-4 text-[9px] uppercase tracking-widest opacity-40" style={{ color: theme.colors?.body }}>
                            — {config.smallNote} —
                        </p>
                    )}

                    {theme.buttonPosition !== 'top' && (
                        <button
                            onClick={onAction}
                            className={`w-full py-4 transition-all flex items-center justify-center gap-2 ${styles.button} ${size === 'fullscreen' ? 'max-w-md mx-auto text-xl py-6' : ''}`}
                            style={{
                                backgroundColor: theme.colors?.buttonBg,
                                color: theme.colors?.buttonText
                            }}
                        >
                            {config.buttonText} {theme.category !== 'Criativo' && <i className="fas fa-arrow-right"></i>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PromoPopupView;
