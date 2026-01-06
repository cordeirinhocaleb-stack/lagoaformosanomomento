
import React, { useState } from 'react';
import { PopupMediaConfig, PopupImagePresentation, PopupVideoSettings, PopupImageStyle } from '../../../../types';
import MediaUploader from '../../../media/MediaUploader';

interface PopupMediaPanelProps {
    media: PopupMediaConfig;
    onChange: (media: Partial<PopupMediaConfig>) => void;
}

type MediaSubTab = 'source' | 'layout' | 'style' | 'filters';

const PopupMediaPanel: React.FC<PopupMediaPanelProps> = ({ media, onChange }) => {
    const [activeSubTab, setActiveSubTab] = useState<MediaSubTab>('source');
    
    // Determine active media type
    const hasVideo = !!media.videoUrl;
    const hasImages = media.images && media.images.length > 0;
    const mediaType = hasVideo ? 'video' : 'image';

    const handleMediaAdd = (_file: File | null, preview: string, type: 'image' | 'video') => {
        if (type === 'video') {
            // Se for vídeo, limpa imagens e seta o vídeo (Apenas 1 vídeo permitido)
            onChange({ videoUrl: preview, images: [] });
        } else {
            // Se for imagem, limpa vídeo e adiciona imagem (Máximo 3)
            const currentImages = media.images || [];
            if (currentImages.length >= 3) {
                alert("Máximo de 3 imagens atingido. Remova uma para adicionar outra.");
                return;
            }
            const newImages = [...currentImages, preview];
            onChange({ images: newImages, videoUrl: '' });
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...(media.images || [])];
        newImages.splice(index, 1);
        onChange({ images: newImages });
    };

    const updateImageStyle = (updates: Partial<PopupImageStyle>) => {
        onChange({ imageStyle: { ...(media.imageStyle || {}), ...updates } as PopupImageStyle });
    };

    const updateVideoSettings = (updates: Partial<PopupVideoSettings>) => {
        onChange({ videoSettings: { ...(media.videoSettings || {}), ...updates } as PopupVideoSettings });
    };

    // Helper Components for Reusable Controls
    const FilterSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
        <div className="grid grid-cols-4 gap-2">
            {['none', 'grayscale', 'sepia', 'saturate', 'contrast', 'brightness', 'blur', 'vintage'].map(f => (
                <button
                    key={f}
                    onClick={() => onChange(f)}
                    className={`px-2 py-2 rounded-lg border text-[9px] font-bold uppercase transition-all ${value === f ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    {f}
                </button>
            ))}
        </div>
    );

    const OverlaySelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
        <select 
            value={value} 
            onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none"
        >
            <option value="none">Nenhum</option>
            <option value="dark_soft">Escuro Suave</option>
            <option value="dark_strong">Escuro Forte</option>
            <option value="bottom_gradient">Gradiente Base</option>
            <option value="top_gradient">Gradiente Topo</option>
            <option value="vignette_soft">Vinheta Suave</option>
            <option value="glass_blur_soft">Vidro (Blur)</option>
        </select>
    );

    return (
        <div className="space-y-6">
            {/* SUB-TABS */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                {['source', 'layout', 'style', 'filters'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab as MediaSubTab)}
                        className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === tab ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab === 'source' ? 'Fonte' : tab === 'layout' ? (mediaType === 'video' ? 'Playback' : 'Layout') : tab === 'style' ? 'Visual' : 'Efeitos'}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: SOURCE */}
            {activeSubTab === 'source' && (
                <div className="space-y-6 animate-fadeIn">
                    <MediaUploader onMediaSelect={handleMediaAdd} />
                    
                    {hasVideo ? (
                        <div className="bg-black rounded-xl overflow-hidden relative group aspect-video border border-gray-200">
                            <iframe 
                                src={media.videoUrl?.replace('watch?v=', 'embed/')} 
                                className="w-full h-full pointer-events-none opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onChange({ videoUrl: '' })}
                                    className="bg-red-600 text-white px-4 py-2 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <i className="fas fa-trash"></i> Remover Vídeo
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase shadow-sm">Vídeo Ativo</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex gap-3 overflow-x-auto pb-2 items-center">
                                {media.images?.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 group border-2 border-gray-100 hover:border-red-500 transition-colors bg-gray-50 shadow-sm">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                onClick={() => removeImage(idx)}
                                                className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                                                title="Remover Imagem"
                                            >
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-black text-center py-0.5 backdrop-blur-sm">
                                            IMG {idx + 1}
                                        </div>
                                    </div>
                                ))}
                                {(!media.images || media.images.length < 3) && (
                                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                                        <i className="fas fa-image text-xl mb-1"></i>
                                        <span className="text-[8px] font-bold uppercase">Vazio</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[9px] text-gray-400 text-center font-medium bg-yellow-50 text-yellow-700 py-2 rounded-lg border border-yellow-100">
                                <i className="fas fa-info-circle mr-1"></i>
                                Máximo 3 imagens (Galeria) OU 1 Vídeo. Adicionar um tipo remove o outro.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: LAYOUT / PLAYBACK */}
            {activeSubTab === 'layout' && (
                <div className="space-y-6 animate-fadeIn">
                    {mediaType === 'video' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Som</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg">
                                    <button onClick={() => updateVideoSettings({ muted: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${media.videoSettings.muted ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Mudo</button>
                                    <button onClick={() => updateVideoSettings({ muted: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!media.videoSettings.muted ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Som</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Loop</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg">
                                    <button onClick={() => updateVideoSettings({ loop: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${media.videoSettings.loop ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Sim</button>
                                    <button onClick={() => updateVideoSettings({ loop: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!media.videoSettings.loop ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Não</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Ajuste (Fit)</label>
                                <select 
                                    value={media.videoSettings.fit} 
                                    onChange={e => updateVideoSettings({ fit: e.target.value as any })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none"
                                >
                                    <option value="cover">Preencher (Cover)</option>
                                    <option value="contain">Ajustar (Contain)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Zoom Motion</label>
                                <select 
                                    value={media.videoSettings.zoomMotion} 
                                    onChange={e => updateVideoSettings({ zoomMotion: e.target.value as any })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none"
                                >
                                    <option value="off">Fixo</option>
                                    <option value="soft">Suave (Ken Burns)</option>
                                    <option value="strong">Forte</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Apresentação</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['hero_single', 'split_2col', 'collage_3', 'stack_cards', 'mini_slider'].map(layout => (
                                        <button
                                            key={layout}
                                            onClick={() => onChange({ imagePresentation: layout as PopupImagePresentation })}
                                            className={`px-3 py-2 rounded-lg border text-[9px] font-bold uppercase transition-all ${
                                                media.imagePresentation === layout 
                                                    ? 'bg-black text-white border-black' 
                                                    : 'bg-white text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {layout.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Ajuste (Fit)</label>
                                    <select 
                                        value={media.imageStyle.fit} 
                                        onChange={e => updateImageStyle({ fit: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none"
                                    >
                                        <option value="cover">Preencher</option>
                                        <option value="contain">Ajustar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Foco</label>
                                    <select 
                                        value={media.imageStyle.focusPoint} 
                                        onChange={e => updateImageStyle({ focusPoint: e.target.value as any })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none"
                                    >
                                        <option value="center">Centro</option>
                                        <option value="top">Topo</option>
                                        <option value="bottom">Base</option>
                                        <option value="left">Esquerda</option>
                                        <option value="right">Direita</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: STYLE (Visual) */}
            {activeSubTab === 'style' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Arredondamento</label>
                            <div className="flex bg-gray-50 p-1 rounded-lg">
                                {['none', 'soft', 'strong'].map(r => (
                                    <button 
                                        key={r}
                                        onClick={() => mediaType === 'video' ? updateVideoSettings({ borderRadius: r as any }) : updateImageStyle({ borderRadius: r as any })}
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${
                                            (mediaType === 'video' ? media.videoSettings.borderRadius : media.imageStyle.borderRadius) === r ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Sombra</label>
                            <div className="flex bg-gray-50 p-1 rounded-lg">
                                {['none', 'soft', 'strong'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => mediaType === 'video' ? updateVideoSettings({ shadow: s as any }) : updateImageStyle({ shadow: s as any })}
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${
                                            (mediaType === 'video' ? media.videoSettings.shadow : media.imageStyle.shadow) === s ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Overlay (Sobreposição)</label>
                        <OverlaySelector 
                            value={mediaType === 'video' ? media.videoSettings.overlayPreset : media.imageStyle.overlayPreset}
                            onChange={v => mediaType === 'video' ? updateVideoSettings({ overlayPreset: v as any }) : updateImageStyle({ overlayPreset: v as any })}
                        />
                    </div>

                    {mediaType === 'video' && (
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Frame Preset</label>
                            <select 
                                value={media.videoSettings.framePreset} 
                                onChange={e => updateVideoSettings({ framePreset: e.target.value as any })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none"
                            >
                                <option value="clean_border">Borda Limpa</option>
                                <option value="glass_card">Glass Card</option>
                                <option value="editorial_frame">Editorial</option>
                                <option value="rounded_modern">Super Redondo</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: FILTERS */}
            {activeSubTab === 'filters' && (
                <div className="space-y-6 animate-fadeIn">
                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Tipo de Filtro</label>
                        <FilterSelector 
                            value={mediaType === 'video' ? media.videoSettings.filterId : media.imageStyle.filterId}
                            onChange={v => mediaType === 'video' ? updateVideoSettings({ filterId: v as any }) : updateImageStyle({ filterId: v as any })}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Intensidade</label>
                        <div className="flex bg-gray-50 p-1 rounded-lg">
                            {['soft', 'strong'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => mediaType === 'video' ? updateVideoSettings({ filterVariant: v as any }) : updateImageStyle({ filterVariant: v as any })}
                                    className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${
                                        (mediaType === 'video' ? media.videoSettings.filterVariant : media.imageStyle.filterVariant) === v ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                                    }`}
                                >
                                    {v === 'soft' ? 'Suave' : 'Forte'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!hasVideo && (
                        <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Opacidade do Overlay ({media.imageStyle.overlayIntensity || 0}%)</label>
                            <input 
                                type="range" 
                                min="0" max="100" 
                                value={media.imageStyle.overlayIntensity || 0}
                                onChange={e => updateImageStyle({ overlayIntensity: parseInt(e.target.value) })}
                                className="w-full accent-black"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PopupMediaPanel;
