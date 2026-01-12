
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
        if (fn.prefix !== 'none') { variantPre = <span className="font-black uppercase text-[10px] mr-2 text-zinc-900 not-italic">{fn.prefix}:</span>; }
    } else if (variant === 'tech_neon') {
        const tn = perStyle.tech_neon || { neonColor: '#00f2ff', glow: 1, panel: 'none', mono: true };
        const nColor = tn.neonColor || '#00f2ff';
        let shadow = 'none';
        if (tn.glow === 1) { shadow = `0 0 10px ${nColor}`; }
        else if (tn.glow === 2) { shadow = `0 0 10px ${nColor}, 0 0 20px ${nColor}`; }
        else if (tn.glow === 3) { shadow = `0 0 10px ${nColor}, 0 0 20px ${nColor}, 0 0 40px ${nColor}`; }
        variantStyles = { ...fluidStyles, color: nColor, fontFamily: tn.mono ? FONT_MAP.mono : 'inherit', textShadow: shadow, backgroundColor: tn.panel === 'dark' ? 'rgba(10, 10, 10, 0.95)' : 'transparent', padding: tn.panel === 'dark' ? '24px' : '0px', borderRadius: '16px', border: tn.panel === 'dark' ? `1px solid ${nColor}33` : 'none', letterSpacing: '0.05em' };
    } else if (variant === 'standard_clean') {
        const ns = perStyle.standard_clean || { fontSize: '1.125rem', lineHeight: '1.75' };
        variantStyles = { ...fluidStyles, fontSize: ns.fontSize, lineHeight: ns.lineHeight, fontFamily: 'sans-serif', color: '#1f2937' };
    } else if (variant === 'editorial_prose') {
        const ep = perStyle.editorial_prose || { fontSize: '1.25rem', lineHeight: '1.8' };
        variantStyles = {
            ...fluidStyles,
            fontSize: ep.fontSize,
            lineHeight: ep.lineHeight,
            fontFamily: FONT_MAP.serif,
            color: '#292524',
            maxWidth: '65ch',
            margin: '1.5rem auto',
            padding: '2.5rem 3rem',
            backgroundColor: '#fafaf9',
            borderTop: '1px solid #e7e5e4',
            borderBottom: '1px solid #e7e5e4'
        };
        variantClasses = "first-letter:float-left first-letter:text-[3.5em] first-letter:leading-[0.8] first-letter:font-black first-letter:mr-3 first-letter:text-zinc-900 text-justify shadow-sm rounded-sm";
    } else if (variant === 'breaking_brief') {
        const bb = perStyle.breaking_brief || { fontSize: '1.125rem', fontWeight: '600' };
        variantStyles = { ...fluidStyles, fontSize: bb.fontSize, fontWeight: bb.fontWeight, color: '#dc2626', borderLeft: '4px solid #dc2626', paddingLeft: '1rem', fontStyle: 'italic' };
    }

    return (
        <div style={{ ...baseStyles, ...variantStyles }} className={`${variantClasses} transition-all duration-500 overflow-hidden`}>
            {variantPre}
            <Tag ref={contentRef} contentEditable onInput={handleInput} className="focus:outline-none min-h-[1.5em] w-full" role="textbox" aria-multiline="true" />
        </div>
    );
};
