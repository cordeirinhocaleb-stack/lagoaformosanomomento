import React, { useState } from 'react';
import { PromoPopupSetConfig, PromoPopupItemConfig, DEFAULT_POPUP_ITEM } from '@/types';
import { MAX_ITEMS_PER_SET } from '@/utils/popupSafety';
import PopupList from './PopupList';
import PopupEditor from './PopupEditor';
import LivePreviewStage from './AdvertiserPopupLivePreviewPanel';
import ImageAdjustmentModal from './components/ImageAdjustmentModal';
import { clearAllFiles } from '../../../../services/storage/localStorageService';

interface PopupSetBuilderProps {
    config: PromoPopupSetConfig;
    onChange: (config: PromoPopupSetConfig) => void;
    darkMode?: boolean;
}

const PopupSetBuilder: React.FC<PopupSetBuilderProps> = ({ config, onChange, darkMode = false }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(() => config.items.length > 0 ? config.items[0].id : null);
    const [mobileTab, setMobileTab] = useState<'config' | 'preview'>('config');
    const [isConfigOpen, setIsConfigOpen] = useState(true);
    const [isAdjusting, setIsAdjusting] = useState(false);

    const handleAdd = () => {
        if (config.items.length >= MAX_ITEMS_PER_SET) { return; }
        const newItem: PromoPopupItemConfig = {
            ...DEFAULT_POPUP_ITEM,
            id: Math.random().toString(36).substr(2, 9),
            title: `Slide ${config.items.length + 1}`
        };
        onChange({ items: [...config.items, newItem] });
        setSelectedItemId(newItem.id);
    };

    const handleDelete = (id: string) => {
        const newItems = config.items.filter(i => i.id !== id);
        onChange({ items: newItems });

        if (selectedItemId === id) {
            if (newItems.length > 0) { setSelectedItemId(newItems[0].id); }
            else { setSelectedItemId(null); }
        }
    };

    const handleClearAll = () => {
        if (!window.confirm("ATENÇÃO: Isso removerá todos os slides. Continuar?")) { return; }
        onChange({ items: [] });
        setSelectedItemId(null);
    };

    const handleUpdate = (id: string, updates: Partial<PromoPopupItemConfig>) => {
        onChange({
            items: config.items.map(i => i.id === id ? { ...i, ...updates } : i)
        });
    };

    const handleHardReset = async () => {
        if (!window.confirm("⚠️ ATENÇÃO: Isso apagará todos os arquivos locais (Imagens/Vídeos temporários) e resetará a configuração deste popup. Deseja continuar?")) return;

        try {
            await clearAllFiles();
            onChange({ items: [] });
            setSelectedItemId(null);
            // Pequeno delay para garantir que DB limpou antes do reload
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            console.error("Erro ao resetar memória local:", err);
            alert("Erro ao limpar arquivos locais.");
        }
    };

    const selectedItem = config.items.find(i => i.id === selectedItemId);

    const handleAdjustImage = (updates: Partial<any>) => {
        if (!selectedItemId || !selectedItem) return;
        handleUpdate(selectedItemId, {
            media: {
                ...selectedItem.media,
                imageStyle: {
                    ...selectedItem.media.imageStyle,
                    ...updates
                }
            }
        });
    };

    return (
        <div className={`flex flex-col h-[800px] lg:h-full rounded-3xl lg:rounded-[2.5rem] border shadow-xl overflow-hidden relative ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>

            {/* 1. LISTA DE SLIDES HORIZONTAL NO TOPO */}
            <PopupList
                items={config.items}
                selectedId={selectedItemId}
                onSelect={setSelectedItemId}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onDuplicate={() => { }}
                onMove={() => { }}
                onUpdate={handleUpdate}
                isCollapsed={false}
                onToggleCollapse={() => { }}
                onClearAll={handleClearAll}
                onHardReset={handleHardReset}
                darkMode={darkMode}
            />

            {/* Mobile View Toggles */}
            <div className={`lg:hidden flex border-b shrink-0 ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <button
                    onClick={() => setMobileTab('config')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${mobileTab === 'config'
                        ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                        : (darkMode ? 'bg-zinc-900 text-gray-500' : 'bg-white text-gray-500')
                        }`}
                >
                    Configurar
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${mobileTab === 'preview'
                        ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                        : (darkMode ? 'bg-zinc-900 text-gray-500' : 'bg-white text-gray-500')
                        }`}
                >
                    Preview
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* LADO ESQUERDO: EDITOR */}
                <div
                    className={`
                        flex flex-col border-r transition-all duration-500 ease-in-out z-20
                        ${isConfigOpen ? 'w-full lg:w-[50%] xl:w-[45%] translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 absolute inset-y-0'}
                        ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}
                        ${darkMode ? 'bg-zinc-900 border-white/5' : 'bg-white border-gray-100'}
                    `}
                >
                    <div className={`flex-1 h-full overflow-hidden relative flex flex-col ${darkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                        {selectedItem ? (
                            <PopupEditor
                                key={selectedItem.id}
                                item={selectedItem}
                                onChange={(updates) => handleUpdate(selectedItem.id, updates)}
                                onDelete={() => handleDelete(selectedItem.id)}
                                darkMode={darkMode}
                            />
                        ) : (
                            <div className={`h-full flex flex-col items-center justify-center p-8 text-center ${darkMode ? 'bg-black/20 text-gray-600' : 'bg-gray-50/30 text-gray-400'}`}>
                                <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mb-4 ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                                    <i className="fas fa-bullhorn text-2xl opacity-20"></i>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Crie ou selecione um slide no menu superior</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* LADO DIREITO: PREVIEW */}
                <div className={`flex-1 p-2 lg:p-4 ${mobileTab === 'config' ? 'hidden lg:block' : 'block'} transition-all duration-500 relative ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                    {!isConfigOpen && (
                        <button
                            onClick={() => setIsConfigOpen(true)}
                            className={`absolute top-6 left-6 z-[60] px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 transition-all animate-fadeIn ${darkMode ? 'bg-white text-black hover:bg-green-500 hover:text-white' : 'bg-black text-white hover:bg-green-600'}`}
                        >
                            <i className="fas fa-pen"></i> Voltar ao Editor
                        </button>
                    )}

                    <LivePreviewStage
                        popupSet={config}
                        selectedItemId={selectedItemId}
                        darkMode={darkMode}
                        onAdjustImage={() => setIsAdjusting(true)}
                    />
                </div>
            </div>

            {/* MODAL DE AJUSTE GLOBAL */}
            {isAdjusting && selectedItem && (
                <ImageAdjustmentModal
                    style={selectedItem.media.imageStyle}
                    onChange={handleAdjustImage}
                    onClose={() => setIsAdjusting(false)}
                    darkMode={true}
                />
            )}
        </div>
    );
};

export default PopupSetBuilder;
