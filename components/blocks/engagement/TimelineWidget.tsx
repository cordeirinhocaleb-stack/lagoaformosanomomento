import React from 'react';
import { WidgetProps } from './types';

export const TimelineWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const events = (block.settings.timelineEvents as any[]) || [];

    if (!events.length) return null;

    return (
        <div className="relative pl-4 py-2 space-y-8 before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-zinc-200">
            {events.map((ev, idx) => (
                <div key={idx} className="relative pl-8 group">
                    {/* Dot */}
                    <div className={`absolute left-0 top-1.5 w-10 h-10 -ml-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center font-bold text-[10px] z-10 transition-colors ${theme.classes.accent} text-white`}>
                        {ev.date.slice(0, 4)} {/* Exibe ano ou parte */}
                    </div>

                    <div className={`p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow ${theme.classes.secondary}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block opacity-60 ${theme.classes.text}`}>{ev.date}</span>
                        <h4 className={`text-lg font-bold mb-2 leading-tight ${theme.classes.text}`}>{ev.title}</h4>
                        <p className={`text-sm opacity-80 leading-relaxed ${theme.classes.text}`}>{ev.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};
