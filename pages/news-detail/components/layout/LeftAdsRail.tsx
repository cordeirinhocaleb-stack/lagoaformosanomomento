
import React from 'react';
import { Advertiser } from '../../../../types';

interface LeftAdsRailProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
    onPlanRequest?: () => void; // New prop
}

const LeftAdsRail: React.FC<LeftAdsRailProps> = ({ advertisers, onAdvertiserClick, onPlanRequest }) => {
    const supporters = advertisers.filter(ad => ad.isActive).slice(0, 5);

    return (
        <nav aria-label="Nossos Apoiadores" className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] p-5 shadow-sm">
                <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span> Apoiadores
                </h5>
                
                <div className="flex flex-col gap-2.5">
                    {supporters.length > 0 ? supporters.map(ad => (
                        <button 
                            key={ad.id}
                            onClick={() => onAdvertiserClick(ad)}
                            className="group w-full flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-all text-left hover:shadow-md"
                        >
                            <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                {ad.logoUrl ? (
                                    <img src={ad.logoUrl} className="w-full h-full object-contain" alt="" />
                                ) : (
                                    <i className="fas fa-store text-gray-300 text-[10px]"></i>
                                )}
                            </div>
                            <p className="text-[10px] font-black text-gray-900 dark:text-zinc-200 uppercase truncate flex-1 tracking-tighter">{ad.name}</p>
                        </button>
                    )) : (
                        <p className="text-[8px] font-bold text-gray-300 text-center py-6 uppercase tracking-widest">Espaço Reservado</p>
                    )}
                </div>
            </div>

            {/* Bloco Comercial Corrigido - Muito Compacto */}
            <div 
                onClick={onPlanRequest}
                className="bg-gray-100/50 dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center p-5 text-center group hover:border-red-500/50 transition-colors cursor-pointer"
            >
                <i className="fas fa-rectangle-ad text-gray-300 dark:text-zinc-700 text-xl mb-2 group-hover:text-red-500 transition-colors"></i>
                <p className="text-[9px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-widest leading-none">Anuncie Aqui</p>
                <span className="mt-2 text-[8px] font-black uppercase text-red-600 hover:underline">Saber Mais</span>
            </div>
        </nav>
    );
};

export default LeftAdsRail;
