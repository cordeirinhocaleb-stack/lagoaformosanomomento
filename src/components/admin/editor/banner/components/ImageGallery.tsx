/**
 * ImageGallery Component
 * Displays image slots with upload, delete, and progress indicators
 */

import React from 'react';

type LayoutType = 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';

interface UploadQueueItem {
    file: File;
    index: number;
}

interface ImageGalleryProps {
    bannerImages: string[];
    bannerImageLayout: LayoutType;
    uploadingIndex: number | null;
    uploadProgress: number;
    uploadQueue: UploadQueueItem[];
    resolveMedia: (url: string) => string;
    getPreviewStyle: (index?: number) => React.CSSProperties;
    onImageUpload: (file: File, index: number) => void;
    onRemoveImage: (index: number) => void;
    selectedImageIndex: number;
    onSelectImage: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
    bannerImages,
    bannerImageLayout,
    uploadingIndex,
    uploadProgress,
    uploadQueue,
    resolveMedia,
    getPreviewStyle,
    onImageUpload,
    onRemoveImage,
    selectedImageIndex,
    onSelectImage
}) => {
    const maxSlots =
        bannerImageLayout === 'split' ? 2 :
            bannerImageLayout === 'mosaic' ? 3 :
                bannerImageLayout === 'grid' ? 4 : 5;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <label className="text-sm font-black text-gray-800 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-md shadow-amber-500/10">
                        <i className="fas fa-film text-white text-xs"></i>
                    </div>
                    ROLO DE CÂMERA
                </label>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
                    {bannerImages.filter(img => img).length} / {maxSlots} assets
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {[...Array(5)].map((_, index) => {
                    const isDisabled = index >= maxSlots;
                    const hasImage = bannerImages[index];

                    return (
                        <div
                            key={index}
                            onClick={() => !isDisabled && onSelectImage(index)}
                            className={`relative rounded-2xl transition-all duration-300 ${isDisabled
                                ? 'opacity-30 pointer-events-none'
                                : 'cursor-pointer hover:shadow-2xl hover:scale-[1.02]'
                                } ${index === selectedImageIndex ? 'ring-4 ring-blue-500 z-10 scale-[1.02]' : ''}`}
                            style={{ aspectRatio: '16/10' }}
                        >
                            {hasImage ? (
                                <>
                                    {/* Image Container with overflow hidden */}
                                    <div className="relative w-full h-full group rounded-2xl overflow-hidden">
                                        {/* Image */}
                                        {resolveMedia(bannerImages[index]) ? (
                                            <img
                                                src={resolveMedia(bannerImages[index])}
                                                alt={`Banner ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                style={getPreviewStyle(index)}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                                <span>Imagem inválida</span>
                                            </div>
                                        )}

                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Image number badge */}
                                        <div className="absolute top-3 left-3 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs font-black">{index + 1}</span>
                                        </div>

                                        {/* Replace button on hover */}
                                        {/* Replace button on hover - Centered */}
                                        <label
                                            onClick={(e) => e.stopPropagation()}
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                        >
                                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-white transition-colors">
                                                <i className="fas fa-sync-alt text-gray-700 text-sm"></i>
                                                <span className="text-gray-800 text-xs font-bold">Substituir</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) { onImageUpload(file, index); }
                                                }}
                                            />
                                        </label>

                                        {/* Upload progress overlay */}
                                        {uploadingIndex === index && (
                                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40">
                                                <div className="w-16 h-16 relative mb-3">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="#333" strokeWidth="4" fill="none" />
                                                        <circle
                                                            cx="32" cy="32" r="28"
                                                            stroke="#ef4444"
                                                            strokeWidth="4"
                                                            fill="none"
                                                            strokeDasharray={`${uploadProgress * 1.76} 176`}
                                                            className="transition-all duration-300"
                                                        />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-white font-black text-lg">
                                                        {uploadProgress}%
                                                    </span>
                                                </div>
                                                <span className="text-white/60 text-xs font-medium">Enviando...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* DELETE BUTTON - Outside overflow container */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onRemoveImage(index);
                                        }}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 border-2 border-white z-50"
                                    >
                                        <i className="fas fa-times text-white text-xs"></i>
                                    </button>
                                </>
                            ) : (
                                <label className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed rounded-2xl ${isDisabled
                                    ? 'bg-gray-100 border-gray-200'
                                    : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-amber-400 hover:from-amber-50 hover:to-yellow-50'
                                    }`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${isDisabled ? 'bg-gray-200' : 'bg-white shadow-lg'
                                        }`}>
                                        <i className={`fas fa-plus text-xl ${isDisabled ? 'text-gray-300' : 'text-amber-500'}`}></i>
                                    </div>
                                    <span className={`text-xs font-bold ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {isDisabled ? 'Bloqueado' : 'Adicionar Take'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-1">CAM {index + 1}</span>
                                    {!isDisabled && (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) { onImageUpload(file, index); }
                                            }}
                                        />
                                    )}
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Queue indicator */}
            {uploadQueue.length > 0 && (
                <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                        <i className="fas fa-clock text-white text-sm"></i>
                    </div>
                    <div>
                        <span className="text-amber-800 text-sm font-bold">
                            {uploadQueue.length} {uploadQueue.length === 1 ? 'imagem' : 'imagens'} na fila
                        </span>
                        <span className="text-amber-600 text-xs ml-2">
                            Processando sequencialmente...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
