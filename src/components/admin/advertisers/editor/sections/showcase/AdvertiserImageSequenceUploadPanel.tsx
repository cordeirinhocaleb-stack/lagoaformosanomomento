import React from 'react';
import { Advertiser } from '@/types';
import MediaUploader from '../../../../../media/MediaUploader';

interface ImageSequenceUploaderProps {
    data: Advertiser;
    handleMediaSelect: (file: File | null, type: 'image', index?: number) => void;
    resolveImage: (url: string | undefined) => string;
}

export const ImageSequenceUploader: React.FC<ImageSequenceUploaderProps> = ({ data, handleMediaSelect, resolveImage }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-3">Sequência de Imagens (Até 3)</label>
                <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map(idx => (
                        <div key={idx} className="space-y-2">
                            <div className="aspect-square relative group">
                                <MediaUploader onMediaSelect={(file) => handleMediaSelect(file, 'image', idx)} />
                                {((data.logoUrls && data.logoUrls[idx]) || (idx === 0 && data.logoUrl)) && (
                                    <div className="absolute inset-2 pointer-events-none rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
                                        <img
                                            src={resolveImage(data.logoUrls?.[idx] || (idx === 0 ? data.logoUrl : ''))}
                                            className="w-full h-full object-cover"
                                            alt={`Preview ${idx + 1}`}
                                        />
                                    </div>
                                )}
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white/20 z-10 shadow-lg">
                                    {idx + 1}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
