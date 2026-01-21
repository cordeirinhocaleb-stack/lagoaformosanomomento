import React from 'react';
import { WidgetProps } from './types';

export const CTAWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { ctaText, ctaLink } = block.settings;

    const handleClick = () => {
        onInteract({ value: 'click' });
        if (ctaLink) {
            window.open(ctaLink, '_blank');
        }
    };

    return (
        <div className="py-6 flex justify-center">
            <button
                onClick={handleClick}
                className={`group relative px-8 py-4 rounded-xl font-bold text-white shadow-lg overflow-hidden transform hover:scale-105 active:scale-95 transition-all duration-300 ${theme.classes.accent}`}
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center gap-3 text-lg">
                    <span>{ctaText || 'Saiba Mais'}</span>
                    <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </div>
            </button>
            {hasInteracted && <span className="absolute bottom-2 text-[9px] text-zinc-400">Clique registrado</span>}
        </div>
    );
};
