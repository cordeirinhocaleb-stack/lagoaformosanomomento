
import React from 'react';
import { PromoBanner } from '@/types';

interface BannerButtonTabProps {
    banner: PromoBanner;
    onUpdate: (updates: Partial<PromoBanner>) => void;
    darkMode?: boolean;
}

export const BannerButtonTab: React.FC<BannerButtonTabProps> = ({ banner, onUpdate, darkMode = false }) => {
    const btnConfig = banner.buttonConfig || {
        label: 'Botão',
        link: '#',
        style: 'solid',
        size: 'md',
        rounded: 'md',
        effect: 'none'
    };

    const updateConfig = (key: string, value: unknown) => {
        onUpdate({ buttonConfig: { ...btnConfig, [key]: value } as any });
    };

    const inputClass = `w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-gray-50 border-gray-200 focus:border-red-500'}`;
    const selectClass = `w-full border rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-gray-200'}`;
    const labelClass = `block text-[9px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`;

    return (
        <div className="space-y-5 animate-fadeIn">
            <div className={`p-6 rounded-2xl border flex justify-center mb-4 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                <button className={`
                    transition-all font-black uppercase tracking-widest flex items-center gap-2
                    ${btnConfig.size === 'sm' ? 'px-4 py-2 text-[9px]' : btnConfig.size === 'lg' ? 'px-8 py-4 text-xs' : 'px-6 py-3 text-[10px]'}
                    ${btnConfig.rounded === 'none' ? 'rounded-none' : btnConfig.rounded === 'full' ? 'rounded-full' : 'rounded-xl'}
                    ${btnConfig.style === 'outline'
                        ? (darkMode ? 'bg-transparent text-white border-2 border-white' : 'bg-transparent text-black border-2 border-black')
                        : btnConfig.style === 'glass'
                            ? 'bg-black/80 text-white backdrop-blur'
                            : 'bg-red-600 text-white'}
                    ${btnConfig.effect === 'pulse' ? 'animate-pulse' : btnConfig.effect === 'bounce' ? 'animate-bounce' : ''}
                `}>
                    {btnConfig.label || 'Botão'} <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            <div>
                <label className={labelClass}>Texto do Botão</label>
                <input
                    type="text"
                    value={btnConfig.label || ''}
                    onChange={e => updateConfig('label', e.target.value)}
                    className={inputClass}
                />
            </div>

            {/* Link Configuration Section */}
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                <label className={labelClass}>Destino do Clique</label>

                {/* Type Selector Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <button
                        onClick={() => updateConfig('link', '')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${!btnConfig.link?.includes('wa.me') && !btnConfig.link?.includes('instagram.com') && !btnConfig.link?.includes('facebook.com') && !btnConfig.link?.includes('tiktok.com') && !btnConfig.link?.includes('kwai.com')
                                ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                                : (darkMode ? 'bg-transparent text-gray-500 border-white/10 hover:text-white' : 'bg-transparent text-gray-400 border-gray-200 hover:text-black')
                            }`}
                    >
                        URL / Site
                    </button>
                    <button
                        onClick={() => updateConfig('link', 'https://wa.me/55')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${btnConfig.link?.includes('wa.me')
                                ? 'bg-green-500 text-white border-green-500'
                                : (darkMode ? 'bg-transparent text-gray-500 border-white/10 hover:text-green-500' : 'bg-transparent text-gray-400 border-gray-200 hover:text-green-600')
                            }`}
                    >
                        <i className="fab fa-whatsapp mr-1"></i> WhatsApp
                    </button>
                    <button
                        onClick={() => updateConfig('link', 'https://instagram.com/')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${btnConfig.link?.includes('instagram.com')
                                ? 'bg-pink-600 text-white border-pink-600'
                                : (darkMode ? 'bg-transparent text-gray-500 border-white/10 hover:text-pink-500' : 'bg-transparent text-gray-400 border-gray-200 hover:text-pink-600')
                            }`}
                    >
                        <i className="fab fa-instagram mr-1"></i> Instagram
                    </button>
                    <button
                        onClick={() => updateConfig('link', 'https://facebook.com/')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${btnConfig.link?.includes('facebook.com')
                                ? 'bg-blue-600 text-white border-blue-600'
                                : (darkMode ? 'bg-transparent text-gray-500 border-white/10 hover:text-blue-500' : 'bg-transparent text-gray-400 border-gray-200 hover:text-blue-600')
                            }`}
                    >
                        <i className="fab fa-facebook mr-1"></i> Facebook
                    </button>
                    <button
                        onClick={() => updateConfig('link', 'https://tiktok.com/@')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${btnConfig.link?.includes('tiktok.com')
                                ? 'bg-black text-white border-black' // TikTok brand is black/white/teal/red
                                : (darkMode ? 'bg-transparent text-gray-500 border-white/10 hover:text-white' : 'bg-transparent text-gray-400 border-gray-200 hover:text-black')
                            }`}
                    >
                        <i className="fab fa-tiktok mr-1"></i> TikTok
                    </button>
                    <button
                        onClick={() => updateConfig('link', 'https://www.kwai.com/@')}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${btnConfig.link?.includes('kwai.com')
                                ? 'bg-orange-500 text-white border-orange-500'
                                : (darkMode ? 'bg-transparent text-gray-500 border-white/10 hover:text-orange-500' : 'bg-transparent text-gray-400 border-gray-200 hover:text-orange-600')
                            }`}
                    >
                        <i className="fas fa-video mr-1"></i> Kwai
                    </button>
                </div>

                {/* Dynamic Input */}
                <div className="relative">
                    {btnConfig.link?.includes('wa.me') ? (
                        <div>
                            <label className="text-[8px] font-bold text-green-500 mb-1 block uppercase">Número do WhatsApp (DDD + Número)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">+55</span>
                                <input
                                    type="text"
                                    value={btnConfig.link?.replace('https://wa.me/55', '') || ''}
                                    onChange={e => updateConfig('link', `https://wa.me/55${e.target.value.replace(/\D/g, '')}`)}
                                    placeholder="34999999999"
                                    className={`${inputClass} pl-10`}
                                />
                            </div>
                        </div>
                    ) : btnConfig.link?.includes('instagram.com') ? (
                        <div>
                            <label className="text-[8px] font-bold text-pink-500 mb-1 block uppercase">Usuário do Instagram</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">@</span>
                                <input
                                    type="text"
                                    value={btnConfig.link?.replace('https://instagram.com/', '').replace('/', '') || ''}
                                    onChange={e => updateConfig('link', `https://instagram.com/${e.target.value.trim()}`)}
                                    placeholder="seu_perfil"
                                    className={`${inputClass} pl-8`}
                                />
                            </div>
                        </div>
                    ) : btnConfig.link?.includes('facebook.com') ? (
                        <div>
                            <label className="text-[8px] font-bold text-blue-600 mb-1 block uppercase">Página ou Perfil Facebook</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">/</span>
                                <input
                                    type="text"
                                    value={btnConfig.link?.replace('https://facebook.com/', '') || ''}
                                    onChange={e => updateConfig('link', `https://facebook.com/${e.target.value.trim()}`)}
                                    placeholder="sua.pagina"
                                    className={`${inputClass} pl-6`}
                                />
                            </div>
                        </div>
                    ) : btnConfig.link?.includes('tiktok.com') ? (
                        <div>
                            <label className={`text-[8px] font-bold mb-1 block uppercase ${darkMode ? 'text-white' : 'text-black'}`}>Usuário TikTok</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">@</span>
                                <input
                                    type="text"
                                    value={btnConfig.link?.replace('https://tiktok.com/@', '') || ''}
                                    onChange={e => updateConfig('link', `https://tiktok.com/@${e.target.value.trim().replace('@', '')}`)}
                                    placeholder="usuario"
                                    className={`${inputClass} pl-8`}
                                />
                            </div>
                        </div>
                    ) : btnConfig.link?.includes('kwai.com') ? (
                        <div>
                            <label className="text-[8px] font-bold text-orange-500 mb-1 block uppercase">Usuário Kwai</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">@</span>
                                <input
                                    type="text"
                                    value={btnConfig.link?.replace('https://www.kwai.com/@', '') || ''}
                                    onChange={e => updateConfig('link', `https://www.kwai.com/@${e.target.value.trim().replace('@', '')}`)}
                                    placeholder="usuario"
                                    className={`${inputClass} pl-8`}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className={`text-[8px] font-bold mb-1 block uppercase ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Link Externo Completo</label>
                            <input
                                type="text"
                                value={btnConfig.link || ''}
                                onChange={e => updateConfig('link', e.target.value)}
                                placeholder="https://..."
                                className={`${inputClass} ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Estilo</label>
                    <select
                        value={btnConfig.style || 'solid'}
                        onChange={e => updateConfig('style', e.target.value)}
                        className={selectClass}
                    >
                        <option value="solid">Sólido</option>
                        <option value="outline">Contorno</option>
                        <option value="glass">Vidro (Glass)</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Tamanho</label>
                    <select
                        value={btnConfig.size || 'md'}
                        onChange={e => updateConfig('size', e.target.value)}
                        className={selectClass}
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
                    <label className={labelClass}>Arredondamento</label>
                    <select
                        value={btnConfig.rounded || 'md'}
                        onChange={e => updateConfig('rounded', e.target.value)}
                        className={selectClass}
                    >
                        <option value="none">Quadrado</option>
                        <option value="md">Suave</option>
                        <option value="full">Redondo (Pill)</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Efeito</label>
                    <select
                        value={btnConfig.effect || 'none'}
                        onChange={e => updateConfig('effect', e.target.value)}
                        className={selectClass}
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
