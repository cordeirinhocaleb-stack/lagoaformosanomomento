
import React, { useState, useEffect } from 'react';
import { PromoBanner } from '@/types';
import MediaUploader from '@/components/media/MediaUploader';
import { storeLocalFile, getLocalFile } from '@/services/storage/localStorageService';

interface BannerMediaTabProps {
    banner: PromoBanner;
    onUpdate: (updates: Partial<PromoBanner>) => void;
    darkMode?: boolean;
}

export const BannerMediaTab: React.FC<BannerMediaTabProps> = ({ banner, onUpdate, darkMode = false }) => {
    const [localPreviews, setLocalPreviews] = useState<Record<string, string>>({});

    // Load previews for local files
    useEffect(() => {
        const loadPreviews = async () => {
            const idsToLoad = [...(banner.images || []), banner.videoUrl].filter(url => url && url.startsWith('local_') && !localPreviews[url]);
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
                    // ignore missing
                }
            }));
            setLocalPreviews(newPreviews);
        };
        loadPreviews();
    }, [banner.images, banner.videoUrl]);

    const resolveUrl = (url: string | undefined) => {
        if (!url) { return ''; }
        if (url.startsWith('local_')) {
            return localPreviews[url] || '';
        }
        return url;
    };

    const handleAddImage = async (file: File | null, preview: string) => {
        if (!file) { return; }
        try {
            const optimisticUrl = URL.createObjectURL(file);
            const localId = await storeLocalFile(file);
            setLocalPreviews(prev => ({ ...prev, [localId]: optimisticUrl }));

            const currentImages = banner.images || [];
            if (currentImages.length >= 5) {
                alert("Máximo de 5 imagens permitido.");
            } else {
                onUpdate({ images: [...currentImages, localId], type: 'image' });
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar imagem localmente.");
        }
    };

    const handleVideoSelect = async (file: File | null, preview: string) => {
        if (!file) { return; }
        try {
            const optimisticUrl = URL.createObjectURL(file);
            const localId = await storeLocalFile(file);
            setLocalPreviews(prev => ({ ...prev, [localId]: optimisticUrl }));
            onUpdate({ videoUrl: localId, type: 'video' });
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar vídeo localmente.");
        }
    };

    const removeImage = (index: number) => {
        const currentImages = [...(banner.images || [])];
        currentImages.splice(index, 1);
        onUpdate({ images: currentImages });
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => onUpdate({ type: 'image' })}
                    className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${banner.type === 'image'
                            ? (darkMode ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-red-600 bg-red-50 text-red-600')
                            : (darkMode ? 'border-white/10 text-gray-400 hover:text-white' : 'border-gray-100 text-gray-400')}`}
                >
                    <i className="fas fa-images"></i> Imagens
                </button>
                <button
                    onClick={() => onUpdate({ type: 'video' })}
                    className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${banner.type === 'video'
                            ? (darkMode ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-red-600 bg-red-50 text-red-600')
                            : (darkMode ? 'border-white/10 text-gray-400 hover:text-white' : 'border-gray-100 text-gray-400')}`}
                >
                    <i className="fas fa-video"></i> Vídeo (Mudo)
                </button>
            </div>

            {banner.type === 'image' ? (
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <div>
                            <h4 className={`text-[10px] font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>Galeria (Slideshow)</h4>
                            <p className="text-[9px] text-gray-500">Até 5 imagens rotativas.</p>
                        </div>
                        <div className="w-32 h-8 relative">
                            <div className="absolute inset-0 opacity-0 z-10">
                                <MediaUploader onMediaSelect={handleAddImage} />
                            </div>
                            <button className={`w-full h-full rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                <i className="fas fa-upload"></i> Adicionar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {banner.images && banner.images.length > 0 ? (
                            banner.images.map((img, i) => (
                                <div key={i} className={`relative aspect-video rounded-xl overflow-hidden group border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                                    <img src={resolveUrl(img)} className="w-full h-full object-cover" />
                                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fas fa-trash text-[10px]"></i>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className={`col-span-3 text-center py-4 text-xs border-2 border-dashed rounded-xl ${darkMode ? 'text-gray-500 border-white/10' : 'text-gray-400 border-gray-200'}`}>Nenhuma imagem</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <h4 className={`text-[10px] font-black uppercase mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Arquivo de Vídeo</h4>
                        <div className={`h-40 relative border-2 border-dashed rounded-xl overflow-hidden group ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                            {banner.videoUrl ? (
                                <video src={resolveUrl(banner.videoUrl)} className="w-full h-full object-cover" muted autoPlay loop />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <i className="fas fa-cloud-upload-alt text-2xl mb-2"></i>
                                    <span className="text-[9px] font-bold uppercase">Clique para enviar MP4</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-40">
                                    <MediaUploader onMediaSelect={handleVideoSelect} />
                                </div>
                            </div>
                        </div>
                        <p className="text-[8px] text-gray-400 mt-2">* O vídeo será reproduzido automaticamente sem som.</p>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Opacidade do Overlay ({banner.overlayOpacity || 50}%)</label>
                <input
                    type="range"
                    min="0" max="90" step="10"
                    value={banner.overlayOpacity || 50}
                    onChange={e => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
                    className={`w-full accent-black h-2 rounded-lg appearance-none cursor-pointer ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}
                />
            </div>
        </div>
    );
};
