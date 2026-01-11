
import React from 'react';
import { SIZE_MAP } from '../applyGlobalStyles';

const FONT_MAP: Record<string, string> = {
    serif: 'Merriweather, serif'
};

export const renderQuoteAspas = (variant: string, perStyle: any, baseStyles: React.CSSProperties, Tag: any, contentRef: any, handleInput: () => void) => {
    let variantStyles: React.CSSProperties = {};
    let variantPre = null;
    let variantPost = null;

    // Estilos Fluidos
    const fluidStyles: React.CSSProperties = {
        width: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap'
    };

    if (variant === 'impact_quote') {
        const iq = perStyle.impact_quote || { borderPosition: 'left', borderWidth: 8, color: '#dc2626', backgroundSubtle: true, bigQuotes: true, quoteSize: 'lg', authorAlign: 'right' };

        const iqColor = iq.color || '#dc2626';

        variantStyles = {
            ...fluidStyles,
            borderLeft: iq.borderPosition === 'left' ? `${iq.borderWidth}px solid ${iqColor}` : 'none',
            borderRight: iq.borderPosition === 'right' ? `${iq.borderWidth}px solid ${iqColor}` : 'none',
            backgroundColor: iq.backgroundSubtle ? `${iqColor}0D` : 'transparent',
            padding: '2.5rem',
            borderRadius: '1rem',
            position: 'relative',
            fontSize: SIZE_MAP[iq.quoteSize] || SIZE_MAP.lg,
            fontFamily: FONT_MAP.serif,
            fontStyle: 'italic',
            fontWeight: '900',
            lineHeight: '1.2',
            color: '#111827'
        };
        if (iq.bigQuotes) { variantPre = <i className="fas fa-quote-left absolute top-4 left-4 opacity-20 text-6xl pointer-events-none" style={{ color: iqColor }}></i>; }
        if (iq.author) { variantPost = <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] opacity-60 not-italic break-words" style={{ textAlign: iq.authorAlign || 'right', color: iqColor }}>— {iq.author}</p>; }
    } else if (variant === 'vintage_letter') {
        const vl = perStyle.vintage_letter || { paperTexture: true, tilt: 0 };
        variantStyles = {
            ...fluidStyles,
            backgroundColor: '#fdf6e3',
            padding: '40px',
            border: `2px ${vl.borderStyle || 'dashed'} #d4c4a8`,
            color: '#433422',
            fontFamily: FONT_MAP.serif,
            transform: `rotate(${vl.tilt * 0.5}deg)`,
            boxShadow: vl.paperTexture ? 'inset 0 0 40px rgba(0,0,0,0.05)' : 'none'
        };
        if (vl.signature) { variantPost = <cite className="block text-right mt-8 font-serif italic text-lg opacity-60 break-words">— {vl.signature}</cite>; }
    } else if (variant === 'quote_modern_accent') {
        // Estilo G1/BBC: Borda esquerda grossa e vermelha, fonte sans, limpo
        variantStyles = {
            ...fluidStyles,
            borderLeft: '12px solid #dc2626',
            padding: '1rem 0 1rem 2rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.5rem',
            fontWeight: '700',
            lineHeight: '1.4',
            color: '#1f2937',
            fontStyle: 'normal'
        };
    } else if (variant === 'quote_elegant_editorial') {
        // Estilo Editorial Lux: Centralizado, aspas grandes, fonte serif, elegante
        variantStyles = {
            ...fluidStyles,
            textAlign: 'center',
            padding: '3rem 1rem',
            fontFamily: 'Merriweather, serif',
            fontSize: '1.8rem',
            fontStyle: 'italic',
            lineHeight: '1.5',
            color: '#111827'
        };
        variantPre = <div className="text-6xl text-zinc-300 mb-4 h-8 flex justify-center"><i className="fas fa-quote-left"></i></div>;
    } else if (variant === 'quote_breaking_card') {
        // Estilo Breaking Card: Fundo sutil, badge, borda lateral, fonte impactante
        variantStyles = {
            ...fluidStyles,
            backgroundColor: '#fef2f2',
            borderLeft: '6px solid #b91c1c',
            padding: '2rem',
            borderRadius: '0 1.5rem 1.5rem 0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.25rem',
            fontWeight: '800'
        };
        variantPre = <div className="inline-block bg-red-700 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-3">Citação Direta</div>;
    }

    return (
        <div style={{ ...baseStyles, ...variantStyles }} className="transition-all duration-500 overflow-hidden">
            {variantPre}
            <Tag ref={contentRef} contentEditable onInput={handleInput} className="focus:outline-none min-h-[1.5em] w-full" role="textbox" aria-multiline="true" />
            {variantPost}
        </div>
    );
};
