import React from 'react';
import { MarketItem } from './types';
import lfnmCoin from '@/assets/lfnm_coin.png';

interface MarketShelfProps {
    marketItems: MarketItem[];
    setCartItems: React.Dispatch<React.SetStateAction<MarketItem[]>>;
    handleDragStart: (e: React.DragEvent, item: MarketItem) => void;
    darkMode: boolean;
}

export const MarketShelf: React.FC<MarketShelfProps> = ({
    marketItems,
    setCartItems,
    handleDragStart,
    darkMode
}) => {
    return (
        <div className={`p-4 rounded-xl shadow-sm border h-full ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-3 text-center md:text-left">Arraste itens para o carrinho</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {marketItems.map(item => (
                    <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        // Make click work as "Add to Cart" for mobile/accessibility
                        onClick={() => setCartItems(prev => [...prev, item])}
                        className={`
                            cursor-grab active:cursor-grabbing rounded-xl border overflow-hidden
                            hover:shadow-md transition-all flex flex-row items-center p-3 gap-3
                            group relative h-24 w-full text-left
                            ${darkMode ? 'bg-zinc-900 border-white/5 hover:bg-zinc-800' : 'bg-white border-gray-100 hover:border-gray-300'}
                        `}
                    >
                        {/* Color Indicator Bar (Left) */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color.includes('bg-') ? item.color.split(' ').find(c => c.startsWith('bg-'))?.replace('bg-', 'bg-') : 'bg-gray-200'}`}></div>

                        {/* Icon Container */}
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl shadow-sm ${item.color || 'bg-gray-100 text-gray-500'}`}>
                            <i className={item.icon.includes(' ') ? item.icon : `fas ${item.icon}`}></i>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className={`block text-[10px] font-black uppercase leading-tight mb-1 truncate ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} title={item.name}>
                                {item.name}
                            </span>

                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black w-fit ${darkMode ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                <img src={(typeof lfnmCoin === "object" && lfnmCoin !== null && "src" in lfnmCoin ? lfnmCoin.src : lfnmCoin) || lfnmCoin} alt="$" className="w-3.5 h-3.5 object-contain animate-coin-sm" />
                                {item.cost}
                            </div>
                        </div>

                        {/* Decorative Background Icon (Subtle) */}
                        <i className={`${item.icon.includes(' ') ? item.icon : `fas ${item.icon}`} absolute -bottom-3 -right-3 text-5xl opacity-[0.03] rotate-[-15deg] pointer-events-none ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
                    </div>
                ))}
            </div>
        </div>
    );
};
