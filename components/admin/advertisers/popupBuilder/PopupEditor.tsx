import React, { useState } from 'react';
import { PromoPopupItemConfig, PopupSize, DEFAULT_THEME_ADVANCED, PopupTargetPage } from '../../../../types';
import ThemeSelectorByFilter from './ThemeSelectorByFilter';
import PopupStylePanel from './PopupStylePanel';
import PopupMediaPanel from './PopupMediaPanel';
import PopupThemePanel from './PopupThemePanel';

interface PopupEditorProps {
    item: PromoPopupItemConfig;
    onChange: (updates: Partial<PromoPopupItemConfig>) => void;
    onDelete: () => void; 
}

type EditorTab = 'content' | 'media' | 'style' | 'targeting';

const PopupEditor: React.FC<PopupEditorProps> = ({ item, onChange, onDelete }) => {
    const [activeTab, setActiveTab] = useState<EditorTab>('content');

    const handleThemeUpdate = (updates: Partial<PromoPopupItemConfig>) => {
        const merged: Partial<PromoPopupItemConfig> = { ...updates };
        if (updates.textStyle) {
            merged.textStyle = { ...item.textStyle, ...updates.textStyle };
        }
        if (updates.media) {
            merged.media = { ...item.media, ...updates.media };
        }
        if (updates.themeAdvanced) {
            merged.themeAdvanced = { ...item.themeAdvanced, ...updates.themeAdvanced };
        }
        if (updates.effectConfig) {
            merged.effectConfig = { ...item.effectConfig, ...updates.effectConfig };
        }
        onChange(merged);
    };

    const toggleTarget = (target: PopupTargetPage) => {
        const current = item.targetPages || [];
        if (current.includes(target)) {
            onChange({ targetPages: current.filter(t => t !== target) });
        } else {
            onChange({ targetPages: [...current, target] });
        }
    };

    const TARGET_OPTIONS: { id: PopupTargetPage; label: string; icon: string }[] = [
        { id: 'home', label: 'Home Page', icon: 'fa-home' },
        { id: 'news_detail', label: 'Leitura de Notícia', icon: 'fa-newspaper' },
        { id: 'jobs_board', label: 'Balcão de Empregos', icon: 'fa-briefcase' },
        { id: 'advertiser_page', label: 'Página de Loja', icon: 'fa-store' },
        { id: 'login_register', label: 'Login / Cadastro', icon: 'fa-user-lock' },
        { id: 'user_profile', label: 'Minha Conta', icon: 'fa-user-circle' },
        { id: 'admin_area', label: 'Painel Admin (Geral)', icon: 'fa-satellite-dish' },
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header com Abas e Botão de Excluir */}
            <div className="flex justify-between items-center border-b border-gray-100 bg-white px-2 pt-2 shrink-0 gap-1 md:gap-2">
                <div className="flex overflow-x-auto scrollbar-hide gap-1 flex-1">
                    {[
                        { id: 'content', icon: 'fa-pen', label: 'Texto' },
                        { id: 'targeting', icon: 'fa-crosshairs', label: 'Onde' },
                        { id: 'media', icon: 'fa-photo-film', label: 'Mídia' },
                        { id: 'style', icon: 'fa-paintbrush', label: 'Visual' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as EditorTab)}
                            type="button"
                            className={`flex-1 min-w-fit px-2 py-2 md:px-3 md:py-2.5 text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all rounded-t-lg flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap border-b-2 ${
                                activeTab === tab.id 
                                ? 'text-red-600 border-red-600 bg-red-50/50' 
                                : 'text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-600'
                            }`}
                        >
                            <i className={`fas ${tab.icon} text-[8px] md:text-[10px]`}></i> {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* Botão de Excluir Permanente */}
                <button 
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 flex-shrink-0 mb-1 mr-1 cursor-pointer active:scale-95"
                    title="Excluir este Slide"
                >
                    <i className="fas fa-trash-alt text-xs"></i>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-6 custom-scrollbar">
                
                {/* --- ABA CONTEÚDO --- */}
                {activeTab === 'content' && (
                    <div className="space-y-5 animate-fadeIn">
                        {/* Seção de Digitação */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1.5 pl-1">Título Principal</label>
                                <input 
                                    type="text" 
                                    value={item.title}
                                    onChange={(e) => onChange({ title: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-black text-gray-900 outline-none focus:border-red-500 transition-colors"
                                    placeholder="Destaque..."
                                />
                            </div>
                            <div>
                                <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1.5 pl-1">Corpo do Texto</label>
                                <textarea 
                                    rows={3}
                                    value={item.body}
                                    onChange={(e) => onChange({ body: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 outline-none focus:border-red-500 resize-none transition-colors"
                                    placeholder="Detalhes..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1.5 pl-1">Botão (CTA)</label>
                                    <input 
                                        type="text" 
                                        value={item.ctaText}
                                        onChange={(e) => onChange({ ctaText: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1.5 pl-1">Link</label>
                                    <input 
                                        type="text" 
                                        value={item.ctaUrl}
                                        onChange={(e) => onChange({ ctaUrl: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-blue-600 outline-none"
                                        placeholder="https://"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                                <span className="text-[9px] font-bold text-gray-500 uppercase">Status deste Slide:</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={item.active}
                                        onChange={(e) => onChange({ active: e.target.checked })}
                                    />
                                    <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className={`ml-2 text-[8px] font-black uppercase ${item.active ? 'text-green-600' : 'text-gray-400'}`}>{item.active ? 'Ativo' : 'Inativo'}</span>
                                </label>
                            </div>
                        </div>

                        {/* Divisor */}
                        <div className="h-px bg-gray-100 w-full"></div>

                        {/* Seção de Estilização Avançada */}
                        <div className="bg-gray-50/50 rounded-2xl p-1 border border-gray-100">
                            <PopupStylePanel 
                                textStyle={item.textStyle} 
                                onChange={(updates) => onChange({ textStyle: { ...item.textStyle, ...updates } })} 
                            />
                        </div>
                    </div>
                )}

                {/* --- ABA SEGMENTAÇÃO (NOVO) --- */}
                {activeTab === 'targeting' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                            <p className="text-[9px] text-blue-800 font-bold leading-relaxed">
                                <i className="fas fa-info-circle mr-1"></i> Selecione onde este slide específico aparecerá.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={() => toggleTarget('all')}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                    item.targetPages?.includes('all') 
                                    ? 'bg-black text-white border-black shadow-lg' 
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${item.targetPages?.includes('all') ? 'bg-white/20 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                    <i className="fas fa-globe"></i>
                                </div>
                                <div>
                                    <span className="text-[9px] font-black uppercase tracking-widest block">Todo o Site</span>
                                </div>
                            </button>

                            <div className="h-px bg-gray-100 my-2"></div>

                            {TARGET_OPTIONS.map(target => {
                                const isActive = item.targetPages?.includes(target.id) || item.targetPages?.includes('all');
                                const isAllActive = item.targetPages?.includes('all');
                                
                                return (
                                    <button
                                        key={target.id}
                                        type="button"
                                        onClick={() => !isAllActive && toggleTarget(target.id)}
                                        disabled={isAllActive}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${
                                            isActive 
                                            ? (isAllActive ? 'bg-gray-50 text-gray-300 border-transparent cursor-not-allowed' : 'bg-white border-green-500 ring-1 ring-green-100 text-green-700 shadow-sm') 
                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <i className={`fas ${target.icon}`}></i>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest">{target.label}</span>
                                        {isActive && <i className="fas fa-check ml-auto text-green-500 text-xs"></i>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- ABA MÍDIA PRO --- */}
                {activeTab === 'media' && (
                    <PopupMediaPanel 
                        media={item.media} 
                        onChange={(mediaUpdates) => onChange({ media: { ...item.media, ...mediaUpdates } })}
                    />
                )}

                {/* --- ABA ESTILO E TEMA --- */}
                {activeTab === 'style' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* 1. Theme Selector */}
                        <div>
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-2">Biblioteca de Temas</label>
                            <ThemeSelectorByFilter 
                                currentThemeId={item.themePresetId}
                                onSelect={handleThemeUpdate}
                            />
                        </div>

                        {/* 2. Theme Advanced */}
                        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                            <label className="text-[9px] font-black uppercase text-red-600 mb-4 block tracking-widest flex items-center gap-2">
                                <i className="fas fa-layer-group"></i> Design Avançado
                            </label>
                            <PopupThemePanel 
                                config={item.themeAdvanced || DEFAULT_THEME_ADVANCED}
                                effectConfig={item.effectConfig}
                                onChange={(updates) => onChange({ themeAdvanced: { ...item.themeAdvanced || DEFAULT_THEME_ADVANCED, ...updates } })}
                                onEffectChange={(updates) => onChange({ effectConfig: { ...(item.effectConfig || {}), ...updates } as any })}
                            />
                        </div>

                        {/* 3. Popup Size */}
                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-[8px] font-bold text-gray-400 uppercase mb-2">Tamanho do Popup</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['sm', 'md', 'lg', 'fullscreen', 'banner_bottom'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => onChange({ popupSizePreset: s as PopupSize })}
                                        className={`px-2 py-1.5 rounded border text-[8px] font-black uppercase transition-all ${
                                            item.popupSizePreset === s ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PopupEditor;