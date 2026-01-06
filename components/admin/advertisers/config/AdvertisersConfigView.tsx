
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
}

const AdvertisersConfigView: React.FC<AdvertisersConfigViewProps> = ({ config, onSave, onCancel, currentUser }) => {
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
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-2 flex items-center gap-2 transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i> Voltar para Lista
                    </button>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">
                        Sistema <span className="text-red-600">Comercial</span>
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Configurações Globais e Tabela de Preços
                    </p>
                </div>

                {/* Ações Superiores */}
                <div className="flex gap-3">
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2 shadow-lg ${isDirty ? 'bg-black text-white hover:bg-green-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSaving ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-save"></i>}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>

            <ConfigTabs activeTab={activeTab} onChange={setActiveTab} />

            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm min-h-[600px]">
                {activeTab === 'overview' && (
                    <OverviewPanel config={tempConfig} onChange={setTempConfig} />
                )}
                {activeTab === 'banners' && (
                    <BannersPanel config={tempConfig} onChange={setTempConfig} />
                )}
                {activeTab === 'popup' && (
                    <PromoPopupPanel config={tempConfig} onChange={setTempConfig} />
                )}
                {activeTab === 'plans' && (
                    <PlansPanel config={tempConfig} onChange={setTempConfig} currentUser={currentUser} />
                )}
                {activeTab === 'placements' && (
                    <PlacementsPanel config={tempConfig} onChange={setTempConfig} />
                )}
                {activeTab === 'rules' && (
                    <RulesBenefitsPanel config={tempConfig} />
                )}
                {activeTab === 'upcoming' && (
                    <UpcomingModulesPanel />
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
