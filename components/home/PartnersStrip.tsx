import React, { useRef, useEffect, useState } from 'react';
import { Advertiser } from '../../types';

interface PartnersStripProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
}

const PartnersStrip: React.FC<PartnersStripProps> = ({ advertisers, onAdvertiserClick }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    // Filtra apenas parceiros ativos
    const activePartners = advertisers.filter(ad => ad.isActive);
    
    // Duplica para o efeito de loop infinito
    const loopPartners = [...activePartners, ...activePartners, ...activePartners];

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || activePartners.length === 0) return;

        let interval: any;
        if (!isPaused) {
            interval = setInterval(() => {
                if (container.scrollLeft >= container.scrollWidth / 2) {
                    container.scrollLeft = 0;
                } else {
                    container.scrollLeft += 0.8;
                }
            }, 30);
        }
        return () => clearInterval(interval);
    }, [isPaused, activePartners.length]);

    if (activePartners.length === 0) return null;

    return (
        <div 
            className="w-full bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 py-3 overflow-hidden relative group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-[1500px] mx-auto flex items-center px-4">
                {/* Título Fixo Lateral */}
                <div className="flex items-center gap-3 pr-6 border-r border-gray-100 dark:border-zinc-800 shrink-0 z-10 bg-white dark:bg-zinc-900">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-[1000] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 italic">Parceiros</span>
                </div>

                {/* Carrossel de Logos */}
                <div 
                    ref={scrollRef}
                    className="flex items-center gap-12 md:gap-20 overflow-hidden whitespace-nowrap pl-8"
                >
                    {loopPartners.map((partner, idx) => (
                        <button
                            key={`${partner.id}-${idx}`}
                            onClick={() => onAdvertiserClick(partner)}
                            className="flex items-center gap-3 group/logo grayscale hover:grayscale-0 transition-all duration-500 shrink-0"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-lg p-1 group-hover/logo:scale-110 transition-transform shadow-sm">
                                {partner.logoUrl ? (
                                    <img src={partner.logoUrl} className="w-full h-full object-contain" alt={partner.name} />
                                ) : (
                                    <i className={`fas ${partner.logoIcon || 'fa-store'} text-zinc-300 dark:text-zinc-600 text-sm`}></i>
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 group-hover/logo:text-red-600 transition-colors tracking-tighter">
                                {partner.name}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sombras de fade nas laterais */}
                <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-zinc-900 pointer-events-none z-10"></div>
            </div>
        </div>
    );
};

export default PartnersStrip;