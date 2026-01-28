
import React, { useState, useEffect, useRef } from 'react';
import { Advertiser, AdPricingConfig } from '../../../../types';
import { AdvertiserCard } from '../../../../components/common/AdvertiserCard';

interface LeftAdsRailProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
    onPlanRequest?: () => void;
    adConfig?: AdPricingConfig;
    isStatic?: boolean;
}

/**
 * [COMPONENTE UI] Lateral de Apoiadores
 * Rail vertical com rolagem infinita suave.
 */
const LeftAdsRail: React.FC<LeftAdsRailProps> = ({
    advertisers,
    onAdvertiserClick,
    onPlanRequest,
    adConfig,
    isStatic = false // Voltando para rolagem automática por padrão
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const virtualPosRef = useRef(0);

    // Filtra exclusivamente parceiros Master ativos (incluindo plano lancamento)
    const supporters = advertisers.filter(ad => ad.isActive && (ad.plan?.toLowerCase() === 'master' || ad.plan?.toLowerCase() === 'lancamento'));

    // Lista para loop infinito vertical (6x para garantir preenchimento fluido)
    const loopSupporters = (!isStatic && supporters.length >= 1) ? Array(6).fill(supporters).flat() : supporters;

    useEffect(() => {
        if (isStatic || loopSupporters.length === 0 || isPaused) return;

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

            // Altura de um set único (sem as repetições)
            const currentSetHeight = container.scrollHeight / 6;
            if (currentSetHeight <= 0) {
                animationFrameId = requestAnimationFrame(scroll);
                return;
            }

            // VELOCIDADE REDUZIDA (antes era 0.045, agora 0.02 para ser mais devagar)
            const speed = 0.02;
            virtualPosRef.current += speed * deltaTime;

            // Reset do loop
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
    }, [isStatic, loopSupporters.length, isPaused]);

    return (
        <nav aria-label="Nossos Apoiadores" className="h-full space-y-4">
            <div
                className={`flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[1.2rem] p-4 lg:p-5 shadow-sm ${!isStatic ? 'overflow-hidden' : ''}`}
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
                    className={`${!isStatic ? 'flex-grow flex flex-col gap-4 overflow-hidden scrollbar-hide' : 'space-y-4'}`}
                >
                    {loopSupporters.length > 0 ? loopSupporters.map((ad, idx) => (
                        <AdvertiserCard
                            key={`${ad.id}-${idx}`}
                            ad={ad}
                            onClick={onAdvertiserClick}
                            className="min-h-[160px] w-full shrink-0"
                        />
                    )) : (
                        <div className="py-10 flex flex-col items-center justify-center opacity-40">
                            <i className="fas fa-crown text-2xl mb-2"></i>
                            <p className="text-[7px] font-bold text-gray-300 text-center uppercase tracking-widest leading-tight">Espaço Master<br />Disponível</p>
                        </div>
                    )}
                </div>

                {/* Link para se tornar parceiro master */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <button
                        onClick={onPlanRequest}
                        className="w-full bg-red-600 hover:bg-black text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-plus-circle"></i>
                        Seja um Parceiro Master
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default LeftAdsRail;
