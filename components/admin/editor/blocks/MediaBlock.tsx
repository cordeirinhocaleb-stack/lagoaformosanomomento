
import React from 'react';
import { ContentBlock } from '../../../types';

interface MediaBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  isUploading?: boolean;
  onSelect: () => void;
}

const MediaBlock: React.FC<MediaBlockProps> = ({ block, isSelected, isUploading, onSelect }) => {
  const isVideo = block.type === 'video';
  const style = block.settings.style || 'clean';
  const content = block.content;

  const videoId = typeof content === 'string' ? content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;

  // Lógica de Container Dinâmico para o Preview do Editor
  const getContainerStyles = () => {
      if (!isVideo) return {};
      switch(style) {
          case 'cinema': return { backgroundColor: '#000', padding: '40px 0', width: '100%' };
          case 'shorts': return { width: '300px', margin: '0 auto', aspectRatio: '9/16' };
          case 'news_card': return { backgroundColor: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
          default: return {};
      }
  };

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`p-4 transition-all ${isSelected ? 'ring-2 ring-blue-500 rounded-2xl bg-blue-50/20' : ''}`}
    >
      {isVideo && style === 'native' && block.settings.videoTitle && (
          <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 mb-2">{block.settings.videoTitle}</h4>
      )}

      <div 
        className={`relative overflow-hidden transition-all ${style === 'polaroid' ? 'p-4 bg-white border border-zinc-200' : 'rounded-2xl'}`}
        style={{ ...getContainerStyles(), margin: isVideo && style === 'shorts' ? '0 auto' : '0 auto' }}
      >
        {isVideo ? (
            <div className={`aspect-video bg-black flex items-center justify-center overflow-hidden ${style === 'shorts' ? 'h-full aspect-[9/16]' : ''}`}>
                {embedUrl ? (
                    <iframe 
                        src={embedUrl} 
                        className="w-full h-full pointer-events-none" 
                        title="Preview YouTube"
                    />
                ) : (
                    <div className="text-center p-8">
                        <i className="fab fa-youtube text-5xl text-red-600 mb-4 animate-pulse"></i>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Aguardando link do YouTube...</p>
                        <p className="text-[8px] text-zinc-500 uppercase mt-2">Clique aqui e cole o link no painel lateral</p>
                    </div>
                )}
                <div className="absolute inset-0 bg-transparent"></div>
                {/* Overlay de Edição */}
                <div className="absolute top-2 left-2 bg-black/50 text-[8px] font-black text-white px-2 py-1 rounded uppercase tracking-widest">
                    Preview: {style}
                </div>
            </div>
        ) : (
            <img src={block.content || 'https://placehold.co/1200x675?text=Carregando+Drive...'} className="w-full h-auto object-cover" alt="Drive Media" />
        )}

        {isUploading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-md">
                <i className="fas fa-circle-notch fa-spin text-white text-3xl mb-2"></i>
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Sincronizando Google Cloud...</span>
            </div>
        )}
      </div>
      
      {isVideo && (
          <div className="mt-2 flex justify-between items-center text-zinc-400">
              <span className="text-[8px] font-bold uppercase tracking-widest">YouTube Cloud Mode</span>
          </div>
      )}

      {block.settings.caption && (
        <p className="text-center font-serif italic mt-4 text-zinc-500 text-sm">{block.settings.caption}</p>
      )}
    </div>
  );
};

export default MediaBlock;
