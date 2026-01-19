
import React from 'react';

interface VideoSourcePickerProps {
    onSelect: (source: 'cloudinary' | 'youtube') => void;
}

const VideoSourcePicker: React.FC<VideoSourcePickerProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col md:flex-row gap-6 p-4">
            {/* OPÇÃO A: CLOUDINARY */}
            <button 
                onClick={() => onSelect('cloudinary')}
                className="flex-1 bg-white border border-gray-200 rounded-[2rem] p-8 text-center shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                    <i className="fas fa-cloud-upload-alt text-3xl"></i>
                </div>
                <h3 className="text-lg font-black uppercase text-gray-900 tracking-tight mb-2">Hospedagem Interna</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Upload direto para nosso servidor (Cloudinary). Ideal para vídeos curtos, stories ou conteúdo exclusivo do site.
                </p>
                <div className="mt-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Recomendado</span>
                </div>
            </button>

            {/* OPÇÃO B: YOUTUBE */}
            <button 
                onClick={() => onSelect('youtube')}
                className="flex-1 bg-white border border-gray-200 rounded-[2rem] p-8 text-center shadow-sm hover:shadow-xl hover:border-red-600 transition-all group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 group-hover:scale-110 transition-transform">
                    <i className="fab fa-youtube text-3xl"></i>
                </div>
                <h3 className="text-lg font-black uppercase text-gray-900 tracking-tight mb-2">YouTube Oficial</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    Envia o vídeo para o canal do LFNM no YouTube. Gera link externo, aumenta alcance e monetização.
                </p>
                <div className="mt-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full flex items-center justify-center gap-2 w-fit mx-auto">
                        <i className="fas fa-bolt"></i> Upload Automático
                    </span>
                </div>
            </button>
        </div>
    );
};

export default VideoSourcePicker;
