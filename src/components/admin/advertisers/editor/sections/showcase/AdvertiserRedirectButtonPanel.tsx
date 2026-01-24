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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h4 className={`text-xs font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Botão Principal de Destaque (Rede Preferida)
                </h4>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Escolha a rede social que terá o botão grande em destaque no anúncio
                </p>
            </div>

            {/* Social Media Grid - Matching Banner Theme Style */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366' },
                    { id: 'instagram', label: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
                    { id: 'tiktok', label: 'TikTok', icon: 'fa-tiktok', color: '#FFFFFF' },
                    { id: 'kwai', label: 'Kwai', icon: 'fa-video', color: '#FF6B00' },
                    { id: 'telegram', label: 'Telegram', icon: 'fa-telegram', color: '#0088cc' },
                    { id: 'external', label: 'Site', icon: 'fa-globe', color: '#9CA3AF' },
                ].map((type) => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onChange({ ...data, redirectType: type.id as any })}
                        className={`
                            relative aspect-square rounded-xl p-4 transition-all duration-200
                            flex flex-col items-center justify-center gap-2
                            ${data.redirectType === type.id
                                ? 'bg-black/40 border-2 border-orange-500 shadow-lg shadow-orange-500/20'
                                : darkMode
                                    ? 'bg-black/20 border border-white/10 hover:bg-black/30 hover:border-white/20'
                                    : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                            }
                        `}
                    >
                        {/* Icon */}
                        <i
                            className={`${type.id === 'external' || type.id === 'kwai' ? 'fas' : 'fab'} ${type.icon} text-3xl`}
                            style={{ color: data.redirectType === type.id ? type.color : darkMode ? '#9CA3AF' : '#6B7280' }}
                        ></i>

                        {/* Label */}
                        <span className={`text-[10px] font-bold uppercase tracking-tight text-center ${data.redirectType === type.id
                                ? darkMode ? 'text-white' : 'text-gray-900'
                                : darkMode ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                            {type.label}
                        </span>

                        {/* Selected indicator */}
                        {data.redirectType === type.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Conditional Input Fields */}
            <div className="space-y-4">
                {data.redirectType === 'external' && (
                    <div className="animate-fadeIn">
                        <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fas fa-globe mr-2"></i>
                            URL do Site Externo
                        </label>
                        <input
                            type="url"
                            value={data.externalUrl || ''}
                            onChange={e => onChange({ ...data, externalUrl: e.target.value })}
                            placeholder="https://www.meusite.com.br"
                            className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${darkMode
                                    ? 'bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500'
                                    : 'bg-white border border-gray-200 text-gray-900 focus:border-orange-500'
                                }`}
                        />
                    </div>
                )}

                {data.redirectType === 'whatsapp' && (
                    <div className="animate-fadeIn">
                        <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fab fa-whatsapp mr-2"></i>
                            Número do WhatsApp
                        </label>
                        <input
                            type="tel"
                            value={internal.whatsapp || ''}
                            onChange={e => handleInternalChange('whatsapp', e.target.value)}
                            placeholder="34999999999 (Apenas números com DDD)"
                            className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${darkMode
                                    ? 'bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500'
                                    : 'bg-white border border-gray-200 text-gray-900 focus:border-orange-500'
                                }`}
                        />
                        <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <i className="fas fa-info-circle mr-1"></i>
                            O link de conversa será gerado automaticamente
                        </p>
                    </div>
                )}

                {data.redirectType === 'instagram' && (
                    <div className="animate-fadeIn">
                        <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fab fa-instagram mr-2"></i>
                            Usuário do Instagram
                        </label>
                        <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>@</span>
                            <input
                                type="text"
                                value={internal.instagram || ''}
                                onChange={e => handleInternalChange('instagram', e.target.value.replace('@', ''))}
                                placeholder="nomeusuario"
                                className={`w-full pl-8 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${darkMode
                                        ? 'bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-orange-500'
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {data.redirectType === 'tiktok' && (
                    <div className="animate-fadeIn">
                        <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fab fa-tiktok mr-2"></i>
                            Usuário do TikTok
                        </label>
                        <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>@</span>
                            <input
                                type="text"
                                value={internal.tiktok || ''}
                                onChange={e => handleInternalChange('tiktok', e.target.value.replace('@', ''))}
                                placeholder="nomeusuario"
                                className={`w-full pl-8 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${darkMode
                                        ? 'bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-orange-500'
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {data.redirectType === 'kwai' && (
                    <div className="animate-fadeIn">
                        <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fas fa-video mr-2"></i>
                            Usuário do Kwai
                        </label>
                        <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>@</span>
                            <input
                                type="text"
                                value={internal.kwai || ''}
                                onChange={e => handleInternalChange('kwai', e.target.value.replace('@', ''))}
                                placeholder="nomeusuario"
                                className={`w-full pl-8 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${darkMode
                                        ? 'bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-orange-500'
                                    }`}
                            />
                        </div>
                    </div>
                )}

                {data.redirectType === 'telegram' && (
                    <div className="animate-fadeIn">
                        <label className={`block text-xs font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <i className="fab fa-telegram mr-2"></i>
                            Usuário do Telegram
                        </label>
                        <div className="relative">
                            <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>@</span>
                            <input
                                type="text"
                                value={internal.telegram || ''}
                                onChange={e => handleInternalChange('telegram', e.target.value.replace('@', ''))}
                                placeholder="nomeusuario"
                                className={`w-full pl-8 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all ${darkMode
                                        ? 'bg-black/20 border border-white/10 text-white placeholder-gray-600 focus:border-orange-500'
                                        : 'bg-white border border-gray-200 text-gray-900 focus:border-orange-500'
                                    }`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
