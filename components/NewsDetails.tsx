
import React, { useState } from 'react';
import { NewsItem } from '../types';
import Logo from './Logo';

interface NewsDetailsProps {
  news: NewsItem;
  onBack: () => void;
}

const NewsDetails: React.FC<NewsDetailsProps> = ({ news, onBack }) => {
  const isYoutube = news.videoUrl?.includes('youtube.com') || news.videoUrl?.includes('youtu.be');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const nextImage = () => {
    if (news.galleryUrls) {
      setCurrentGalleryIndex((prev) => (prev + 1) % news.galleryUrls!.length);
    }
  };

  const prevImage = () => {
    if (news.galleryUrls) {
      setCurrentGalleryIndex((prev) => (prev - 1 + news.galleryUrls!.length) % news.galleryUrls!.length);
    }
  };

  return (
    <div className="bg-white min-h-screen animate-fadeIn pb-24 md:pb-10">
      {/* Header da Notícia Otimizado */}
      <div className="relative w-full bg-black">
        {/* Se for vídeo de destaque, exibe o player ou iframe, senão exibe imagem */}
        {news.mediaType === 'video' && news.videoUrl ? (
          <div className="aspect-video w-full bg-black">
             {isYoutube ? (
               <iframe 
                 src={news.videoUrl} 
                 className="w-full h-full" 
                 title={news.title}
                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                 allowFullScreen
               ></iframe>
             ) : (
               <video src={news.videoUrl} controls className="w-full h-full object-contain" />
             )}
          </div>
        ) : (
          <div className="h-72 md:h-[500px] w-full relative">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover object-center opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/50"></div>
          </div>
        )}
        
        {/* Botão Voltar Flutuante */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 bg-white/90 backdrop-blur text-black w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
        >
          <i className="fas fa-arrow-left"></i>
        </button>

        {/* Se não for vídeo (ou seja, imagem de capa), mostra título sobreposto. Se for vídeo, título vai abaixo */}
        {news.mediaType !== 'video' && (
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest italic mb-3 inline-block">
              {news.category}
            </span>
            <h1 className="text-2xl md:text-5xl font-black text-gray-900 serif leading-tight drop-shadow-lg">
              {news.title}
            </h1>
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Se for vídeo, coloca o título aqui em baixo pois o player ocupou o header */}
        {news.mediaType === 'video' && (
          <div className="mb-8">
             <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest italic mb-3 inline-block">
               {news.category}
             </span>
             <h1 className="text-2xl md:text-5xl font-black text-gray-900 serif leading-tight">
               {news.title}
             </h1>
          </div>
        )}

        {/* Info do Autor */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-white border-2 border-red-600 flex items-center justify-center overflow-hidden shadow-lg">
            <Logo className="scale-125" />
          </div>
          <div>
            <p className="font-black text-gray-900 uppercase italic">Por {news.author}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{news.createdAt ? new Date(news.createdAt).toLocaleDateString() : 'Hoje'} • Lagoa Formosa</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all">
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
        </div>

        {/* Conteúdo da Notícia - Renderização WYSIWYG */}
        <article className="prose prose-lg max-w-none prose-red mb-12">
          {/* Excerpt estilizado */}
          {news.lead && (
            <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed mb-8 italic border-l-4 border-red-600 pl-6 bg-gray-50 py-6 rounded-r-2xl">
              {news.lead}
            </p>
          )}
          
          {/* Conteúdo Rico - AQUI ESTÁ A LÓGICA DE COMPATIBILIDADE VISUAL COM O EDITOR */}
          <div 
            className="text-gray-800 leading-loose space-y-6 text-lg 
            prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-4 
            prose-iframe:rounded-2xl prose-iframe:shadow-xl prose-iframe:my-8 prose-iframe:w-full
            prose-h2:text-3xl prose-h2:font-black prose-h2:uppercase prose-h2:italic prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8
            prose-a:text-red-600 prose-a:font-bold hover:prose-a:text-black
            prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:rounded-r-xl"
            dangerouslySetInnerHTML={{ 
              __html: news.content 
            }}
          />
        </article>

        {/* GALERIA / CARROSSEL (Se existir) */}
        {news.galleryUrls && news.galleryUrls.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-black uppercase text-gray-900 tracking-tight mb-6 flex items-center gap-3">
              <i className="fas fa-images text-red-600"></i> Galeria de Fotos
            </h3>
            
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group">
              <div className="aspect-[16/9] md:aspect-[21/9]">
                <img 
                  src={news.galleryUrls[currentGalleryIndex]} 
                  className="w-full h-full object-contain" 
                  alt={`Galeria ${currentGalleryIndex + 1}`} 
                />
              </div>
              
              {/* Controles do Carrossel */}
              {news.galleryUrls.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-4 py-1 rounded-full text-white text-xs font-black uppercase tracking-widest">
                    {currentGalleryIndex + 1} / {news.galleryUrls.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Miniaturas */}
            {news.galleryUrls.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {news.galleryUrls.map((url, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentGalleryIndex(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentGalleryIndex === idx ? 'border-red-600 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rodapé da Notícia */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6 text-center">Fim da Reportagem</h4>
          <button 
            onClick={onBack}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-xl"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
