
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ContentBlock, GalleryItem, GalleryStyle } from '../../types';

interface GalleryRendererProps {
    block: ContentBlock;
    isEditor?: boolean;
}

const GalleryRenderer: React.FC<GalleryRendererProps> = ({ block, isEditor = false }) => {
    // Normalize items: Handle legacy 'items', 'images' in content (Editor), and 'images' in settings (Sync fallback)
    const rawItems = block.content?.images || (block.settings && Array.isArray(block.settings.images) ? block.settings.images : null) || block.content?.items || [];
    const items: GalleryItem[] = Array.isArray(rawItems) ? rawItems.map((item: unknown, idx: number) => {
        if (typeof item === 'string') {
            return {
                id: `gallery-item-${idx}`,
                url: item,
                caption: '',
                alt: ''
            };
        }
        return item as GalleryItem;
    }) : [];
    const style: GalleryStyle = (block.settings.style as GalleryStyle) || 'masonry';
    const [activeIndex, setActiveIndex] = useState(0);
    const [comparisonValue, setComparisonValue] = useState(50);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Settings helpers
    const uniformSize = block.settings?.uniformSize || false;
    const aspectRatioSetting = block.settings?.aspectRatio || 'auto';
    const objectFitSetting = block.settings?.objectFit || 'cover';

    const getAspectRatioClass = () => {
        if (!uniformSize || aspectRatioSetting === 'auto') { return ''; }
        switch (aspectRatioSetting) {
            case 'square': return 'aspect-square';
            case 'video': return 'aspect-video';
            case 'portrait': return 'aspect-[3/4]';
            default: return '';
        }
    };

    const getObjectFitClass = () => {
        return objectFitSetting === 'contain' ? 'object-contain' : 'object-cover';
    };

    const columns = block.settings?.columns || 3;
    const getGridColumnsClass = () => {
        switch (columns) {
            case 2: return 'md:grid-cols-2';
            case 4: return 'md:grid-cols-2 lg:grid-cols-4';
            case 5: return 'md:grid-cols-3 lg:grid-cols-5';
            default: return 'md:grid-cols-2 lg:grid-cols-3';
        }
    };

    // Bloquear scroll quando o lightbox abrir
    React.useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [lightboxIndex]);

    if (items.length === 0) { return null; }

    const openLightbox = (idx: number) => setLightboxIndex(idx);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex !== null) { setLightboxIndex((lightboxIndex + 1) % items.length); }
    };
    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex !== null) { setLightboxIndex((lightboxIndex - 1 + items.length) % items.length); }
    };

    // --- RENDERERS POR ESTILO ---

    const renderHeroSlider = () => (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden group">
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 transition-all duration-1000 transform ${idx === activeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
                    onClick={() => openLightbox(idx)}
                >
                    <img src={item.url} loading="lazy" width="1280" height="720" className="w-full h-full object-cover cursor-zoom-in" alt={item.alt} />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {item.caption && (
                        <div className="absolute bottom-10 left-10 right-10 text-white animate-fadeIn">
                            <p className="text-2xl md:text-5xl font-[1000] uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl max-w-2xl">{item.caption}</p>
                        </div>
                    )}
                </div>
            ))}
            {/* Navigation Buttons - DataBar Style */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 group-hover:opacity-100 transition-all">
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev - 1 + items.length) % items.length); }}
                    className="bg-white shadow-xl border border-zinc-200 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform active:scale-90 hover:scale-110"
                    title="Anterior"
                >
                    <i className="fas fa-chevron-left text-xl"></i>
                </button>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 group-hover:opacity-100 transition-all">
                <button
                    onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev + 1) % items.length); }}
                    className="bg-white shadow-xl border border-zinc-200 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform active:scale-90 hover:scale-110"
                    title="Próximo"
                >
                    <i className="fas fa-chevron-right text-xl"></i>
                </button>
            </div>

            <div className="absolute bottom-10 right-10 z-20 flex gap-1.5">
                {items.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-10 bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]' : 'w-2.5 bg-white/20'}`}></div>
                ))}
            </div>
        </div >
    );

    const renderNewsMosaic = () => (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:aspect-[21/9] w-full group">
            <div
                className="md:col-span-8 rounded-2xl overflow-hidden relative group/item cursor-zoom-in min-h-[400px] md:min-h-0"
                onClick={() => openLightbox(0)}
            >
                <img src={items[0]?.url} loading="lazy" className="w-full h-full object-cover transition-all duration-1000 group-hover/item:scale-105" alt="" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>

                {/* Removed Highlight badge for purity */}

                <div className="absolute bottom-10 left-10 transition-all duration-700">
                    <div className="w-12 h-1.5 bg-red-600 mb-4 skew-x-[-15deg]"></div>
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.4em] mb-2 block opacity-60">Visualizar Agora</span>
                    <i className="fas fa-search-plus text-white text-3xl"></i>
                </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-6">
                {[1, 2].map((idx) => (
                    <div
                        key={idx}
                        className="flex-1 rounded-2xl overflow-hidden relative group/item cursor-zoom-in aspect-[16/9] md:aspect-auto"
                        onClick={() => openLightbox(idx)}
                    >
                        <img src={items[idx]?.url || items[0]?.url} loading="lazy" className="w-full h-full object-cover transition-all duration-1000 group-hover/item:scale-110 group-hover/item:opacity-40" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-6 text-center">
                            <div className="w-8 h-1 bg-red-600 mb-3"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest italic leading-tight">Ver Imagem Fullscreen</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFilmstrip = () => (
        <div className="space-y-8">
            <div
                className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-50 relative cursor-zoom-in group"
                onClick={() => openLightbox(activeIndex)}
            >
                <img src={items[activeIndex].url} loading="lazy" className="w-full h-full object-contain transition-all duration-1000 group-hover:scale-105" alt="" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Removed Visualização badge for purity */}

                <div className="absolute bottom-12 left-12 right-12 animate-fadeIn">
                    <div className="w-12 h-1.5 bg-red-600 mb-6 skew-x-[-15deg]"></div>
                    {items[activeIndex].caption && (
                        <p className="text-white font-[1000] uppercase italic text-2xl md:text-4xl tracking-tighter leading-[0.8] drop-shadow-2xl">{items[activeIndex].caption}</p>
                    )}
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><i className="fas fa-expand-arrows-alt text-4xl"></i></div>
            </div>
            <div className="flex gap-5 overflow-x-auto py-6 scrollbar-hide snap-x">
                {items.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden transition-all duration-500 snap-start ${activeIndex === idx ? 'scale-110 ring-4 ring-red-600' : 'opacity-40 hover:opacity-100 hover:scale-105 shadow-sm'}`}
                    >
                        <img src={item.url} loading="lazy" className="w-full h-full object-cover" alt="" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderComparison = () => (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden group select-none">
            <img src={items[1]?.url || items[0]?.url} loading="lazy" className="absolute inset-0 w-full h-full object-cover" alt="Depois" />
            <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparisonValue}% 0 0)` }}>
                <img src={items[0]?.url} loading="lazy" className="absolute inset-0 w-full h-full object-cover" alt="Antes" />
            </div>
            <input type="range" min="0" max="100" value={comparisonValue} onChange={(e) => setComparisonValue(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40" />

            {/* Slider Handle Premium */}
            <div className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" style={{ left: `${comparisonValue}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-600 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.6)] flex items-center justify-center border-4 border-white group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-arrows-left-right text-white text-xl"></i>
                </div>
            </div>

            {/* Comparison indicators removed for purity */}
        </div>
    );

    const renderMasonry = () => (
        <div className={`${uniformSize ? `grid grid-cols-1 ${getGridColumnsClass()} gap-8` : 'columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8'} animate-fadeIn`}>
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className={`break-inside-avoid rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative cursor-zoom-in ${uniformSize ? '' : 'mb-8'} ${getAspectRatioClass()}`}
                    onClick={() => openLightbox(idx)}
                >
                    <img
                        src={item.url}
                        loading="lazy"
                        className={`w-full h-full transition-all duration-1000 group-hover:scale-110 ${getObjectFitClass()}`}
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                        <div className="h-0.5 w-8 bg-red-600 mb-3 group-hover:w-16 transition-all duration-700"></div>
                        {item.caption && <p className="text-white font-[1000] uppercase italic tracking-tighter text-sm leading-tight">{item.caption}</p>}
                    </div>
                    {/* Removed Zoom badge for purity */}
                </div>
            ))}
        </div>
    );

    const renderStoriesScroll = () => (
        <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x px-8 -mx-8">
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className="flex-shrink-0 w-[280px] aspect-[3/4] rounded-xl overflow-hidden snap-start relative group cursor-zoom-in"
                    onClick={() => openLightbox(idx)}
                >
                    <img src={item.url} loading="lazy" className="w-full h-full object-cover transition-all duration-[3000ms] group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="absolute top-8 left-8 flex items-center gap-2">
                        {/* Story tag removed for purity */}
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                        <div className="w-8 h-1 bg-red-600 mb-4 skew-x-[-15deg]"></div>
                        {item.caption && <p className="text-white text-xl font-[1000] uppercase italic tracking-tighter leading-tight drop-shadow-2xl">{item.caption}</p>}
                        <p className="mt-4 text-[8px] text-white/40 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-1000">Toque para Expandir</p>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPolaroid = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 py-10">
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className="bg-transparent rotate-[-1.5deg] even:rotate-[1.5deg] hover:rotate-0 hover:scale-110 hover:z-10 transition-all duration-700 group cursor-zoom-in relative"
                    onClick={() => openLightbox(idx)}
                >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                        <img src={item.url} loading="lazy" className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-125" alt="" />
                        <div className="absolute inset-0 bg-red-900/5 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    {item.caption ? (
                        <p className="font-serif text-zinc-900 text-center text-xl italic tracking-tighter leading-tight px-2">{item.caption}</p>
                    ) : (
                        <div className="flex justify-center flex-col items-center gap-2 opacity-30">
                            <div className="w-16 h-0.5 bg-zinc-400"></div>
                            <div className="w-10 h-0.5 bg-zinc-400"></div>
                        </div>
                    )}

                    {/* Selo LFNM Premium no Polaroid */}
                    <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] font-serif italic">LFNM.com</div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCardPeek = () => (
        <div className="flex gap-10 overflow-x-auto pb-16 scrollbar-hide snap-x px-12 -mx-12">
            {items.map((item, idx) => (
                <div
                    key={item.id}
                    className="flex-shrink-0 w-[90%] md:w-[60%] aspect-[16/10] rounded-xl overflow-hidden snap-center relative transition-all duration-700 hover:scale-[1.01] cursor-zoom-in group"
                    onClick={() => openLightbox(idx)}
                >
                    <img src={item.url} loading="lazy" className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-105" alt="" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="absolute top-10 left-10">
                        {/* Premium tag removed for purity */}
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                        <div className="bg-red-600 w-12 h-1.5 mb-6 skew-x-[-15deg]"></div>
                        {item.caption && (
                            <p className="text-white text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl">{item.caption}</p>
                        )}
                        <p className="mt-4 text-[10px] text-white/40 font-black uppercase tracking-[0.5em] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-300">Expandir Visualização <i className="fas fa-arrow-right ml-2 text-red-600"></i></p>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className={`${isEditor ? '' : 'my-20'} w-full animate-fadeIn relative`}>
            {(style === 'hero_slider' || style === 'slideshow') && renderHeroSlider()}
            {style === 'news_mosaic' && renderNewsMosaic()}
            {(style === 'filmstrip' || style === 'carousel') && renderFilmstrip()}
            {style === 'comparison' && renderComparison()}
            {(style === 'masonry' || style === 'grid' || style === 'columns') && renderMasonry()}
            {(style === 'stories_scroll' || style === 'reel') && renderStoriesScroll()}
            {style === 'card_peek' && renderCardPeek()}
            {style === 'polaroid' && renderPolaroid()}

            {block.settings.caption && (
                <p className="text-center text-[11px] font-black text-zinc-400 uppercase mt-12 tracking-[0.4em] flex items-center justify-center gap-4">
                    <span className="w-12 h-px bg-zinc-200"></span>
                    <i className="fas fa-camera text-[8px] text-red-500"></i>
                    {block.settings.caption}
                    <span className="w-12 h-px bg-zinc-200"></span>
                </p>
            )}

            {/* LIGHTBOX MODAL PREMIUM - THE CINEMA BOX (Portaled to Body) */}
            {lightboxIndex !== null && createPortal(
                <div
                    className="fixed inset-0 z-[10000] bg-black flex items-center justify-center animate-fadeIn select-none p-4 md:p-10"
                    onClick={closeLightbox}
                >
                    {/* Ambient Cinema Glow - Blurs current image in the background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <img
                            src={items[lightboxIndex].url}
                            className="w-full h-full object-cover opacity-30 blur-[120px] scale-150 transition-all duration-1000"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>

                    {/* Botão Fechar - Premium Skew */}
                    <button
                        onClick={closeLightbox}
                        className="fixed top-12 right-12 text-white/50 hover:text-white transition-all w-20 h-20 rounded-[2rem] bg-black/50 backdrop-blur-3xl flex flex-col items-center justify-center hover:bg-red-600 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50 group border border-white/5"
                    >
                        <i className="fas fa-times text-2xl group-hover:rotate-180 transition-all duration-500"></i>
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-40 group-hover:opacity-100 italic">ESC</span>
                    </button>

                    {/* Controles Navegação - Cinematic Paddles */}
                    {items.length > 1 && (
                        <>
                            <div className="fixed inset-y-0 left-0 w-32 md:w-64 flex items-center justify-center group/nav" onClick={prevImage}>
                                <button className="w-16 h-40 rounded-full bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/20 group-hover/nav:text-white group-hover/nav:bg-red-600/20 group-hover/nav:border-red-600/40 transition-all duration-500 opacity-0 group-hover/nav:opacity-100 -translate-x-10 group-hover/nav:translate-x-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent opacity-0 group-hover/nav:opacity-100"></div>
                                    <i className="fas fa-chevron-left text-4xl relative z-10"></i>
                                </button>
                            </div>
                            <div className="fixed inset-y-0 right-0 w-32 md:w-64 flex items-center justify-center group/nav" onClick={nextImage}>
                                <button className="w-16 h-40 rounded-full bg-white/5 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/20 group-hover/nav:text-white group-hover/nav:bg-red-600/20 group-hover/nav:border-red-600/40 transition-all duration-500 opacity-0 group-hover/nav:opacity-100 translate-x-10 group-hover/nav:translate-x-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-l from-red-600/20 to-transparent opacity-0 group-hover/nav:opacity-100"></div>
                                    <i className="fas fa-chevron-right text-4xl relative z-10"></i>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Conteúdo Principal */}
                    <div className="relative w-full max-w-7xl h-full flex flex-col items-center justify-center gap-10" onClick={e => e.stopPropagation()}>
                        <div className="relative flex-1 w-full max-h-[75vh] flex items-center justify-center group/img">
                            {/* Reflexo sob a imagem */}
                            <div className="absolute -bottom-20 w-[80%] h-32 bg-red-600/20 blur-[60px] rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000"></div>

                            <img
                                src={items[lightboxIndex].url}
                                className="max-w-full max-h-full object-contain shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)] rounded-xl md:rounded-[3.5rem] animate-in zoom-in-95 duration-700 relative z-10"
                                alt=""
                            />
                        </div>

                        {/* Painel de Controle LFNM - HUD Style */}
                        <div className="w-full max-w-2xl px-8 py-6 bg-zinc-950/80 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl relative animate-in slide-in-from-bottom-12 duration-1000">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-red-600 skew-x-[-15deg]"></div>

                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-6">
                                    <span className="text-[10px] font-black italic text-zinc-500 uppercase tracking-[0.4em]">IMAGEM {lightboxIndex + 1} DE {items.length}</span>
                                    <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_#dc2626]"></div>
                                    <span className="text-[10px] font-black italic text-zinc-500 uppercase tracking-[0.4em]">LFNM DIGITAL</span>
                                </div>

                                {items[lightboxIndex].caption ? (
                                    <p className="text-white font-[1000] italic text-2xl md:text-3xl tracking-tighter text-center uppercase leading-none opacity-90">{items[lightboxIndex].caption}</p>
                                ) : (
                                    <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.6em] italic">Cinematic Preview Mode</p>
                                )}

                                <div className="flex gap-2 mt-2">
                                    {items.map((_, i) => (
                                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === lightboxIndex ? 'w-8 bg-red-600' : 'w-2 bg-white/10'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default GalleryRenderer;

