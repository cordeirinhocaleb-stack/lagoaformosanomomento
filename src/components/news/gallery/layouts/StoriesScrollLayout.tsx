import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const StoriesScrollLayout: React.FC<LayoutProps> = ({ items, block, openLightbox }) => (
    <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x px-8 -mx-8">
        {items.map((item, idx) => (
            <div
                key={item.id}
                className="flex-shrink-0 w-[260px] md:w-[300px] aspect-[9/16] rounded-[2rem] overflow-hidden snap-start relative group cursor-zoom-in shadow-2xl"
                onClick={() => openLightbox(idx)}
            >
                <img src={item.url} loading="lazy" className="w-full h-full object-cover transition-all duration-[3000ms] group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <WatermarkOverlay show={!!block.settings.showWatermark} />

                <div className="absolute bottom-12 left-10 right-10 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                    <div className="w-10 h-1 bg-red-600 mb-6 skew-x-[-15deg]"></div>
                    {item.caption && <p className="text-white text-2xl font-[1000] uppercase italic tracking-tighter leading-none drop-shadow-2xl">{item.caption}</p>}
                    <p className="mt-6 text-[8px] text-white/50 font-black uppercase tracking-[0.5em] flex items-center gap-2">
                        <i className="fas fa-hand-pointer text-red-600"></i> TOQUE PARA EXPANDIR
                    </p>
                </div>
            </div>
        ))}
    </div>
);
