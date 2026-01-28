
import React, { useRef, useEffect, useState } from 'react';
import { Advertiser, AdPricingConfig } from '../../types';
import { getActiveAdsForSlot, trackAdView } from '../../services/adService';

interface AdBannerProps {
  advertisers?: Advertiser[];
  adConfig?: AdPricingConfig; // Config needed to check plan features
  onAdvertiserClick?: (advertiser: Advertiser) => void;
  onPlanRequest?: () => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ advertisers = [], adConfig, onAdvertiserClick, onPlanRequest }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Filtra anunciantes cujo plano tenha placement incluindo 'master_carousel'
  const masterAds = React.useMemo(() => {
    if (!adConfig) { return []; }

    const now = new Date();
    return advertisers.filter(ad => {
      if (!ad.isActive) { return false; }
      if (new Date(ad.endDate) < now) { return false; }
      if (new Date(ad.startDate) > now) { return false; }

      const plan = adConfig.plans.find(p => p.id === ad.plan);
      // Atualizado para verificar se 'placements' (array) inclui o local
      return plan && plan.features.placements && plan.features.placements.includes('master_carousel');
    }).sort(() => Math.random() - 0.5);
  }, [advertisers, adConfig]);

  useEffect(() => {
    masterAds.forEach(ad => trackAdView(ad.id));
  }, [masterAds]);

  // Triplicamos os itens para garantir o loop infinito (original + reserva esquerda + reserva direita)
  const loopAdvertisers = [...masterAds, ...masterAds, ...masterAds];

  useEffect(() => {
    if (loopAdvertisers.length === 0) { return; }

    let animationFrameId: number;
    let lastTime = performance.now();

    const startScroll = () => {
      if (scrollRef.current && masterAds.length > 0) {
        // Medição em tempo real garantida
        const setOffset = scrollRef.current.scrollWidth / 3;
        scrollRef.current.scrollLeft = setOffset;
      }
    };

    // Delay inicial para garantir renderização
    const timeoutId = setTimeout(startScroll, 150);

    const scroll = (currentTime: number) => {
      const container = scrollRef.current;
      if (!isPaused && container && masterAds.length > 0) {
        const deltaTime = currentTime - lastTime;
        const speed = 0.05;

        container.scrollLeft += speed * deltaTime;

        const setOffset = container.scrollWidth / 3;

        // Loop infinito robusto
        if (container.scrollLeft >= setOffset * 2) {
          container.scrollLeft -= setOffset;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += setOffset;
        }
      }
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [isPaused, loopAdvertisers.length, masterAds.length]);

  const scrollManual = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const setOffset = scrollRef.current.scrollWidth / 3;
      const scrollAmount = direction === 'left' ? -setOffset / 2 : setOffset / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section
      className="bg-white border-y border-gray-100 py-6 mb-6 overflow-hidden relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 mb-4 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-black rounded-full shadow-lg"></div>
          <h3 className="text-[12px] md:text-sm font-black text-black uppercase tracking-[0.2em] italic">
            Parceiros <span className="text-red-600">Master</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPlanRequest}
            className="group relative flex items-center justify-center bg-red-600 hover:bg-black text-white w-10 h-10 md:w-auto md:px-6 md:py-3 rounded-full transition-all duration-500 shadow-xl hover:shadow-red-600/20 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <i className="fas fa-plus-circle text-xs md:text-sm"></i>
            <span className="text-[11px] font-black uppercase tracking-widest hidden md:inline ml-2">Anuncie aqui</span>
          </button>
        </div>
      </div>

      {loopAdvertisers.length > 0 ? (
        <div className="relative">
          {/* Mobile Swipe Instruction */}
          <div className="md:hidden text-center mb-6">
            <span className="bg-gray-100 text-gray-500 text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-gray-200">
              <i className="fas fa-hand-pointer mr-2 animate-bounce"></i> Arraste para o lado
            </span>
          </div>
          <button
            onClick={() => scrollManual('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-xl hidden md:flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white active:scale-90"
          >
            <i className="fas fa-chevron-left"></i>
          </button>

          <button
            onClick={() => scrollManual('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-gray-100 rounded-full shadow-xl hidden md:flex items-center justify-center text-red-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white active:scale-90"
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/50 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/50 to-transparent z-20 pointer-events-none"></div>

          <div
            ref={scrollRef}
            className="flex overflow-x-hidden py-10"
          >
            {loopAdvertisers.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 grow-0 basis-[48%] md:basis-[280px] px-1 md:px-4 group/card cursor-pointer"
              >
                <div className="relative bg-white p-3 md:p-6 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm transition-all duration-500 group-hover/card:shadow-2xl group-hover/card:border-red-100 group-hover/card:-translate-y-2 overflow-hidden">
                  {/* Category Badge */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-zinc-800 text-white text-[7px] md:text-[9px] font-black uppercase px-2 md:px-3 py-1 rounded-full z-10 opacity-80 group-hover/card:bg-red-600 group-hover/card:opacity-100 transition-all">
                    {partner.category}
                  </div>

                  <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-6 shadow-inner transition-all duration-500 group-hover/card:scale-110 overflow-hidden border border-gray-50">
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} width="200" height="200" className="w-full h-full object-cover" />
                    ) : (
                      <i className={`fas ${partner.logoIcon || 'fa-store'} text-xl md:text-3xl text-gray-300 group-hover/card:text-red-600 transition-colors`}></i>
                    )}
                  </div>

                  <div className="text-center mb-4 md:mb-6">
                    <p className="text-[10px] md:text-[14px] font-black text-gray-900 uppercase leading-tight truncate px-2">
                      {partner.name}
                    </p>
                    <div className="w-4 h-0.5 bg-gray-200 mx-auto mt-2 transition-all group-hover/card:w-8 group-hover/card:bg-red-600"></div>
                  </div>

                  {/* Ver Site Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdvertiserClick && onAdvertiserClick(partner);
                    }}
                    className="w-full py-2 md:py-3 rounded-full bg-red-600 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-red-600/20"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Ver Site
                  </button>
                </div>
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
