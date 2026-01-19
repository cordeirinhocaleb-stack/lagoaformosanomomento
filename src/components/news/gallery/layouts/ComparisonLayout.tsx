import React from 'react';
import { LayoutProps } from '../types';

export const ComparisonLayout: React.FC<LayoutProps> = ({ items, block, openLightbox, comparisonValue = 50, setComparisonValue }) => (
    <div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden group select-none shadow-2xl animate-fadeIn">
        <img src={items[1]?.url || items[0]?.url} loading="lazy" className="absolute inset-0 w-full h-full object-cover" alt="Depois" />
        <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - (comparisonValue ?? 50)}% 0 0)` }}>
            <img src={items[0]?.url} loading="lazy" className="absolute inset-0 w-full h-full object-cover" alt="Antes" />
        </div>
        <input type="range" min="0" max="100" value={comparisonValue} onChange={(e) => setComparisonValue?.(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40" />

        {/* Slider Handle Premium */}
        <div className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" style={{ left: `${comparisonValue}%` }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-600 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-arrows-left-right text-white text-xl"></i>
            </div>
        </div>
    </div>
);
