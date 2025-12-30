
import React, { useState, useRef } from 'react';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null, previewUrl: string, type: 'image' | 'video') => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const isVideo = file.type.startsWith('video/');
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const result = event.target?.result as string;
        setPreview(result);
        setIsProcessing(false);
        // Passa o arquivo bruto para que o EditorTab gerencie o destino (Drive ou YouTube)
        onMediaSelect(file, result, isVideo ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setPreview(null);
    onMediaSelect(null, '', 'image');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-4">
        {preview ? (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group">
            {preview.includes('video') ? (
              <video src={preview} className="w-full h-full object-contain" />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={clearSelection}
                  className="bg-red-600 text-white px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-xl"
                >
                  Substituir
                </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[8px] py-1 px-3 font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-cloud-upload-alt text-blue-400"></i> Preparado para Cloud
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isProcessing ? 'bg-gray-50 border-gray-200' : 'border-gray-200 hover:border-red-400 hover:bg-red-50'}`}
          >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
                className="hidden" 
            />
            {isProcessing ? (
              <i className="fas fa-circle-notch fa-spin text-xl text-red-600"></i>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-2xl text-gray-300 mb-2"></i>
                <p className="text-[10px] font-black uppercase text-gray-500">Clique para selecionar</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase mt-1">Imagens ou Vídeos</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
