
import React, { useRef, useEffect, useState } from 'react';
import { Advertiser } from '../types';
import { getActiveAdsForSlot, trackAdView } from '../services/adService';

interface AdBannerProps {
  advertisers?: Advertiser[];
  onAdvertiserClick?: (advertiser: Advertiser) => void;
  onPlanRequest?: () => void; // Nova prop
}

const AdBanner: React.FC<AdBannerProps> = ({ advertisers = [], onAdvertiserClick, onPlanRequest }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // 2.2 Algoritmo: Buscar apenas Campanhas Ativas com Plano = "Master"
  const masterAds = getActiveAdsForSlot(advertisers, 'master');
  
  // Registra views (apenas uma vez ao montar, para simplificar a simulação)
  useEffect(() => {
    masterAds.forEach(ad => trackAdView(ad.id));
  }, [masterAds]);

  // Se não houver anunciantes Master suficientes, não renderiza o carrossel, mas renderiza o call-to-action
  // Ajuste: Sempre renderiza a section para mostrar o botão de "Seja um Anunciante" se solicitado
  
  // Duplicamos para loop infinito apenas se houver itens
  const loopAdvertisers = [...masterAds, ...masterAds, ...masterAds, ...masterAds];

  useEffect(() => {
    if (loopAdvertisers.length === 0) return;

    let animationFrameId: number;
    
    const scroll = () => {
      if (!isPaused && scrollRef.current) {
        scrollRef.current.scrollLeft += 0.8; // Velocidade
        
        // Reset imperceptível
        if (scrollRef.current.scrollLeft >= (scrollRef.current.scrollWidth / 4) * 3) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth / 4;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, loopAdvertisers.length]);

  const scrollManual = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="bg-white border-y border-gray-100 py-6 mb-6 overflow-hidden relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 mb-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-5 bg-red-600 rounded-full animate-pulse"></span>
          <h3 className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Parceiros Master</h3>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onPlanRequest}
            className="text-[10px] font-black text-red-600 bg-red-50 px-4 py-1.5 rounded-full uppercase hover:bg-black hover:text-white transition-all border border-red-100 shadow-sm"
          >
            Seja um Anunciante Master <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>

      {loopAdvertisers.length > 0 ? (
        <div className="relative">
            <button 
            onClick={() => scrollManual('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-xl flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white active:scale-90"
            >
            <i className="fas fa-chevron-left"></i>
            </button>
            
            <button 
            onClick={() => scrollManual('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-xl flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white active:scale-90"
            >
            <i className="fas fa-chevron-right"></i>
            </button>

            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/50 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/50 to-transparent z-20 pointer-events-none"></div>

            <div 
            ref={scrollRef}
            className="flex overflow-x-hidden scroll-smooth whitespace-nowrap py-2"
            >
            {loopAdvertisers.map((partner, index) => (
                <div 
                key={`${partner.id}-${index}`}
                onClick={() => onAdvertiserClick && onAdvertiserClick(partner)}
                className="inline-block flex-shrink-0 w-[110px] md:w-[240px] mx-2 md:mx-3 bg-gray-50 p-3 md:p-6 rounded-xl md:rounded-[2.5rem] border border-gray-100 text-center transition-all hover:bg-white hover:shadow-2xl hover:border-red-200 hover:-translate-y-1 group/card cursor-pointer"
                >
                <div className="w-6 h-6 md:w-14 md:h-14 bg-white text-black group-hover/card:bg-red-600 group-hover/card:text-white rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-md transition-all duration-500 overflow-hidden">
                    {partner.logoUrl ? (
                    <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-cover" />
                    ) : (
                    <i className={`fas ${partner.logoIcon || 'fa-store'} text-[10px] md:text-2xl`}></i>
                    )}
                </div>
                <p className="text-[9px] md:text-[12px] font-black text-gray-900 uppercase leading-tight truncate group-hover/card:text-red-600">
                    {partner.name}
                </p>
                <p className="text-[7px] md:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 md:mt-2">
                    {partner.category}
                </p>
                </div>
            ))}
            </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center mx-4 border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Espaço disponível para sua marca</p>
            <button onClick={onPlanRequest} className="text-red-600 font-black uppercase text-sm mt-2 hover:underline">Anuncie Aqui</button>
        </div>
      )}
    </section>
  );
};

export default AdBanner;
