
import React from 'react';
import { AdPricingConfig } from '../../../../../types';

interface OverviewPanelProps {
    config: AdPricingConfig;
    onChange: (newConfig: AdPricingConfig) => void;
    darkMode?: boolean;
}

import { getSiteStats, SiteStats } from '@/services/stats/siteStatsService';

interface OverviewPanelProps {
    config: AdPricingConfig;
    onChange: (newConfig: AdPricingConfig) => void;
    darkMode?: boolean;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({ config, onChange, darkMode = false }) => {
    const [stats, setStats] = React.useState<SiteStats | null>(null);

    React.useEffect(() => {
        getSiteStats().then(setStats);
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Visitas Totais', val: stats?.totalVisits || 0, icon: 'fas fa-globe', color: 'text-blue-500' },
                    { label: 'IPs Únicos', val: stats?.uniqueVisitors || 0, icon: 'fas fa-fingerprint', color: 'text-purple-500' },
                    { label: 'Mobile', val: stats?.mobileVisits || 0, icon: 'fas fa-mobile-alt', color: 'text-green-500' },
                    { label: 'Re-entradas', val: stats?.returningVisits || 0, icon: 'fas fa-door-open', color: 'text-orange-500' }
                ].map((s, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 shadow-sm ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                        <i className={`${s.icon} text-xl ${s.color}`}></i>
                        <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{s.val}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Status Geral */}
            <div className={`p-4 md:p-8 rounded-3xl md:rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-6 ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                <div>
                    <h3 className={`text-lg font-black uppercase tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Status do Módulo Comercial</h3>
                    <p className={`text-xs max-w-md leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Quando desativado, a área de anunciantes e banners fica oculta para o público, mas o painel administrativo continua acessível.
                    </p>
                </div>
                <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm border transition-colors ${darkMode ? 'bg-black/40 border-white/5' : 'bg-white border-gray-100'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.active ? 'text-green-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                        {config.active ? 'Sistema Ativo' : 'Sistema Pausado'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.active}
                            onChange={(e) => onChange({ ...config, active: e.target.checked })}
                        />
                        <div className={`w-14 h-8 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 ${darkMode ? 'bg-white/10 after:bg-gray-200 after:border-white/20' : 'bg-gray-200'}`}></div>
                    </label>
                </div>
            </div>

            {/* Texto Promocional */}
            <div>
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-bullhorn"></i> Texto Promocional (Modal de Vendas)
                </h3>
                <div className="relative group">
                    <textarea
                        value={config.promoText}
                        onChange={(e) => onChange({ ...config, promoText: e.target.value })}
                        rows={4}
                        className={`w-full border-2 rounded-2xl p-6 text-sm font-bold outline-none focus:shadow-lg transition-all resize-none ${darkMode ? 'bg-yellow-900/10 border-yellow-500/20 text-yellow-500 placeholder-yellow-500/50 focus:border-yellow-500/40' : 'bg-yellow-50 border-yellow-100 text-yellow-900 placeholder-yellow-300 focus:border-yellow-400'}`}
                        placeholder="Ex: Assine agora e impulsione seu negócio!"
                    />
                    <div className="absolute bottom-4 right-4 text-[9px] font-black uppercase text-yellow-600/50">
                        Exibido no topo do modal de planos
                    </div>
                </div>
            </div>

            {/* Preços de Itens Avulsos (Boosts) */}
            <div>
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-tags"></i> Tabela de Preços (Itens Avulsos)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { key: 'boost_video_30s', label: 'Vídeo Propaganda (30s)', icon: 'fas fa-clapperboard', def: 200 },
                        { key: 'boost_facebook_6d', label: '1 Vídeo Facebook (6 dias)', icon: 'fab fa-facebook-f', def: 120 },
                        { key: 'boost_instagram_6d', label: '1 Vídeo Instagram (6 dias)', icon: 'fab fa-instagram', def: 120 },
                        { key: 'boost_youtube_6d', label: '1 Vídeo Youtube (6 dias)', icon: 'fab fa-youtube', def: 120 },
                        { key: 'boost_home_banner_7d', label: 'Banner Home (7d)', icon: 'fas fa-window-maximize', def: 150 },
                        { key: 'boost_article_footer_7d', label: 'Rodapé Artigo (7d)', icon: 'fas fa-chart-simple', def: 100 },
                        { key: 'boost_article_sidebar_7d', label: 'Sidebar Esq (7d)', icon: 'fas fa-table-columns', def: 100 },
                        { key: 'boost_home_scroll_7d', label: 'Scroll Topo (7d)', icon: 'fas fa-up-long', def: 150 }
                    ].map(item => (
                        <div key={item.key} className={`p-4 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
                                    <i className={item.icon.includes(' ') ? item.icon : `fas ${item.icon}`}></i>
                                </div>
                                <span className={`text-[10px] font-black uppercase ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>R$</span>
                                <input
                                    type="number"
                                    value={config.boostsValues?.[item.key] ?? item.def}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        onChange({
                                            ...config,
                                            boostsValues: { ...config.boostsValues, [item.key]: val }
                                        });
                                    }}
                                    className={`w-20 bg-transparent border-b text-right font-black outline-none ${darkMode ? 'text-white border-white/20 focus:border-white' : 'text-gray-900 border-gray-200 focus:border-black'}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Estatísticas Rápidas (Estático para Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`border p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-black uppercase mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Total Planos</p>
                    <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{config.plans.length}</p>
                </div>
                <div className={`border p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-black uppercase mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Planos Master</p>
                    <p className="text-3xl font-black text-red-600">
                        {config.plans.filter(p => p.features.placements.includes('master_carousel')).length}
                    </p>
                </div>
                <div className={`border p-6 rounded-2xl shadow-sm ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-100'}`}>
                    <p className={`text-[9px] font-black uppercase mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Moeda Base</p>
                    <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>BRL (R$)</p>
                </div>
            </div>

        </div>
    );
};

export default OverviewPanel;
