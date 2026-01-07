
import React, { useState, useEffect } from 'react';
import { AdPricingConfig, User } from '../../../../types';
import ConfigTabs, { ConfigTabId } from './ConfigTabs';
import OverviewPanel from './panels/OverviewPanel';
import PlansPanel from './panels/PlansPanel';
import PlacementsPanel from './panels/PlacementsPanel';
import PromoPopupPanel from './panels/PromoPopupPanel';
import BannersPanel from './panels/BannersPanel';
import RulesBenefitsPanel from './rules/RulesBenefitsPanel';
import UpcomingModulesPanel from './upcoming/UpcomingModulesPanel';
import { useDirtyState } from './shared/useDirtyState';
import SaveBar from './shared/SaveBar';
import { processConfigUploads } from '../../../../services/storage/syncService';

interface AdvertisersConfigViewProps {
    config: AdPricingConfig;
    onSave: (config: AdPricingConfig) => void;
    onCancel: () => void;
    currentUser: User;
    darkMode?: boolean;
}

const AdvertisersConfigView: React.FC<AdvertisersConfigViewProps> = ({ config, onSave, onCancel, currentUser, darkMode = false }) => {
    // Estado local para evitar auto-save. Só persiste ao clicar em Salvar.
    const [tempConfig, setTempConfig] = useState<AdPricingConfig>(JSON.parse(JSON.stringify(config)));
    const [activeTab, setActiveTab] = useState<ConfigTabId>('banners');
    const [isSaving, setIsSaving] = useState(false);

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
            onSave(syncedConfig);
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao salvar configurações: ${e.message}`);
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
                {activeTab === 'banners' && (
                    <BannersPanel config={tempConfig} onChange={setTempConfig} darkMode={darkMode} />
                )}
                {activeTab === 'popup' && (
                    <PromoPopupPanel config={tempConfig} onChange={setTempConfig} darkMode={darkMode} />
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
                {activeTab === 'upcoming' && (
                    <UpcomingModulesPanel darkMode={darkMode} />
                )}
                {activeTab === 'reports' && (
                    <div className="flex flex-col items-center justify-center h-96 opacity-50">
                        <i className="fas fa-file-invoice-dollar text-4xl mb-4 text-gray-300"></i>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Relatórios em Desenvolvimento</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvertisersConfigView;
