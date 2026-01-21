
import React from 'react';
import { PromoBanner } from '@/types';
import { WysiwygField } from './WysiwygField';
import { THEMES } from './constants';

interface BannerTextTabProps {
    banner: PromoBanner;
    onUpdate: (updates: Partial<PromoBanner>) => void;
    darkMode?: boolean;
}

export const BannerTextTab: React.FC<BannerTextTabProps> = ({ banner, onUpdate, darkMode = false }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* SELEÇÃO DE TEMA DE LOCALIZAÇÃO */}
            <div>
                <label className={`block text-[9px] font-bold uppercase mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Tema de Localização (Posição)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {THEMES.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => onUpdate({ textPositionPreset: theme.id as any })}
                            className={`p-3 rounded-xl border-2 text-left transition-all group ${(banner.textPositionPreset || 'gradient_bottom_left') === theme.id
                                ? (darkMode ? 'border-white bg-white text-black' : 'border-black bg-black text-white')
                                : (darkMode ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-gray-100 bg-white hover:border-gray-200')
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <i className={`fas ${theme.icon} ${banner.textPositionPreset === theme.id ? 'text-red-500' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}></i>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${banner.textPositionPreset === theme.id ? '' : (darkMode ? 'text-gray-300' : 'text-gray-800')}`}>{theme.label}</span>
                            </div>
                            <p className={`text-[9px] ${banner.textPositionPreset === theme.id ? (darkMode ? 'text-gray-600' : 'text-gray-400') : (darkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                                {theme.desc}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* CAMPOS DE TEXTO COM EDITOR VISUAL */}
            <div className={`space-y-6 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-100'}`}>
                <WysiwygField
                    label="Tag Superior"
                    value={banner.tag}
                    onChange={val => onUpdate({ tag: val })}
                    darkMode={darkMode}
                />

                <WysiwygField
                    label="Título Principal"
                    value={banner.title}
                    onChange={val => onUpdate({ title: val })}
                    fontFamily={banner.textConfig?.fontFamily}
                    multiline
                    darkMode={darkMode}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-[8px] font-bold uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Fonte</label>
                        <select
                            value={banner.textConfig?.fontFamily || 'Inter'}
                            onChange={e => onUpdate({ textConfig: { ...banner.textConfig!, fontFamily: e.target.value as any } })}
                            className={`w-full border rounded-lg px-2 py-2 text-[10px] font-bold uppercase outline-none ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-gray-200 text-black'}`}
                        >
                            <option value="Inter">Inter (Padrão)</option>
                            <option value="Merriweather">Merriweather (Serifa)</option>
                            <option value="Caveat">Caveat (Manuscrito)</option>
                            <option value="Oswald">Oswald (Impacto)</option>
                        </select>
                    </div>
                    <div>
                        <label className={`block text-[8px] font-bold uppercase mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>Cor Base (Texto Padrão)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={banner.textConfig?.customColor || '#ffffff'}
                                onChange={e => onUpdate({ textConfig: { ...banner.textConfig!, customColor: e.target.value } })}
                                className="w-8 h-8 rounded-full border-none cursor-pointer p-0 bg-transparent"
                            />
                            <span className={`text-[9px] font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{banner.textConfig?.customColor}</span>
                        </div>
                    </div>
                </div>

                <WysiwygField
                    label="Descrição"
                    value={banner.description}
                    onChange={val => onUpdate({ description: val })}
                    multiline
                    darkMode={darkMode}
                />

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                        type="checkbox"
                        checked={banner.textConfig?.descriptionVisible ?? true}
                        onChange={e => onUpdate({ textConfig: { ...banner.textConfig!, descriptionVisible: e.target.checked } })}
                        className="w-3 h-3 rounded text-black focus:ring-0"
                    />
                    <span className={`text-[8px] font-bold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Exibir Descrição no Banner</span>
                </label>
            </div>
        </div>
    );
};
