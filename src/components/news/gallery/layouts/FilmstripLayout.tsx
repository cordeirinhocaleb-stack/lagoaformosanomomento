import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const FilmstripLayout: React.FC<LayoutProps> = ({ items, block, openLightbox, activeIndex = 0, setActiveIndex }) => (
    <div className="space-y-10">
        <div
            className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-zinc-950 relative cursor-zoom-in group shadow-2xl"
            onClick={() => openLightbox(activeIndex)}
        >
            <img src={items[activeIndex].url} loading="lazy" className="w-full h-full object-contain transition-all duration-1000 group-hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <WatermarkOverlay show={!!block.settings.showWatermark} />

            <div className="absolute bottom-12 left-12 right-12 animate-fadeIn">
                <div className="w-12 h-1.5 bg-red-800 mb-6 skew-x-[-15deg]"></div>
                {items[activeIndex].caption && (
                    <p className="text-white font-[1000] uppercase italic text-2xl md:text-5xl tracking-tighter leading-[0.8] drop-shadow-2xl">{items[activeIndex].caption}</p>
                )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 bg-red-800 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
                    <i className="fas fa-expand text-2xl"></i>
                </div>
            </div>
        </div>
        <div className="flex gap-6 overflow-x-auto py-6 scrollbar-hide snap-x px-2">
            {items.map((item, idx) => (
                <button
                    key={item.id}
                    onClick={() => setActiveIndex?.(idx)}
                    className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden transition-all duration-500 snap-start border-4 ${activeIndex === idx ? 'border-red-800 scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100 shadow-sm'}`}
                >
                    <img src={item.url} loading="lazy" className="w-full h-full object-cover" alt="" />
                </button>
            ))}
        </div>
    </div>
);
