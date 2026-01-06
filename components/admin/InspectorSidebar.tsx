import React, { useMemo } from 'react';
import { ContentBlock } from '../../types';
import { getWidgetStyles } from './WidgetPresets';
import { EDITOR_WIDGETS } from './EditorWidgets';
import { getEngagementStyles } from './editor/EngagementStyles';
import { getEngagementColors } from './editor/EngagementColors';

interface InspectorSidebarProps {
    block: ContentBlock | null;
    onUpdate: (block: ContentBlock) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    accessToken: string | null;
    newsMetadata: any;
}

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ block, onUpdate, onDelete, onClose }) => {

    // Helper to identify widget ID
    const widgetId = useMemo(() => {
        if (!block || block.type !== 'smart_block') return null;
        if (block.settings.widgetId) return block.settings.widgetId;

        // Infer from content
        const widgetDef = EDITOR_WIDGETS.find(w => block.content.includes(`data-key`)); // Simplified check
        return widgetDef ? widgetDef.id : 'default';
    }, [block]);

    const availableStyles = useMemo(() => {
        if (!widgetId) return [];
        return getWidgetStyles(widgetId);
    }, [widgetId]);

    const engagementStyles = useMemo(() => {
        if (!block || block.type !== 'engagement') return [];
        // Extract type from settings or content
        return getEngagementStyles(block.settings.engagementType || 'poll');
    }, [block]);

    const engagementColors = useMemo(() => {
        if (!block) return [];
        if (block.type === 'engagement') {
            return getEngagementColors(block.settings.engagementType || 'poll');
        }
        if (block.type === 'smart_block') {
            return getEngagementColors('default');
        }
        return [];
    }, [block]);

    if (!block) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 p-4 border-l bg-white">
                <i className="fas fa-mouse-pointer text-4xl"></i>
                <p>Selecione um bloco para editar</p>
            </div>
        );
    }

    const handleChange = (field: string, value: any) => {
        onUpdate({
            ...block,
            settings: {
                ...block.settings,
                [field]: value
            }
        });
    };

    if (!block) return null;

    return (
        <div className="h-full w-full bg-white border-l border-gray-100 shadow-xl flex flex-col animate-fadeIn">
            {/* HEADER */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Propriedades</span>
                <div className="flex gap-2">
                    <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 transition-colors">
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* GLOBAL SETTINGS */}
                <div className="space-y-4">

                    {/* WIDGET VARIANT SELECTOR */}
                    {block.type === 'smart_block' && widgetId && (
                        <div className="space-y-2 animate-fadeIn">
                            <label className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                <i className="fas fa-paint-brush text-blue-500"></i> Variante Visual
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableStyles.map(style => {
                                    const isActive = (block.settings.editorialVariant || 'default') === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => handleChange('editorialVariant', style.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 ${isActive ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-50'}`}
                                            title={style.label}
                                        >
                                            <i className={`fas ${style.icon} text-lg`}></i>
                                            <span className="text-[9px] font-black uppercase tracking-wider">{style.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ENGAGEMENT STYLE SELECTOR - DYNAMIC PER TYPE */}
                    {block.type === 'engagement' && (
                        <div className="space-y-2 animate-fadeIn">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                    <i className="fas fa-palette text-red-500"></i> Estilo Visual
                                </label>
                                <span className="text-[9px] font-mono text-zinc-300 uppercase">{block.settings.engagementType || 'poll'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {engagementStyles.map(style => {
                                    const isActive = (block.settings.engagementStyle || 'default') === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => handleChange('engagementStyle', style.id)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-2 relative overflow-hidden group ${isActive ? 'bg-red-50 border-red-500 text-red-600 shadow-sm' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-50'}`}
                                            title={style.description}
                                        >
                                            {/* Icon / Preview */}
                                            <div className="z-10 flex flex-col items-center gap-1">
                                                <i className={`fas ${style.icon} text-lg ${isActive ? 'text-red-500' : 'text-zinc-300 group-hover:text-zinc-500'}`}></i>
                                                <span className="text-[9px] font-black uppercase tracking-wider">{style.label}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-zinc-400 text-center italic">
                                {engagementStyles.find(s => s.id === (block.settings.engagementStyle || 'default'))?.description}
                            </p>
                        </div>
                    )}

                    {/* COLOR THEME SELECTOR */}
                    {(block.type === 'engagement' || block.type === 'smart_block') && engagementColors.length > 0 && (
                        <div className="space-y-2 animate-fadeIn pt-2 border-t border-zinc-100">
                            <label className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                <i className="fas fa-swatchbook text-purple-500"></i> Tema de Cores
                            </label>

                            <div className="grid grid-cols-5 gap-2">
                                {engagementColors.map(theme => {
                                    const isActive = (block.settings.engagementColor || engagementColors[0].id) === theme.id;
                                    return (
                                        <button
                                            key={theme.id}
                                            onClick={() => handleChange('engagementColor', theme.id)}
                                            className={`w-full aspect-square rounded-full flex items-center justify-center transition-all ${isActive ? 'ring-2 ring-offset-1 ring-blue-400 scale-110' : 'hover:scale-105'}`}
                                            title={theme.label}
                                        >
                                            <div className={`w-full h-full rounded-full ${theme.preview} border-2 border-white shadow-sm`}></div>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-zinc-400 text-center italic">
                                {engagementColors.find(c => c.id === (block.settings.engagementColor || engagementColors[0].id))?.label}
                            </p>
                        </div>
                    )}
                    {/* SEPARATOR SETTINGS */}
                    {block.type === 'separator' && (
                        <div className="space-y-4 animate-fadeIn border-t border-zinc-100 pt-4">
                            <label className="text-xs font-bold text-zinc-700 flex items-center gap-2">
                                <i className="fas fa-ruler-combined text-zinc-500"></i> Dimensões da Linha
                            </label>

                            {/* Thickness */}
                            <div>
                                <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                    <span>Espessura</span>
                                    <span>{block.settings.thickness || 1}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={block.settings.thickness || 1}
                                    onChange={(e) => handleChange('thickness', parseInt(e.target.value))}
                                    className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Height (Vertical Only) */}
                            {block.settings.orientation === 'vertical' && (
                                <div>
                                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                                        <span>Altura Vertical</span>
                                        <span>{block.settings.height || 60}px</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="20"
                                        max="500"
                                        step="10"
                                        value={block.settings.height || 60}
                                        onChange={(e) => handleChange('height', parseInt(e.target.value))}
                                        className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}

                            {/* Color Picker Simple */}
                            <div>
                                <label className="text-[10px] font-bold text-zinc-400 block mb-2">Cor da Linha</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#e2e8f0', '#94a3b8', '#475569', '#000000', '#ef4444', '#3b82f6'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => handleChange('color', c)}
                                            className={`w-6 h-6 rounded-full border border-zinc-200 ${block.settings.color === c ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Largura</label>
                        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
                            {[
                                { value: '1/4', icon: 'fa-compress-arrows-alt', label: '25%' },
                                { value: '1/3', icon: 'fa-compress', label: '33%' },
                                { value: '1/2', icon: 'fa-columns', label: '50%' },
                                { value: '2/3', icon: 'fa-expand', label: '66%' },
                                { value: 'full', icon: 'fa-arrows-alt-h', label: '100%' }
                            ].map((opt) => {
                                const val = opt.value === 'full' ? 'full' : opt.value;
                                const current = block.settings.width || 'full';
                                const isActive = current === val || (val === 'full' && !block.settings.width);
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('width', val)}
                                        className={`flex-1 h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center ${isActive ? 'bg-white shadow text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                                        title={opt.label}
                                    >
                                        <i className={`fas ${opt.icon}`}></i>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-zinc-700 block mb-1">Espaçamento Vertical</label>
                        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
                            {[
                                { value: 'py-0', icon: 'fa-compress', label: 'Nenhum' },
                                { value: 'py-2', icon: 'fa-compress-alt', label: 'Pequeno' },
                                { value: 'py-4', icon: 'fa-arrows-alt-v', label: 'Normal' },
                                { value: 'py-8', icon: 'fa-expand-alt', label: 'Grande' },
                                { value: 'py-16', icon: 'fa-expand-arrows-alt', label: 'Extra' }
                            ].map((opt) => {
                                const current = block.settings.paddingY || 'py-4';
                                const isActive = current === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleChange('paddingY', opt.value)}
                                        className={`flex-1 h-8 rounded text-[10px] font-bold transition-all flex items-center justify-center ${isActive ? 'bg-white shadow text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                                        title={opt.label}
                                    >
                                        <i className={`fas ${opt.icon}`}></i>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* AÇÕES DE BLOCO */}
                <div className="pt-6 border-t border-zinc-100">
                    <button
                        onClick={() => onDelete(block.id)}
                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-trash-alt"></i> Excluir Bloco
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InspectorSidebar;
