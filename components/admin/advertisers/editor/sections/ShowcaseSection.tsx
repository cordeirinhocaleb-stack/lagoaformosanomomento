
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

    // Load previews for existing local_ IDs on mount or data change
    useEffect(() => {
        const loadPreviews = async () => {
            const idsToLoad = [data.logoUrl, data.bannerUrl].filter(url => url && url.startsWith('local_') && !localPreviews[url]);
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
    }, [data.logoUrl, data.bannerUrl]);

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

    const handleLogoSelect = async (file: File | null, preview: string) => {
        if (file) {
            try {
                // Optimistic preview
                const optimisticUrl = URL.createObjectURL(file);
                // Temp placeholder flow is slightly tricky with purely local ID, 
                // but we can set localPreviews with optimistic URL mapped to the ID we are about to get?
                // Actually, storeLocalFile returns ID.

                const localId = await storeLocalFile(file);
                setLocalPreviews(prev => ({ ...prev, [localId]: optimisticUrl }));
                onChange({ ...data, logoUrl: localId });
            } catch (e) {
                console.error(e);
                alert("Erro ao salvar logotipo localmente.");
            }
        } else {
            onChange({ ...data, logoUrl: '' });
        }
    };

    const handleBannerSelect = async (file: File | null, preview: string) => {
        if (file) {
            try {
                const optimisticUrl = URL.createObjectURL(file);
                const localId = await storeLocalFile(file);
                setLocalPreviews(prev => ({ ...prev, [localId]: optimisticUrl }));
                onChange({ ...data, bannerUrl: localId });
            } catch (e) {
                console.error(e);
                alert("Erro ao salvar banner localmente.");
            }
        } else {
            onChange({ ...data, bannerUrl: '' });
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
                        Identidade Visual
                    </h3>

                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Logo (Quadrado)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 shrink-0">
                                <MediaUploader onMediaSelect={handleLogoSelect} />
                            </div>
                            {data.logoUrl && (
                                <div className={`w-20 h-20 p-2 ${previewContainerClass}`}>
                                    <img src={resolveImage(data.logoUrl)} className="w-full h-full object-contain" alt="Logo Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Banner de Capa (Horizontal)</label>
                        <div className="h-40 w-full">
                            <MediaUploader onMediaSelect={handleBannerSelect} />
                        </div>
                        {data.bannerUrl && (
                            <div className={`mt-2 h-20 w-full ${previewContainerClass}`}>
                                <img src={resolveImage(data.bannerUrl)} className="w-full h-full object-cover" alt="Banner Preview" />
                            </div>
                        )}
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

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className={`pt-4 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.redirectType === 'external'}
                                onChange={e => onChange({ ...data, redirectType: e.target.checked ? 'external' : 'internal' })}
                                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                            />
                            <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Redirecionar direto para site externo? (Ignora página interna)</span>
                        </label>
                        {data.redirectType === 'external' && (
                            <input
                                type="text"
                                value={data.externalUrl || ''}
                                onChange={e => onChange({ ...data, externalUrl: e.target.value })}
                                placeholder="https://meusite.com.br"
                                className={`mt-2 w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none ${darkMode ? 'bg-blue-900/20 border-blue-500/30 text-blue-300 placeholder-blue-700' : 'bg-blue-50 border-blue-200 text-blue-800'}`}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseSection;
