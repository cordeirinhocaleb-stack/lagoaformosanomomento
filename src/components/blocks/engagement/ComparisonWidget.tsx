import React from 'react';
import { WidgetProps } from './types';

export const ComparisonWidget: React.FC<WidgetProps> = ({ block, theme, stats, hasInteracted, onInteract, accentColor }) => {
    const { options } = block.settings; // Or logic from renderComparison

    // block.settings deve ter leftOption/rightOption ou options[0]/options[1]
    // Se usar ImageA/ImageB e LabelA/LabelB das settings do editor:
    const labelA = (block.settings.labelA as string) || (options && (options[0]?.label || options[0])) || 'Opção A';
    const labelB = (block.settings.labelB as string) || (options && (options[1]?.label || options[1])) || 'Opção B';
    const imgA = (block.settings.imageA as string) || (options && typeof options[0] === 'object' ? options[0].image : null);
    const imgB = (block.settings.imageB as string) || (options && typeof options[1] === 'object' ? options[1].image : null);

    const countA = stats?.distribution[labelA] || 0;
    // const countB = stats?.distribution[labelB] || 0; // Unused
    const total = (stats?.total || 0);
    const percentA = total ? Math.round((countA / total) * 100) : 50;
    const percentB = total ? 100 - percentA : 50;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg relative">
                {/* Lado A */}
                <button
                    onClick={() => onInteract({ selectedOption: labelA })}
                    disabled={hasInteracted}
                    className={`relative h-full flex flex-col items-center justify-center transition-all overflow-hidden group ${hasInteracted ? '' : 'hover:brightness-110'}`}
                    style={{
                        width: hasInteracted ? `${percentA}%` : '50%',
                        backgroundColor: accentColor, // Cor primária
                    }}
                >
                    {imgA && <img src={imgA} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt={labelA} />}
                    <div className="relative z-10 p-2 text-center">
                        <span className="font-black text-xl md:text-3xl uppercase tracking-tighter text-white drop-shadow-md">{labelA}</span>
                        {hasInteracted && <span className="block text-2xl font-black text-white mt-2">{percentA}%</span>}
                    </div>
                </button>

                {/* Divisor VS */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white text-zinc-900 font-black rounded-full w-12 h-12 flex items-center justify-center border-4 border-zinc-100 shadow-xl">
                    VS
                </div>

                {/* Lado B */}
                <button
                    onClick={() => onInteract({ selectedOption: labelB })}
                    disabled={hasInteracted}
                    className={`relative h-full flex flex-col items-center justify-center transition-all overflow-hidden group ${hasInteracted ? '' : 'hover:brightness-110'}`}
                    style={{
                        width: hasInteracted ? `${percentB}%` : '50%',
                        backgroundColor: '#3b82f6', // Azul fixo ou secundária
                    }}
                >
                    {imgB && <img src={imgB} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt={labelB} />}
                    <div className="relative z-10 p-2 text-center">
                        <span className="font-black text-xl md:text-3xl uppercase tracking-tighter text-white drop-shadow-md">{labelB}</span>
                        {hasInteracted && <span className="block text-2xl font-black text-white mt-2">{percentB}%</span>}
                    </div>
                </button>
            </div>
            {hasInteracted && (
                <p className="text-center text-xs text-zinc-400 font-medium">{total} votos computados</p>
            )}
        </div>
    );
};
