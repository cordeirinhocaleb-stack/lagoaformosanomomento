import React from 'react';
import { WidgetProps } from './types';

export const QuizWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor, selectedOption }) => {
    const { options, correctOptionIndex } = block.settings;
    if (!options) return null;

    return (
        <div className="space-y-3">
            {options.map((opt: string | { label: string, image?: string }, idx: number) => {
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const isCorrect = idx === correctOptionIndex;
                const isSelected = selectedOption === optLabel || selectedOption === opt;

                let borderClass = 'border-zinc-200';
                let bgClass = 'bg-white';
                let icon = null;

                if (hasInteracted) {
                    if (isCorrect) {
                        borderClass = 'border-green-500';
                        bgClass = 'bg-green-50';
                        icon = <i className="fas fa-check text-green-600"></i>;
                    } else if (isSelected) {
                        borderClass = 'border-red-500';
                        bgClass = 'bg-red-50';
                        icon = <i className="fas fa-times text-red-600"></i>;
                    } else {
                        bgClass = 'bg-zinc-50 opacity-50';
                    }
                }

                return (
                    <button
                        key={idx}
                        onClick={() => onInteract({ selectedOption: optLabel })}
                        disabled={hasInteracted}
                        className={`relative w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between overflow-hidden ${borderClass} ${bgClass} ${!hasInteracted && 'hover:shadow-md hover:scale-[1.01]'}`}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            {typeof opt === 'object' && opt.image && (
                                <div className="w-10 h-10 rounded-full bg-cover bg-center border border-black/10 shrink-0" style={{ backgroundImage: `url(${opt.image})` }}></div>
                            )}
                            <span className={`font-bold text-zinc-800 ${typeof opt === 'object' && opt.image ? 'text-sm' : ''}`}>{optLabel}</span>
                        </div>
                        {icon}
                    </button>
                );
            })}
        </div>
    );
};
