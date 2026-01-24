import React from 'react';
import { User } from '@/types';

interface BoostsSectionProps {
    user: User;
    darkMode: boolean;
    openHistory: (label: string, query?: string) => void;
}

export const BoostsSection: React.FC<BoostsSectionProps> = ({ user, darkMode, openHistory }) => {
    // Recalcula o base dos planos para encontrar a diferença (Boosts)
    let planResources = {
        videoLimit: 0,
        socialPublications: { instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 },
        displayLocations: { homeBar: false, sidebar: false, footer: false, homeBanner: false, popup: false }
    };
    const PLAN_DEFAULTS_CALC: Record<string, any> = {
        'master': { videoLimit: 1, socialPublications: { instagram: 5, facebook: 5, youtube: 1 }, displayLocations: { homeBanner: true, sidebar: true } },
        'mensal': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3 }, displayLocations: { sidebar: true } },
        'lancamento': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3, youtube: 1 }, displayLocations: { homeBanner: true } }
    };
    if (user.activePlans?.length) {
        user.activePlans.forEach(pid => {
            const key = Object.keys(PLAN_DEFAULTS_CALC).find(k => pid.toLowerCase().includes(k)) || 'mensal';
            const def = PLAN_DEFAULTS_CALC[key];
            planResources.videoLimit += (def.videoLimit || 0);
            if (def.socialPublications) {
                Object.keys(def.socialPublications).forEach(k => {
                    (planResources.socialPublications as any)[k] += (def.socialPublications[k] || 0);
                });
            }
            if (def.displayLocations) {
                Object.keys(def.displayLocations).forEach(k => {
                    if (def.displayLocations[k]) (planResources.displayLocations as any)[k] = true;
                });
            }
        });
    }

    const totalData = user.commercialData || {};
    const totalSocial = totalData.socialPublications || {};
    const totalLocs = totalData.displayLocations || {};

    const boosts = {
        videoLimit: Math.max(0, (totalData.videoLimit || 0) - planResources.videoLimit),
        instagram: Math.max(0, (totalSocial.instagram || 0) - planResources.socialPublications.instagram),
        facebook: Math.max(0, (totalSocial.facebook || 0) - planResources.socialPublications.facebook),
        youtube: Math.max(0, (totalSocial.youtube || 0) - planResources.socialPublications.youtube),
        tiktok: Math.max(0, (totalSocial.tiktok || 0) - planResources.socialPublications.tiktok),
        whatsapp: Math.max(0, (totalSocial.whatsapp || 0) - planResources.socialPublications.whatsapp),
        homeBar: !!totalLocs.homeBar && !planResources.displayLocations.homeBar,
        popup: !!totalLocs.popup && !planResources.displayLocations.popup,
        footer: !!totalLocs.footer && !planResources.displayLocations.footer,
        sidebar: !!totalLocs.sidebar && !planResources.displayLocations.sidebar,
        homeBanner: !!totalLocs.homeBanner && !planResources.displayLocations.homeBanner,
    };

    const hasBoosts = Object.values(boosts).some(v => v === true || (typeof v === 'number' && v > 0));

    if (!hasBoosts) return null;

    return (
        <div className={`rounded-xl p-6 border-2 border-dashed ${darkMode ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
            <h3 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-yellow-500' : 'text-yellow-700'}`}>
                <i className="fas fa-bolt"></i> Extrato de Itens Avulsos (Boosts)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {boosts.videoLimit > 0 && (
                    <div onClick={() => openHistory('Vídeos', 'Vídeo')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-pink-200'}`}>
                        <i className="fas fa-clapperboard text-pink-500 text-xl mb-1"></i>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.videoLimit}</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vídeos</span>
                    </div>
                )}
                {boosts.instagram > 0 && (
                    <div onClick={() => openHistory('Instagram')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-fuchsia-200'}`}>
                        <i className="fab fa-instagram text-fuchsia-600 text-xl mb-1"></i>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.instagram}</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Instagram</span>
                    </div>
                )}
                {boosts.facebook > 0 && (
                    <div onClick={() => openHistory('Facebook')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-blue-200'}`}>
                        <i className="fab fa-facebook-f text-blue-600 text-xl mb-1"></i>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.facebook}</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Facebook</span>
                    </div>
                )}
                {boosts.youtube > 0 && (
                    <div onClick={() => openHistory('Youtube')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-red-200'}`}>
                        <i className="fab fa-youtube text-red-600 text-xl mb-1"></i>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.youtube}</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Youtube</span>
                    </div>
                )}
                {boosts.tiktok > 0 && (
                    <div onClick={() => openHistory('TikTok')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-gray-200'}`}>
                        <i className="fab fa-tiktok text-black dark:text-white text-xl mb-1"></i>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.tiktok}</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>TikTok</span>
                    </div>
                )}
                {boosts.whatsapp > 0 && (
                    <div onClick={() => openHistory('WhatsApp')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-green-200'}`}>
                        <i className="fab fa-whatsapp text-green-600 text-xl mb-1"></i>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.whatsapp}</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>WhatsApp</span>
                    </div>
                )}
                {boosts.homeBar && (
                    <div onClick={() => openHistory('Barra Topo', 'Scroll Topo')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-amber-200'}`}>
                        <div className="relative">
                            <i className="fas fa-arrow-up text-amber-600 text-xl mb-1"></i>
                            <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                        </div>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Barra Topo</span>
                    </div>
                )}
                {boosts.popup && (
                    <div onClick={() => openHistory('Popup')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-orange-200'}`}>
                        <div className="relative">
                            <i className="fas fa-clone text-orange-600 text-xl mb-1"></i>
                            <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                        </div>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Popup</span>
                    </div>
                )}
                {boosts.homeBanner && (
                    <div onClick={() => openHistory('Banner')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-indigo-200'}`}>
                        <div className="relative">
                            <i className="fas fa-window-maximize text-indigo-600 text-xl mb-1"></i>
                            <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                        </div>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Banner</span>
                    </div>
                )}
                {boosts.sidebar && (
                    <div onClick={() => openHistory('Sidebar')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-violet-200'}`}>
                        <div className="relative">
                            <i className="fas fa-table-columns text-violet-600 text-xl mb-1"></i>
                            <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                        </div>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sidebar</span>
                    </div>
                )}
                {boosts.footer && (
                    <div onClick={() => openHistory('Rodapé')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-emerald-200'}`}>
                        <div className="relative">
                            <i className="fas fa-shoe-prints text-emerald-600 text-xl mb-1"></i>
                            <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                        </div>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                        <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rodapé</span>
                    </div>
                )}
            </div>
            <p className="text-[9px] text-gray-400 font-bold uppercase mt-3 text-center">
                * Estes itens já estão somados nos créditos disponíveis acima.
            </p>
        </div>
    );
};
