
import React from 'react';
import { PromoBanner } from '@/types';

interface BannerButtonTabProps {
    banner: PromoBanner;
    onUpdate: (updates: Partial<PromoBanner>) => void;
}

export const BannerButtonTab: React.FC<BannerButtonTabProps> = ({ banner, onUpdate }) => {
    const btnConfig = banner.buttonConfig || {
        label: 'Botão',
        link: '#',
        style: 'solid',
        size: 'md',
        rounded: 'md',
        effect: 'none'
    };

    const updateConfig = (key: string, value: any) => {
        onUpdate({ buttonConfig: { ...btnConfig, [key]: value } as any });
    };

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex justify-center mb-4">
                <button className={`
                    transition-all font-black uppercase tracking-widest flex items-center gap-2
                    ${btnConfig.size === 'sm' ? 'px-4 py-2 text-[9px]' : btnConfig.size === 'lg' ? 'px-8 py-4 text-xs' : 'px-6 py-3 text-[10px]'}
                    ${btnConfig.rounded === 'none' ? 'rounded-none' : btnConfig.rounded === 'full' ? 'rounded-full' : 'rounded-xl'}
                    ${btnConfig.style === 'outline' ? 'bg-transparent text-black border-2 border-black' : btnConfig.style === 'glass' ? 'bg-black/80 text-white backdrop-blur' : 'bg-red-600 text-white'}
                    ${btnConfig.effect === 'pulse' ? 'animate-pulse' : btnConfig.effect === 'bounce' ? 'animate-bounce' : ''}
                `}>
                    {btnConfig.label || 'Botão'} <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Texto do Botão</label>
                <input 
                    type="text" 
                    value={btnConfig.label || ''}
                    onChange={e => updateConfig('label', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold uppercase outline-none focus:border-red-500"
                />
            </div>

            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Link</label>
                <input 
                    type="text" 
                    value={btnConfig.link || ''}
                    onChange={e => updateConfig('link', e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-blue-600 outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Estilo</label>
                    <select 
                        value={btnConfig.style || 'solid'}
                        onChange={e => updateConfig('style', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none"
                    >
                        <option value="solid">Sólido</option>
                        <option value="outline">Contorno</option>
                        <option value="glass">Vidro (Glass)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Tamanho</label>
                    <select 
                        value={btnConfig.size || 'md'}
                        onChange={e => updateConfig('size', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none"
                    >
                        <option value="sm">Pequeno</option>
                        <option value="md">Médio</option>
                        <option value="lg">Grande</option>
                        <option value="xl">Gigante</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Arredondamento</label>
                    <select 
                        value={btnConfig.rounded || 'md'}
                        onChange={e => updateConfig('rounded', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none"
                    >
                        <option value="none">Quadrado</option>
                        <option value="md">Suave</option>
                        <option value="full">Redondo (Pill)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Efeito</label>
                    <select 
                        value={btnConfig.effect || 'none'}
                        onChange={e => updateConfig('effect', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none"
                    >
                        <option value="none">Nenhum</option>
                        <option value="pulse">Pulso</option>
                        <option value="shine">Brilho</option>
                        <option value="bounce">Pulo</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
