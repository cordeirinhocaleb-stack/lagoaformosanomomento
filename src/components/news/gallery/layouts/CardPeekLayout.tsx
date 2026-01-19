import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const CardPeekLayout: React.FC<LayoutProps> = ({ items, block, openLightbox }) => (
    <div className="flex gap-10 overflow-x-auto pb-20 scrollbar-hide snap-x px-12 -mx-12">
        {items.map((item, idx) => (
            <div
                key={item.id}
                className="flex-shrink-0 w-[90%] md:w-[70%] aspect-[16/10] rounded-[3rem] overflow-hidden snap-center relative transition-all duration-1000 hover:scale-[1.02] cursor-zoom-in group shadow-2xl"
                onClick={() => openLightbox(idx)}
            >
                <img src={item.url} loading="lazy" className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <WatermarkOverlay show={!!block.settings.showWatermark} />

                <div className="absolute bottom-16 left-16 right-16 transition-all duration-1000 translate-y-6 group-hover:translate-y-0">
                    <div className="bg-red-600 w-16 h-2 mb-8 skew-x-[-15deg]"></div>
                    {item.caption && (
                        <p className="text-white text-4xl md:text-7xl font-[1000] uppercase italic tracking-tighter leading-[0.7] drop-shadow-2xl">{item.caption}</p>
                    )}
                    <p className="mt-8 text-[11px] text-white/50 font-black uppercase tracking-[0.6em] flex items-center gap-4">
                        VER DETALHES <i className="fas fa-arrow-right text-red-600"></i>
                    </p>
                </div>
            </div>
        ))}
    </div>
);
