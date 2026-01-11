
import React from 'react';
import { PromoPopupItemConfig, PopupTextStyle } from '../../../../types';

interface PopupStylePanelProps {
    textStyle: PopupTextStyle;
    onChange: (style: Partial<PopupTextStyle>) => void;
    darkMode?: boolean;
}

const EDITOR_PALETTE = ['#000000', '#ffffff', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#6b7280'];

const ColorPicker = ({ label, value, onSelect, darkMode }: { label: string, value: string, onSelect: (c: string) => void, darkMode: boolean }) => (
    <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onSelect(e.target.value)}
                    className="w-5 h-5 rounded-full border-none p-0 cursor-pointer overflow-hidden"
                />
                <span className={`text-[8px] font-mono uppercase ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>{value}</span>
            </div>
        </div>
        <div className="flex gap-2 flex-wrap">
            {EDITOR_PALETTE.map(c => (
                <button
                    key={c}
                    onClick={() => onSelect(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${value === c ? (darkMode ? 'border-white scale-110 shadow-sm' : 'border-gray-900 scale-110 shadow-sm') : 'border-transparent opacity-50 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                />
            ))}
        </div>
    </div>
);

const PopupStylePanel: React.FC<PopupStylePanelProps> = ({ textStyle, onChange, darkMode = false }) => {

    const sectionHeaderClass = `flex items-center gap-2 border-b pb-2 mb-4 ${darkMode ? 'border-white/5' : 'border-gray-100'}`;
    const sectionTitleClass = `text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`;
    const labelClass = `text-[8px] font-bold uppercase mb-1 block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`;
    const iconClass = `text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`;

    const selectClass = `w-full rounded-lg p-2 text-[10px] font-bold uppercase outline-none border transition-colors ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`;
    const buttonGroupClass = `flex p-1 rounded-lg border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`;
    const buttonClass = (isActive: boolean) => `flex-1 py-1 rounded text-[9px] font-bold transition-all ${isActive ? (darkMode ? 'bg-white/10 shadow-sm text-white' : 'bg-white shadow-sm text-black') : (darkMode ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400')}`;

    return (
        <div className="space-y-8 animate-fadeIn pb-8">

            {/* 1. TIPOGRAFIA DO TÍTULO */}
            <section className="space-y-4">
                <div className={sectionHeaderClass}>
                    <i className={`fas fa-heading ${iconClass}`}></i>
                    <h3 className={sectionTitleClass}>Manchete (Título)</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Peso</label>
                        <select
                            value={textStyle.titleWeight || '900'}
                            onChange={e => onChange({ titleWeight: e.target.value as any })}
                            className={selectClass}
                        >
                            <option value="300">Light (300)</option>
                            <option value="400">Regular (400)</option>
                            <option value="600">Bold (600)</option>
                            <option value="700">Extra Bold (700)</option>
                            <option value="900">Black (900)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Transformação</label>
                        <div className={buttonGroupClass}>
                            {[
                                { val: 'none', lbl: 'Aa' },
                                { val: 'uppercase', lbl: 'AA' },
                                { val: 'lowercase', lbl: 'aa' }
                            ].map(opt => (
                                <button
                                    key={opt.val}
                                    onClick={() => onChange({ titleTransform: opt.val as any })}
                                    className={buttonClass(textStyle.titleTransform === opt.val)}
                                >
                                    {opt.lbl}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <ColorPicker label="Cor do Título" value={textStyle.titleColor} onSelect={c => onChange({ titleColor: c })} darkMode={darkMode} />
            </section>

            {/* 2. TIPOGRAFIA DO CORPO */}
            <section className="space-y-4">
                <div className={sectionHeaderClass}>
                    <i className={`fas fa-paragraph ${iconClass}`}></i>
                    <h3 className={sectionTitleClass}>Corpo do Texto</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Peso</label>
                        <select
                            value={textStyle.bodyWeight || '400'}
                            onChange={e => onChange({ bodyWeight: e.target.value as any })}
                            className={selectClass}
                        >
                            <option value="300">Light</option>
                            <option value="400">Regular</option>
                            <option value="500">Medium</option>
                            <option value="600">Bold</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Tamanho</label>
                        <select
                            value={textStyle.bodySize || 'md'}
                            onChange={e => onChange({ bodySize: e.target.value as any })}
                            className={selectClass}
                        >
                            <option value="sm">Pequeno</option>
                            <option value="md">Normal</option>
                            <option value="lg">Grande</option>
                        </select>
                    </div>
                </div>

                <ColorPicker label="Cor do Texto" value={textStyle.bodyColor} onSelect={c => onChange({ bodyColor: c })} darkMode={darkMode} />
            </section>

            {/* 3. ALINHAMENTO E EFEITOS GERAIS */}
            <section className="space-y-4">
                <div className={sectionHeaderClass}>
                    <i className={`fas fa-sliders ${iconClass}`}></i>
                    <h3 className={sectionTitleClass}>Layout & Efeitos</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Alinhamento</label>
                        <div className={buttonGroupClass}>
                            {['left', 'center', 'right'].map(align => (
                                <button
                                    key={align}
                                    onClick={() => onChange({ textAlign: align as any })}
                                    className={buttonClass(textStyle.textAlign === align)}
                                >
                                    <i className={`fas fa-align-${align}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Espaçamento</label>
                        <select
                            value={textStyle.letterSpacing || 'normal'}
                            onChange={e => onChange({ letterSpacing: e.target.value })}
                            className={selectClass}
                        >
                            <option value="tighter">Apertado</option>
                            <option value="normal">Normal</option>
                            <option value="widest">Expandido</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={`${labelClass} mb-2`}>Sombra do Texto</label>
                    <div className="flex gap-2">
                        {['none', 'soft', 'strong'].map(shadow => (
                            <button
                                key={shadow}
                                onClick={() => onChange({ textShadow: shadow as any })}
                                className={`flex-1 py-2 rounded-lg border text-[9px] font-black uppercase transition-all ${textStyle.textShadow === shadow ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : (darkMode ? 'bg-black/20 text-gray-500 border-white/5' : 'bg-white text-gray-500 border-gray-200')}`}
                            >
                                {shadow}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. BOTÃO CTA */}
            <section className="space-y-4">
                <div className={sectionHeaderClass}>
                    <i className={`fas fa-mouse-pointer ${iconClass}`}></i>
                    <h3 className={sectionTitleClass}>Botão CTA</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Estilo</label>
                        <select
                            value={textStyle.buttonStyle || 'solid'}
                            onChange={e => onChange({ buttonStyle: e.target.value as any })}
                            className={selectClass}
                        >
                            <option value="solid">Sólido</option>
                            <option value="outline">Contorno</option>
                            <option value="glass">Vidro (Glass)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Arredondamento</label>
                        <select
                            value={textStyle.buttonRounded || 'md'}
                            onChange={e => onChange({ buttonRounded: e.target.value as any })}
                            className={selectClass}
                        >
                            <option value="none">Quadrado</option>
                            <option value="md">Médio</option>
                            <option value="full">Redondo</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ColorPicker label="Fundo Botão" value={textStyle.buttonColor || '#000000'} onSelect={c => onChange({ buttonColor: c })} darkMode={darkMode} />
                    <ColorPicker label="Texto Botão" value={textStyle.buttonTextColor || '#ffffff'} onSelect={c => onChange({ buttonTextColor: c })} darkMode={darkMode} />
                </div>
            </section>

        </div>
    );
};

export default PopupStylePanel;
