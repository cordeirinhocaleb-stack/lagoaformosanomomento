
import React, { useState, useEffect } from 'react';
import { PromoPopupSetConfig, PromoPopupItemConfig, DEFAULT_POPUP_ITEM } from '../../../../types';
import { MAX_ITEMS_PER_SET } from '../../../../utils/popupSafety';
import PopupList from './PopupList';
import PopupEditor from './PopupEditor';
import LivePreviewStage from './LivePreviewStage';

interface PopupSetBuilderProps {
    config: PromoPopupSetConfig;
    onChange: (config: PromoPopupSetConfig) => void;
}

const PopupSetBuilder: React.FC<PopupSetBuilderProps> = ({ config, onChange }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState<'config' | 'preview'>('config');
    const [isConfigOpen, setIsConfigOpen] = useState(true);

    useEffect(() => {
        if (config.items.length > 0 && !selectedItemId) {
            setSelectedItemId(config.items[0].id);
        }
        if (config.items.length === 0 && selectedItemId) {
            setSelectedItemId(null);
        }
    }, [config.items, selectedItemId]);

    const handleAdd = () => {
        if (config.items.length >= MAX_ITEMS_PER_SET) return;
        const newItem: PromoPopupItemConfig = {
            ...DEFAULT_POPUP_ITEM,
            id: Math.random().toString(36).substr(2, 9),
            title: `Slide ${config.items.length + 1}`
        };
        onChange({ items: [...config.items, newItem] });
        setSelectedItemId(newItem.id);
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este slide?")) return;
        const newItems = config.items.filter(i => i.id !== id);
        onChange({ items: newItems });
        if (selectedItemId === id) {
            if (newItems.length > 0) setSelectedItemId(newItems[0].id);
            else setSelectedItemId(null);
        }
    };

    const handleClearAll = () => {
        if (!window.confirm("ATENÇÃO: Isso removerá todos os slides. Continuar?")) return;
        onChange({ items: [] });
        setSelectedItemId(null);
    };

    const handleUpdate = (id: string, updates: Partial<PromoPopupItemConfig>) => {
        onChange({
            items: config.items.map(i => i.id === id ? { ...i, ...updates } : i)
        });
    };

    const selectedItem = config.items.find(i => i.id === selectedItemId);

    return (
        <div className="flex flex-col h-[800px] lg:h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden relative">
            
            {/* 1. LISTA DE SLIDES HORIZONTAL NO TOPO */}
            <PopupList 
                items={config.items}
                selectedId={selectedItemId}
                onSelect={setSelectedItemId}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onDuplicate={() => {}}
                onMove={() => {}}
                onUpdate={handleUpdate}
                isCollapsed={false}
                onToggleCollapse={() => {}}
                onClearAll={handleClearAll}
            />

            {/* Mobile View Toggles */}
            <div className="lg:hidden flex border-b border-gray-100 shrink-0">
                <button 
                    onClick={() => setMobileTab('config')} 
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${mobileTab === 'config' ? 'bg-black text-white' : 'bg-white text-gray-500'}`}
                >
                    Configurar
                </button>
                <button 
                    onClick={() => setMobileTab('preview')} 
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${mobileTab === 'preview' ? 'bg-black text-white' : 'bg-white text-gray-500'}`}
                >
                    Preview
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* LADO ESQUERDO: EDITOR */}
                <div 
                    className={`
                        flex flex-col border-r border-gray-100 transition-all duration-500 ease-in-out bg-white z-20
                        ${isConfigOpen ? 'w-full lg:w-[50%] xl:w-[45%] translate-x-0 opacity-100' : 'w-0 -translate-x-full opacity-0 absolute inset-y-0'}
                        ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}
                    `}
                >
                    <div className="flex-1 h-full overflow-hidden bg-white relative flex flex-col">
                        {/* Botão de Expansão removido conforme solicitado */}
                        {selectedItem ? (
                            <PopupEditor 
                                key={selectedItem.id}
                                item={selectedItem} 
                                onChange={(updates) => handleUpdate(selectedItem.id, updates)} 
                                onDelete={() => handleDelete(selectedItem.id)}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <i className="fas fa-bullhorn text-2xl opacity-20"></i>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest">Crie ou selecione um slide no menu superior</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* LADO DIREITO: PREVIEW */}
                <div className={`flex-1 bg-gray-50 p-2 lg:p-4 ${mobileTab === 'config' ? 'hidden lg:block' : 'block'} transition-all duration-500 relative`}>
                    {!isConfigOpen && (
                        <button 
                            onClick={() => setIsConfigOpen(true)}
                            className="absolute top-6 left-6 z-[60] bg-black text-white px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:bg-green-600 transition-all animate-fadeIn"
                        >
                            <i className="fas fa-pen"></i> Voltar ao Editor
                        </button>
                    )}

                    <LivePreviewStage 
                        popupSet={config} 
                        selectedItemId={selectedItemId}
                    />
                </div>
            </div>
        </div>
    );
};

export default PopupSetBuilder;
