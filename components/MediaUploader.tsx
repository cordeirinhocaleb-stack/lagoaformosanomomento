
import React, { useState, useRef } from 'react';

interface MediaUploaderProps {
  onMediaSelect: (file: File | null, previewUrl: string, type: 'image' | 'video') => void;
  onDriveUpload?: (file: File) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaSelect, onDriveUpload }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'drive'>('local');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [driveLink, setDriveLink] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      alert('Formato não suportado. Use imagens ou vídeos.');
      return;
    }

    setIsProcessing(true);

    if (activeTab === 'drive' && onDriveUpload) {
        // Modo Drive Upload
        onDriveUpload(file);
        setIsProcessing(false);
        // Não setamos preview local aqui pois a URL virá do Drive após o upload
        return;
    }

    // Modo Local
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setPreview(e.target?.result as string);
          setMediaType('image');
          setIsProcessing(false);
          onMediaSelect(file, e.target?.result as string, 'image');
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      const videoUrl = URL.createObjectURL(file);
      setPreview(videoUrl);
      setMediaType('video');
      setIsProcessing(false);
      onMediaSelect(file, videoUrl, 'video');
    }
  };

  const handleDriveSubmit = () => {
    // Deprecated logic (for link pasting), now we use picker mostly
    // But keeping it for manual entry
    if (!driveLink) return;
    setIsProcessing(true);
    
    // Simplistic check
    setPreview(driveLink); 
    setMediaType('image');
    setIsProcessing(false);
    onMediaSelect(null, driveLink, 'image');
  };

  const clearSelection = () => {
    setPreview(null);
    setDriveLink('');
    setMediaType(null);
    onMediaSelect(null, '', 'image');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden shadow-sm">
      {/* Abas de Seleção */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'local' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <i className="fas fa-laptop mr-2"></i> Computador
        </button>
        <button 
          onClick={() => setActiveTab('drive')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'drive' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <i className="fab fa-google-drive mr-2"></i> Upload Nuvem
        </button>
      </div>

      <div className="p-6">
        {preview ? (
          <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-lg group">
            {mediaType === 'image' ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <video src={preview} className="w-full h-full object-contain" controls />
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl hover:bg-black transition-colors"
                >
                  <i className="fas fa-trash-alt mr-2"></i> Remover Mídia
                </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] py-1 px-3 font-bold uppercase tracking-widest flex justify-between">
              <span>Mídia Selecionada</span>
              {activeTab === 'drive' && <span className="text-green-400"><i className="fab fa-google-drive"></i> Via Drive</span>}
            </div>
          </div>
        ) : (
          <>
            <div 
              className={`border-4 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group ${
                  isDragging ? 'border-red-600 bg-red-50' : 
                  activeTab === 'drive' ? 'border-green-100 bg-green-50/30 hover:bg-green-50' :
                  'border-gray-100 bg-gray-50 hover:bg-white hover:border-red-200'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              {isProcessing ? (
                <div className="py-4">
                  <i className="fas fa-cog fa-spin text-3xl text-red-600 mb-2"></i>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Processando...</p>
                </div>
              ) : (
                <div className="py-4">
                  <div className={`w-14 h-14 bg-white border rounded-full flex items-center justify-center mx-auto mb-3 transition-all shadow-sm ${
                      activeTab === 'drive' ? 'border-green-200 text-green-600 group-hover:bg-green-600 group-hover:text-white' : 
                      'border-gray-200 text-gray-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600'
                  }`}>
                    <i className={`fas ${activeTab === 'drive' ? 'fa-cloud-upload-alt' : 'fa-laptop'} text-xl`}></i>
                  </div>
                  <p className="text-xs font-black uppercase text-gray-700 mb-1">
                    {activeTab === 'drive' ? 'Enviar para Google Drive' : 'Clique ou Arraste'}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    {activeTab === 'drive' ? 'A imagem será pública' : 'JPG, PNG ou MP4'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
