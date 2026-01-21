
import React, { useState, useEffect } from 'react';
import { Advertiser } from '../../../../../types';
import MediaUploader from '../../../../media/MediaUploader';
import { storeLocalFile, getLocalFile } from '../../../../../services/storage/localStorageService';


interface ShowcaseSectionProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ data, onChange, darkMode = false }) => {
    const internal = data.internalPage || { description: '', products: [], whatsapp: '', instagram: '', location: '' };
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({}); // Map local_ID -> BlobURL
    const [previewIndex, setPreviewIndex] = useState(0);

    // Load previews for existing local_ IDs on mount or data change
    useEffect(() => {
        const loadPreviews = async () => {
            const extraUrls = data.logoUrls || [];
            const idsToLoad = [data.logoUrl, ...extraUrls, data.videoUrl]
                .filter(url => url && url.startsWith('local_') && !localPreviews[url]);

            if (idsToLoad.length === 0) { return; }

            const newPreviews = { ...localPreviews };
            await Promise.all(idsToLoad.map(async (id) => {
                if (!id) { return; }
                try {
                    const blob = await getLocalFile(id);
                    if (blob) {
                        newPreviews[id] = URL.createObjectURL(blob);
                    }
                } catch (e) {
                    console.error("Erro ao carregar preview local:", id);
                }
            }));
            setLocalPreviews(newPreviews);
        };
        loadPreviews();
    }, [data.logoUrl, data.logoUrls, data.videoUrl]);

    // Efeito para o Preview em tempo real simular as transições
    useEffect(() => {
        const activeUrls = (data.logoUrls?.filter(u => !!u) || []);
        if (data.mediaType === 'video' || activeUrls.length <= 1) {
            setPreviewIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setPreviewIndex(prev => (prev + 1) % activeUrls.length);
        }, 3000); // 3s no editor para ser mais dinâmico

        return () => clearInterval(interval);
    }, [data.logoUrls, data.mediaType]);

    const resolveImage = (url: string | undefined) => {
        if (!url) { return ''; }
        if (url.startsWith('local_')) {
            return localPreviews[url] || '';
        }
        return url;
    };

    const handleInternalChange = (field: string, value: unknown) => {
        onChange({
            ...data,
            internalPage: { ...internal, [field]: value }
        });
    };

    const handleMediaSelect = async (file: File | null, type: 'image' | 'video', index?: number) => {
        if (!file) {
            if (type === 'video') {
                onChange({ ...data, videoUrl: '' });
            } else if (index !== undefined) {
                const newUrls = [...(data.logoUrls || [])];
                newUrls[index] = '';
                onChange({ ...data, logoUrls: newUrls });
            } else {
                onChange({ ...data, logoUrl: '' });
            }
            return;
        }

        try {
            const optimisticUrl = URL.createObjectURL(file);
            const localId = await storeLocalFile(file);
            setLocalPreviews(prev => ({ ...prev, [localId]: optimisticUrl }));

            if (type === 'video') {
                onChange({ ...data, videoUrl: localId, mediaType: 'video' });
            } else if (index !== undefined) {
                const newUrls = [...(data.logoUrls || [])];
                while (newUrls.length <= index) newUrls.push('');
                newUrls[index] = localId;

                const updates: Partial<Advertiser> = {
                    logoUrls: newUrls,
                    mediaType: 'image'
                };
                if (index === 0) updates.logoUrl = localId;

                onChange({ ...data, ...updates });
            } else {
                onChange({ ...data, logoUrl: localId, mediaType: 'image' });
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar mídia localmente.");
        }
    };



    const inputClass = `w-full rounded-xl px-3 py-2 text-xs font-bold outline-none border transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`;
    const textareaClass = `w-full rounded-xl px-4 py-3 text-sm outline-none border resize-none transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-red-500' : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 focus:border-red-500'}`;
    const previewContainerClass = `rounded-xl border flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Coluna Esquerda: Mídia */}
                <div className="space-y-6">
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-2 flex justify-between items-center ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-100'}`}>
                        Mídia da Oferta
                    </h3>

                    <div className="flex gap-2 mb-6 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl">
                        {[
                            { id: 'image', label: 'Imagens / GIF', icon: 'fa-images' },
                            { id: 'video', label: 'Vídeo (30s)', icon: 'fa-video' }
                        ].map(type => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => onChange({ ...data, mediaType: type.id as any })}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${(data.mediaType || 'image') === type.id
                                    ? 'bg-white dark:bg-zinc-800 text-red-600 shadow-sm border border-gray-100 dark:border-zinc-700'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <i className={`fas ${type.icon}`}></i>
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {(data.mediaType || 'image') === 'image' ? (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-3">Sequência de Imagens (Até 3)</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[0, 1, 2].map(idx => (
                                        <div key={idx} className="space-y-2">
                                            <div className="aspect-square relative group">
                                                <MediaUploader onMediaSelect={(file) => handleMediaSelect(file, 'image', idx)} />
                                                {((data.logoUrls && data.logoUrls[idx]) || (idx === 0 && data.logoUrl)) && (
                                                    <div className="absolute inset-2 pointer-events-none rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
                                                        <img
                                                            src={resolveImage(data.logoUrls?.[idx] || (idx === 0 ? data.logoUrl : ''))}
                                                            className="w-full h-full object-cover"
                                                            alt={`Preview ${idx + 1}`}
                                                        />
                                                    </div>
                                                )}
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white/20 z-10 shadow-lg">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Transição entre Imagens</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'none', label: 'Nenhum' },
                                        { id: 'fade', label: 'Fade' },
                                        { id: 'slide', label: 'Slide' },
                                        { id: 'zoom', label: 'Zoom' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => onChange({ ...data, transitionType: type.id as any })}
                                            className={`py-2 rounded-lg border text-[8px] font-black uppercase tracking-tight transition-all ${(data.transitionType || 'none') === type.id
                                                ? 'bg-red-600 border-red-600 text-white shadow-md'
                                                : darkMode ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-white border-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-3">Vídeo Publicitário (Máx 30 Segundos)</label>
                                <div className="aspect-video relative rounded-2xl overflow-hidden bg-black group border-2 border-dashed border-zinc-800">
                                    <MediaUploader onMediaSelect={(file) => handleMediaSelect(file, 'video')} />
                                    {data.videoUrl && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <video
                                                src={resolveImage(data.videoUrl)}
                                                className="w-full h-full object-cover opacity-60"
                                                autoPlay muted loop
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <i className="fas fa-play-circle text-white text-4xl opacity-50"></i>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[8px] text-gray-500 mt-3 font-bold uppercase italic leading-tight">
                                    * Formatos suportados: MP4, MOV. Máximo 15MB.
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Preview em Tempo Real */}
                    <div className="mt-12 pt-8 border-t border-dashed border-gray-200 dark:border-white/10">
                        <label className="block text-[9px] font-black text-red-600 uppercase mb-6 tracking-[0.2em] animate-pulse">
                            <i className="fas fa-eye mr-2"></i> Preview em Tempo Real (No Site)
                        </label>

                        <div className="flex justify-center">
                            <div className="w-full max-w-[280px]">
                                <div className={`relative group w-full ${darkMode ? 'bg-zinc-900/50' : 'bg-gray-50'} rounded-[2.2rem] border-2 border-transparent hover:border-red-600 transition-all overflow-hidden shadow-2xl flex flex-col`}>
                                    {/* Simulação do MediaBox do LeftAdsRail */}
                                    <div className="w-full aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden shrink-0">
                                        {(data.mediaType === 'video' && data.videoUrl) ? (
                                            <video src={resolveImage(data.videoUrl)} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                        ) : (
                                            (() => {
                                                const previewUrls = (data.logoUrls?.filter(u => !!u) || []).length > 0
                                                    ? data.logoUrls?.filter(u => !!u)
                                                    : [data.logoUrl || ''];

                                                return previewUrls?.map((url, idx) => {
                                                    const isActive = previewIndex === idx;

                                                    // Mapeamento de classes de animação (mirror do LeftAdsRail)
                                                    let activeClasses = "opacity-100 scale-100 translate-x-0";
                                                    let inactiveClasses = "opacity-0";

                                                    if (data.transitionType === 'slide') {
                                                        inactiveClasses = "opacity-0 translate-x-full";
                                                    } else if (data.transitionType === 'zoom') {
                                                        inactiveClasses = "opacity-0 scale-125";
                                                    } else { // fade (default)
                                                        inactiveClasses = "opacity-0";
                                                    }

                                                    return (
                                                        <img
                                                            key={idx}
                                                            src={resolveImage(url as string)}
                                                            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${isActive ? activeClasses : inactiveClasses
                                                                }`}
                                                            alt="Preview"
                                                        />
                                                    );
                                                });
                                            })()
                                        )}
                                        {!data.logoUrl && !data.videoUrl && !(data.logoUrls?.some(u => !!u)) && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <i className="fas fa-store text-zinc-400 text-3xl opacity-20"></i>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center p-4 gap-0.5 w-full">
                                        <h4 className={`text-[11px] font-[1000] uppercase tracking-tight leading-tight text-center w-full truncate px-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {data.name || 'Nome do Anunciante'}
                                        </h4>
                                        <div className="flex items-center gap-2 justify-center mt-0.5">
                                            <span className="text-[8px] font-black text-red-600 uppercase tracking-widest leading-none">
                                                {data.category || 'Categoria'}
                                            </span>
                                            {/* Mini Icons Preview */}
                                            <div className="flex items-center gap-1 opacity-80">
                                                {internal.whatsapp && <i className="fab fa-whatsapp text-[8px] text-green-500"></i>}
                                                {internal.instagram && <i className="fab fa-instagram text-[8px] text-pink-500"></i>}
                                                {internal.tiktok && <i className="fab fa-tiktok text-[8px] text-black dark:text-white"></i>}
                                                {internal.kwai && <i className="fas fa-video text-[8px] text-orange-500"></i>}
                                                {internal.telegram && <i className="fab fa-telegram text-[8px] text-blue-400"></i>}
                                                {data.externalUrl && <i className="fas fa-globe text-[8px] text-blue-400"></i>}
                                            </div>
                                        </div>

                                        {data.internalPage?.description && (
                                            <div className={`mt-2 pt-2 border-t w-full ${darkMode ? 'border-white/5' : 'border-gray-200/50'}`}>
                                                <p className="text-[9px] font-bold text-gray-400 italic line-clamp-2 leading-tight text-center">
                                                    "{data.internalPage.description}"
                                                </p>
                                            </div>
                                        )}

                                        {/* Preview do Botão de Ação */}
                                        <div className="mt-4 w-full px-2">
                                            {data.redirectType === 'whatsapp' ? (
                                                <div className="w-full py-2 bg-green-500 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/10">
                                                    <i className="fab fa-whatsapp text-xs"></i>
                                                    <span className="text-[9px] font-[1000] uppercase tracking-wider">WhatsApp</span>
                                                </div>
                                            ) : data.redirectType === 'instagram' ? (
                                                <div className="w-full py-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/10">
                                                    <i className="fab fa-instagram text-xs"></i>
                                                    <span className="text-[9px] font-[1000] uppercase tracking-wider">Instagram</span>
                                                </div>
                                            ) : data.redirectType === 'tiktok' ? (
                                                <div className="w-full py-2 bg-black text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 dark:border dark:border-white/20">
                                                    <i className="fab fa-tiktok text-xs"></i>
                                                    <span className="text-[9px] font-[1000] uppercase tracking-wider">TikTok</span>
                                                </div>
                                            ) : data.redirectType === 'kwai' ? (
                                                <div className="w-full py-2 bg-orange-500 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
                                                    <i className="fas fa-video text-xs"></i>
                                                    <span className="text-[9px] font-[1000] uppercase tracking-wider">Kwai</span>
                                                </div>
                                            ) : data.redirectType === 'telegram' ? (
                                                <div className="w-full py-2 bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                                    <i className="fab fa-telegram text-xs"></i>
                                                    <span className="text-[9px] font-[1000] uppercase tracking-wider">Telegram</span>
                                                </div>
                                            ) : (
                                                <div className="w-full py-2 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/10">
                                                    <i className="fas fa-external-link-alt text-[9px]"></i>
                                                    <span className="text-[9px] font-[1000] uppercase tracking-wider">Ver Site</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-red-600 h-1 w-full mt-auto"></div>
                                </div>
                            </div>
                        </div>
                        <p className="text-[8px] text-gray-500 mt-4 text-center font-bold uppercase italic leading-tight">
                            * Assim é como o bloco aparecerá nas barras laterais do portal.
                        </p>
                    </div>
                </div>

                {/* Coluna Direita: Conteúdo */}
                <div className="space-y-6">
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 border-b pb-2 ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-100'}`}>Página Interna</h3>

                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Descrição / Sobre</label>
                        <textarea
                            rows={5}
                            value={internal.description}
                            onChange={e => handleInternalChange('description', e.target.value)}
                            className={textareaClass}
                            placeholder="Conte a história da empresa, diferenciais, etc..."
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2"><i className="fab fa-whatsapp text-green-500 mr-1"></i> WhatsApp</label>
                            <input
                                type="text"
                                value={internal.whatsapp || ''}
                                onChange={e => handleInternalChange('whatsapp', e.target.value)}
                                placeholder="(34) 99999-9999"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2"><i className="fab fa-instagram text-pink-500 mr-1"></i> Instagram</label>
                            <input
                                type="text"
                                value={internal.instagram || ''}
                                onChange={e => handleInternalChange('instagram', e.target.value)}
                                placeholder="@usuario"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2"><i className="fab fa-tiktok text-black dark:text-white mr-1"></i> TikTok</label>
                            <input
                                type="text"
                                value={internal.tiktok || ''}
                                onChange={e => handleInternalChange('tiktok', e.target.value)}
                                placeholder="@usuario"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2"><i className="fas fa-video text-orange-500 mr-1"></i> Kwai</label>
                            <input
                                type="text"
                                value={internal.kwai || ''}
                                onChange={e => handleInternalChange('kwai', e.target.value)}
                                placeholder="@usuario"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2"><i className="fab fa-telegram text-blue-400 mr-1"></i> Telegram</label>
                            <input
                                type="text"
                                value={internal.telegram || ''}
                                onChange={e => handleInternalChange('telegram', e.target.value)}
                                placeholder="@usuario"
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2"><i className="fas fa-map-marker-alt text-red-500 mr-1"></i> Endereço Completo</label>
                        <input
                            type="text"
                            value={internal.location || ''}
                            onChange={e => handleInternalChange('location', e.target.value)}
                            className={inputClass}
                            placeholder="Rua, Número, Bairro - Cidade"
                        />
                    </div>

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
                                    onClick={() => onChange({ ...data, redirectType: type.id as any })}
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



                        <div className={`pt-6 mt-6 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Locais de Exibição</label>
                            <div className="space-y-3">
                                {[
                                    { id: 'home_top', label: 'Topo da Home (Carrossel Parceiros)', icon: 'fa-home' },
                                    { id: 'article_sidebar', label: 'Barra Lateral dos Artigos', icon: 'fa-columns' },
                                    { id: 'article_footer', label: 'Rodapé dos Artigos', icon: 'fa-shoe-prints' }
                                ].map(loc => {
                                    const isChecked = (data.displayLocations || ['home_top', 'article_sidebar', 'article_footer']).includes(loc.id);
                                    return (
                                        <label key={loc.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked
                                            ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
                                            : darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}>
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked
                                                ? 'bg-red-600 border-red-600 text-white'
                                                : 'border-gray-300 dark:border-zinc-600'
                                                }`}>
                                                {isChecked && <i className="fas fa-check text-[10px]"></i>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isChecked}
                                                onChange={() => {
                                                    const current = data.displayLocations || ['home_top', 'article_sidebar', 'article_footer'];
                                                    const newLocs = isChecked
                                                        ? current.filter(l => l !== loc.id)
                                                        : [...current, loc.id];
                                                    onChange({ ...data, displayLocations: newLocs });
                                                }}
                                            />
                                            <i className={`fas ${loc.icon} ${isChecked ? 'text-red-600' : 'text-gray-400'} text-xs w-4 text-center`}></i>
                                            <span className={`text-[10px] font-bold uppercase tracking-wide ${isChecked ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                                                {loc.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>


                    </div>
                </div>
            </div>


        </div>
    );
};

export default ShowcaseSection;
