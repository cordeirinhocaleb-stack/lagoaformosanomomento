
import React from 'react';
import { PromoPopupItemConfig, PopupThemeAdvanced } from '@/types';
import { isSafeUrl } from '@/utils/popupSafety';

interface SlideContentLayerProps {
    item: PromoPopupItemConfig;
    themeConfig: PopupThemeAdvanced;
    theme: any;
    size: any;
    colors: {
        bg: string;
        title: string;
        body: string;
        btnBg: string;
        btnText: string;
    };
    onAction?: (url: string, item?: PromoPopupItemConfig) => void;
}

export const SlideContentLayer: React.FC<SlideContentLayerProps> = ({
    item, themeConfig, theme, size, colors, onAction
}) => {

    // Tratamento de CTA
    const isCtaSafe = isSafeUrl(item.ctaUrl);
    const handleCtaClick = () => {
        if (onAction) { onAction(item.ctaUrl, item as any); }
    };

    const textStyle = item.textStyle || {};
    const fontStyle = {
        fontFamily: textStyle?.fontFamily || theme?.recommendedFontFamily || 'Inter',
        letterSpacing: textStyle?.letterSpacing === 'tighter' ? '-0.05em' : textStyle?.letterSpacing === 'widest' ? '0.1em' : 'normal',
        textAlign: textStyle?.textAlign || 'left',
        textTransform: textStyle?.titleTransform || 'none'
    } as React.CSSProperties;

    const titleSizeClass = { 'xl': 'text-2xl', '2xl': 'text-3xl md:text-4xl', '3xl': 'text-4xl md:text-5xl' }[textStyle?.titleSize || '2xl'] || 'text-2xl';
    const bodySizeClass = { 'sm': 'text-xs', 'md': 'text-sm', 'lg': 'text-base' }[textStyle?.bodySize || 'md'] || 'text-sm';

    // Spacing
    const spacingClass = {
        'compact': 'p-4 md:p-6',
        'normal': 'p-6 md:p-10',
        'comfortable': 'p-8 md:p-14'
    }[themeConfig.spacing];

    // Button Style
    let btnClasses = 'px-8 py-3.5 font-black uppercase tracking-widest text-xs transition-all shadow-xl border-2';
    if (textStyle?.buttonRounded === 'full') { btnClasses += ' rounded-full'; }
    else if (textStyle?.buttonRounded === 'none') { btnClasses += ' rounded-none'; }
    else { btnClasses += ' rounded-xl'; }

    let btnStyle = {};
    if (textStyle?.buttonStyle === 'outline') {
        btnStyle = { borderColor: colors.btnBg, color: colors.btnBg, backgroundColor: 'transparent' };
        btnClasses += ' hover:bg-opacity-10';
    } else if (textStyle?.buttonStyle === 'glass') {
        btnStyle = { borderColor: 'rgba(255,255,255,0.3)', color: colors.btnText, backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' };
    } else {
        btnStyle = { backgroundColor: colors.btnBg, color: colors.btnText, borderColor: colors.btnBg };
        btnClasses += ' hover:scale-105 active:scale-95';
    }

    return (
        <div className={`relative z-20 flex-1 flex flex-col justify-end ${spacingClass} text-${textStyle?.textAlign || 'left'}`}>
            <div className="max-w-xl mx-auto w-full" style={{ marginLeft: textStyle?.textAlign === 'center' ? 'auto' : 0, marginRight: textStyle?.textAlign === 'center' || textStyle?.textAlign === 'right' ? 'auto' : 0 }}>

                {/* Badge Label */}
                {(item.badgeText || theme.defaults?.headerAccent === 'badge') && (
                    <div className="inline-block mb-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm animate-fadeIn"
                        style={{ backgroundColor: colors.btnBg, color: colors.btnText }}>
                        {item.badgeText || 'NEWS'}
                    </div>
                )}

                {theme.buttonPosition === 'top' && item.ctaText && (
                    <button
                        onClick={handleCtaClick}
                        disabled={!isCtaSafe}
                        className={`${btnClasses} mb-6 ${!isCtaSafe ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                        style={btnStyle}
                    >
                        {item.ctaText} {!isCtaSafe && '(Link Inválido)'}
                    </button>
                )}

                <h2
                    className={`leading-[0.9] mb-1 ${titleSizeClass} ${textStyle?.textShadow === 'soft' ? 'drop-shadow-sm' : textStyle?.textShadow === 'strong' ? 'drop-shadow-lg' : ''}`}
                    style={{ ...fontStyle, color: colors.title, fontWeight: textStyle?.titleWeight || '900' }}
                >
                    {item.title}
                </h2>

                {item.subtitle && (
                    <h3 className="text-sm md:text-lg font-bold opacity-80 mb-4 tracking-tight"
                        style={{ color: colors.title, fontFamily: textStyle?.fontFamily }}>
                        {item.subtitle}
                    </h3>
                )}

                {item.body && (
                    <p
                        className={`leading-relaxed mb-6 whitespace-pre-wrap ${bodySizeClass}`}
                        style={{ ...fontStyle, color: colors.body, fontWeight: textStyle?.bodyWeight || '500', textTransform: 'none' }}
                    >
                        {item.body}
                    </p>
                )}

                {theme.buttonPosition !== 'top' && item.ctaText && (
                    <button
                        onClick={handleCtaClick}
                        disabled={!isCtaSafe}
                        className={`${btnClasses} ${!isCtaSafe ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                        style={btnStyle}
                    >
                        {item.ctaText} {!isCtaSafe && '(Link Inválido)'}
                    </button>
                )}

                {item.smallNote && (
                    <div className="mt-6 text-[10px] font-bold opacity-40 uppercase tracking-widest"
                        style={{ color: colors.body }}>
                        — {item.smallNote} —
                    </div>
                )}
            </div>
        </div>
    );
};
