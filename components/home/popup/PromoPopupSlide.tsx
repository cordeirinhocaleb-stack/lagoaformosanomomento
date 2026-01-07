
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
    onAction?: (url: string) => void;
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
        switch(s) {
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

        if (isMobilePreview && isStandardPopup) {return 'w-full h-full rounded-none';} 
        if (isStandardPopup) {return `w-full h-full rounded-none ${desktopClasses}`;}
        return desktopClasses.replace('md:', ''); 
    };

    const sizeClass = getSizeClasses(item.popupSizePreset || 'md');

    // 3. Estilos de Superfície
    let surfaceClass = 'bg-white';
    if (themeConfig.surfaceStyle === 'glass') {surfaceClass = 'bg-white/80 backdrop-blur-xl border border-white/20';}
    if (themeConfig.surfaceStyle === 'outline') {surfaceClass = 'bg-transparent border-4';}
    if (themeConfig.surfaceStyle === 'flat') {surfaceClass = 'bg-white border-0 shadow-none';}
    if (themeConfig.surfaceStyle === 'solid') {surfaceClass = 'bg-white border border-gray-100';}

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
            if (isMobilePreview) {return 'rounded-none';}
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
        if (themeConfig.headerAccent === 'none') {return null;}
        if (themeConfig.headerAccent === 'top_bar') {return <div className="absolute top-0 left-0 right-0 h-2 z-20" style={{ backgroundColor: colors.btnBg }}></div>;}
        if (themeConfig.headerAccent === 'left_bar') {return <div className="absolute top-0 bottom-0 left-0 w-2 z-20" style={{ backgroundColor: colors.btnBg }}></div>;}
        if (themeConfig.headerAccent === 'badge') {return (
            <div className="absolute top-4 left-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg" style={{ backgroundColor: colors.btnBg, color: colors.btnText }}>
                Destaque
            </div>
        );}
        return null;
    };

    // 7. Imagens Seguras
    const imageList = useMemo(() => {
        let rawList: string[] = [];
        if (item.media.images && item.media.images.length > 0) {rawList = item.media.images;}
        return rawList.filter(url => isSafeUrl(url));
    }, [item.media]);

    // 8. Z-Index de Efeitos
    const fxZIndex = effectConfig.placement === 'background' ? 'z-0' : effectConfig.placement === 'over_media' ? 'z-15' : 'z-30';

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
                    
                    {!item.media.imageStyle?.overlayPreset && !item.media.videoSettings?.overlayPreset && (
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
