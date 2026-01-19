import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const HeroSliderLayout: React.FC<LayoutProps> = ({ items, block, openLightbox, activeIndex = 0, setActiveIndex }) => (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden group rounded-[2.5rem] shadow-2xl">
        {items.map((item, idx) => (
            <div
                key={item.id}
                className={`absolute inset-0 transition-all duration-1000 transform ${idx === activeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
                onClick={() => openLightbox(idx)}
            >
                <img src={item.url} loading="lazy" width="1280" height="720" className="w-full h-full object-cover cursor-zoom-in" alt={item.alt} />
                <div className="absolute inset-0 bg-black/30 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <WatermarkOverlay show={!!block.settings.showWatermark} />
                {item.caption && (
                    <div className="absolute bottom-12 left-12 right-12 text-white animate-fadeIn">
                        <div className="w-12 h-1.5 bg-red-800 mb-6 skew-x-[-15deg]"></div>
                        <p className="text-3xl md:text-6xl font-[1000] uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl max-w-2xl">{item.caption}</p>
                    </div>
                )}
            </div>
        ))}
        {/* Cinematic Arrows */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 transition-all">
            <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex?.((prev) => (prev - 1 + items.length) % items.length); }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full w-14 h-20 flex items-center justify-center text-white hover:bg-red-800 transition-all transform active:scale-90"
            >
                <i className="fas fa-chevron-left"></i>
            </button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 transition-all">
            <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex?.((prev) => (prev + 1) % items.length); }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full w-14 h-20 flex items-center justify-center text-white hover:bg-red-800 transition-all transform active:scale-90"
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>

        <div className="absolute bottom-12 right-12 z-20 flex gap-2">
            {items.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-12 bg-red-800 shadow-[0_0_20px_#dc2626]' : 'w-3 bg-white/20'}`}></div>
            ))}
        </div>
    </div >
);
