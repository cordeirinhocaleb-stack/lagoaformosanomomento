import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const MasonryLayout: React.FC<LayoutProps> = ({ items, block, openLightbox, uniformSize, getGridColumnsClass, getAspectRatioClass, getObjectFitClass }) => (
    <div className={`${uniformSize ? `grid grid-cols-1 ${getGridColumnsClass?.()} gap-10` : 'columns-1 sm:columns-2 lg:columns-3 gap-10 space-y-10'} animate-fadeIn`}>
        {items.map((item, idx) => (
            <div
                key={item.id}
                className={`break-inside-avoid rounded-[2rem] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative cursor-zoom-in shadow-md ${uniformSize ? '' : 'mb-10'} ${getAspectRatioClass?.()}`}
                onClick={() => openLightbox(idx)}
            >
                <img
                    src={item.url}
                    loading="lazy"
                    className={`w-full h-full transition-all duration-1000 group-hover:scale-110 ${getObjectFitClass?.()}`}
                    alt=""
                />
                <WatermarkOverlay show={!!block.settings.showWatermark} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                    <div className="h-1 w-8 bg-red-600 mb-4 group-hover:w-16 transition-all duration-700"></div>
                    {item.caption && <p className="text-white font-[1000] uppercase italic tracking-tighter text-sm leading-tight">{item.caption}</p>}
                    <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mt-4 block">AMPLIAR IMAGEM</span>
                </div>
            </div>
        ))}
    </div>
);
