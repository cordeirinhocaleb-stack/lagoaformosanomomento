import React, { useMemo } from 'react';
import { NewsItem, Advertiser, AdPricingConfig } from '../../../../types';
import ShareBar from '../tools/ShareBar';
import ReadingModeToggle from '../tools/ReadingModeToggle';
import PrintButton from '../tools/PrintButton';
import SavePostButton from '../tools/SavePostButton';
import { useActiveHeading } from '../../hooks/useActiveHeading';

interface RightToolsRailProps {
    news: NewsItem;
    toc: { id: string; text: string }[];
    isMini?: boolean;
    fontSize: 'base' | 'lg' | 'xl';
    setFontSize: (size: 'base' | 'lg' | 'xl') => void;
    readingMode: boolean;
    setReadingMode: (val: boolean) => void;
    onAuthorClick?: (id: string) => void;
    advertisers?: Advertiser[];
    onAdvertiserClick?: (ad: Advertiser) => void;
    adConfig?: AdPricingConfig;
}

const RightToolsRail: React.FC<RightToolsRailProps> = ({ 
    news, toc, isMini, readingMode, setReadingMode, onAuthorClick,
    advertisers = [], onAdvertiserClick, adConfig
}) => {
    const headingIds = toc.map(t => t.id);
    const activeId = useActiveHeading(headingIds);

    // Filtra Parceiros Master Ativos
    const masterPartners = useMemo(() => {
        if (!adConfig) {return [];}
        const now = new Date();
        return advertisers.filter(ad => {
            if (!ad.isActive) {return false;}
            if (new Date(ad.endDate) < now) {return false;}
            if (new Date(ad.startDate) > now) {return false;}
            
            const plan = adConfig.plans.find(p => p.id === ad.plan);
            return plan && plan.features.placements && plan.features.placements.includes('master_carousel');
        }).sort(() => Math.random() - 0.5);
    }, [advertisers, adConfig]);

    if (isMini) {
        return (
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-full p-2 shadow-2xl flex flex-col gap-4 animate-fadeInRight">
                <button onClick={() => setReadingMode(false)} className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <i className="fas fa-times"></i>
                </button>
                <SavePostButton newsId={news.id} mini />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bloco: Ações */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                    <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Ferramentas</h5>
                    <PrintButton />
                </div>
                
                <ShareBar title={news.title} url={window.location.href} />
                <hr className="border-gray-50 dark:border-zinc-800" />
                <SavePostButton newsId={news.id} />
                <ReadingModeToggle active={readingMode} toggle={() => setReadingMode(!readingMode)} />
            </div>

            {/* NOVO: Bloco Parceiros Master no Painel */}
            {masterPartners.length > 0 && (
                <div className="bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-6 shadow-xl border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl"></div>
                    
                    <h5 className="text-[9px] font-[1000] uppercase tracking-[0.3em] text-red-500 mb-6 flex items-center gap-2">
                        <i className="fas fa-crown"></i> Parceiros Master
                    </h5>

                    <div className="space-y-4">
                        {masterPartners.map(partner => (
                            <button 
                                key={partner.id}
                                onClick={() => onAdvertiserClick?.(partner)}
                                className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 transition-all text-left group/p"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 group-hover/p:scale-105 transition-transform shadow-lg">
                                    {partner.logoUrl ? (
                                        <img src={partner.logoUrl} className="w-full h-full object-contain" alt={partner.name} />
                                    ) : (
                                        <i className="fas fa-store text-zinc-300 text-xs"></i>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-black text-white uppercase truncate tracking-tight">{partner.name}</p>
                                    <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest">{partner.category}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5">
                        <button className="w-full text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                            Sua Marca aqui <i className="fas fa-arrow-right text-[7px]"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Bloco: Índice (TOC) */}
            {toc.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                    <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <i className="fas fa-list-ol text-red-600"></i> No Artigo
                    </h5>
                    <ul className="space-y-1">
                        {toc.map((item, idx) => (
                            <li key={idx}>
                                <button 
                                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                                    className={`text-left text-[11px] font-bold transition-all line-clamp-1 border-l-2 pl-3 py-1.5 w-full ${
                                        activeId === item.id 
                                        ? 'text-red-600 border-red-600 bg-red-50/50 dark:bg-red-900/10' 
                                        : 'text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    {item.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Bloco: Autor Clicável */}
            <button 
                onClick={() => onAuthorClick?.(news.authorId)}
                className="w-full text-left bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:ring-2 hover:ring-red-600 transition-all active:scale-[0.98]"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-600 rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-xl font-black shrink-0 border border-white/10 group-hover:border-white/40 transition-colors">
                        {news.author.charAt(0)}
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-red-500 uppercase tracking-widest">Redação LFNM</p>
                        <h4 className="text-xs font-black uppercase truncate group-hover:text-red-500 transition-colors">{news.author}</h4>
                        <p className="text-[7px] font-bold text-zinc-500 uppercase mt-1">Ver Perfil Completo <i className="fas fa-arrow-right ml-1"></i></p>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default RightToolsRail;