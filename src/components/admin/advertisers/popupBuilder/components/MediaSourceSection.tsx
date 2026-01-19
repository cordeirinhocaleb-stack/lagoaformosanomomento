import React from 'react';
import { PopupMediaConfig } from '@/types';
import MediaUploader from '../../../../media/MediaUploader';

interface MediaSourceSectionProps {
    media: PopupMediaConfig;
    darkMode: boolean;
    hasVideo: boolean;
    handleMediaAdd: (_file: File | null, preview: string, type: 'image' | 'video') => void;
    removeImage: (index: number) => void;
    onResetVideo: () => void;
}

export const MediaSourceSection: React.FC<MediaSourceSectionProps> = ({
    media,
    darkMode,
    hasVideo,
    handleMediaAdd,
    removeImage,
    onResetVideo
}) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <MediaUploader onMediaSelect={handleMediaAdd} />

            {hasVideo ? (
                <div className={`rounded-xl overflow-hidden relative group aspect-video border ${darkMode ? 'bg-black border-white/10' : 'bg-black border-gray-200'}`}>
                    <iframe
                        src={media.videoUrl?.replace('watch?v=', 'embed/')}
                        className="w-full h-full pointer-events-none opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={onResetVideo}
                            className="bg-red-600 text-white px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <i className="fas fa-trash"></i> Remover Vídeo
                        </button>
                    </div>
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase shadow-sm">Vídeo Ativo</div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex gap-3 overflow-x-auto pb-2 items-center">
                        {media.images?.map((img, idx) => (
                            <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 group border-2 border-gray-100 hover:border-red-500 transition-colors bg-gray-50 shadow-sm">
                                <img src={img} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                        title="Remover Imagem"
                                    >
                                        <i className="fas fa-trash text-xs"></i>
                                    </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-black text-center py-0.5 backdrop-blur-sm">
                                    IMG {idx + 1}
                                </div>
                            </div>
                        ))}
                        {(!media.images || media.images.length < 3) && (
                            <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center ${darkMode ? 'border-white/10 bg-white/5 text-gray-500' : 'border-gray-200 bg-gray-50/50 text-gray-300'}`}>
                                <i className="fas fa-image text-xl mb-1"></i>
                                <span className="text-[8px] font-bold uppercase">Vazio</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[9px] text-gray-400 text-center font-medium bg-yellow-50 text-yellow-700 py-2 rounded-lg border border-yellow-100">
                        <i className="fas fa-info-circle mr-1"></i>
                        Máximo 3 imagens (Galeria) OU 1 Vídeo. Adicionar um tipo remove o outro.
                    </p>
                </div>
            )}
        </div>
    );
};
