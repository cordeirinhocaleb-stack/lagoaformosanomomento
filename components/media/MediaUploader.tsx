
import React, { useState, useRef } from 'react';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null, previewUrl: string, type: 'image' | 'video') => void;
  label?: string;
  acceptedTypes?: string[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaSelect, label, acceptedTypes }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const isVideo = file.type.startsWith('video/');

    // Cria uma URL local para preview imediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setIsProcessing(false);

    // Passa o arquivo bruto para o componente pai gerenciar o upload tardio (ex: YouTube)
    onMediaSelect(file, objectUrl, isVideo ? 'video' : 'image');
  };

  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onMediaSelect(null, '', 'image');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden w-full h-full">
      <div className="p-0 w-full h-full">
        {preview ? (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group">
            {preview.includes('blob:') && (preview.match(/video/) || preview.includes('data:video')) ? (
              <video src={preview} className="w-full h-full object-contain" controls />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-gray-100"
              >
                <i className="fas fa-sync-alt mr-2"></i> Alterar
              </button>
              <button
                onClick={clearSelection}
                className="bg-red-600 text-white px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-red-700"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>

            {/* Indicador de Estado Local */}
            {preview.startsWith('blob:') && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[8px] py-1 px-3 font-black uppercase tracking-widest rounded-full shadow-lg z-10 pointer-events-none">
                <i className="fas fa-hdd mr-1"></i> Preview Local
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl w-full h-full min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-all ${isProcessing ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-red-400 hover:bg-red-50'}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-8 h-8 animate-coin object-contain mb-2" alt="Processing" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">Processando...</p>
              </div>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-2xl text-gray-300 mb-2"></i>
                <p className="text-[10px] font-black uppercase text-gray-500 text-center">Selecionar Mídia</p>
                {!label && <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Img / Vídeo</p>}
                {label && <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">{label}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
