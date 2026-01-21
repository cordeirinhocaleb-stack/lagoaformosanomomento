import React from 'react';
import { WidgetProps } from './types';

export const PollWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor, selectedOption }) => {
    const { options } = block.settings;
    if (!options) return null;

    return (
        <div className="space-y-3">
            {options.map((opt: string | { label: string, image?: string }, idx: number) => {
                const optLabel = typeof opt === 'string' ? opt : opt.label;
                const count = stats?.distribution[optLabel] || 0;
                const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                const isSelected = selectedOption === optLabel || selectedOption === opt; // Fix logic

                return (
                    <button
                        key={idx}
                        onClick={() => onInteract({ selectedOption: optLabel })}
                        disabled={hasInteracted}
                        className={`relative w-full text-left p-4 transition-all overflow-hidden ${theme.classes.option || 'rounded-xl border-2 border-zinc-200 hover:bg-white hover:shadow-md'
                            } ${hasInteracted && !isSelected ? 'opacity-60' : ''}`}
                        style={{
                            borderColor: hasInteracted && isSelected ? accentColor : undefined,
                            backgroundColor: hasInteracted && isSelected ? `${accentColor}10` : undefined,
                        }}
                    >
                        {hasInteracted && (
                            <div
                                className={theme.classes.barStyle || 'absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out opacity-20'}
                                style={{
                                    width: `${percent}%`,
                                    backgroundColor: theme.classes.barStyle ? undefined : (isSelected ? accentColor : '#e4e4e7'),
                                    position: theme.classes.barStyle ? 'absolute' : undefined,
                                    left: theme.classes.barStyle ? 0 : undefined,
                                    top: theme.classes.barStyle ? 0 : undefined,
                                    bottom: theme.classes.barStyle ? 0 : undefined
                                }}
                            />
                        )}

                        <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                {typeof opt === 'object' && opt.image && (
                                    <div className="w-8 h-8 rounded-full bg-cover bg-center border border-white/40 shadow-sm" style={{ backgroundImage: `url(${opt.image})` }}></div>
                                )}
                                <span className={`font-bold ${isSelected ? theme.classes.text : 'text-zinc-800'}`}>{optLabel}</span>
                            </div>
                            {hasInteracted && (
                                <span className="font-black text-xs" style={{ color: accentColor }}>{percent}% ({count})</span>
                            )}
                        </div>
                    </button>
                );
            })}
            {hasInteracted && (
                <p className="text-center text-xs text-zinc-400 mt-2 font-medium">{stats?.total || 0} votos computados</p>
            )}
        </div>
    );
};
