import React, { useState } from 'react';
import { WidgetProps } from './types';

export const AccordionWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const items = (block.settings.accordionItems as any[]) || [];
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (idx: number) => {
        setOpenIndex(openIndex === idx ? null : idx);
        if (openIndex !== idx && !hasInteracted) {
            onInteract({ value: `open_${idx}` });
        }
    };

    if (!items.length) return null;

    return (
        <div className="space-y-2">
            {items.map((item, idx) => (
                <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${openIndex === idx ? `${theme.classes.secondary} shadow-md` : 'border-zinc-100'}`}>
                    <button
                        onClick={() => toggle(idx)}
                        className={`w-full flex items-center justify-between p-4 text-left font-bold transition-colors ${openIndex === idx ? theme.classes.wrapper : 'bg-white hover:bg-zinc-50'}`}
                    >
                        <span className={theme.classes.text}>{item.title}</span>
                        <i className={`fas fa-chevron-down transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}></i>
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 bg-white/50 ${openIndex === idx ? 'max-h-96 opacity-100 p-4 border-t border-dashed border-zinc-200' : 'max-h-0 opacity-0'}`}
                    >
                        <p className={`text-sm leading-relaxed opacity-80 ${theme.classes.text}`}>{item.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
