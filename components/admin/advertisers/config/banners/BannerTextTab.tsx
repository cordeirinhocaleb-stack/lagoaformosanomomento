
import React from 'react';
import { PromoBanner } from '@/types';
import { WysiwygField } from './WysiwygField';
import { THEMES } from './constants';

interface BannerTextTabProps {
    banner: PromoBanner;
    onUpdate: (updates: Partial<PromoBanner>) => void;
}

export const BannerTextTab: React.FC<BannerTextTabProps> = ({ banner, onUpdate }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* SELEÇÃO DE TEMA DE LOCALIZAÇÃO */}
            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-3">Tema de Localização (Posição)</label>
                <div className="grid grid-cols-2 gap-3">
                    {THEMES.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => onUpdate({ textPositionPreset: theme.id as any })}
                            className={`p-3 rounded-xl border-2 text-left transition-all group ${
                                (banner.textPositionPreset || 'gradient_bottom_left') === theme.id 
                                    ? 'border-black bg-black text-white' 
                                    : 'border-gray-100 bg-white hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <i className={`fas ${theme.icon} ${banner.textPositionPreset === theme.id ? 'text-red-500' : 'text-gray-400'}`}></i>
                                <span className="text-[10px] font-black uppercase tracking-widest">{theme.label}</span>
                            </div>
                            <p className={`text-[9px] ${banner.textPositionPreset === theme.id ? 'text-gray-400' : 'text-gray-500'}`}>
                                {theme.desc}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* CAMPOS DE TEXTO COM EDITOR VISUAL */}
            <div className="space-y-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                <WysiwygField 
                    label="Tag Superior"
                    value={banner.tag}
                    onChange={val => onUpdate({ tag: val })}
                />

                <WysiwygField 
                    label="Título Principal"
                    value={banner.title}
                    onChange={val => onUpdate({ title: val })}
                    fontFamily={banner.textConfig?.fontFamily}
                    multiline
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Fonte</label>
                        <select 
                            value={banner.textConfig?.fontFamily || 'Inter'} 
                            onChange={e => onUpdate({ textConfig: { ...banner.textConfig!, fontFamily: e.target.value as any } })}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-[10px] font-bold uppercase outline-none"
                        >
                            <option value="Inter">Inter (Padrão)</option>
                            <option value="Merriweather">Merriweather (Serifa)</option>
                            <option value="Caveat">Caveat (Manuscrito)</option>
                            <option value="Oswald">Oswald (Impacto)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[8px] font-bold text-gray-400 uppercase mb-1">Cor Base (Texto Padrão)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={banner.textConfig?.customColor || '#ffffff'}
                                onChange={e => onUpdate({ textConfig: { ...banner.textConfig!, customColor: e.target.value } })}
                                className="w-8 h-8 rounded-full border-none cursor-pointer p-0 bg-transparent"
                            />
                            <span className="text-[9px] text-gray-500 font-mono">{banner.textConfig?.customColor}</span>
                        </div>
                    </div>
                </div>

                <WysiwygField 
                    label="Descrição"
                    value={banner.description}
                    onChange={val => onUpdate({ description: val })}
                    multiline
                />

                <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input 
                        type="checkbox" 
                        checked={banner.textConfig?.descriptionVisible ?? true}
                        onChange={e => onUpdate({ textConfig: { ...banner.textConfig!, descriptionVisible: e.target.checked } })}
                        className="w-3 h-3 rounded text-black focus:ring-0"
                    />
                    <span className="text-[8px] font-bold uppercase text-gray-500">Exibir Descrição no Banner</span>
                </label>
            </div>
        </div>
    );
};
