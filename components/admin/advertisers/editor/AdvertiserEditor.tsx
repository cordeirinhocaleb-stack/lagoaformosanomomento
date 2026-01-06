
import React, { useState, useEffect } from 'react';
import { Advertiser } from '../../../../types';
import EditorTabs, { EditorTabId } from './EditorTabs';
import GeneralSection from './sections/GeneralSection';
import ShowcaseSection from './sections/ShowcaseSection';
import ProductsSection from './sections/ProductsSection';
import CouponsSection from './sections/CouponsSection';
import AdvertiserPopupSection from './sections/AdvertiserPopupSection';
import { processAdvertiserUploads } from '../../../../services/storage/syncService';

interface AdvertiserEditorProps {
    advertiser: Advertiser | null; // null = Criando novo
    onSave: (advertiser: Advertiser) => void;
    onCancel: () => void;
}

const DEFAULT_ADVERTISER: Advertiser = {
    id: '',
    name: '',
    category: 'Geral',
    plan: 'master',
    billingCycle: 'monthly',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
    isActive: true,
    views: 0,
    clicks: 0,
    redirectType: 'internal',
    internalPage: {
        description: '',
        products: [],
        whatsapp: '',
        instagram: '',
        location: ''
    },
    coupons: [],
    ownerId: ''
};

const AdvertiserEditor: React.FC<AdvertiserEditorProps> = ({ advertiser, onSave, onCancel }) => {
    const [activeTab, setActiveTab] = useState<EditorTabId>('geral');
    const [formData, setFormData] = useState<Advertiser>(DEFAULT_ADVERTISER);
    const [isSaving, setIsSaving] = useState(false);

    // Inicializa dados
    useEffect(() => {
        if (advertiser) {
            setFormData({
                ...DEFAULT_ADVERTISER,
                ...advertiser,
                internalPage: {
                    ...DEFAULT_ADVERTISER.internalPage,
                    ...(advertiser.internalPage || {})
                },
                coupons: advertiser.coupons || [],
                popup: advertiser.popup
            });
        } else {
            setFormData({
                ...DEFAULT_ADVERTISER,
                id: Math.random().toString(36).substr(2, 9)
            });
        }
    }, [advertiser]);

    const handleSave = async () => {
        if (!formData.name) return alert("O nome da empresa é obrigatório.");
        setIsSaving(true);

        try {
            // 1. Processa uploads pendentes (local -> cloud)
            const syncedData = await processAdvertiserUploads(formData);

            // 2. Salva (envia para o pai/backend)
            onSave(syncedData);
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao salvar: ${e.message}`);
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={onCancel}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-2 flex items-center gap-2 transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i> Voltar para Lista
                    </button>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">
                        {advertiser ? `Editando: ${formData.name}` : 'Novo Contrato'}
                    </h2>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl border border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={isSaving}
                        className={`bg-green-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
                        onClick={handleSave}
                    >
                        {isSaving ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-save"></i>}
                        {isSaving ? 'Sincronizando...' : 'Salvar Dados'}
                    </button>
                </div>
            </div>

            {/* Navegação */}
            <EditorTabs activeTab={activeTab} onChange={setActiveTab} />

            {/* Conteúdo das Abas */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm min-h-[500px]">
                {activeTab === 'geral' && (
                    <GeneralSection
                        data={formData}
                        onChange={setFormData}
                    />
                )}
                {activeTab === 'vitrine' && (
                    <ShowcaseSection
                        data={formData}
                        onChange={setFormData}
                    />
                )}
                {activeTab === 'produtos' && (
                    <ProductsSection
                        data={formData}
                        onChange={setFormData}
                    />
                )}
                {activeTab === 'cupons' && (
                    <CouponsSection
                        data={formData}
                        onChange={setFormData}
                    />
                )}
                {activeTab === 'popup' && (
                    <AdvertiserPopupSection
                        data={formData}
                        onChange={setFormData}
                    />
                )}
            </div>
        </div>
    );
};

export default AdvertiserEditor;
