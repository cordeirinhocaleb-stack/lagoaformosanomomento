import React from 'react';
import { WidgetProps } from './types';

export const SliderWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { leftLabel, rightLabel } = block.settings;

    return (
        <div className="py-6 px-2">
            <div className="flex justify-between text-2xl mb-4 text-zinc-400">
                <span>{leftLabel || '👎'}</span>
                <span>{rightLabel || '👍'}</span>
            </div>
            <input
                type="range"
                min="0" max="100"
                defaultValue="50"
                className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: accentColor }}
                onMouseUp={(e: any) => onInteract({ value: e.target.value })}
                onTouchEnd={(e: any) => onInteract({ value: e.target.value })}
            />
            {hasInteracted && (
                <p className="text-center text-xs font-bold mt-2" style={{ color: accentColor }}>Voto registrado!</p>
            )}
        </div>
    );
};
