import React from 'react';
import { Advertiser } from '@/types';
import MediaUploader from '../../../../../media/MediaUploader';

interface VideoUploaderWrapperProps {
    data: Advertiser;
    handleMediaSelect: (file: File | null, type: 'video') => void;
    resolveImage: (url: string | undefined) => string;
}

export const VideoUploaderWrapper: React.FC<VideoUploaderWrapperProps> = ({ data, handleMediaSelect, resolveImage }) => {
    return (
        <div className="space-y-4 animate-fadeIn">
            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-3">Vídeo Publicitário (Máx 30 Segundos)</label>
                <div className="aspect-video relative rounded-2xl overflow-hidden bg-black group border-2 border-dashed border-zinc-800">
                    <MediaUploader onMediaSelect={(file) => handleMediaSelect(file, 'video')} />
                    {data.videoUrl && (
                        <div className="absolute inset-0 pointer-events-none">
                            <video
                                src={resolveImage(data.videoUrl)}
                                className="w-full h-full object-cover opacity-60"
                                autoPlay muted loop
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <i className="fas fa-play-circle text-white text-4xl opacity-50"></i>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-[8px] text-gray-500 mt-3 font-bold uppercase italic leading-tight">
                    * Formatos suportados: MP4, MOV. Máximo 15MB.
                </p>
            </div>
        </div>
    );
};
