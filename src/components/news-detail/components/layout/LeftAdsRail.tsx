
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

    // Filtra exclusivamente parceiros Master ativos (incluindo plano lancamento)
    const supporters = advertisers.filter(ad => ad.isActive && (ad.plan?.toLowerCase() === 'master' || ad.plan?.toLowerCase() === 'lancamento'));

    // Lista para loop infinito vertical (6x para garantir preenchimento fluido em 2 colunas)
    const loopSupporters = supporters.length >= 1 ? Array(6).fill(supporters).flat() : [];

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

            // Medição da altura de um set completo (considerando Grid)
            // Em grid de 2 colunas, a altura total de um set é a metade se o array for duplicado, 
            // mas aqui estamos apenas repetindo o set. A altura de 1 set é total/6.
            const currentSetHeight = container.scrollHeight / 6;
            if (currentSetHeight <= 0) {
                animationFrameId = requestAnimationFrame(scroll);
                return;
            }

            const speed = 0.045; // Velocidade suave para visualização lateral
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
                className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] p-4 lg:p-5 shadow-sm overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex items-center justify-between mb-4 px-1">
                    <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 focus:outline-none">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        Parceiros <span className="text-red-600">Master</span>
                    </h5>
                </div>

                <div
                    ref={scrollRef}
                    className="grid grid-cols-1 gap-4 max-h-[800px] overflow-hidden scrollbar-hide"
                >
                    {loopSupporters.length > 0 ? loopSupporters.map((ad, idx) => (
                        <AdvertiserCard
                            key={`${ad.id}-${idx}`}
                            ad={ad}
                            onClick={onAdvertiserClick}
                            className="min-h-[120px] lg:min-h-[160px] w-full flex-shrink-0"
                            innerClassName="!p-1 lg:!p-2"
                        />
                    )) : (
                        <div className="col-span-2 py-10 flex flex-col items-center justify-center opacity-40">
                            <i className="fas fa-crown text-2xl mb-2"></i>
                            <p className="text-[7px] font-bold text-gray-300 text-center uppercase tracking-widest leading-tight">Espaço Master<br />Disponível</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Link para se tornar parceiro master */}
            <button
                onClick={onPlanRequest}
                className="w-full bg-red-600 hover:bg-black text-white py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
                <i className="fas fa-plus-circle"></i>
                Seja um Parceiro Master
            </button>
        </nav>
    );
};

export default LeftAdsRail;
