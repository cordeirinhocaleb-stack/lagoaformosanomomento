import React from 'react';
import { WidgetProps } from './types';

export const CounterWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { clickEmoji, buttonText } = block.settings;
    const total = stats?.total || 0;

    return (
        <div className="flex flex-col items-center justify-center py-6">
            <button
                onClick={() => onInteract({ value: 'click' })}
                className="group relative text-white w-24 h-24 rounded-full shadow-xl flex items-center justify-center text-3xl transition-transform active:scale-95 hover:brightness-110 overflow-hidden"
                style={{ backgroundColor: accentColor }}
            >
                <span className="relative z-10 group-active:scale-150 transition-transform block">{clickEmoji || '❤️'}</span>
                <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-300"></div>
            </button>
            <div className="mt-4 text-center">
                <span className="block text-2xl font-black text-zinc-900">{total}</span>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{buttonText || 'Apoios'}</span>
            </div>
        </div>
    );
};
