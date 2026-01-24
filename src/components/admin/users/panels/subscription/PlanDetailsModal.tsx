import React from 'react';
import { User, AdPricingConfig } from '@/types';

interface PlanDetailsModalProps {
    selectedPlanId: string;
    setSelectedPlanId: (id: string | null) => void;
    user: User;
    adConfig?: AdPricingConfig;
    darkMode: boolean;
}

export const PlanDetailsModal: React.FC<PlanDetailsModalProps> = ({
    selectedPlanId,
    setSelectedPlanId,
    user,
    adConfig,
    darkMode
}) => {
    const planConfig = adConfig?.plans.find(p => p.id === selectedPlanId);
    const planName = planConfig?.name || selectedPlanId;
    const commercial = user.commercialData || {};
    const socials = commercial.socialPublications || {};
    const locations = commercial.displayLocations || {};

    const features: any = planConfig?.features || {};

    const onSiteFeatures = {
        highlightDays: 'Dias em Destaque na Home',
        banners: 'Banners Rotativos',
        popups: 'Popups Semanais',
        storePage: 'Página Exclusiva da Loja',
        maxProducts: 'Limite de Anúncios no Site'
    };

    const locNames: Record<string, string> = {
        homeBar: 'Barra da Home',
        sidebar: 'Lateral (Artigos)',
        footer: 'Rodapé (Artigos)',
        homeBanner: 'Banner Principal',
        popup: 'Popup de Entrada'
    };

    return (
        <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPlanId(null)}></div>
            <div className={`relative w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-scaleIn border overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-[#0F0F0F] border-white/10' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl border border-blue-500/20">
                            <i className="fas fa-certificate"></i>
                        </div>
                        <div>
                            <h3 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>{planName}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Detalhes e Benefícios Ativos</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedPlanId(null)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                    <div className="space-y-6">
                        {/* SEÇÃO 1: PUBLICIDADE NO SITE */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-blue-900/10 to-transparent border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <i className="fas fa-globe text-6xl text-blue-500"></i>
                            </div>

                            <h4 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                <i className="fas fa-desktop"></i> Publicidade no Portal
                            </h4>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Locais de Exibição Ativos</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(Object.entries(locations) as [string, any][]).map(([loc, enabled]) => (
                                            enabled ? (
                                                <span key={loc} className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold uppercase shadow-sm flex items-center gap-1.5">
                                                    <i className="fas fa-check-circle text-[8px]"></i> {locNames[loc] || loc}
                                                </span>
                                            ) : null
                                        ))}
                                        {Object.values(locations).every(v => !v) && <span className="text-xs text-gray-500 italic">Nenhum local de exibição incluído.</span>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {(Object.entries(onSiteFeatures) as [string, string][]).map(([key, label]) => {
                                        const val = features[key];
                                        if (!val || val === 0) return null;
                                        return (
                                            <div key={key} className={`p-2 rounded-lg border flex flex-col ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/60 border-blue-100'}`}>
                                                <span className="text-[9px] uppercase text-gray-400 font-bold">{label}</span>
                                                <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-blue-900'}`}>{String(val)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 2: PRODUÇÃO E REDES SOCIAIS */}
                        <div className={`p-5 rounded-2xl border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-purple-900/10 to-transparent border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'}`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <i className="fas fa-video text-6xl text-purple-500"></i>
                            </div>

                            <h4 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                                <i className="fas fa-bullhorn"></i> Produção & Redes Sociais
                            </h4>

                            <div className="space-y-4 relative z-10">
                                {features.videoLimit > 0 && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                                            <i className="fas fa-play"></i>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold opacity-80">Produção Mensal</p>
                                            <p className="text-lg font-black leading-none">{features.videoLimit} Vídeos Novos / Mês</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Frequência de Postagem / Divulgação</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {(Object.entries(socials) as [string, any][])
                                            .filter(([_, qtd]) => Number(qtd) > 0)
                                            .map(([net, qtd]) => (
                                                <div key={net} className={`text-center p-2 rounded-lg border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-200'}`}>
                                                    <div className="text-[8px] uppercase text-gray-400 mb-1">{net}</div>
                                                    <div className="font-black text-purple-500 text-lg">{String(qtd)}x</div>
                                                </div>
                                            ))}
                                        {Object.values(socials).every(q => Number(q) === 0) && <p className="text-[10px] text-gray-500 italic col-span-4">Sem divulgação em redes sociais.</p>}
                                    </div>
                                    <p className="text-[9px] text-purple-400 mt-2 italic">*Quantidade de posts semanais/diários conforme contrato.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {commercial.contract && (
                        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <h4 className="text-xs font-black uppercase text-gray-400 mb-2"><i className="fas fa-file-contract text-gray-500"></i> Observações do Contrato</h4>
                            <p className={`text-xs italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{commercial.contract.notes || 'Sem observações.'}</p>
                            {commercial.contract.hasContract && <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[9px] rounded uppercase font-bold">Contrato Assinado</span>}
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <button onClick={() => setSelectedPlanId(null)} className="px-6 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-xs font-black uppercase hover:bg-gray-300 transition-colors">Fechar</button>
                </div>
            </div>
        </div>
    );
};
