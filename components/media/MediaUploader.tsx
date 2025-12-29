
import React, { useState, useRef } from 'react';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null, previewUrl: string, type: 'image' | 'video') => void;
  onDriveUpload?: (file: File) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaSelect }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    // Cria um preview temporário apenas para a UI
    const reader = new FileReader();
    reader.onload = (event) => {
        setPreview(event.target?.result as string);
        setIsProcessing(false);
        // Passa o arquivo original para o EditorTab fazer o upload real no Drive
        onMediaSelect(file, event.target?.result as string, file.type.startsWith('video/') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const clearSelection = () => {
    setPreview(null);
    onMediaSelect(null, '', 'image');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
      <div className="flex border-b border-gray-100 bg-gray-50">
        <div className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-center text-blue-600">
          <i className="fas fa-upload mr-2"></i> Upload via Google Drive
        </div>
      </div>

      <div className="p-6">
        {preview ? (
          <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-lg group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl hover:bg-black transition-colors"
                >
                  <i className="fas fa-trash-alt mr-2"></i> Substituir
                </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[8px] py-1 px-3 font-black uppercase tracking-widest flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Sincronização de Nuvem Ativa
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-gray-100 rounded-2xl p-8 text-center hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer group"
          >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
                className="hidden" 
            />
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <i className="fas fa-cloud-upload-alt text-xl text-gray-400 group-hover:text-blue-600"></i>
            </div>
            <p className="text-xs font-black uppercase text-gray-700 mb-1">Upload Automático</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase">Qualquer imagem será salva no seu Drive</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
