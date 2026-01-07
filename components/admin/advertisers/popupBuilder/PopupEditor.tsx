import React, { useState } from 'react';
import { PromoPopupItemConfig, PopupThemeAdvanced, DEFAULT_THEME_ADVANCED } from '../../../../types';
import PopupThemePanel from './PopupThemePanel';
import PopupStylePanel from './PopupStylePanel';
import PopupMediaPanel from './PopupMediaPanel';
import ThemeSelectorByFilter from './ThemeSelectorByFilter';
import { POPUP_THEME_CATALOG } from '../../../home/popup/popupThemeCatalog';

interface PopupEditorProps {
    item: PromoPopupItemConfig;
    onChange: (updates: Partial<PromoPopupItemConfig>) => void;
    onDelete: () => void;
    darkMode?: boolean;
}

const PopupEditor: React.FC<PopupEditorProps> = ({ item, onChange, onDelete, darkMode = false }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'media' | 'style' | 'targeting'>('content');

    const handleThemeSelect = (updates: Partial<PromoPopupItemConfig>) => {
        // ThemeSelectorByFilter now returns the exact updates needed
        onChange(updates);
    };

    const inputClass = `w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-gray-50 border-gray-200 text-black focus:border-black'}`;
    const labelClass = `block text-[9px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`;
    const sectionClass = `p-6 rounded-[2rem] border mb-6 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-100'}`;

    return (
        <div className="flex flex-col h-full animate-fadeIn">

            {/* TABS DE SEÇÃO - Fixed at Top */}
            <div className={`shrink-0 px-6 pt-6 pb-2 border-b flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <div className={`p-1 rounded-xl flex ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                    {(['content', 'media', 'style', 'targeting'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? (darkMode ? 'bg-white text-black shadow-sm' : 'bg-white text-black shadow-sm')
                                    : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')
                                }`}
                        >
                            {tab === 'content' ? 'Conteúdo' : tab === 'media' ? 'Mídia' : tab === 'style' ? 'Estilo' : 'Regras'}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onDelete}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm shrink-0"
                    title="Excluir Slide"
                >
                    <i className="fas fa-trash-alt text-xs"></i>
                </button>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                {activeTab === 'content' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Seletor de Tema Visual */}
                        <div>
                            <label className={labelClass}>Biblioteca de Temas</label>
                            <ThemeSelectorByFilter
                                currentThemeId={item.themePresetId}
                                onSelect={handleThemeSelect}
                                darkMode={darkMode}
                            />
                        </div>

                        {/* Editor de Texto Simples */}
                        <div className={sectionClass}>
                            <h4 className={`text-xs font-black uppercase mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Conteúdo do Popup</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Título Principal</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => onChange({ title: e.target.value })}
                                        className={inputClass}
                                        placeholder="Ex: Super Promoção"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Texto do Corpo</label>
                                    <textarea
                                        value={item.body}
                                        onChange={(e) => onChange({ body: e.target.value })}
                                        className={`${inputClass} min-h-[100px] resize-y`}
                                        placeholder="Digite os detalhes da sua oferta..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Texto do Botão</label>
                                        <input
                                            type="text"
                                            value={item.ctaText}
                                            onChange={(e) => onChange({ ctaText: e.target.value })}
                                            className={inputClass}
                                            placeholder="Saiba Mais"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link do Botão</label>
                                        <input
                                            type="text"
                                            value={item.ctaUrl}
                                            onChange={(e) => onChange({ ctaUrl: e.target.value })}
                                            className={inputClass}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'style' && (
                    <div className="animate-fadeIn space-y-6">
                        {/* 1. Theme Advanced */}
                        <div className={sectionClass}>
                            <label className={`text-[9px] font-black uppercase mb-4 block tracking-widest flex items-center gap-2 ${darkMode ? 'text-red-500' : 'text-red-600'}`}>
                                <i className="fas fa-layer-group"></i> Design Avançado
                            </label>
                            <PopupThemePanel
                                config={item.themeAdvanced || DEFAULT_THEME_ADVANCED}
                                effectConfig={item.effectConfig}
                                onChange={(updates) => onChange({ themeAdvanced: { ...(item.themeAdvanced || DEFAULT_THEME_ADVANCED), ...updates } })}
                                onEffectChange={(updates) => onChange({ effectConfig: { ...(item.effectConfig || {}), ...updates } as any })}
                                darkMode={darkMode}
                            />
                        </div>

                        {/* 2. Text Style */}
                        <div className={sectionClass}>
                            <label className={`text-[9px] font-black uppercase mb-4 block tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                                Tipografia e Cores
                            </label>
                            <PopupStylePanel
                                textStyle={item.textStyle}
                                onChange={(style) => onChange({ textStyle: { ...item.textStyle, ...style } })}
                                darkMode={darkMode}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="animate-fadeIn">
                        <PopupMediaPanel
                            media={item.media}
                            onChange={(media) => onChange({ media: { ...item.media, ...media } })}
                            darkMode={darkMode}
                        />
                    </div>
                )}

                {activeTab === 'targeting' && (
                    <div className="animate-fadeIn space-y-4">
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                            <h4 className={`text-xs font-black uppercase mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Em Breve</h4>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                As regras de exibição (frequência, dias da semana, horários) serão configuradas aqui.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PopupEditor;