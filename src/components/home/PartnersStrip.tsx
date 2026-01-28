
import React, { useRef, useEffect, useState } from 'react';
import { Advertiser } from '../../types';
import { AdvertiserCard } from '../common/AdvertiserCard';

interface PartnersStripProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
    onAdvertiserView?: (adId: string) => void;
    onPricingClick?: () => void;
}

const PartnersStrip: React.FC<PartnersStripProps> = ({ advertisers, onAdvertiserClick, onAdvertiserView, onPricingClick }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Filtra apenas parceiros ativos e garante que cada anunciante seja único pelo NOME
    const activePartners = Array.from(new Map(
        advertisers.filter(ad => ad.isActive).map(ad => [ad.name, ad])
    ).values());

    // Lista final: 12x para garantir scroll infinito seguro em qualquer tela
    // Isso garante que activePartners * 12 seja sempre maior que a tela + buffer de reset
    const shouldLoop = activePartners.length >= 1;
    const loopPartners = shouldLoop
        ? Array(12).fill(activePartners).flat()
        : activePartners;

    const virtualPosRef = useRef(0);

    // Motor de Animação Único e Ultra-Preciso
    useEffect(() => {
        if (!shouldLoop || isPaused) return;

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

            // Medição instantânea (1/12 do total)
            const currentSetOffset = container.scrollWidth / 12;
            if (currentSetOffset <= 0) {
                animationFrameId = requestAnimationFrame(scroll);
                return;
            }

            // Inicialização da posição virtual
            if (virtualPosRef.current === 0) {
                virtualPosRef.current = currentSetOffset;
            }

            const speed = 0.055;
            virtualPosRef.current += speed * deltaTime;

            // Loop Infinito Robusto
            if (virtualPosRef.current >= currentSetOffset * 2) {
                virtualPosRef.current -= currentSetOffset;
            } else if (virtualPosRef.current <= 0) {
                virtualPosRef.current += currentSetOffset;
            }

            // Aplicação física direta (SEM scroll-smooth para evitar lag)
            container.scrollLeft = virtualPosRef.current;

            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [shouldLoop, isPaused, activePartners.length]);

    const scrollManual = (direction: 'left' | 'right') => {
        const container = scrollRef.current;
        if (!container) return;
        const currentSetOffset = container.scrollWidth / 12;

        const jump = currentSetOffset;
        const target = direction === 'right' ? container.scrollLeft + jump : container.scrollLeft - jump;

        container.scrollTo({ left: target, behavior: 'smooth' });
    };

    return (
        <div
            className="w-full bg-white dark:bg-[#050505] pt-4 pb-1 md:pb-2 overflow-hidden relative group/strip border-b border-gray-100 dark:border-white/5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 relative">

                {/* HEADER: TITLE + CTA (STAY FIXED ABOVE MARQUEE) */}
                <div className="flex items-center justify-between mb-1 md:mb-2 px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-black dark:bg-white rounded-full"></div>
                        <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white flex items-center gap-1">
                            Parceiros <span className="text-red-600">Master</span>
                        </h2>
                    </div>

                    {onPricingClick && (
                        <button
                            onClick={onPricingClick}
                            className="group relative flex items-center justify-center bg-red-600 hover:bg-black text-white px-6 md:px-14 py-2 md:py-3 rounded-full transition-all duration-500 shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 active:scale-95 overflow-hidden border border-white/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <i className="fas fa-plus-circle text-[10px] md:text-sm"></i>
                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest ml-2">Anuncie aqui</span>
                        </button>
                    )}
                </div>

                <div className="relative">
                    {/* Botões de Scroll com Gradient Suave - Lado Esquerdo */}
                    {loopPartners.length > 0 && (
                        <div className="absolute -left-4 top-0 bottom-0 z-40 flex items-center pl-4 bg-gradient-to-r from-white via-white/80 to-transparent pr-32 opacity-0 group-hover/strip:opacity-100 transition-all duration-300 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollManual('left'); }}
                                className="bg-white shadow-2xl border border-gray-100 rounded-full w-14 h-14 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-90 pointer-events-auto"
                            >
                                <i className="fas fa-chevron-left text-lg"></i>
                            </button>
                        </div>
                    )}

                    {/* Botão de Scroll - Lado Direito */}
                    {loopPartners.length > 0 && (
                        <div className="absolute -right-4 top-0 bottom-0 z-40 flex items-center pr-4 bg-gradient-to-l from-white via-white/80 to-transparent pl-32 opacity-0 group-hover/strip:opacity-100 transition-all duration-300 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollManual('right'); }}
                                className="bg-white shadow-2xl border border-gray-100 rounded-full w-14 h-14 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-90 pointer-events-auto"
                            >
                                <i className="fas fa-chevron-right text-lg"></i>
                            </button>
                        </div>
                    )}

                    {/* Carrossel de Cards Verticais OU Placeholder Empty State */}
                    <div
                        ref={scrollRef}
                        className="flex items-center gap-2 md:gap-6 overflow-x-auto scrollbar-hide py-3 md:py-4"
                    >
                        {loopPartners.length > 0 ? (
                            loopPartners.map((partner, idx) => (
                                <AdvertiserCard
                                    key={`${partner.id}-${idx}`}
                                    ad={partner}
                                    onClick={onAdvertiserClick}
                                    onView={onAdvertiserView}
                                    className="flex-shrink-0 grow-0 basis-[48%] md:basis-[280px] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 !rounded-lg"
                                />
                            ))
                        ) : (
                            // EMPTY STATE: Sua Marca Aqui
                            <div
                                onClick={onPricingClick}
                                className="w-full h-40 md:h-56 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50/10 transition-all group/empty relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/empty:animate-shimmer" />
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-4 group-hover/empty:scale-110 transition-transform text-gray-400 dark:text-white/40 group-hover/empty:text-red-500 group-hover/empty:bg-red-100">
                                        <i className="fas fa-plus text-2xl"></i>
                                    </div>
                                    <h3 className="text-lg font-black uppercase text-gray-400 dark:text-white/40 group-hover/empty:text-red-500">
                                        Anuncie Aqui
                                    </h3>
                                    <p className="text-xs font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest mt-1">
                                        Sua marca em destaque
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnersStrip;