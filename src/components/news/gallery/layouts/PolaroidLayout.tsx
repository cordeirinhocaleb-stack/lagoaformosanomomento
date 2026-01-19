import React from 'react';
import { LayoutProps } from '../types';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const PolaroidLayout: React.FC<LayoutProps> = ({ items, block, openLightbox }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
        {items.map((item, idx) => (
            <div
                key={item.id}
                className="group cursor-zoom-in relative rounded-3xl overflow-hidden bg-zinc-950 border border-red-600/10 hover:border-red-600/30 transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(220,38,38,0.3)]"
                onClick={() => openLightbox(idx)}
            >
                {/* Image Container */}
                <div className="aspect-[4/3] overflow-hidden relative bg-zinc-900">
                    <img
                        src={item.url}
                        loading="lazy"
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                        alt=""
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {/* Watermark */}
                    <WatermarkOverlay show={!!block.settings.showWatermark} />

                    {/* Red Accent Top */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Hover Expand Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="w-16 h-16 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <i className="fas fa-expand text-white text-xl"></i>
                        </div>
                    </div>
                </div>

                {/* Card Footer - News Site Style */}
                <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800">
                    {item.caption ? (
                        <p className="text-white font-bold text-xs leading-snug mb-2 line-clamp-2">
                            {item.caption}
                        </p>
                    ) : (
                        <div className="h-4 flex items-center">
                            <span className="text-[10px] text-zinc-600 uppercase tracking-wide font-medium">
                                Sem legenda
                            </span>
                        </div>
                    )}

                    {/* Meta Info Bar */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2">
                        <div className="flex items-center gap-1.5">
                            <i className="fas fa-image text-red-600 text-[9px]"></i>
                            <span className="font-medium">LFNM</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <i className="fas fa-expand-alt text-[8px]"></i>
                            <span className="font-medium">Ver</span>
                        </div>
                    </div>
                </div>

                {/* Subtle Bottom Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
        ))}
    </div>
);
