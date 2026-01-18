
import React, { useState, useEffect } from 'react';
import { AdPricingConfig, User, Advertiser } from '../../../../types';
import ConfigTabs, { ConfigTabId } from './ConfigTabs';
import OverviewPanel from './panels/OverviewPanel';
import PlansPanel from './panels/PlansPanel';
import PlacementsPanel from './panels/PlacementsPanel';
import RulesBenefitsPanel from './rules/RulesBenefitsPanel';
import { useDirtyState } from './shared/useDirtyState';
import SaveBar from './shared/SaveBar';
import { processConfigUploads } from '../../../../services/storage/syncService';

interface AdvertisersConfigViewProps {
    config: AdPricingConfig;
    onSave: (config: AdPricingConfig) => void;
    onCancel: () => void;
    currentUser: User;
    advertisers: Advertiser[];
    darkMode?: boolean;
}

const AdvertisersConfigView: React.FC<AdvertisersConfigViewProps> = ({ config, onSave, onCancel, currentUser, advertisers, darkMode = false }) => {
    // Estado local para evitar auto-save. Só persiste ao clicar em Salvar.
    const [tempConfig, setTempConfig] = useState<AdPricingConfig>(JSON.parse(JSON.stringify(config)));

    const [activeTab, setActiveTab] = useState<ConfigTabId>('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [reportData, setReportData] = useState<{ topAds: any[], planStats: any[] }>({ topAds: [], planStats: [] });

    // Fetch real reports data when tab changes or data updates
    useEffect(() => {
        if (activeTab === 'reports') {
            // 1. Top Anúncios por Cliques
            const sortedAds = [...advertisers]
                .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
                .slice(0, 5)
                .map(ad => ({
                    name: ad.name || 'Sem Nome',
                    clicks: ad.clicks || 0,
                    plan: tempConfig.plans.find(p => p.id === ad.plan)?.name || ad.plan
                }));

            // 2. Estatísticas de Planos (Baseado nos planos REAIS cadastrados)
            const colors = ['bg-amber-500', 'bg-yellow-400', 'bg-slate-400', 'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-zinc-500'];
            const stats = tempConfig.plans.map((plan, index) => {
                const count = advertisers.filter(ad => ad.plan === plan.id).length;
                return {
                    plan: plan.name,
                    count,
                    color: colors[index % colors.length]
                };
            });

            setReportData({
                topAds: sortedAds,
                planStats: stats.sort((a, b) => b.count - a.count)
            });
        }
    }, [activeTab, advertisers, tempConfig.plans]);

    // Detecta alterações
    const isDirty = useDirtyState(config, tempConfig);

    // Previne fechamento acidental da aba
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const syncedConfig = await processConfigUploads(tempConfig);
            await onSave(syncedConfig);
            setIsSaving(false);
        } catch (e: unknown) {
            console.error(e);
            const message = e instanceof Error ? e.message : String(e);
            alert(`Erro ao salvar configurações: ${message}`);
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm("Deseja descartar todas as alterações não salvas?")) {
            setTempConfig(JSON.parse(JSON.stringify(config)));
        }
    };

    const handleBack = () => {
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja sair e perder o progresso?")) {
                onCancel();
            }
        } else {
            onCancel();
        }
    };

    return (
        <div className="animate-fadeIn w-full relative pb-40">
            {/* Save Bar Global */}
            <SaveBar
                isVisible={isDirty}
                onSave={handleSave}
                onDiscard={handleDiscard}
            />

            {/* Header com Ações */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <button
                        onClick={handleBack}
                        className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                    >
                        <i className="fas fa-arrow-left"></i> Voltar para Lista
                    </button>
                    <h2 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Sistema <span className="text-red-600">Comercial</span>
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Configurações Globais e Tabela de Preços
                    </p>
                </div>

                {/* Ações Superiores */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={handleBack}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-colors ${darkMode ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg ${isDirty ? (darkMode ? 'bg-white text-black hover:bg-green-400' : 'bg-black text-white hover:bg-green-600') : 'bg-gray-100 text-gray-400 cursor-not-allowed'} ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSaving ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-save"></i>}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            <ConfigTabs activeTab={activeTab} onChange={setActiveTab} darkMode={darkMode} />

            <div className={`rounded-3xl md:rounded-[2.5rem] border p-4 md:p-8 shadow-sm min-h-[600px] transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
                {activeTab === 'overview' && (
                    <OverviewPanel config={tempConfig} onChange={setTempConfig} darkMode={darkMode} />
                )}
                {activeTab === 'plans' && (
                    <PlansPanel config={tempConfig} onChange={setTempConfig} currentUser={currentUser} darkMode={darkMode} />
                )}
                {activeTab === 'placements' && (
                    <PlacementsPanel config={tempConfig} onChange={setTempConfig} darkMode={darkMode} />
                )}
                {activeTab === 'rules' && (
                    <RulesBenefitsPanel config={tempConfig} darkMode={darkMode} />
                )}
                {activeTab === 'reports' && (
                    <div className="space-y-12 animate-fadeIn max-w-4xl mx-auto py-4">
                        {/* Top Anúncios */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className={`text-xl font-black uppercase italic italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Top <span className="text-red-500">Cliques</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Anunciantes com maior engajamento</p>
                                </div>
                                <i className="fas fa-chart-line text-red-500 text-xl opacity-50"></i>
                            </div>

                            <div className="grid gap-3">
                                {reportData.topAds.map((ad, i) => (
                                    <div key={i} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.01] ${darkMode ? 'bg-zinc-900/50 border-white/5 hover:border-red-500/30' : 'bg-white border-gray-100 hover:border-red-600/30 shadow-sm'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : (darkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-gray-100 text-gray-400')}`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ad.name}</p>
                                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{ad.plan}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ad.clicks.toLocaleString()}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Cliques Totais</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Popularidade de Planos */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className={`text-xl font-black uppercase italic italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Popularidade de <span className="text-red-500">Planos</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Distribuição comercial da base</p>
                                </div>
                                <i className="fas fa-pie-chart text-red-500 text-xl opacity-50"></i>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {reportData.planStats.map((stat, i) => (
                                    <div key={i} className={`p-6 rounded-3xl border relative overflow-hidden ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                                        <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full ${stat.color}`}></div>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{stat.plan}</p>
                                        <div className="flex items-end gap-2">
                                            <h4 className={`text-3xl font-black italic ${darkMode ? 'text-white' : 'text-black'}`}>{stat.count}</h4>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase pb-1.5">Clientes</p>
                                        </div>
                                        <div className="mt-4 w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${stat.color}`} style={{ width: `${(stat.count / 80) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvertisersConfigView;
