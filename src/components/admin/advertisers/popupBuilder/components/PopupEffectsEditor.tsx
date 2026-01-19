import React from 'react';
import { PopupEffectConfig, PopupEffectDirection } from '@/types';

interface PopupEffectsEditorProps {
    effectConfig: PopupEffectConfig;
    onEffectChange: (updates: Partial<PopupEffectConfig>) => void;
    darkMode?: boolean;
}

const EDITOR_PALETTE = ['#ffffff', '#000000', '#dc2626', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#6b7280'];

const EFFECTS = [
    { id: 'snow', label: 'Neve' },
    { id: 'rain', label: 'Chuva' },
    { id: 'sparkles', label: 'Brilhos' },
    { id: 'confetti', label: 'Confete' },
    { id: 'hearts', label: 'Corações' },
    { id: 'pumpkins', label: 'Abóboras' },
    { id: 'pulse_red', label: 'Pulso' },
    { id: 'camera_flash', label: 'Flash' },
    { id: 'matrix', label: 'Matrix' },
    { id: 'bokeh', label: 'Bokeh' },
    { id: 'scanline', label: 'Scanline' },
    { id: 'noise', label: 'Ruído' },
    { id: 'clouds', label: 'Nuvens' },
    { id: 'gradient_wave', label: 'Onda Cor' },
    { id: 'glitch', label: 'Glitch' },
];

const DIRECTION_OPTIONS: { id: PopupEffectDirection; label: string; icon: string }[] = [
    { id: 'random', label: 'Aleatório', icon: 'fa-shuffle' },
    { id: 'top_bottom', label: 'Cima p/ Baixo', icon: 'fa-arrow-down' },
    { id: 'bottom_top', label: 'Baixo p/ Cima', icon: 'fa-arrow-up' },
    { id: 'left_right', label: 'Esq p/ Dir', icon: 'fa-arrow-right' },
    { id: 'right_left', label: 'Dir p/ Esq', icon: 'fa-arrow-left' },
];

const PopupEffectsEditor: React.FC<PopupEffectsEditorProps> = ({
    effectConfig,
    onEffectChange,
    darkMode = false
}) => {
    const cardClass = `p-4 rounded-2xl border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`;
    const selectClass = `w-full rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none transition-colors ${darkMode ? 'bg-black border border-white/10 text-white focus:border-red-500' : 'bg-white border border-gray-200 focus:border-red-500'}`;

    return (
        <div className={`pt-8 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-6">
                <label className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2">
                    <i className="fas fa-wand-magic-sparkles"></i> Efeitos Especiais (FX)
                </label>
                <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold uppercase ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Ativar Efeitos</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={effectConfig.enabled}
                            onChange={(e) => onEffectChange({ enabled: e.target.checked })}
                        />
                        <div className={`w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                    </label>
                </div>
            </div>

            <div className={`space-y-6 transition-all duration-300 ${!effectConfig.enabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>

                {/* Seletor de Tipo */}
                <div className={cardClass}>
                    <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Tipo de Efeito</label>
                    <select
                        value={effectConfig.type}
                        onChange={e => onEffectChange({ type: e.target.value as PopupEffectConfig['type'] })}
                        className={selectClass}
                    >
                        <option value="none">-- Nenhum --</option>
                        {EFFECTS.map(fx => (
                            <option key={fx.id} value={fx.id} className="text-black">{fx.label}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Intensidade */}
                    <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Intensidade / Velocidade</label>
                        <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            {([
                                { id: 'low', label: 'Suave' },
                                { id: 'normal', label: 'Normal' },
                                { id: 'high', label: 'Intenso' },
                            ] as const).map(int => (
                                <button
                                    key={int.id}
                                    onClick={() => onEffectChange({ intensity: int.id as PopupEffectConfig['intensity'] })}
                                    className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${effectConfig.intensity === int.id
                                        ? (darkMode ? 'bg-white/10 text-red-500 shadow-sm' : 'bg-white shadow-sm text-red-600')
                                        : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                                        }`}
                                >
                                    {int.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Camada (Placement) */}
                    <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Localização (Camada)</label>
                        <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            {([
                                { id: 'background', label: 'Fundo Card' },
                                { id: 'over_media', label: 'Sobre Mídia' },
                                { id: 'screen_overlay', label: 'Frente Total' },
                            ] as const).map(place => (
                                <button
                                    key={place.id}
                                    onClick={() => onEffectChange({ placement: place.id as PopupEffectConfig['placement'] })}
                                    className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${effectConfig.placement === place.id
                                        ? (darkMode ? 'bg-white/10 text-blue-400 shadow-sm' : 'bg-white shadow-sm text-blue-600')
                                        : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                                        }`}
                                >
                                    {place.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* NOVO: DIREÇÃO E COR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Direção */}
                    <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Direção do Movimento</label>
                        <div className={`flex p-1 rounded-xl border overflow-x-auto scrollbar-hide ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            {DIRECTION_OPTIONS.map(dir => (
                                <button
                                    key={dir.id}
                                    onClick={() => onEffectChange({ direction: dir.id })}
                                    className={`flex-1 min-w-[40px] py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${(effectConfig.direction || 'top_bottom') === dir.id
                                        ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black')
                                        : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')
                                        }`}
                                    title={dir.label}
                                >
                                    <i className={`fas ${dir.icon}`}></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cor */}
                    <div>
                        <label className={`text-[9px] font-black uppercase tracking-widest block mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cor do Efeito</label>
                        <div className={`flex gap-2 flex-wrap p-2 rounded-xl border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <button
                                onClick={() => onEffectChange({ color: undefined })}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!effectConfig.color ? 'border-black' : 'border-gray-200'}`}
                                title="Padrão do Efeito"
                            >
                                <i className="fas fa-ban text-[8px] text-gray-400"></i>
                            </button>
                            {EDITOR_PALETTE.map(c => (
                                <button
                                    key={c}
                                    onClick={() => onEffectChange({ color: c })}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${effectConfig.color === c ? 'border-black scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Opacidade */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Visibilidade (Opacidade)</label>
                        <span className="text-[9px] font-bold text-gray-600">{effectConfig.opacity}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={effectConfig.opacity}
                        onChange={e => onEffectChange({ opacity: parseInt(e.target.value) })}
                        className="w-full accent-red-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

            </div>
        </div>
    );
};

export default PopupEffectsEditor;
