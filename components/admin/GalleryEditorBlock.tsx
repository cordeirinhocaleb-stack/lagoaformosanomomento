
import React, { useState, useEffect } from 'react';
import { ContentBlock } from '../../types';
import { storeLocalFile, getLocalFile } from '../../services/storage/localStorageService';

interface GalleryEditorProps {
    block: ContentBlock;
    accessToken?: string | null;
    onUpdate: (updatedBlock: ContentBlock) => void;
}

const GALLERY_STYLES = [
    { id: 'grid', label: 'Grade Fina', icon: 'fa-th', maxItems: 12 },
    { id: 'masonry', label: 'Mosaico', icon: 'fa-layer-group', maxItems: 12 },
    { id: 'carousel', label: 'Carrossel', icon: 'fa-images', maxItems: 8 },
    { id: 'slideshow', label: 'Slideshow', icon: 'fa-play-circle', maxItems: 5 },
    { id: 'columns', label: 'Colunas', icon: 'fa-columns', maxItems: 4 },
    { id: 'hero_slider', label: 'Destaque', icon: 'fa-star', maxItems: 5 },
    { id: 'polaroid', label: 'Polaroid', icon: 'fa-camera-retro', maxItems: 8 },
    { id: 'reel', label: 'Reel Scroll', icon: 'fa-film', maxItems: 10 }
];

export const GalleryEditorBlock: React.FC<GalleryEditorProps> = ({ block, onUpdate }) => {
    const currentStyleId = block.settings?.style || 'grid';
    const images = block.content.images || [];
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

    // Settings
    const columns = block.settings?.columns || 4;
    const gap = block.settings?.gap !== undefined ? block.settings.gap : 2; // 0, 1, 2, 4, 8
    const aspectRatio = block.settings?.aspectRatio || 'square'; // 'auto', 'square', 'video', 'portrait'
    const objectFit = block.settings?.objectFit || 'cover'; // 'cover', 'contain'
    const autoplaySpeed = block.settings?.autoplaySpeed || 3000;
    const showArrows = block.settings?.showArrows !== false;

    // Load Local Previews
    useEffect(() => {
        let active = true;
        const loadPreviews = async () => {
            const newUrls: Record<string, string> = {};
            for (const img of images) {
                if (typeof img === 'string' && img.startsWith('local_')) {
                    if (!previewUrls[img]) {
                        const blob = await getLocalFile(img);
                        if (blob) {
                            newUrls[img] = URL.createObjectURL(blob);
                        }
                    }
                } else if (typeof img === 'string') {
                    newUrls[img] = img;
                }
            }
            if (active && Object.keys(newUrls).length > 0) {
                setPreviewUrls(prev => ({ ...prev, ...newUrls }));
            }
        };
        loadPreviews();
        return () => { active = false; };
    }, [images]);

    const getImgSrc = (img: string | number) => {
        if (typeof img === 'number') {return null;}
        return previewUrls[img] || img;
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case 'square': return 'aspect-square';
            case 'video': return 'aspect-video';
            case 'portrait': return 'aspect-[3/4]';
            case 'auto': return '';
            default: return 'aspect-square';
        }
    };

    const getGridColsClass = () => {
        switch (columns) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            case 5: return 'grid-cols-5';
            case 6: return 'grid-cols-6';
            default: return 'grid-cols-4';
        }
    };

    const getGapClass = () => {
        switch (gap) {
            case 0: return 'gap-0';
            case 1: return 'gap-1';
            case 2: return 'gap-2';
            case 4: return 'gap-4';
            case 8: return 'gap-8';
            default: return 'gap-2';
        }
    };

    const renderImage = (img: string | number, className: string, applyAspect = true) => {
        const src = getImgSrc(img);
        const aspectClass = applyAspect ? getAspectRatioClass() : '';
        const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

        if (src) {
            return <img src={src} className={`${className} ${aspectClass} ${fitClass} w-full h-full`} alt="Gallery Item" />;
        }
        return (
            <div className={`${className} ${aspectClass} bg-zinc-100 flex items-center justify-center text-zinc-300 w-full h-full`}>
                <i className="fas fa-image text-xl sm:text-2xl"></i>
            </div>
        );
    };

    // Render Preview based on style
    const renderPreview = () => {
        const displayItems = images.length > 0 ? images : [1, 2, 3, 4];

        switch (currentStyleId) {
            case 'masonry':
                return (
                    <div className={`columns-2 md:columns-${columns} ${getGapClass()} space-y-${gap}`}>
                        {displayItems.map((img: any, i: number) => (
                            <div key={i} className="break-inside-avoid rounded-lg overflow-hidden relative group mb-2">
                                {renderImage(img, "w-full h-auto", false)}
                            </div>
                        ))}
                    </div>
                );
            case 'carousel':
                return (
                    <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                        {displayItems.map((img: any, i: number) => (
                            <div key={i} className={`min-w-[${200 + (columns * 10)}px] ${getAspectRatioClass()} rounded-xl overflow-hidden snap-center flex-shrink-0 relative`}>
                                {renderImage(img, "w-full h-full", false)}
                            </div>
                        ))}
                    </div>
                );
            case 'slideshow':
                return (
                    <div className={`w-full ${getAspectRatioClass()} rounded-xl overflow-hidden relative bg-black group`}>
                        {renderImage(displayItems[0], "w-full h-full opacity-100", false)}

                        {showArrows && (
                            <>
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer backdrop-blur-sm">
                                    <i className="fas fa-chevron-left"></i>
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer backdrop-blur-sm">
                                    <i className="fas fa-chevron-right"></i>
                                </div>
                            </>
                        )}

                        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1">
                            {displayItems.map((_: any, i: number) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === 0 ? 'bg-white w-3' : 'bg-white/30'}`}></div>
                            ))}
                        </div>
                    </div>
                );
            case 'columns':
            case 'grid':
            default:
                return (
                    <div className={`grid ${getGridColsClass()} ${getGapClass()}`}>
                        {displayItems.map((img: any, i: number) => (
                            <div key={i} className={`bg-zinc-100 rounded-lg overflow-hidden relative`}>
                                {renderImage(img, "w-full h-full", true)}
                            </div>
                        ))}
                    </div>
                );
            case 'hero_slider': // Destaque
                return (
                    <div className={`grid grid-cols-4 ${getGapClass()}`}>
                        <div className="col-span-4 aspect-video rounded-xl overflow-hidden relative">
                            {renderImage(displayItems[0], "w-full h-full", false)}
                        </div>
                        {displayItems.slice(1, 5).map((img: any, i: number) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden relative">
                                {renderImage(img, "w-full h-full", false)}
                            </div>
                        ))}
                    </div>
                );
            case 'reel':
                return (
                    <div className="flex gap-4 overflow-x-auto p-4 bg-black rounded-xl">
                        {displayItems.map((img: any, i: number) => (
                            <div key={i} className="min-w-[120px] aspect-[9/16] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
                                {renderImage(img, "w-full h-full", false)}
                            </div>
                        ))}
                    </div>
                );
        }
    };

    const updateSetting = (key: string, value: any) => {
        onUpdate({
            ...block,
            settings: {
                ...block.settings,
                [key]: value
            }
        });
    };

    const isGridLike = ['grid', 'masonry', 'columns', 'polaroid'].includes(currentStyleId);
    const isSliderLike = ['carousel', 'slideshow', 'reel'].includes(currentStyleId);

    return (
        <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <i className="fas fa-images"></i>
                </div>
                <div>
                    <h3 className="font-black text-xs uppercase tracking-widest text-zinc-900">Galeria de Fotos</h3>
                    <p className="text-[10px] text-zinc-400 font-bold">Gerencie o estilo de exibição</p>
                </div>
            </div>

            {/* Layout Preview Area */}
            <div className="mb-6 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase text-zinc-400 block">Pré-visualização</span>
                        {images.length > 0 && <span className="text-[9px] text-blue-500 font-bold">{images.length} fotos</span>}
                    </div>

                    <label className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full font-bold hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2">
                        <i className="fas fa-upload"></i> Upload Fotos
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length === 0) {return;}

                                const newImages: string[] = [];
                                for (const file of files) {
                                    try {
                                        const id = await storeLocalFile(file);
                                        newImages.push(id);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }

                                if (newImages.length > 0) {
                                    const currentImages = block.content.images || [];
                                    onUpdate({
                                        ...block,
                                        content: {
                                            ...block.content,
                                            images: [...currentImages, ...newImages]
                                        }
                                    });
                                }
                            }}
                        />
                    </label>
                </div>
                {renderPreview()}

                {images.length > 0 && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => onUpdate({ ...block, content: { ...block.content, images: [] } })}
                            className="text-[9px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                        >
                            <i className="fas fa-trash mr-1"></i> Limpar Galeria
                        </button>
                    </div>
                )}
            </div>

            {/* SELETORES DE CONFIGURAÇÃO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* 1. Layout Selector */}
                <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest pl-1">Estilo do Layout</label>
                    <div className="grid grid-cols-4 gap-2">
                        {GALLERY_STYLES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => updateSetting('style', s.id)}
                                className={`p-2 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 aspect-square ${currentStyleId === s.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-400'}`}
                                title={s.label}
                            >
                                <i className={`fas ${s.icon} text-lg`}></i>
                                <span className="text-[7px] font-bold uppercase text-center leading-tight">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Dynamic Settings */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-sliders-h text-zinc-400 text-xs"></i>
                        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Ajustes Finos</span>
                    </div>

                    {isGridLike && (
                        <>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Colunas</label>
                                    <span className="text-[9px] font-bold text-blue-600">{columns}</span>
                                </div>
                                <input
                                    type="range" min="2" max="6" step="1"
                                    value={columns}
                                    onChange={(e) => updateSetting('columns', parseInt(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Espaçamento</label>
                                    <span className="text-[9px] font-bold text-blue-600">{gap === 0 ? 'Nenhum' : gap + 'x'}</span>
                                </div>
                                <input
                                    type="range" min="0" max="8" step="2"
                                    value={gap}
                                    onChange={(e) => updateSetting('gap', parseInt(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                        </>
                    )}

                    {isSliderLike && (
                        <>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase">Velocidade (ms)</label>
                                    <span className="text-[9px] font-bold text-blue-600">{autoplaySpeed}ms</span>
                                </div>
                                <input
                                    type="range" min="1000" max="10000" step="500"
                                    value={autoplaySpeed}
                                    onChange={(e) => updateSetting('autoplaySpeed', parseInt(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase">Mostrar Setas</label>
                                <button
                                    onClick={() => updateSetting('showArrows', !showArrows)}
                                    className={`w-8 h-4 rounded-full relative transition-colors ${showArrows ? 'bg-blue-500' : 'bg-zinc-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showArrows ? 'left-4.5' : 'left-0.5'}`} style={{ left: showArrows ? '18px' : '2px' }}></div>
                                </button>
                            </div>
                        </>
                    )}

                    {/* Global Image Settings */}
                    <div className="pt-3 border-t border-zinc-200 mt-2">
                        <div className="flex items-center gap-2 mb-3">
                            <i className="fas fa-crop-alt text-zinc-400 text-xs"></i>
                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Imagens</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[8px] font-bold text-zinc-400 uppercase block mb-1">Proporção</label>
                                <select
                                    value={aspectRatio}
                                    onChange={(e) => updateSetting('aspectRatio', e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-[10px] font-bold text-zinc-700 outline-none focus:border-blue-500"
                                >
                                    <option value="square">Quadrado (1:1)</option>
                                    <option value="video">Vídeo (16:9)</option>
                                    <option value="portrait">Retrato (3:4)</option>
                                    <option value="auto">Original</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[8px] font-bold text-zinc-400 uppercase block mb-1">Ajuste</label>
                                <select
                                    value={objectFit}
                                    onChange={(e) => updateSetting('objectFit', e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-lg p-1.5 text-[10px] font-bold text-zinc-700 outline-none focus:border-blue-500"
                                >
                                    <option value="cover">Preencher (Cover)</option>
                                    <option value="contain">Conter (Contain)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GalleryEditorBlock;
