import React from 'react';
import { ContentBlock } from '@/types';

interface MediaBlockOverlaysProps {
    isSelected: boolean;
    uploadError: string | null;
    isUploading?: boolean;
    uploadStatus?: string;
    videoSource?: string;
    hasYoutubeMeta: boolean;
    showEffects: boolean;
    onResetSource: (e: React.MouseEvent) => void;
    onToggleEffects: (e: React.MouseEvent) => void;
    onOpenYoutubeWizard: (e: React.MouseEvent) => void;
    onCloseError: () => void;
}

export const MediaBlockOverlays: React.FC<MediaBlockOverlaysProps> = ({
    isSelected,
    uploadError,
    isUploading,
    uploadStatus,
    videoSource,
    hasYoutubeMeta,
    showEffects,
    onResetSource,
    onToggleEffects,
    onOpenYoutubeWizard,
    onCloseError
}) => {
    return (
        <>
            {/* Processing / Uploading Overlay */}
            {(isUploading || uploadStatus === 'uploading') && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-md z-50">
                    <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-10 h-10 animate-coin object-contain mb-3" alt="Loading" />
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Enviando Mídia...</span>
                </div>
            )}

            {/* Error Message */}
            {uploadError && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-center p-6 animate-in fade-in zoom-in">
                    <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-3"></i>
                    <p className="text-white font-bold text-sm mb-4">{uploadError}</p>
                    <button onClick={onCloseError} className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase hover:bg-zinc-200">Tentar Novamente</button>
                </div>
            )}

            {/* Controls Overlay */}
            {isSelected && !uploadError && !isUploading && (
                <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
                    <button onClick={onResetSource} className="bg-white/90 text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-black/10 hover:bg-red-600 hover:text-white transition-colors">
                        <i className="fas fa-undo"></i> Trocar Origem
                    </button>
                    {videoSource === 'youtube' && hasYoutubeMeta && (
                        <button onClick={onOpenYoutubeWizard} className="bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-red-700 hover:bg-red-700 transition-colors">
                            <i className="fab fa-youtube"></i> Editar Info YouTube
                        </button>
                    )}
                    <button onClick={onToggleEffects} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/10 transition-colors ${showEffects ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white hover:bg-blue-600'}`}>
                        <i className="fas fa-sliders-h"></i> Ajustes
                    </button>
                </div>
            )}
        </>
    );
};
