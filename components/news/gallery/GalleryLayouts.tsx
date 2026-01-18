
import React from 'react';
import { GalleryItem, ContentBlock } from '../../../types';

export const WatermarkOverlay: React.FC<{ show: boolean }> = ({ show }) => {
    if (!show) return null;
    return (
        <div className="absolute bottom-0 right-0 w-[40%] z-40 pointer-events-none select-none">
            <div className="bg-gradient-to-r from-zinc-950/95 to-zinc-950/98 backdrop-blur-lg px-4 py-2.5 flex items-center justify-end border-t border-l border-zinc-700/30">
                <span className="text-white text-[10px] font-semibold uppercase tracking-wider">
                    lagoaformosanomomento.com.br
                </span>
            </div>
        </div>
    );
};

interface LayoutProps {
    items: GalleryItem[];
    block: ContentBlock;
    openLightbox: (idx: number) => void;
    activeIndex?: number;
    setActiveIndex?: React.Dispatch<React.SetStateAction<number>>;
    comparisonValue?: number;
    setComparisonValue?: React.Dispatch<React.SetStateAction<number>>;
    getAspectRatioClass?: () => string;
    getObjectFitClass?: () => string;
    getGridColumnsClass?: () => string;
    uniformSize?: boolean;
}

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
                <div className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 skew-x-[-10deg]">
                    <i className="fas fa-star text-[8px] animate-pulse"></i>
                    DESTAQUE EDITORIAL
                </div>
            </div>

            <WatermarkOverlay show={!!block.settings.showWatermark} />

            <div className="absolute bottom-10 left-10 right-10 z-30 animate-fadeIn">
                <div className="w-12 h-1.5 bg-red-600 mb-4 skew-x-[-15deg]"></div>
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
                        className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-white/5 hover:border-red-600 transition-all cursor-pointer group/thumb"
                    >
                        <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-110" alt="" />
                    </div>
                ))}
            </div>
        )}
    </div>
);

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
                        <div className="w-12 h-1.5 bg-red-600 mb-6 skew-x-[-15deg]"></div>
                        <p className="text-3xl md:text-6xl font-[1000] uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl max-w-2xl">{item.caption}</p>
                    </div>
                )}
            </div>
        ))}
        {/* Cinematic Arrows */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 transition-all">
            <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex?.((prev) => (prev - 1 + items.length) % items.length); }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full w-14 h-20 flex items-center justify-center text-white hover:bg-red-600 transition-all transform active:scale-90"
            >
                <i className="fas fa-chevron-left"></i>
            </button>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 transition-all">
            <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex?.((prev) => (prev + 1) % items.length); }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full w-14 h-20 flex items-center justify-center text-white hover:bg-red-600 transition-all transform active:scale-90"
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>

        <div className="absolute bottom-12 right-12 z-20 flex gap-2">
            {items.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-12 bg-red-600 shadow-[0_0_20px_#dc2626]' : 'w-3 bg-white/20'}`}></div>
            ))}
        </div>
    </div >
);

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
                <div className="w-12 h-1.5 bg-red-600 mb-4 skew-x-[-15deg]"></div>
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
                                <div className="bg-red-600 p-4 rounded-full skew-x-[-10deg] scale-0 group-hover/item:scale-100 transition-transform duration-500">
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
                <div className="w-12 h-1.5 bg-red-600 mb-6 skew-x-[-15deg]"></div>
                {items[activeIndex].caption && (
                    <p className="text-white font-[1000] uppercase italic text-2xl md:text-5xl tracking-tighter leading-[0.8] drop-shadow-2xl">{items[activeIndex].caption}</p>
                )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
                    <i className="fas fa-expand text-2xl"></i>
                </div>
            </div>
        </div>
        <div className="flex gap-6 overflow-x-auto py-6 scrollbar-hide snap-x px-2">
            {items.map((item, idx) => (
                <button
                    key={item.id}
                    onClick={() => setActiveIndex?.(idx)}
                    className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden transition-all duration-500 snap-start border-4 ${activeIndex === idx ? 'border-red-600 scale-110 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100 shadow-sm'}`}
                >
                    <img src={item.url} loading="lazy" className="w-full h-full object-cover" alt="" />
                </button>
            ))}
        </div>
    </div>
);

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
