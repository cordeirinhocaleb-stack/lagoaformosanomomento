import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const SpotlightLayout: React.FC<LayoutProps> = ({ items, block, openLightbox }) => (
    <div className="flex flex-col gap-10 group animate-fadeIn">
        <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl cursor-zoom-in" onClick={() => openLightbox(0)}>
            {/* Ambient Glow Background */}
            <div className="absolute inset-0 pointer-events-none opacity-40 blur-[80px] scale-150">
                <img src={items[0]?.url} className="w-full h-full object-cover" alt="" />
            </div>

            <img src={items[0]?.url} loading="lazy" className="relative z-10 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20"></div>

            {/* Spotlight Header Badge */}
            <div className="absolute top-8 left-8 z-30">
                <div className="bg-red-800 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 skew-x-[-10deg]">
                    <i className="fas fa-star text-[8px] animate-pulse"></i>
                    DESTAQUE EDITORIAL
                </div>
            </div>

            <WatermarkOverlay show={!!block.settings.showWatermark} />

            <div className="absolute bottom-10 left-10 right-10 z-30 animate-fadeIn">
                <div className="w-12 h-1.5 bg-red-800 mb-4 skew-x-[-15deg]"></div>
                {items[0].caption && (
                    <p className="text-white text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl">{items[0].caption}</p>
                )}
                <p className="mt-4 text-[10px] text-white/40 font-black uppercase tracking-[0.5em]">Clique para expandir galeria</p>
            </div>
        </div>

        {/* Thumbnail Navigation */}
        {items.length > 1 && (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {items.slice(1).map((item, idx) => (
                    <div
                        key={item.id}
                        onClick={() => openLightbox(idx + 1)}
                        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-white/5 hover:border-red-800 transition-all cursor-pointer group/thumb"
                    >
                        <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" alt="" />
                    </div>
                ))}
            </div>
        )}
    </div>
);
