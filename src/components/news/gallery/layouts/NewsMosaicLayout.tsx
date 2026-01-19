import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const NewsMosaicLayout: React.FC<LayoutProps> = ({ items, block, openLightbox }) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full group">
        <div
            className="md:col-span-8 rounded-[2rem] overflow-hidden relative group/item cursor-zoom-in min-h-[450px] md:min-h-0 shadow-lg"
            onClick={() => openLightbox(0)}
        >
            <img src={items[0]?.url} loading="lazy" className="w-full h-full object-cover transition-all duration-1000 group-hover/item:scale-105" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <WatermarkOverlay show={!!block.settings.showWatermark} />

            <div className="absolute bottom-10 left-10 transition-all duration-700">
                <div className="w-12 h-1.5 bg-red-800 mb-4 skew-x-[-15deg]"></div>
                <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] mb-2 block opacity-80">VER DESTAQUE</span>
                <i className="fas fa-search-plus text-white text-3xl"></i>
            </div>
        </div>
        <div className="md:col-span-4 flex flex-col gap-8">
            {[1, 2].map((idx) => (
                <div
                    key={idx}
                    className="flex-1 rounded-[1.5rem] overflow-hidden relative group/item cursor-zoom-in aspect-[16/9] md:aspect-auto shadow-md"
                    onClick={() => openLightbox(idx)}
                >
                    {items[idx] ? (
                        <>
                            <img src={items[idx].url} loading="lazy" className="w-full h-full object-cover transition-all duration-1000 group-hover/item:scale-110" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <div className="bg-red-800 p-4 rounded-full skew-x-[-10deg] scale-0 group-hover/item:scale-100 transition-transform duration-500">
                                    <i className="fas fa-expand-arrows-alt"></i>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-zinc-50 flex items-center justify-center border-2 border-dashed border-zinc-200">
                            <i className="fas fa-image text-zinc-200 text-3xl"></i>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);
