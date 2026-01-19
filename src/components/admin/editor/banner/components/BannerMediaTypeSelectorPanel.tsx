/**
 * MediaTypeSelector Component
 * Selector for Gallery (images) or Cinema (video) mode
 */

import React from 'react';

interface MediaTypeSelectorProps {
    bannerMediaType: 'image' | 'video';
    onSelectImage: () => void;
    onSelectVideo: () => void;
}

const MediaTypeSelector: React.FC<MediaTypeSelectorProps> = ({
    bannerMediaType,
    onSelectImage,
    onSelectVideo
}) => {
    return (
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                <button
                    onClick={onSelectImage}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bannerMediaType === 'image'
                        ? 'bg-black text-white shadow-xl'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <i className="fas fa-images"></i>
                    Galeria
                </button>
                <button
                    onClick={onSelectVideo}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bannerMediaType === 'video'
                        ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <i className="fas fa-play"></i>
                    Cinema
                </button>
            </div>

            {/* Informative message about selected media type */}
            <div className={`mt-3 text-center text-xs font-medium px-4 py-2 rounded-lg mx-auto max-w-md ${bannerMediaType === 'image'
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                <i className={`fas ${bannerMediaType === 'image' ? 'fa-images' : 'fa-video'} mr-2`}></i>
                {bannerMediaType === 'image'
                    ? 'Somente as imagens aparecerão no banner da notícia'
                    : 'Somente o vídeo aparecerá no banner da notícia'
                }
            </div>
        </div>
    );
};

export default MediaTypeSelector;
