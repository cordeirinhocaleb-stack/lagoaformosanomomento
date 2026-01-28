
import React, { useMemo } from 'react';
import { PromoPopupItemConfig, DEFAULT_THEME_ADVANCED, PopupSize, PopupEffectConfig } from '../../../types';
import { POPUP_THEME_CATALOG } from './popupThemeCatalog';
import { isSafeUrl } from '../../../utils/popupSafety';
import { getOverlayPresetClass } from './overlayPresets';
import { SpecialEffectsRenderer } from './slide/SpecialEffectsRenderer';
import { SlideMediaLayer } from './slide/SlideMediaLayer';
import { SlideContentLayer } from './slide/SlideContentLayer';

interface PromoPopupSlideProps {
    item: PromoPopupItemConfig;
    mode: 'live' | 'preview';
    onClose?: () => void;
    onAction?: (url: string, item?: PromoPopupItemConfig) => void;
    className?: string;
    isMobilePreview?: boolean;
}

const PromoPopupSlide: React.FC<PromoPopupSlideProps> = ({
    item, mode, onClose, onAction, className = '', isMobilePreview = false
}) => {

    // 1. Resolve Configuração de Tema e Cores
    const { theme, themeConfig, colors, effectConfig } = useMemo(() => {
        const t = POPUP_THEME_CATALOG.find(x => x.id === item.themePresetId) || POPUP_THEME_CATALOG[0];

        const tc = {
            ...DEFAULT_THEME_ADVANCED,
            ...t.defaults,
            ...item.themeAdvanced
        };

        const ef: PopupEffectConfig = (item.effectConfig && item.effectConfig.enabled)
            ? item.effectConfig
            : (t.specialEffect && t.specialEffect !== 'none'
                ? { enabled: true, type: t.specialEffect, intensity: 'normal', placement: 'over_media', direction: 'top_bottom', opacity: 100 }
                : { enabled: false, type: 'none', intensity: 'normal', placement: 'background', direction: 'top_bottom', opacity: 0 });

        const c = {
            bg: t.colors.background,
            title: item.textStyle?.titleColor || t.colors.title,
            body: item.textStyle?.bodyColor || t.colors.body,
            btnBg: item.textStyle?.buttonColor || t.colors.buttonBg,
            btnText: item.textStyle?.buttonTextColor || t.colors.buttonText
        };

        return { theme: t, themeConfig: tc, colors: c, effectConfig: ef };
    }, [item.themePresetId, item.themeAdvanced, item.effectConfig, item.textStyle]);

    // 2. Lógica de Dimensionamento
    const getSizeClasses = (s: PopupSize) => {
        const isStandardPopup = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(s);
        let desktopClasses = '';
        switch (s) {
            case 'xs': desktopClasses = 'md:w-full md:max-w-[280px] md:h-auto md:max-h-[80%]'; break;
            case 'sm': desktopClasses = 'md:w-full md:max-w-sm md:h-auto md:max-h-[85%]'; break;
            case 'md': desktopClasses = 'md:w-full md:max-w-md md:h-auto md:max-h-[90%]'; break;
            case 'lg': desktopClasses = 'md:w-full md:max-w-lg md:h-auto md:max-h-[95%]'; break;
            case 'xl': desktopClasses = 'md:w-full md:max-w-xl md:h-auto md:max-h-[95%]'; break;
            case '2xl': desktopClasses = 'md:w-full md:max-w-2xl md:h-auto md:max-h-[95%]'; break;
            case 'fullscreen': desktopClasses = 'w-full h-full rounded-none'; break;
            case 'banner_top': desktopClasses = 'w-full max-w-4xl h-auto absolute top-4'; break;
            case 'banner_bottom': desktopClasses = 'w-full max-w-4xl h-auto absolute bottom-4'; break;
            default: desktopClasses = 'md:w-full md:max-w-md md:h-auto'; break;
        }

        if (isMobilePreview && isStandardPopup) { return 'w-full h-full rounded-none'; }
        if (isStandardPopup) { return `w-full h-full rounded-none ${desktopClasses}`; }
        return desktopClasses.replace('md:', '');
    };

    const sizeClass = getSizeClasses(item.popupSizePreset || 'md');

    // 3. Estilos de Superfície
    let surfaceClass = 'bg-white';
    if (themeConfig.surfaceStyle === 'glass') { surfaceClass = 'bg-white/80 backdrop-blur-xl border border-white/20'; }
    if (themeConfig.surfaceStyle === 'outline') { surfaceClass = 'bg-transparent border-4'; }
    if (themeConfig.surfaceStyle === 'flat') { surfaceClass = 'bg-white border-0 shadow-none'; }
    if (themeConfig.surfaceStyle === 'solid') { surfaceClass = 'bg-white border border-gray-100'; }

    const surfaceStyleObj = themeConfig.surfaceStyle === 'outline' ? { borderColor: colors.bg } : { backgroundColor: colors.bg };

    // 4. Radius
    const getRadiusClass = () => {
        const baseRadius = {
            'none': 'rounded-none',
            'soft': 'rounded-2xl',
            'strong': 'rounded-[2.5rem]',
            'full': 'rounded-[3rem]'
        }[themeConfig.borderRadius];

        if (item.popupSizePreset && ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(item.popupSizePreset)) {
            if (isMobilePreview) { return 'rounded-none'; }
            return `rounded-none md:${baseRadius}`;
        }
        return baseRadius;
    };

    // 5. Shadow
    const shadowClass = {
        'none': 'shadow-none',
        'soft': 'shadow-lg',
        'strong': 'shadow-2xl',
        'glow': 'shadow-[0_0_40px_rgba(255,255,255,0.3)]'
    }[themeConfig.shadow];

    // 6. Accent Renderer
    const renderAccent = () => {
        if (themeConfig.headerAccent === 'none') { return null; }
        if (themeConfig.headerAccent === 'top_bar') { return <div className="absolute top-0 left-0 right-0 h-2 z-20" style={{ backgroundColor: colors.btnBg }}></div>; }
        if (themeConfig.headerAccent === 'left_bar') { return <div className="absolute top-0 bottom-0 left-0 w-2 z-20" style={{ backgroundColor: colors.btnBg }}></div>; }
        if (themeConfig.headerAccent === 'badge') {
            return (
                <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg" style={{ backgroundColor: colors.btnBg, color: colors.btnText }}>
                    Destaque
                </div>
            );
        }
        return null;
    };

    // 7. Imagens Seguras
    const imageList = useMemo(() => {
        let rawList: string[] = [];
        if (item.media.images && item.media.images.length > 0) { rawList = item.media.images; }
        return rawList.filter(url => isSafeUrl(url));
    }, [item.media]);

    // 8. Z-Index de Efeitos
    const fxZIndex = effectConfig.placement === 'background' ? 'z-0' : effectConfig.placement === 'over_media' ? 'z-15' : 'z-30';

    // ========================================================================
    // LAYOUT: BANNER TOP
    // ========================================================================
    if (theme.layout === 'banner_top') {
        const borderRadius = item.popupSizePreset === 'fullscreen' ? '0px' : '0px';
        return (
            <div className={`absolute top-0 left-0 w-full z-[9999] p-2 md:p-3 flex justify-center pointer-events-none transition-all duration-500`}>
                <div className="flex items-center gap-4 md:gap-10 px-6 py-2 shadow-2xl pointer-events-auto max-w-4xl w-full border-b-2"
                    style={{ backgroundColor: colors.bg, borderColor: colors.btnBg, borderRadius }}>
                    <span className="font-black uppercase text-[10px] md:text-sm tracking-widest whitespace-nowrap" style={{ color: colors.title, fontFamily: item.textStyle?.fontFamily }}>
                        {item.title}
                    </span>
                    <span className="flex-1 text-xs md:text-sm font-semibold opacity-90 line-clamp-1" style={{ color: colors.body, fontFamily: item.textStyle?.fontFamily }}>
                        {item.body}
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onAction && onAction(item.ctaUrl, item)}
                            className="px-4 py-1.5 md:px-6 md:py-2 text-[9px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                            style={{ backgroundColor: colors.btnBg, color: colors.btnText }}
                        >
                            {item.ctaText}
                        </button>
                        {onClose && (
                            <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100 transition-opacity" style={{ color: colors.title }}>
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (theme.layout === 'monolith') {
        return (
            <div className={`relative ${className} flex items-center justify-center p-4`} onClick={() => onClose && onClose()}>
                <div
                    className={`relative w-full h-full max-w-2xl max-h-[90%] md:aspect-square overflow-hidden bg-black text-white shadow-2xl flex flex-col`}
                    style={{ backgroundColor: colors.bg, borderColor: colors.btnBg }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Media as Texture Background */}
                    <div className="absolute inset-0 z-0 opacity-60 mix-blend-multiply">
                        <SlideMediaLayer item={item} mode={mode} images={imageList} />
                    </div>

                    {/* Content Layer */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-between p-8 md:p-12">
                        <div>
                            <h2
                                className="text-5xl md:text-8xl font-black leading-[0.85] tracking-tighter mix-blend-difference break-words"
                                style={{ color: colors.title, fontFamily: item.textStyle?.fontFamily }}
                            >
                                {item.title.toUpperCase()}
                            </h2>
                        </div>

                        <div className="space-y-6">
                            <p
                                className="text-lg md:text-xl font-medium max-w-md mix-blend-difference"
                                style={{ color: colors.body, fontFamily: item.textStyle?.fontFamily }}
                            >
                                {item.body}
                            </p>
                            <button
                                onClick={() => onAction && onAction(item.ctaUrl, item)}
                                className="w-full py-6 text-xl font-bold border-t-2 border-white/20 hover:bg-white hover:text-black transition-colors uppercase tracking-widest flex justify-between items-center group"
                                style={{ borderColor: colors.btnBg, color: colors.btnText, backgroundColor: colors.btnBg }}
                            >
                                <span>{item.ctaText}</span>
                                <i className="fas fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                            </button>
                        </div>

                        {onClose && (
                            <button onClick={onClose} className="absolute top-0 right-0 p-6 mix-blend-difference text-white hover:rotate-90 transition-transform z-50">
                                <i className="fas fa-times text-4xl"></i>
                            </button>
                        )}
                    </div>

                    <div className="absolute inset-0 pointer-events-none z-20">
                        <SpecialEffectsRenderer config={effectConfig} />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: ASYMMETRIC (90/10 Tension)
    // ========================================================================
    if (theme.layout === 'asymmetric') {
        return (
            <div className={`relative ${className} flex`} onClick={() => onClose && onClose()}>
                <div className={`relative w-full h-full p-4 md:p-8 flex items-end justify-start pointer-events-none`}>
                    {/* Content Box (10% area) */}
                    <div
                        className={`relative z-50 pointer-events-auto bg-black text-white p-6 md:p-8 max-w-md w-full shadow-2xl`}
                        style={{ backgroundColor: colors.bg, borderTop: `4px solid ${colors.btnBg}` }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            className="text-4xl md:text-5xl font-bold mb-4 leading-none tracking-tight"
                            style={{ color: colors.title, fontFamily: item.textStyle?.fontFamily }}
                        >
                            {item.title}
                        </h2>
                        <p
                            className="text-sm opacity-80 mb-6 leading-relaxed"
                            style={{ color: colors.body, fontFamily: item.textStyle?.fontFamily }}
                        >
                            {item.body}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => onAction && onAction(item.ctaUrl, item)}
                                className="flex-1 py-3 px-6 bg-yellow-400 text-black font-bold uppercase text-sm tracking-wider hover:bg-white transition-colors"
                                style={{ backgroundColor: colors.btnBg, color: colors.btnText }}
                            >
                                {item.ctaText}
                            </button>
                            {onClose && (
                                <button onClick={onClose} className="w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white/10 transition-colors text-white bg-black/50">
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Massive Background Media (90% area) - Fixed/Absolute behind */}
                    <div className="absolute inset-0 z-0 pointer-events-auto">
                        <div className="w-full h-full opacity-80">
                            <SlideMediaLayer item={item} mode={mode} images={imageList} />
                        </div>
                        {/* Marquee Effect Optional based on title */}
                        <div className="absolute bottom-[20%] left-0 w-full overflow-hidden opacity-10 pointer-events-none">
                            <div className="whitespace-nowrap text-[8rem] md:text-[10rem] font-black uppercase text-transparent stroke-white" style={{ WebkitTextStroke: '2px white' }}>
                                {item.title} {item.title}
                            </div>
                        </div>
                        <div className="absolute inset-0 pointer-events-none z-10">
                            <SpecialEffectsRenderer config={effectConfig} />
                        </div>
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
            <div className={`relative ${className} flex items-center justify-center`} onClick={() => onClose && onClose()}>
                <div className={`relative w-full max-w-4xl h-[60vh] pointer-events-none`} onClick={(e) => e.stopPropagation()}>
                    {/* Layer 1: Media (Floating somewhere) */}
                    <div className="absolute top-0 right-0 w-2/3 h-2/3 z-0 pointer-events-auto overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl">
                        <SlideMediaLayer item={item} mode={mode} images={imageList} />
                    </div>

                    {/* Layer 2: Text Block (Floating left) */}
                    <div
                        className="absolute bottom-10 left-4 md:left-10 z-10 max-w-sm pointer-events-auto mix-blend-hard-light backdrop-blur-md p-8 shadow-xl"
                        style={{ backgroundColor: `${colors.bg}99` }} // Add opacity
                    >
                        <h2
                            className="text-5xl md:text-6xl font-thin tracking-tighter mb-4"
                            style={{ color: colors.title, fontFamily: item.textStyle?.fontFamily }}
                        >
                            {item.title}
                        </h2>
                        <p
                            className="text-lg font-light mb-8 border-l-2 pl-4 border-current opacity-80"
                            style={{ color: colors.body, fontFamily: item.textStyle?.fontFamily }}
                        >
                            {item.body}
                        </p>
                        <button
                            onClick={() => onAction && onAction(item.ctaUrl, item)}
                            className="px-8 py-3 text-sm font-bold uppercase tracking-[0.2em] border border-current hover:bg-current hover:text-black transition-colors"
                            style={{ color: colors.btnText, borderColor: colors.btnBg }}
                        >
                            {item.ctaText}
                        </button>
                    </div>

                    {/* Layer 3: Close Button (Random spot) */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 z-50 pointer-events-auto w-16 h-16 flex items-center justify-center bg-black text-white hover:bg-red-600 transition-colors shadow-none"
                        >
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    )}

                    <div className="absolute inset-0 pointer-events-none z-20">
                        <SpecialEffectsRenderer config={effectConfig} />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: COVER (Full Image / Banner Style)
    // ========================================================================
    if (theme.layout === 'cover') {
        const borderRadius = themeConfig.borderRadius === 'none' ? '0px' : '24px';

        return (
            <div className={`relative ${className} flex items-center justify-center`} onClick={() => onClose && onClose()}>
                <div
                    className={`relative w-full overflow-hidden shadow-2xl pointer-events-auto group`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: item.popupSizePreset === 'fullscreen' ? '100%' : '550px',
                        height: item.popupSizePreset === 'fullscreen' ? '100%' : '750px', // Taller aspect ratio for cover
                        maxHeight: '90vh',
                        borderRadius: borderRadius
                    }}
                >
                    {/* 1. Full Background Media */}
                    <div className="absolute inset-0 z-0">
                        <SlideMediaLayer item={item} mode={mode} images={imageList} />
                    </div>

                    {/* 2. Gradient Overlay */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* 3. Content - Bottom Aligned */}
                    <div className="absolute bottom-0 left-0 w-full z-20 p-8 md:p-12 flex flex-col items-start">
                        {/* Optional Badge */}
                        {themeConfig.headerAccent === 'badge' && (
                            <div
                                className="mb-4 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg"
                                style={{ backgroundColor: colors.btnBg, color: colors.btnText }}
                            >
                                Destaque
                            </div>
                        )}

                        <h2
                            className="text-4xl md:text-6xl font-black leading-[0.9] mb-4 tracking-tight drop-shadow-xl text-white"
                            style={{ fontFamily: item.textStyle?.fontFamily, color: colors.title }}
                        >
                            {item.title}
                        </h2>

                        <p
                            className="text-lg md:text-xl font-medium opacity-90 mb-8 max-w-sm drop-shadow-md leading-relaxed text-white"
                            style={{ fontFamily: item.textStyle?.fontFamily, color: colors.body }}
                        >
                            {item.body}
                        </p>

                        <button
                            onClick={() => onAction && onAction(item.ctaUrl, item)}
                            className="w-full md:w-auto px-8 py-4 text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all duration-300 shadow-lg"
                            style={{ backgroundColor: colors.btnBg, color: colors.btnText }}
                        >
                            {item.ctaText}
                        </button>
                    </div>

                    {/* 4. Close Button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors border border-white/20"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}

                    <div className="absolute inset-0 pointer-events-none z-20">
                        <SpecialEffectsRenderer config={effectConfig} />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: FEATURE LIST
    // ========================================================================
    if (theme.layout === 'feature_list') {
        const features = item.body.split('|').map(f => f.trim());
        return (
            <div className={`relative ${className} flex items-center justify-center p-4`} onClick={() => onClose && onClose()}>
                <div
                    className={`relative w-full max-w-sm p-8 shadow-2xl overflow-hidden pointer-events-auto flex flex-col`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: colors.bg,
                        borderRadius: '32px',
                        border: colors.btnBg ? `1px solid ${colors.btnBg}30` : 'none'
                    }}
                >
                    {onClose && (
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    )}

                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-8" style={{ color: colors.title, fontFamily: item.textStyle?.fontFamily }}>
                        {item.title}
                    </h2>

                    <div className="space-y-4 mb-10 overflow-y-auto">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.btnBg}20` }}>
                                    <i className="fas fa-check text-[10px]" style={{ color: colors.btnBg }}></i>
                                </div>
                                <span className="text-sm font-bold opacity-90" style={{ color: colors.body, fontFamily: item.textStyle?.fontFamily }}>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => onAction && onAction(item.ctaUrl, item)}
                        className="w-full py-5 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl"
                        style={{ backgroundColor: colors.btnBg, color: colors.btnText, borderRadius: '16px' }}
                    >
                        {item.ctaText}
                    </button>

                    <div className="absolute inset-0 pointer-events-none z-10">
                        <SpecialEffectsRenderer config={effectConfig} />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // LAYOUT: COUNTDOWN
    // ========================================================================
    if (theme.layout === 'countdown') {
        return (
            <div className={`relative ${className} flex items-center justify-center p-4`} onClick={() => onClose && onClose()}>
                <div
                    className={`relative w-full max-w-sm p-8 text-center shadow-2xl pointer-events-auto flex flex-col`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ backgroundColor: colors.bg, borderRadius: '40px' }}
                >
                    <div className="mb-6 flex justify-center">
                        <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-wider mb-2" style={{ color: colors.title, fontFamily: item.textStyle?.fontFamily }}>
                        {item.title}
                    </h2>

                    <p className="text-sm font-bold opacity-80 mb-8" style={{ color: colors.body, fontFamily: item.textStyle?.fontFamily }}>
                        {item.body}
                    </p>

                    <div className="flex justify-center gap-3 mb-10">
                        {['23', '59', '42'].map((unit, i) => (
                            <div key={i} className="flex flex-col gap-1 items-center">
                                <div className="w-12 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl font-black border border-white/10"
                                    style={{ color: colors.title }}>
                                    {unit}
                                </div>
                                <span className="text-[7px] font-bold uppercase opacity-40 px-1" style={{ color: colors.body }}>
                                    {i === 0 ? 'Hrs' : i === 1 ? 'Min' : 'Seg'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => onAction && onAction(item.ctaUrl, item)}
                        className="w-full py-4 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                        style={{ backgroundColor: colors.btnBg, color: colors.btnText, borderRadius: '99px' }}
                    >
                        {item.ctaText}
                    </button>

                    {onClose && (
                        <button onClick={onClose} className="mt-6 text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity" style={{ color: colors.body }}>
                            Não gostaria, obrigado
                        </button>
                    )}

                    <div className="absolute inset-0 pointer-events-none z-10">
                        <SpecialEffectsRenderer config={effectConfig} />
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================================
    // DEFAULT LAYOUT
    // ========================================================================
    return (
        <div
            className={`relative ${className} flex items-center justify-center p-4`}
            onClick={() => onClose && onClose()}
        >
            <div
                className={`relative flex flex-col overflow-hidden pointer-events-auto ${sizeClass} ${surfaceClass} ${getRadiusClass()} ${shadowClass}`}
                style={surfaceStyleObj}
                onClick={(e) => e.stopPropagation()}
            >
                {/* FX LAYER */}
                <div className={`absolute inset-0 pointer-events-none ${fxZIndex}`}>
                    <SpecialEffectsRenderer config={effectConfig} />
                </div>

                {renderAccent()}

                {/* MEDIA LAYER */}
                <div className="relative z-0 min-h-[150px] flex-shrink-0">
                    <SlideMediaLayer item={item} mode={mode} images={imageList} />

                    {!item.media?.imageStyle?.overlayPreset && !item.media?.videoSettings?.overlayPreset && (
                        <div className={`absolute inset-0 pointer-events-none z-10 ${getOverlayPresetClass(theme.overlayPreset)}`}></div>
                    )}
                </div>

                {/* CLOSE BTN */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg border border-white/20"
                        title="Fechar"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}

                {/* CONTENT LAYER */}
                <SlideContentLayer
                    item={item}
                    themeConfig={themeConfig}
                    theme={theme}
                    size={item.popupSizePreset}
                    colors={colors}
                    onAction={onAction}
                />
            </div>
        </div>
    );
};

export default PromoPopupSlide;
