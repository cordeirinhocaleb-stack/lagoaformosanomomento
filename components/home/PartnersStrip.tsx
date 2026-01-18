
import React, { useRef, useEffect, useState } from 'react';
import { Advertiser } from '../../types';
import { AdvertiserCard } from '../common/AdvertiserCard';

interface PartnersStripProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
    onPricingClick?: () => void;
}

const PartnersStrip: React.FC<PartnersStripProps> = ({ advertisers, onAdvertiserClick, onPricingClick }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Filtra apenas parceiros ativos e garante que cada anunciante seja único pelo NOME
    const activePartners = Array.from(new Map(
        advertisers.filter(ad => ad.isActive).map(ad => [ad.name, ad])
    ).values());

    // Lista final: 1 único card por anunciante
    const loopPartners = activePartners;

    useEffect(() => {
        // Auto-scroll removido a pedido: "não repita os anuncios"
        // O usuário agora navega manualmente ou vê a lista estática
    }, [activePartners.length]);

    const scrollManual = (direction: 'left' | 'right') => {
        const container = scrollRef.current;
        if (!container) return;

        const jump = 350;
        const target = direction === 'right' ? container.scrollLeft + jump : container.scrollLeft - jump;

        container.scrollTo({ left: target, behavior: 'smooth' });
    };

    // if (activePartners.length === 0) { return null; } // REMOVIDO: Mostrar CTA mesmo sem parceiros

    return (
        <div
            className="w-full bg-white dark:bg-[#050505] py-4 md:py-4 overflow-hidden relative group/strip border-b border-gray-100 dark:border-white/5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 relative">

                {/* HEADER: TITLE + CTA (STAY FIXED ABOVE MARQUEE) */}
                <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
                    <div className="flex items-center gap-5">
                        <div className="w-2.5 h-9 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)]"></div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white flex items-center gap-3">
                            Parceiros <span className="text-red-600">Master</span>
                        </h2>
                    </div>

                    {onPricingClick && (
                        <button
                            onClick={onPricingClick}
                            className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-8 py-3 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all border border-red-100 hover:border-red-600 flex items-center gap-3 group/cta shadow-sm hover:shadow-xl hover:shadow-red-500/20 active:scale-95"
                        >
                            Seja um anunciante master
                            <i className="fas fa-arrow-right group-hover/cta:translate-x-1 transition-transform"></i>
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
                        className="flex items-center gap-2 md:gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap py-6 scroll-smooth"
                    >
                        {loopPartners.length > 0 ? (
                            loopPartners.map((partner, idx) => (
                                <AdvertiserCard
                                    key={`${partner.id}-${idx}`}
                                    ad={partner}
                                    onClick={onAdvertiserClick}
                                    className="w-28 md:w-72 shrink-0 bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5"
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