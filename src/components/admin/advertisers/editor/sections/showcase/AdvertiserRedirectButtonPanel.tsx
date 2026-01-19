import React from 'react';
import { Advertiser } from '@/types';

import { InternalPageData } from '@/types/admin';

interface RedirectButtonConfigProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    internal: InternalPageData;
    handleInternalChange: (field: string, value: unknown) => void;
    darkMode?: boolean;
}

export const RedirectButtonConfig: React.FC<RedirectButtonConfigProps> = ({ data, onChange, internal, handleInternalChange, darkMode }) => {
    return (
        <div className={`pt-6 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
            <div className="flex flex-col gap-1 mb-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Botão Principal de Destaque (Rede Preferida)</label>
                <span className="text-[9px] text-gray-500 font-bold italic">Escolha a rede social que terá o botão grande em destaque no anúncio.</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-whatsapp', color: 'text-green-500' },
                    { id: 'instagram', label: 'Instagram', icon: 'fa-instagram', color: 'text-pink-500' },
                    { id: 'tiktok', label: 'TikTok', icon: 'fa-tiktok', color: 'text-black dark:text-white' },
                    { id: 'kwai', label: 'Kwai', icon: 'fa-video', color: 'text-orange-500' },
                    { id: 'telegram', label: 'Telegram', icon: 'fa-telegram', color: 'text-blue-400' },
                    { id: 'external', label: 'Site Externo', icon: 'fa-globe', color: 'text-gray-400' },
                ].map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onChange({ ...data, redirectType: type.id as 'whatsapp' | 'instagram' | 'tiktok' | 'kwai' | 'telegram' | 'external' })}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all ${data.redirectType === type.id
                            ? 'bg-red-600 border-red-600 text-white shadow-lg'
                            : darkMode
                                ? 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                                : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                            }`}
                    >
                        <i className={`${type.id === 'external' ? 'fas' : type.id === 'kwai' ? 'fas' : 'fab'} ${type.icon} ${data.redirectType === type.id ? 'text-white' : type.color}`}></i>
                        {type.label}
                    </button>
                ))}
            </div>

            {data.redirectType === 'external' && (
                <div className="animate-slideUp">
                    <label className="block text-[9px] font-bold text-blue-500 uppercase mb-2 ml-1">URL do Site</label>
                    <input
                        type="text"
                        value={data.externalUrl || ''}
                        onChange={e => onChange({ ...data, externalUrl: e.target.value })}
                        placeholder="https://www.meusite.com.br"
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${darkMode
                            ? 'bg-blue-900/20 border-blue-500/30 text-blue-300 placeholder-blue-700 focus:bg-blue-900/40'
                            : 'bg-blue-50 border-blue-200 text-blue-800 focus:bg-blue-100'
                            }`}
                    />
                </div>
            )}

            {data.redirectType === 'whatsapp' && (
                <div className="animate-slideUp">
                    <label className="block text-[9px] font-bold text-green-500 uppercase mb-2 ml-1">Número do WhatsApp</label>
                    <input
                        type="text"
                        value={internal.whatsapp || ''}
                        onChange={e => handleInternalChange('whatsapp', e.target.value)}
                        placeholder="34999999999 (Apenas números com DDD)"
                        className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${darkMode
                            ? 'bg-green-900/20 border-green-500/30 text-green-300 placeholder-green-700 focus:bg-green-900/40'
                            : 'bg-green-50 border-green-200 text-green-800 focus:bg-green-100'
                            }`}
                    />
                    <p className="text-[8px] text-gray-400 mt-2 ml-1 font-bold uppercase italic">* O sistema gerará o link de conversa automaticamente.</p>
                </div>
            )}

            {data.redirectType === 'instagram' && (
                <div className="animate-slideUp">
                    <label className="block text-[9px] font-bold text-pink-500 uppercase mb-2 ml-1">Usuário do Instagram</label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs ${darkMode ? 'text-pink-500/50' : 'text-pink-500/50'}`}>@</span>
                        <input
                            type="text"
                            value={internal.instagram || ''}
                            onChange={e => handleInternalChange('instagram', e.target.value.replace('@', ''))}
                            placeholder="nomeusuario"
                            className={`w-full border rounded-xl pl-8 pr-4 py-3 text-xs font-bold outline-none transition-all ${darkMode
                                ? 'bg-pink-900/20 border-pink-500/30 text-pink-300 placeholder-pink-700 focus:bg-pink-900/40'
                                : 'bg-pink-50 border-pink-200 text-pink-800 focus:bg-pink-100'
                                }`}
                        />
                    </div>
                </div>
            )}

            {data.redirectType === 'tiktok' && (
                <div className="animate-slideUp">
                    <label className="block text-[9px] font-bold text-black dark:text-white uppercase mb-2 ml-1">Usuário do TikTok</label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs opacity-50`}>@</span>
                        <input
                            type="text"
                            value={internal.tiktok || ''}
                            onChange={e => handleInternalChange('tiktok', e.target.value.replace('@', ''))}
                            placeholder="nomeusuario"
                            className={`w-full border rounded-xl pl-8 pr-4 py-3 text-xs font-bold outline-none transition-all ${darkMode
                                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:bg-zinc-900'
                                : 'bg-zinc-100 border-zinc-300 text-black focus:bg-white'
                                }`}
                        />
                    </div>
                </div>
            )}

            {data.redirectType === 'kwai' && (
                <div className="animate-slideUp">
                    <label className="block text-[9px] font-bold text-orange-500 uppercase mb-2 ml-1">Usuário do Kwai</label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs opacity-50 text-orange-500`}>@</span>
                        <input
                            type="text"
                            value={internal.kwai || ''}
                            onChange={e => handleInternalChange('kwai', e.target.value.replace('@', ''))}
                            placeholder="nomeusuario"
                            className={`w-full border rounded-xl pl-8 pr-4 py-3 text-xs font-bold outline-none transition-all ${darkMode
                                ? 'bg-orange-900/20 border-orange-500/30 text-orange-300 placeholder-orange-700 focus:bg-orange-900/40'
                                : 'bg-orange-50 border-orange-200 text-orange-800 focus:bg-orange-100'
                                }`}
                        />
                    </div>
                </div>
            )}

            {data.redirectType === 'telegram' && (
                <div className="animate-slideUp">
                    <label className="block text-[9px] font-bold text-blue-400 uppercase mb-2 ml-1">Usuário do Telegram</label>
                    <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xs opacity-50 text-blue-400`}>@</span>
                        <input
                            type="text"
                            value={internal.telegram || ''}
                            onChange={e => handleInternalChange('telegram', e.target.value.replace('@', ''))}
                            placeholder="nomeusuario"
                            className={`w-full border rounded-xl pl-8 pr-4 py-3 text-xs font-bold outline-none transition-all ${darkMode
                                ? 'bg-blue-900/20 border-blue-400/30 text-blue-300 placeholder-blue-700 focus:bg-blue-900/40'
                                : 'bg-blue-50 border-blue-200 text-blue-800 focus:bg-blue-100'
                                }`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
