
import React, { useState, useMemo, useEffect } from 'react';
import { NewsItem, Advertiser } from '../types';
import Logo from '../components/common/Logo';

interface NewsDetailProps {
  news: NewsItem;
  onBack: () => void;
  advertisers?: Advertiser[];
  onAdvertiserClick?: (ad: Advertiser) => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack, advertisers = [], onAdvertiserClick }) => {
  const isYoutube = news.videoUrl?.includes('youtube.com') || news.videoUrl?.includes('youtu.be');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Filtra Anunciantes PREMIUM para exibir no final
  const premiumSponsors = useMemo(() => {
      const now = new Date();
      return advertisers.filter(ad => {
          if (!ad.isActive) return false;
          if (new Date(ad.endDate) < now) return false;
          if (new Date(ad.startDate) > now) return false;
          
          // Verifica se é plano premium (ou master se quiser incluir ambos)
          return ad.plan === 'premium' || ad.plan === 'master';
      }).sort(() => Math.random() - 0.5); // Randomiza a ordem
  }, [advertisers]);

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

  // Carrossel Automático
  useEffect(() => {
    if (!news.galleryUrls || news.galleryUrls.length <= 1) return;
    
    const interval = setInterval(() => {
        setCurrentGalleryIndex((prev) => (prev + 1) % news.galleryUrls!.length);
    }, 4500); // 4.5 segundos (rotação lenta)

    return () => clearInterval(interval);
  }, [news.galleryUrls]);

  // --- FORMATAÇÃO DE DATA PROFISSIONAL ---
  const dateObj = new Date(news.createdAt);
  
  const formattedDate = useMemo(() => {
    return dateObj.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [dateObj]);

  const formattedTime = useMemo(() => {
    return dateObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [dateObj]);

  // Cálculo estimado de leitura (média de 200 palavras/min)
  const readingTime = useMemo(() => {
      const text = news.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
      const words = text.split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      return `${minutes} min de leitura`;
  }, [news.content]);

  return (
    <div className="bg-white min-h-screen animate-fadeIn pb-24 md:pb-10 font-sans">
      
      {/* 1. HERO SECTION (Mídia Principal) */}
      <div className="relative w-full bg-black group">
        {news.mediaType === 'video' && news.videoUrl ? (
          <div className="aspect-video w-full max-h-[80vh] bg-black mx-auto">
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
          <div className="h-[50vh] md:h-[65vh] w-full relative overflow-hidden">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover object-center opacity-90 transition-transform duration-[20s] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            
            {/* Créditos da Imagem na foto */}
            {news.imageCredits && (
                <div className="absolute bottom-4 right-4 text-[9px] text-white/60 uppercase tracking-widest font-bold bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                    Foto: {news.imageCredits}
                </div>
            )}
          </div>
        )}
        
        {/* Botão Voltar Flutuante */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 md:left-8 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all z-20 border border-white/20"
          title="Voltar"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
      </div>

      <div className="container mx-auto px-4 md:px-0 max-w-4xl -mt-16 relative z-10">
        <div className="bg-white rounded-t-[2.5rem] p-6 md:p-12 shadow-2xl border-t border-gray-100">
            
            {/* 2. CABEÇALHO DA MATÉRIA */}
            <header className="mb-10 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-6">
                    <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-red-200">
                        {news.category}
                    </span>
                    <div className="flex items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        <span><i className="far fa-clock mr-1"></i> {readingTime}</span>
                        <span>•</span>
                        <button className="hover:text-red-600 transition-colors"><i className="fas fa-share-alt mr-1"></i> Compartilhar</button>
                    </div>
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 serif leading-[1.1] mb-6 tracking-tight">
                    {news.title}
                </h1>

                {/* 3. BARRA DE METADADOS (Autor e Data) */}
                <div className="flex flex-col md:flex-row items-center gap-6 py-6 border-y border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-red-600 to-black">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
                                <Logo className="scale-150" /> 
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Escrito por</p>
                            <p className="font-black text-gray-900 uppercase italic text-sm">{news.author}</p>
                            <p className="text-[9px] text-red-600 font-bold uppercase tracking-wide">Redação Lagoa Formosa</p>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                    <div className="text-center md:text-left flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Publicado em</p>
                        <p className="text-sm font-bold text-gray-700 capitalize flex items-center justify-center md:justify-start gap-2">
                            <i className="far fa-calendar-alt text-gray-400"></i> {formattedDate}
                        </p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center justify-center md:justify-start gap-2">
                            <i className="far fa-clock text-gray-400"></i> às {formattedTime}
                        </p>
                    </div>
                </div>
            </header>

            {/* 4. CONTEÚDO (Artigo) */}
            <article className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-red-600 prose-img:rounded-3xl prose-img:shadow-xl">
                {/* Resumo (Lead) Destacado */}
                {news.lead && (
                    <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed mb-10 italic border-l-[6px] border-red-600 pl-6 py-2">
                        {news.lead}
                    </p>
                )}
                
                {/* Corpo do Texto */}
                <div 
                    className="text-gray-800 leading-loose text-lg font-serif space-y-6"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                />
            </article>

            {/* 5. GALERIA */}
            {news.galleryUrls && news.galleryUrls.length > 0 && (
                <div className="mt-16 bg-gray-50 rounded-[2rem] p-6 md:p-8 border border-gray-100">
                    <h3 className="text-xl font-black uppercase text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                        <i className="fas fa-camera text-red-600"></i> Galeria de Imagens
                    </h3>
                    
                    <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl group aspect-[16/9] md:aspect-[21/9]">
                        <img 
                            src={news.galleryUrls[currentGalleryIndex]} 
                            className="w-full h-full object-contain transition-opacity duration-1000 ease-in-out" 
                            alt={`Galeria ${currentGalleryIndex + 1}`} 
                        />
                        
                        {/* Controles */}
                        {news.galleryUrls.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"><i className="fas fa-chevron-left"></i></button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"><i className="fas fa-chevron-right"></i></button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                                    {currentGalleryIndex + 1} / {news.galleryUrls.length}
                                </div>
                            </>
                        )}
                    </div>
                    
                    {/* Thumbs */}
                    {news.galleryUrls.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {news.galleryUrls.map((url, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setCurrentGalleryIndex(idx)}
                                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentGalleryIndex === idx ? 'border-red-600 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={url} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 6. PATROCINADORES PREMIUM (Footer Ad) */}
            {premiumSponsors.length > 0 && (
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h4 className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6 flex items-center justify-center gap-4">
                        <span className="h-px bg-gray-200 w-16"></span>
                        Oferecimento Premium
                        <span className="h-px bg-gray-200 w-16"></span>
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {premiumSponsors.map(sponsor => (
                            <div 
                                key={sponsor.id} 
                                onClick={() => onAdvertiserClick && onAdvertiserClick(sponsor)}
                                className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-red-200 hover:shadow-lg transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-110 transition-transform">
                                    {sponsor.logoUrl ? (
                                        <img src={sponsor.logoUrl} alt={sponsor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <i className={`fas ${sponsor.logoIcon || 'fa-store'} text-gray-400`}></i>
                                    )}
                                </div>
                                <span className="text-[9px] font-black uppercase text-gray-800 text-center leading-tight group-hover:text-red-600 transition-colors">
                                    {sponsor.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 7. RODAPÉ DO ARTIGO */}
            <div className="mt-10 pt-10 border-t border-gray-100 flex flex-col items-center text-center">
                <div className="w-16 h-1 bg-red-600 rounded-full mb-6"></div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                    Fim da reportagem • Lagoa Formosa No Momento
                </p>
                <button 
                    onClick={onBack}
                    className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl hover:shadow-red-200 hover:-translate-y-1 flex items-center gap-3"
                >
                    <i className="fas fa-home"></i> Voltar ao Início
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
