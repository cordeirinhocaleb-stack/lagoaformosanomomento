
import React from 'react';
import { Advertiser } from '../../../../types';

interface AdvertisersFooterProps {
    advertisers: Advertiser[];
    onAdvertiserClick: (ad: Advertiser) => void;
    onPlanRequest?: () => void; // New prop
}

const AdvertisersFooter: React.FC<AdvertisersFooterProps> = ({ advertisers, onAdvertiserClick, onPlanRequest }) => {
    const supporters = advertisers.filter(ad => ad.isActive).slice(0, 6);

    return (
        <div className="mt-20">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h3 className="text-sm font-[1000] uppercase tracking-widest text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <i className="fas fa-store text-red-600"></i> Parceiros Comerciais
                </h3>
                <button 
                    onClick={onPlanRequest}
                    className="text-[10px] font-black uppercase text-zinc-400 hover:text-red-600 transition-colors"
                >
                    Anuncie sua marca <i className="fas fa-arrow-right ml-1"></i>
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {supporters.map(ad => (
                    <button 
                        key={ad.id} 
                        onClick={() => onAdvertiserClick(ad)}
                        className="group bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-red-500/50 transition-all flex flex-col items-center text-center gap-3"
                    >
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700 p-2 overflow-hidden group-hover:scale-105 transition-transform">
                            {ad.logoUrl ? (
                                <img src={ad.logoUrl} className="w-full h-full object-contain" alt={ad.name} />
                            ) : (
                                <i className="fas fa-store text-zinc-300 dark:text-zinc-600 text-xl"></i>
                            )}
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-100 leading-tight truncate max-w-[120px]">{ad.name}</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{ad.category}</p>
                        </div>
                    </button>
                ))}
                
                {supporters.length < 6 && (
                    <div 
                        onClick={onPlanRequest}
                        className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <i className="fas fa-plus-circle text-zinc-200 dark:text-zinc-700 text-xl"></i>
                        <p className="text-[8px] font-bold text-zinc-300 dark:text-zinc-600 uppercase">Sua Marca <br/> Aqui</p>
                    </div>
                )}
            </div>
            
            <div className="mt-10 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20 text-center">
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-wide">Alcance milhares de pessoas em Lagoa Formosa!</p>
                <button 
                    onClick={onPlanRequest}
                    className="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                >
                    Anunciar Agora
                </button>
            </div>
        </div>
    );
};

export default AdvertisersFooter;
