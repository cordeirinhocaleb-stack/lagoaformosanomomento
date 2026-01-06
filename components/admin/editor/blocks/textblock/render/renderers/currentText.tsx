
import React from 'react';

const FONT_MAP: Record<string, string> = {
    serif: 'Merriweather, serif',
    mono: 'JetBrains Mono, monospace'
};

export const renderCurrentText = (variant: string, perStyle: any, baseStyles: React.CSSProperties, Tag: any, contentRef: any, handleInput: () => void) => {
    let variantStyles: React.CSSProperties = {};
    let variantClasses = "";
    let variantPre = null;

    // Estilos Base para Adaptação de Largura
    const fluidStyles: React.CSSProperties = {
        width: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap'
    };

    if (variant === 'newspaper_standard') {
        const ns = perStyle.newspaper_standard || { columnWidth: 'full', paragraphGap: 'normal', dropCap: false, dropCapLines: 2, hyphenation: 'off', justify: false };
        variantStyles = {
            ...fluidStyles,
            maxWidth: ns.columnWidth === 'prose' ? '65ch' : '100%',
            margin: ns.columnWidth === 'prose' ? '0 auto' : '0',
            textAlign: ns.justify ? 'justify' : baseStyles.textAlign,
            hyphens: ns.hyphenation === 'on' ? 'auto' : 'none',
            fontFamily: FONT_MAP.serif,
            lineHeight: '1.8',
        };
        variantClasses = `newspaper-variant gap-${ns.paragraphGap} ${ns.dropCap ? `drop-cap lines-${ns.dropCapLines}` : ''}`;
    } else if (variant === 'footnote') {
        const fn = perStyle.footnote || { prefix: 'none', opacity: 0.7, sizePx: 13, italic: true };
        variantStyles = { ...fluidStyles, fontSize: `${fn.sizePx}px`, opacity: fn.opacity, borderTop: fn.showTopBorder ? '1px solid #e5e7eb' : 'none', paddingTop: '16px', marginTop: '24px', fontStyle: fn.italic ? 'italic' : 'normal', color: '#6b7280' };
        if (fn.prefix !== 'none') variantPre = <span className="font-black uppercase text-[10px] mr-2 text-zinc-900 not-italic">{fn.prefix}:</span>;
    } else if (variant === 'tech_neon') {
        const tn = perStyle.tech_neon || { neonColor: '#00f2ff', glow: 1, panel: 'none', mono: true };
        const nColor = tn.neonColor || '#00f2ff';
        let shadow = 'none';
        if (tn.glow === 1) shadow = `0 0 10px ${nColor}`;
        else if (tn.glow === 2) shadow = `0 0 10px ${nColor}, 0 0 20px ${nColor}`;
        else if (tn.glow === 3) shadow = `0 0 10px ${nColor}, 0 0 20px ${nColor}, 0 0 40px ${nColor}`;
        variantStyles = { ...fluidStyles, color: nColor, fontFamily: tn.mono ? FONT_MAP.mono : 'inherit', textShadow: shadow, backgroundColor: tn.panel === 'dark' ? 'rgba(10, 10, 10, 0.95)' : 'transparent', padding: tn.panel === 'dark' ? '24px' : '0px', borderRadius: '16px', border: tn.panel === 'dark' ? `1px solid ${nColor}33` : 'none', letterSpacing: '0.05em' };
    }

    return (
        <div style={{ ...baseStyles, ...variantStyles }} className={`${variantClasses} transition-all duration-500 overflow-hidden`}>
            {variantPre}
            <Tag ref={contentRef} contentEditable onInput={handleInput} className="focus:outline-none min-h-[1.5em] w-full" role="textbox" aria-multiline="true" />
        </div>
    );
};
