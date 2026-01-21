import React from 'react';
import { WidgetProps } from './types';

export const TestimonialWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { testimonialText, authorName, authorImage } = block.settings;

    return (
        <div className="py-2 px-6 text-center italic relative">
            <i className={`fas fa-quote-left text-4xl absolute -top-2 left-4 opacity-10 ${theme.classes.text}`}></i>

            <p className={`text-xl md:text-2xl font-serif mb-6 leading-relaxed opacity-90 ${theme.classes.text}`}>
                "{testimonialText}"
            </p>

            <div className="flex flex-col items-center gap-2 not-italic">
                <div className={`w-12 h-12 rounded-full overflow-hidden shadow-md border-2 ${theme.classes.secondary} bg-zinc-100 flex items-center justify-center`}>
                    {authorImage ? (
                        <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                        <span className={`font-bold text-lg ${theme.classes.text}`}>{authorName ? authorName[0] : '?'}</span>
                    )}
                </div>
                <div>
                    <span className={`block font-bold text-sm ${theme.classes.text}`}>{authorName || 'Autor'}</span>
                    <span className="text-[10px] uppercase opacity-50 tracking-wider font-bold">Leitor Verificado</span>
                </div>
            </div>
        </div>
    );
};
