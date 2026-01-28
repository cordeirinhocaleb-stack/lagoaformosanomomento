
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
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const virtualPosRef = React.useRef(0);

    const supporters = advertisers.filter(ad => ad.isActive);

    // Lista para loop infinito vertical (4x para garantir preenchimento da altura)
    const loopSupporters = supporters.length >= 1 ? Array(4).fill(supporters).flat() : [];

    useEffect(() => {
        if (loopSupporters.length === 0 || isPaused) return;

        const container = scrollRef.current;
        if (!container) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        const scroll = (currentTime: number) => {
            if (!container || isPaused) {
                lastTime = currentTime;
                animationFrameId = requestAnimationFrame(scroll);
                return;
            }

            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            // Medição da altura de um set completo
            const currentSetHeight = container.scrollHeight / 4;
            if (currentSetHeight <= 0) {
                animationFrameId = requestAnimationFrame(scroll);
                return;
            }

            const speed = 0.052; // Velocidade 30% mais rápida (original: 0.04)
            virtualPosRef.current += speed * deltaTime;

            // Loop Infinito Vertical
            if (virtualPosRef.current >= currentSetHeight) {
                virtualPosRef.current -= currentSetHeight;
            }

            container.scrollTop = virtualPosRef.current;
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [loopSupporters.length, isPaused]);

    return (
        <nav aria-label="Nossos Apoiadores" className="space-y-4">
            <div
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] p-5 shadow-sm overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Apoiadores Master
                </h5>

                <div
                    ref={scrollRef}
                    className="flex flex-col gap-4 max-h-[500px] overflow-hidden scrollbar-hide"
                >
                    {loopSupporters.length > 0 ? loopSupporters.map((ad, idx) => (
                        <AdvertiserCard
                            key={`${ad.id}-${idx}`}
                            ad={ad}
                            onClick={onAdvertiserClick}
                            className="min-h-[190px] w-full flex-shrink-0"
                        />
                    )) : (
                        <p className="text-[8px] font-bold text-gray-300 text-center py-6 uppercase tracking-widest">Espaço Reservado</p>
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
