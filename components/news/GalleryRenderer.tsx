
import React, { useState } from 'react';
import { ContentBlock, GalleryItem, GalleryStyle } from '../../types';

interface GalleryRendererProps {
  block: ContentBlock;
}

const GalleryRenderer: React.FC<GalleryRendererProps> = ({ block }) => {
    const items: GalleryItem[] = block.content?.items || [];
    const style: GalleryStyle = (block.settings.style as GalleryStyle) || 'masonry';
    const [activeIndex, setActiveIndex] = useState(0);
    const [comparisonValue, setComparisonValue] = useState(50);

    if (items.length === 0) return null;

    // --- RENDERERS POR ESTILO ---

    const renderHeroSlider = () => (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl group">
            {items.map((item, idx) => (
                <div 
                    key={item.id} 
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img src={item.url} loading="lazy" width="1280" height="720" className="w-full h-full object-cover" alt={item.alt} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    {item.caption && (
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <p className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-tight drop-shadow-lg">{item.caption}</p>
                        </div>
                    )}
                </div>
            ))}
            <button onClick={() => setActiveIndex((prev) => (prev - 1 + items.length) % items.length)} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white hover:text-black transition-all text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-chevron-left"></i></button>
            <button onClick={() => setActiveIndex((prev) => (prev + 1) % items.length)} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white hover:text-black transition-all text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><i className="fas fa-chevron-right"></i></button>
        </div>
    );

    const renderNewsMosaic = () => (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[500px]">
            <div className="md:col-span-8 rounded-[2.5rem] overflow-hidden shadow-xl">
                <img src={items[0]?.url} loading="lazy" width="800" height="600" className="w-full h-full object-cover" alt="" />
            </div>
            <div className="md:col-span-4 flex flex-col gap-4">
                <div className="flex-1 rounded-[2.5rem] overflow-hidden shadow-lg">
                    <img src={items[1]?.url || items[0]?.url} loading="lazy" width="400" height="300" className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 rounded-[2.5rem] overflow-hidden shadow-lg">
                    <img src={items[2]?.url || items[0]?.url} loading="lazy" width="400" height="300" className="w-full h-full object-cover" alt="" />
                </div>
            </div>
        </div>
    );

    const renderFilmstrip = () => (
        <div className="space-y-4">
            <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl bg-black border border-zinc-100">
                <img src={items[activeIndex].url} loading="lazy" width="1280" height="720" className="w-full h-full object-contain" alt="" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {items.map((item, idx) => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveIndex(idx)}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all snap-start ${activeIndex === idx ? 'border-red-600 scale-105' : 'border-white opacity-60 hover:opacity-100'}`}
                    >
                        <img src={item.url} loading="lazy" width="100" height="100" className="w-full h-full object-cover" alt="" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderComparison = () => (
        <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden shadow-2xl group select-none">
            {/* Foto de Baixo (Depois) */}
            <img src={items[1]?.url || items[0]?.url} loading="lazy" width="1280" height="720" className="absolute inset-0 w-full h-full object-cover" alt="Depois" />
            
            {/* Foto de Cima (Antes) com corte dinâmico */}
            <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - comparisonValue}% 0 0)` }}
            >
                <img src={items[0]?.url} loading="lazy" width="1280" height="720" className="absolute inset-0 w-full h-full object-cover" alt="Antes" />
            </div>

            {/* Controle Deslizante */}
            <input 
                type="range" min="0" max="100" value={comparisonValue}
                onChange={(e) => setComparisonValue(parseInt(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
            
            <div className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-xl pointer-events-none" style={{ left: `${comparisonValue}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
                    <i className="fas fa-arrows-left-right text-gray-900 text-xs"></i>
                </div>
            </div>

            <div className="absolute bottom-6 left-6 z-10 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white tracking-widest">Antes</div>
            <div className="absolute bottom-6 right-6 z-10 bg-black/50 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-white tracking-widest">Depois</div>
        </div>
    );

    const renderMasonry = () => (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {items.map((item) => (
                <div key={item.id} className="break-inside-avoid rounded-3xl overflow-hidden shadow-lg border border-zinc-100 hover:shadow-2xl transition-all group">
                    <img src={item.url} loading="lazy" width="600" height="800" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                </div>
            ))}
        </div>
    );

    const renderStoriesScroll = () => (
        <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x px-4">
            {items.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-[280px] aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl snap-start border border-zinc-100 relative group">
                    <img src={item.url} loading="lazy" width="280" height="500" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    {item.caption && <p className="absolute bottom-6 left-6 right-6 text-white text-xs font-bold leading-tight">{item.caption}</p>}
                </div>
            ))}
        </div>
    );

    const renderCardPeek = () => (
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x px-8">
            {items.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-[85%] md:w-[60%] aspect-video rounded-[3rem] overflow-hidden shadow-2xl snap-center border-4 border-white relative transition-transform duration-500 hover:scale-[1.02]">
                    <img src={item.url} loading="lazy" width="800" height="450" className="w-full h-full object-cover" alt="" />
                    <div className="absolute top-6 left-6">
                        <span className="bg-red-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xl italic">Galeria LFNM</span>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="my-16 w-full animate-fadeIn">
            {style === 'hero_slider' && renderHeroSlider()}
            {style === 'news_mosaic' && renderNewsMosaic()}
            {style === 'filmstrip' && renderFilmstrip()}
            {style === 'comparison' && renderComparison()}
            {style === 'masonry' && renderMasonry()}
            {style === 'stories_scroll' && renderStoriesScroll()}
            {style === 'card_peek' && renderCardPeek()}
            
            {block.settings.caption && (
                <p className="text-center text-[10px] font-bold text-zinc-400 uppercase mt-8 tracking-[0.3em] flex items-center justify-center gap-3">
                    <span className="w-8 h-px bg-zinc-100"></span>
                    {block.settings.caption}
                    <span className="w-8 h-px bg-zinc-100"></span>
                </p>
            )}
        </div>
    );
};

export default GalleryRenderer;
