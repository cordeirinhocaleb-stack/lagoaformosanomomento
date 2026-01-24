import React from 'react';
import { User } from '@/types';

interface ResourcesSectionProps {
    user: User;
    userAds: any[];
    darkMode: boolean;
    openHistory: (label: string, query?: string) => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
    user,
    userAds,
    darkMode,
    openHistory
}) => {
    // 1. Recursos Base (Planos Ativos)
    let resources: any = {
        videoLimit: 0,
        socialPublications: { instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 },
        displayLocations: { homeBar: false, sidebar: false, footer: false, homeBanner: false, popup: false }
    };

    const PLAN_DEFAULTS: Record<string, any> = {
        'master': { videoLimit: 1, socialPublications: { instagram: 5, facebook: 5, youtube: 1 }, displayLocations: { homeBanner: true, sidebar: true } },
        'mensal': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3 }, displayLocations: { sidebar: true } },
        'lancamento': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3, youtube: 1 }, displayLocations: { homeBanner: true } }
    };

    if (user.activePlans?.length) {
        user.activePlans.forEach(pid => {
            const key = Object.keys(PLAN_DEFAULTS).find(k => pid.toLowerCase().includes(k)) || 'mensal';
            const def = PLAN_DEFAULTS[key];
            resources.videoLimit += (def.videoLimit || 0);
            if (def.socialPublications) {
                Object.keys(def.socialPublications).forEach(k => {
                    resources.socialPublications[k] = (resources.socialPublications[k] || 0) + (def.socialPublications[k] || 0);
                });
            }
            if (def.displayLocations) {
                Object.keys(def.displayLocations).forEach(k => {
                    if (def.displayLocations[k]) resources.displayLocations[k] = true;
                });
            }
        });
    }

    // 2. Somar/Mesclar dados comerciais reais (Boosts e Overrides manuais)
    if (user.commercialData) {
        const cd = user.commercialData;
        resources.videoLimit += (cd.videoLimit || 0);

        if (cd.socialPublications) {
            Object.keys(cd.socialPublications).forEach(k => {
                resources.socialPublications[k] = (resources.socialPublications[k] || 0) + (cd.socialPublications[k] || 0);
            });
        }

        if (cd.displayLocations) {
            Object.keys(cd.displayLocations).forEach(k => {
                if (cd.displayLocations[k]) resources.displayLocations[k] = true;
            });
        }
    }

    // CÁLCULO DE SALDO
    const usage = { video: 0, instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 };
    userAds.forEach((ad: any) => {
        if (ad.isActive === false) return;
        const n = ad.name?.toLowerCase() || '';
        const c = ad.category?.toLowerCase() || '';
        const t = ad.type?.toLowerCase() || '';
        if (c === 'video' || t === 'video') usage.video++;
        else if (n.includes('insta')) usage.instagram++;
        else if (n.includes('face')) usage.facebook++;
        else if (n.includes('youtu')) usage.youtube++;
        else if (n.includes('tiktok')) usage.tiktok++;
        else if (n.includes('whats')) usage.whatsapp++;
    });

    const netResources = JSON.parse(JSON.stringify(resources));
    if (netResources.videoLimit !== undefined) netResources.videoLimit = Math.max(0, netResources.videoLimit - usage.video);
    if (netResources.socialPublications) {
        const sp = netResources.socialPublications;
        if (sp.instagram !== undefined) sp.instagram = Math.max(0, sp.instagram - usage.instagram);
        if (sp.facebook !== undefined) sp.facebook = Math.max(0, sp.facebook - usage.facebook);
        if (sp.youtube !== undefined) sp.youtube = Math.max(0, sp.youtube - usage.youtube);
        if (sp.tiktok !== undefined) sp.tiktok = Math.max(0, sp.tiktok - usage.tiktok);
        if (sp.whatsapp !== undefined) sp.whatsapp = Math.max(0, sp.whatsapp - usage.whatsapp);
    }

    const tokens: any[] = [];
    if ((resources.videoLimit || 0) > 0) {
        tokens.push({ icon: 'fas fa-clapperboard', label: 'Vídeos', count: netResources.videoLimit, total: resources.videoLimit, color: 'text-pink-500', border: darkMode ? 'border-pink-500/20 bg-pink-900/20' : 'border-pink-500/20 bg-pink-50' });
    }
    if (resources.socialPublications) {
        const sp = resources.socialPublications;
        const nsp = netResources.socialPublications || {};
        if (sp.instagram > 0) tokens.push({ icon: 'fab fa-instagram', label: 'Instagram', count: nsp.instagram || 0, total: sp.instagram, color: 'text-fuchsia-600', border: darkMode ? 'border-fuchsia-500/20 bg-fuchsia-900/20' : 'border-fuchsia-500/20 bg-fuchsia-50' });
        if (sp.facebook > 0) tokens.push({ icon: 'fab fa-facebook-f', label: 'Facebook', count: nsp.facebook || 0, total: sp.facebook, color: 'text-blue-600', border: darkMode ? 'border-blue-500/20 bg-blue-900/20' : 'border-blue-500/20 bg-blue-50' });
        if (sp.youtube > 0) tokens.push({ icon: 'fab fa-youtube', label: 'Youtube', count: nsp.youtube || 0, total: sp.youtube, color: 'text-red-600', border: darkMode ? 'border-red-500/20 bg-red-900/20' : 'border-red-500/20 bg-red-50' });
        if (sp.tiktok > 0) tokens.push({ icon: 'fab fa-tiktok', label: 'TikTok', count: nsp.tiktok || 0, total: sp.tiktok, color: 'text-black dark:text-white', border: darkMode ? 'border-gray-500/20 bg-gray-900/20' : 'border-gray-500/20 bg-gray-50' });
        if (sp.whatsapp > 0) tokens.push({ icon: 'fab fa-whatsapp', label: 'WhatsApp', count: nsp.whatsapp || 0, total: sp.whatsapp, color: 'text-green-600', border: darkMode ? 'border-green-500/20 bg-green-900/20' : 'border-green-500/20 bg-green-50' });
    }
    if (resources.displayLocations) {
        const dl = resources.displayLocations;
        if (dl.homeBanner) tokens.push({ icon: 'fas fa-window-maximize', label: 'Banner Home', color: 'text-indigo-600', border: darkMode ? 'border-indigo-500/20 bg-indigo-900/20' : 'border-indigo-500/20 bg-indigo-50' });
        if (dl.sidebar) tokens.push({ icon: 'fas fa-table-columns', label: 'Sidebar', color: 'text-violet-600', border: darkMode ? 'border-violet-500/20 bg-violet-900/20' : 'border-violet-500/20 bg-violet-50' });
        if (dl.footer) tokens.push({ icon: 'fas fa-shoe-prints', label: 'Rodapé', color: 'text-emerald-600', border: darkMode ? 'border-emerald-500/20 bg-emerald-900/20' : 'border-emerald-500/20 bg-emerald-50' });
        if (dl.homeBar) tokens.push({ icon: 'fas fa-arrow-up', label: 'Barra Topo', color: 'text-amber-600', border: darkMode ? 'border-amber-500/20 bg-amber-900/20' : 'border-amber-500/20 bg-amber-50' });
        if (dl.popup) tokens.push({ icon: 'fas fa-clone', label: 'Popup', color: 'text-orange-600', border: darkMode ? 'border-orange-500/20 bg-orange-900/20' : 'border-orange-500/20 bg-orange-50' });
    }

    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <i className="fas fa-cubes text-purple-500"></i> Créditos Disponíveis
            </h3>
            {tokens.length === 0 ? (
                <div className={`p-4 rounded-xl text-center border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhum recurso disponível.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {tokens.map((token, idx) => {
                        let query = token.label;
                        if (token.label === 'Vídeos') query = 'Vídeo';
                        if (token.label === 'Barra Topo') query = 'Scroll Topo';

                        return (
                            <div
                                key={idx}
                                onClick={() => openHistory(token.label, query)}
                                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all hover:scale-105 cursor-pointer hover:shadow-lg ${token.border}`}
                                title={`Clique para ver histórico de ${token.label}`}
                            >
                                <i className={`${token.icon} ${token.color} text-2xl drop-shadow-lg`}></i>
                                <div className="flex flex-col items-center leading-none mt-1">
                                    <span className={`text-[12px] font-black ${darkMode ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>{token.count !== undefined ? `${token.count}/${token.total}` : 'Ativo'}</span>
                                    <span className={`text-[8px] font-black uppercase text-center mt-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                        {token.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
