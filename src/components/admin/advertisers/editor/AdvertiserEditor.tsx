
import React, { useState, useEffect } from 'react';
import { Advertiser } from '../../../../types';
import EditorTabs, { EditorTabId } from './EditorTabs';
import GeneralSection from './sections/GeneralSection';
import ShowcaseSection from './sections/ShowcaseSection';
import { processAdvertiserUploads } from '../../../../services/storage/syncService';

const BannersPanel = React.lazy(() => import('../config/panels/BannersPanel'));
const PromoPopupPanel = React.lazy(() => import('../config/panels/PromoPopupPanel'));

interface AdvertiserEditorProps {
    advertiser: Advertiser | null; // null = Criando novo
    onSave: (advertiser: Advertiser) => Promise<void> | void;
    onCancel: () => void;
    darkMode?: boolean;
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
    redirectType: 'external',
    internalPage: {
        description: '',
        products: [],
        whatsapp: '',
        instagram: '',
        tiktok: '',
        kwai: '',
        telegram: '',
        location: ''
    },
    coupons: [],
    ownerId: '',
    logoUrls: [],
    mediaType: 'image',
    transitionType: 'fade',
    displayLocations: ['home_top', 'article_sidebar', 'article_footer']
};

const AdvertiserEditor: React.FC<AdvertiserEditorProps> = ({ advertiser, onSave, onCancel, darkMode = false }) => {
    // Prepare initial state helper
    const prepareInitialState = (adv: Advertiser | null): Advertiser => {
        if (adv) {
            return {
                ...DEFAULT_ADVERTISER,
                ...adv,
                logoUrls: adv.logoUrls || [],
                internalPage: {
                    description: adv.internalPage?.description || '',
                    products: adv.internalPage?.products || [],
                    whatsapp: adv.internalPage?.whatsapp || '',
                    instagram: adv.internalPage?.instagram || '',
                    tiktok: adv.internalPage?.tiktok || '',
                    kwai: adv.internalPage?.kwai || '',
                    telegram: adv.internalPage?.telegram || '',
                    location: adv.internalPage?.location || ''
                },
                coupons: adv.coupons || [],
                popupSet: adv.popupSet,
                displayLocations: adv.displayLocations || ['home_top', 'article_sidebar', 'article_footer']
            };
        }
        return {
            ...DEFAULT_ADVERTISER,
            id: (typeof crypto !== 'undefined' && crypto.randomUUID)
                ? crypto.randomUUID()
                : `temp-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`
        };
    };

    const [activeTab, setActiveTab] = useState<EditorTabId>('geral');
    const [formData, setFormData] = useState<Advertiser>(() => prepareInitialState(advertiser));
    const [isSaving, setIsSaving] = useState(false);



    const handleSave = async () => {
        if (!formData.name) { return alert("O nome da empresa é obrigatório."); }
        setIsSaving(true);

        try {
            // 1. Processa uploads pendentes (local -> cloud)
            const syncedData = await processAdvertiserUploads(formData);

            // 2. Salva (envia para o pai/backend)
            await onSave(syncedData);
            setIsSaving(false);
        } catch (e: unknown) {
            console.error(e);
            const message = e instanceof Error ? e.message : 'Erro desconhecido';
            alert(`Erro ao salvar: ${message}`);
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-fadeIn w-full max-w-5xl xl:max-w-full mx-auto">
            {/* Header */}
            <div className="flex flex-col md:items-center md:flex-row justify-between gap-6 mb-8">
                <div>
                    <button
                        onClick={onCancel}
                        className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                    >
                        <i className="fas fa-arrow-left"></i> Voltar para Lista
                    </button>
                    <h2 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {advertiser ? `Editando: ${formData.name}` : 'Novo Contrato'}
                    </h2>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={onCancel}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-colors ${darkMode ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={isSaving}
                        className={`flex-1 md:flex-none bg-green-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
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
            <div className={`rounded-3xl md:rounded-[2.5rem] border p-4 md:p-8 xl:p-10 shadow-sm min-h-[500px] transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5 text-white' : 'bg-white border-gray-100'}`}>
                {activeTab === 'geral' && (
                    <GeneralSection
                        data={formData}
                        onChange={setFormData}
                        darkMode={darkMode}
                    />
                )}
                {activeTab === 'vitrine' && (
                    <ShowcaseSection
                        data={formData}
                        onChange={setFormData}
                        darkMode={darkMode}
                    />
                )}
                {activeTab === 'banners' && (
                    <React.Suspense fallback={<div className="h-48 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-red-500"></i></div>}>
                        <div className="animate-fadeIn">
                            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2 border-b flex items-center gap-2 ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-100'}`}>
                                <i className="fas fa-panorama"></i> Banners Home vinculados
                            </h3>
                            <BannersPanel
                                config={formData.promoBanners || []}
                                onChange={(val: any[]) => setFormData(prev => ({ ...prev, promoBanners: val }))}
                                darkMode={darkMode}
                            />
                        </div>
                    </React.Suspense>
                )}
                {activeTab === 'popup' && (
                    <React.Suspense fallback={<div className="h-48 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-red-500"></i></div>}>
                        <div className="animate-fadeIn">
                            <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 pb-2 border-b flex items-center gap-2 ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-100'}`}>
                                <i className="fas fa-bullhorn"></i> Popup Promocional
                            </h3>
                            <PromoPopupPanel
                                config={formData.popupSet || { items: [] }}
                                onChange={(val: { items: any[] }) => setFormData(prev => ({ ...prev, popupSet: val }))}
                                darkMode={darkMode}
                            />
                        </div>
                    </React.Suspense>
                )}
            </div>
        </div>
    );
};

export default AdvertiserEditor;
