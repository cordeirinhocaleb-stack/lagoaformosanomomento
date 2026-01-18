import React from 'react';
import { WidgetProps } from './types';

export const ThermometerWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { leftLabel, rightLabel } = block.settings;
    // const temperature = stats?.average || 50; // Unused, logic uses stats?.average directly in style

    return (
        <div className="py-8 px-4 flex flex-col items-center">
            <div className="relative w-8 h-64 bg-zinc-200 rounded-full border-4 border-zinc-300 overflow-hidden shadow-inner">
                <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out"
                    style={{
                        height: hasInteracted ? `${stats?.average || 50}%` : '50%',
                        backgroundColor: accentColor
                    }}
                ></div>
                {/* Marcas de graduação */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-full h-[1px] bg-zinc-400/50"></div>
                    ))}
                </div>
            </div>

            <input
                type="range"
                min="0" max="100"
                defaultValue="50"
                disabled={hasInteracted}
                className={`mt-8 w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer ${hasInteracted ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ accentColor: accentColor }}
                onMouseUp={(e: any) => onInteract({ value: e.target.value })}
                onTouchEnd={(e: any) => onInteract({ value: e.target.value })}
            />

            <div className="flex justify-between w-full text-xs font-bold uppercase mt-2 text-zinc-400">
                <span>{leftLabel || 'Frio'}</span>
                <span>{rightLabel || 'Quente'}</span>
            </div>

            {hasInteracted && (
                <div className="mt-4 text-center">
                    <span className="text-3xl font-black" style={{ color: accentColor }}>{Math.round(stats?.average || 0)}°</span>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest">Temperatura Média</p>
                </div>
            )}
        </div>
    );
};
