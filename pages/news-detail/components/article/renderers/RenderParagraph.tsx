import React from 'react';
import { ContentBlock } from '@/types';

interface RenderParagraphProps {
    block: ContentBlock;
    fontSizeClass: string;
}

export const RenderParagraph: React.FC<RenderParagraphProps> = ({ block, fontSizeClass }) => {
    const pVariant = block.settings?.editorialVariant || 'newspaper_standard';
    const settings = block.settings || {};
    const pSettings = settings.perStyle?.[pVariant] || {};

    if (pVariant === 'editorial_prose') {
        const dropCapClass = "first-letter:float-left first-letter:text-[3.5em] first-letter:leading-[0.8] first-letter:font-black first-letter:mr-3 first-letter:text-zinc-900 dark:first-letter:text-zinc-100";
        return (
            <div className="my-8 py-10 px-6 md:px-12 bg-[#fafaf9] dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800 mx-auto max-w-[65ch] shadow-sm rounded-sm">
                <div
                    className={`${fontSizeClass} font-serif text-[#292524] dark:text-zinc-300 text-justify ${dropCapClass}`}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            </div>
        );
    }

    if (pVariant === 'breaking_brief') {
        return (
            <div className="my-6 pl-6 border-l-4 border-red-600">
                <div className={`${fontSizeClass} font-bold italic text-red-600 dark:text-red-400`} dangerouslySetInnerHTML={{ __html: block.content }} />
            </div>
        );
    }

    if (pVariant === 'footnote') {
        const sizePx = pSettings.sizePx || 13;
        const opacity = pSettings.opacity || 0.7;
        const showBorder = pSettings.showTopBorder !== false;

        return (
            <div
                className={`mt-8 pt-4 ${showBorder ? 'border-t border-gray-200 dark:border-zinc-800' : ''} text-gray-500 italic`}
                style={{ fontSize: `${sizePx}px`, opacity }}
            >
                {pSettings.prefix && pSettings.prefix !== 'none' && (
                    <span className="font-black uppercase text-xs mr-2 text-zinc-900 dark:text-zinc-400 not-italic">
                        {pSettings.prefix}:
                    </span>
                )}
                <span dangerouslySetInnerHTML={{ __html: block.content }} />
            </div>
        );
    }

    if (pVariant === 'tech_neon') {
        const neonColor = pSettings.neonColor || '#00f2ff';
        return (
            <div className="my-8 p-6 rounded-xl border border-white/10 bg-[#0a0a0a]" style={{ boxShadow: `0 0 20px ${neonColor}1a`, borderColor: `${neonColor}33` }}>
                <div className={`${fontSizeClass} font-mono`} style={{ color: neonColor, textShadow: `0 0 10px ${neonColor}` }} dangerouslySetInnerHTML={{ __html: block.content }} />
            </div>
        );
    }

    // Default: Newspaper Standard with Full Options
    const widthClass = pSettings.columnWidth === 'prose' ? 'max-w-[65ch] mx-auto' : '';

    // Configuração de Margem/Gap
    const gapClass = pSettings.paragraphGap === 'compact' ? 'mb-4' : pSettings.paragraphGap === 'relaxed' ? 'mb-10 leading-loose' : 'mb-8';

    // Configuração de Drop Cap (Capitular)
    let dropCapClasses = '';
    if (pSettings.dropCap) {
        const lines = pSettings.dropCapLines || 2;
        // Mapeia linhas para tamanhos aproximados de fonte/leading
        const sizeMap: Record<number, string> = {
            2: 'first-letter:text-5xl first-letter:mt-2',
            3: 'first-letter:text-7xl first-letter:mt-1',
            4: 'first-letter:text-9xl first-letter:mt-0'
        };
        const sizeClass = sizeMap[lines] || sizeMap[2];
        dropCapClasses = `first-letter:float-left first-letter:font-black first-letter:mr-3 ${sizeClass} first-letter:leading-[0.8]`;
    }

    // Hifenização e Justificação
    const alignClass = pSettings.justify ? 'text-justify' : 'text-left';
    const hyphenClass = pSettings.hyphenation === 'on' ? 'hyphens-auto' : '';

    return (
        <div
            className={`${fontSizeClass} text-zinc-800 dark:text-zinc-300 ${gapClass} ${widthClass} ${settings.style === 'serif' ? 'font-serif' : 'font-sans'} ${dropCapClasses} ${alignClass} ${hyphenClass}`}
            dangerouslySetInnerHTML={{ __html: block.content }}
        />
    );
};
