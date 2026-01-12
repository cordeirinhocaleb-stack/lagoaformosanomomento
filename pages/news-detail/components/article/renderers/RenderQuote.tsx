import React from 'react';
import { ContentBlock } from '@/types';
import { sanitize } from '@/utils/sanitizer';

interface RenderQuoteProps {
    block: ContentBlock;
}

export const RenderQuote: React.FC<RenderQuoteProps> = ({ block }) => {
    const quoteVariant = block.settings?.editorialVariant || 'impact_quote';
    const qSettings = block.settings || {};
    const qPerStyle = qSettings.perStyle || {};
    const qStyle = qPerStyle[quoteVariant] || {};

    const fluidStyles: React.CSSProperties = { width: '100%', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' };

    if (quoteVariant === 'impact_quote') {
        const iq = {
            ...{
                borderPosition: 'left',
                borderWidth: 8,
                color: '#dc2626',
                backgroundSubtle: true,
                bigQuotes: true,
                quoteSize: 'lg',
                authorAlign: 'right'
            },
            ...qStyle
        };
        const iqColor = iq.color || '#dc2626';

        // Size Classes
        const fontSize = iq.quoteSize === 'xl' ? '1.5rem' : iq.quoteSize === 'sm' ? '1rem' : iq.quoteSize === 'md' ? '1.125rem' : '1.25rem';

        return (
            <div className="my-10 relative rounded-2xl overflow-hidden transition-all" style={{
                ...fluidStyles,
                borderLeft: iq.borderPosition === 'left' ? `${iq.borderWidth}px solid ${iqColor}` : 'none',
                borderRight: iq.borderPosition === 'right' ? `${iq.borderWidth}px solid ${iqColor}` : 'none',
                backgroundColor: iq.backgroundSubtle ? `${iqColor}0D` : 'transparent', // 0D = 5% opacity
                padding: '2.5rem',
            }}>
                {iq.bigQuotes && <i className="fas fa-quote-left absolute top-4 left-4 opacity-20 text-6xl pointer-events-none" style={{ color: iqColor }}></i>}
                <div style={{ fontSize, fontFamily: 'Merriweather, serif', fontStyle: 'italic', fontWeight: 900, lineHeight: 1.2, color: '#111827' }} dangerouslySetInnerHTML={{ __html: block.content }} />
                {iq.author && <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] opacity-60 not-italic break-words" style={{ textAlign: iq.authorAlign, color: iqColor }}>— {iq.author}</p>}
            </div>
        );
    }

    if (quoteVariant === 'vintage_letter') {
        const vl = { ...{ paperTexture: true, tilt: 0, borderStyle: 'dashed', signature: '' }, ...qStyle };
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
    }

    if (quoteVariant === 'quote_modern_accent') {
        return (
            <div className="my-10 pl-8 border-l-[12px] border-red-600 font-sans text-2xl font-bold text-gray-800 leading-snug" style={fluidStyles} dangerouslySetInnerHTML={{ __html: block.content }} />
        );
    }

    if (quoteVariant === 'quote_breaking_card') {
        return (
            <div className="my-10 bg-red-50 border-l-[6px] border-red-700 p-8 rounded-r-3xl shadow-sm" style={fluidStyles}>
                <div className="inline-block bg-red-700 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-3">Citação</div>
                <div
                    className="font-serif text-lg md:text-xl leading-relaxed text-zinc-800"
                    dangerouslySetInnerHTML={{ __html: sanitize(block.content) }}
                />
            </div>
        );
    }

    // Default fallback
    return (
        <blockquote className="border-l-[10px] border-red-600 bg-gray-50 dark:bg-zinc-900/40 p-8 md:p-12 rounded-r-2xl my-10 relative overflow-hidden group">
            <i className="fas fa-quote-right text-gray-200 dark:text-zinc-800 text-7xl absolute -bottom-8 right-4 pointer-events-none opacity-50"></i>
            <div className="text-xl md:text-2xl font-black italic text-zinc-900 dark:text-zinc-100 relative z-10 font-serif leading-tight" dangerouslySetInnerHTML={{ __html: block.content }} />
        </blockquote>
    );
};
