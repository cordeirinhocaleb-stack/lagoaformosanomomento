
import React, { useState, useEffect } from 'react';
import { Advertiser, AdPricingConfig } from '../../../../types';

import { AdvertiserCard } from '../../../../components/common/AdvertiserCard';

interface LeftAdsRailProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
    onPlanRequest?: () => void;
    adConfig?: AdPricingConfig;
}

const LeftAdsRail: React.FC<LeftAdsRailProps> = ({ advertisers, onAdvertiserClick, onPlanRequest, adConfig }) => {
    const supporters = advertisers.filter(ad => ad.isActive).slice(0, 5);

    return (
        <nav aria-label="Nossos Apoiadores" className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] p-5 shadow-sm">
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Apoiadores Master
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-4">
                    {supporters.length > 0 ? supporters.map(ad => (
                        <AdvertiserCard
                            key={ad.id}
                            ad={ad}
                            onClick={onAdvertiserClick}
                            className="min-h-[170px] lg:min-h-[190px]"
                        />
                    )) : (
                        <p className="col-span-full text-[8px] font-bold text-gray-300 text-center py-6 uppercase tracking-widest">Espaço Reservado</p>
                    )}
                </div>
            </div>

            {/* Bloco Comercial Dinâmico */}
            <div
                onClick={onPlanRequest}
                className="bg-zinc-900 border-2 border-dashed border-zinc-800 rounded-[2rem] p-5 lg:p-8 text-center group hover:border-red-600 transition-all cursor-pointer shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                        <i className="fas fa-rocket text-red-600 text-lg lg:text-xl group-hover:animate-bounce"></i>
                    </div>

                    <h5 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 lg:mb-3">Anuncie Aqui</h5>

                    <p className="text-white text-[10px] lg:text-[11px] font-[1000] uppercase italic leading-tight tracking-tight whitespace-pre-line mb-3 lg:mb-4">
                        {adConfig?.promoText || "Destaque sua marca para milhares de leitores todos os dias!"}
                    </p>

                    <button className="px-5 py-1.5 lg:px-6 lg:py-2 bg-red-600 text-white text-[8px] lg:text-[9px] font-black uppercase rounded-full group-hover:bg-white group-hover:text-black transition-all shadow-lg">
                        Saber Mais
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default LeftAdsRail;
