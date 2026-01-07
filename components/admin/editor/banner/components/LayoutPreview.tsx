/**
 * LayoutPreview Component
 * Shows a visual preview of how images will appear based on selected layout
 */

import React from 'react';

type LayoutType = 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';

interface LayoutPreviewProps {
    bannerImages: string[];
    bannerImageLayout: LayoutType;
    resolveMedia: (url: string) => string;
    getPreviewStyle: (index?: number) => React.CSSProperties;
}

const LayoutPreview: React.FC<LayoutPreviewProps> = ({
    bannerImages,
    bannerImageLayout,
    resolveMedia,
    getPreviewStyle
}) => {
    // Only show preview if there are images
    if (!bannerImages.some(img => img)) {return null;}

    return (
        <div className="mt-6 mx-8">
            <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-eye text-gray-400"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Preview do Layout
                </span>
            </div>
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl" style={{ height: '240px' }}>
                {/* Carousel / Fade Preview */}
                {(bannerImageLayout === 'carousel' || bannerImageLayout === 'fade') && (
                    <>
                        {bannerImages.filter(img => img).map((url, i) => (
                            <img
                                key={i}
                                src={resolveMedia(url)}
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === 0 ? 'opacity-100' : 'opacity-0'}`}
                                style={getPreviewStyle(i)}
                                alt=""
                            />
                        ))}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {bannerImages.filter(img => img).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
                            ))}
                        </div>
                        <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold">
                            {bannerImageLayout === 'carousel' ? 'CARROSSEL' : 'FADE'}
                        </div>
                    </>
                )}

                {/* Split Preview (2 Images) */}
                {bannerImageLayout === 'split' && (
                    <div className="absolute inset-0 grid grid-cols-2 gap-0.5">
                        {bannerImages.slice(0, 2).map((url, i) => (
                            url ? (
                                <img key={i} src={resolveMedia(url)} className="w-full h-full object-cover" style={getPreviewStyle(i)} alt="" />
                            ) : (
                                <div key={i} className="bg-zinc-800 flex items-center justify-center">
                                    <i className="fas fa-image text-zinc-600 text-2xl"></i>
                                </div>
                            )
                        ))}
                        <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold">
                            SPLIT
                        </div>
                    </div>
                )}

                {/* Grid Preview (4 Images) */}
                {bannerImageLayout === 'grid' && (
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
                        {[0, 1, 2, 3].map((i) => (
                            bannerImages[i] ? (
                                <img key={i} src={resolveMedia(bannerImages[i])} className="w-full h-full object-cover" style={getPreviewStyle(i)} alt="" />
                            ) : (
                                <div key={i} className="bg-zinc-800 flex items-center justify-center">
                                    <i className="fas fa-image text-zinc-600 text-xl"></i>
                                </div>
                            )
                        ))}
                        <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold">
                            GRID
                        </div>
                    </div>
                )}

                {/* Mosaic Preview (1 Big + 2 Small) */}
                {bannerImageLayout === 'mosaic' && (
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-2 gap-0.5">
                        <div className="col-span-8 row-span-2">
                            {bannerImages[0] ? (
                                <img src={resolveMedia(bannerImages[0])} className="w-full h-full object-cover" style={getPreviewStyle(0)} alt="" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <i className="fas fa-image text-zinc-600 text-3xl"></i>
                                </div>
                            )}
                        </div>
                        <div className="col-span-4 row-span-1">
                            {bannerImages[1] ? (
                                <img src={resolveMedia(bannerImages[1])} className="w-full h-full object-cover" style={getPreviewStyle(1)} alt="" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <i className="fas fa-image text-zinc-600 text-xl"></i>
                                </div>
                            )}
                        </div>
                        <div className="col-span-4 row-span-1">
                            {bannerImages[2] ? (
                                <img src={resolveMedia(bannerImages[2])} className="w-full h-full object-cover" style={getPreviewStyle(2)} alt="" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                    <i className="fas fa-image text-zinc-600 text-xl"></i>
                                </div>
                            )}
                        </div>
                        <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold">
                            MOSAIC
                        </div>
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Sample title overlay */}
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">
                        Prévia da Composição
                    </div>
                    <div className="text-white text-sm font-bold truncate">
                        Título da Notícia Aparecerá Aqui
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LayoutPreview;
