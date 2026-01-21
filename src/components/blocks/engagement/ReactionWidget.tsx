import React from 'react';
import { WidgetProps } from './types';

export const ReactionWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { reactionEmojis } = block.settings;
    const emojis = (reactionEmojis || '👍,❤️,😂,😮,😢,😡').split(',');

    return (
        <div className="flex flex-wrap gap-4 justify-center py-4">
            {emojis.map((emoji: string, idx: number) => {
                const count = stats?.distribution[emoji.trim()] || 0;
                return (
                    <button
                        key={idx}
                        onClick={() => onInteract({ value: emoji.trim() })}
                        className="flex flex-col items-center gap-1 group transition-transform active:scale-125 shadow-none hover:shadow-none border-none bg-transparent"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform filter drop-shadow-sm">{emoji.trim()}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>{count}</span>
                    </button>
                );
            })}
        </div>
    );
};
