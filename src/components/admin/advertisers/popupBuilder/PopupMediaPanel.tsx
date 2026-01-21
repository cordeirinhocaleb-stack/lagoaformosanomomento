
import React, { useState } from 'react';
import { PopupMediaConfig, PopupImagePresentation, PopupVideoSettings, PopupImageStyle } from '../../../../types';
import MediaUploader from '../../../media/MediaUploader';

interface PopupMediaPanelProps {
    media: PopupMediaConfig;
    onChange: (media: Partial<PopupMediaConfig>) => void;
    darkMode?: boolean;
}

type MediaSubTab = 'source' | 'layout' | 'style' | 'filters';

const FilterSelector = ({ value, onChange, darkMode }: { value: string, onChange: (v: string) => void, darkMode: boolean }) => {
    const buttonClass = (isActive: boolean) => `px-2 py-2 rounded-lg border text-[9px] font-bold uppercase transition-all ${isActive ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black') : (darkMode ? 'bg-black/20 text-gray-400 border-white/5 hover:bg-white/5' : 'bg-white text-gray-500 hover:bg-gray-50')}`;

    return (
        <div className="grid grid-cols-4 gap-2">
            {['none', 'grayscale', 'sepia', 'saturate', 'contrast', 'brightness', 'blur', 'vintage'].map(f => (
                <button
                    key={f}
                    onClick={() => onChange(f)}
                    className={buttonClass(value === f)}
                >
                    {f}
                </button>
            ))}
        </div>
    );
};

const OverlaySelector = ({ value, onChange, darkMode }: { value: string, onChange: (v: string) => void, darkMode: boolean }) => {
    const selectClass = `w-full border rounded-lg p-2 text-[10px] font-bold uppercase outline-none ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`;

    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={selectClass}
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
};

const PopupMediaPanel: React.FC<PopupMediaPanelProps> = ({ media, onChange, darkMode = false }) => {
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

    const tabClass = (isActive: boolean) => `flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${isActive ? (darkMode ? 'bg-white shadow-sm text-black' : 'bg-white shadow-sm text-black') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`;
    // Helper Components for Reusable Controls
    const selectClass = `w-full border rounded-lg p-2 text-[10px] font-bold uppercase outline-none ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`;
    const labelClass = `block text-[9px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`;

    return (
        <div className="space-y-6">
            {/* SUB-TABS */}
            <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                {['source', 'layout', 'style', 'filters'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab as MediaSubTab)}
                        className={tabClass(activeSubTab === tab)}
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
                        <div className={`rounded-xl overflow-hidden relative group aspect-video border ${darkMode ? 'bg-black border-white/10' : 'bg-black border-gray-200'}`}>
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
                                    <div className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center ${darkMode ? 'border-white/10 bg-white/5 text-gray-500' : 'border-gray-200 bg-gray-50/50 text-gray-300'}`}>
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
                                <label className={labelClass}>Som</label>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <button onClick={() => updateVideoSettings({ muted: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${media.videoSettings.muted ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Mudo</button>
                                    <button onClick={() => updateVideoSettings({ muted: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!media.videoSettings.muted ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Som</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Loop</label>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <button onClick={() => updateVideoSettings({ loop: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${media.videoSettings.loop ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Sim</button>
                                    <button onClick={() => updateVideoSettings({ loop: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!media.videoSettings.loop ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Não</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Ajuste (Fit)</label>
                                <select
                                    value={media.videoSettings.fit}
                                    onChange={e => updateVideoSettings({ fit: e.target.value as PopupVideoSettings['fit'] })}
                                    className={selectClass}
                                >
                                    <option value="cover">Preencher (Cover)</option>
                                    <option value="contain">Ajustar (Contain)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Zoom Motion</label>
                                <select
                                    value={media.videoSettings.zoomMotion}
                                    onChange={e => updateVideoSettings({ zoomMotion: e.target.value as PopupVideoSettings['zoomMotion'] })}
                                    className={selectClass}
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
                                <label className={labelClass}>Apresentação</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['hero_single', 'split_2col', 'collage_3', 'stack_cards', 'mini_slider'].map(layout => (
                                        <button
                                            key={layout}
                                            onClick={() => onChange({ imagePresentation: layout as PopupImagePresentation })}
                                            className={`px-3 py-2 rounded-lg border text-[9px] font-bold uppercase transition-all ${media.imagePresentation === layout
                                                ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                                                : (darkMode ? 'bg-black/20 text-gray-400 border-white/5 hover:bg-white/5' : 'bg-white text-gray-500 hover:bg-gray-50')
                                                }`}
                                        >
                                            {layout.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Ajuste (Fit)</label>
                                    <select
                                        value={media.imageStyle.fit}
                                        onChange={e => updateImageStyle({ fit: e.target.value as PopupImageStyle['fit'] })}
                                        className={selectClass}
                                    >
                                        <option value="cover">Preencher</option>
                                        <option value="contain">Ajustar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Foco</label>
                                    <select
                                        value={media.imageStyle.focusPoint}
                                        onChange={e => updateImageStyle({ focusPoint: e.target.value as PopupImageStyle['focusPoint'] })}
                                        className={selectClass}
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
                            <label className={labelClass}>Arredondamento</label>
                            <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                {['none', 'soft', 'strong'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => mediaType === 'video' ? updateVideoSettings({ borderRadius: r as PopupVideoSettings['borderRadius'] }) : updateImageStyle({ borderRadius: r as PopupImageStyle['borderRadius'] })}
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${(mediaType === 'video' ? media.videoSettings.borderRadius : media.imageStyle.borderRadius) === r ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Sombra</label>
                            <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                {['none', 'soft', 'strong'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => mediaType === 'video' ? updateVideoSettings({ shadow: s as PopupVideoSettings['shadow'] }) : updateImageStyle({ shadow: s as PopupImageStyle['shadow'] })}
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${(mediaType === 'video' ? media.videoSettings.shadow : media.imageStyle.shadow) === s ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Overlay (Sobreposição)</label>
                        <OverlaySelector
                            value={mediaType === 'video' ? media.videoSettings.overlayPreset : media.imageStyle.overlayPreset}
                            onChange={v => mediaType === 'video' ? updateVideoSettings({ overlayPreset: v as PopupVideoSettings['overlayPreset'] }) : updateImageStyle({ overlayPreset: v as PopupImageStyle['overlayPreset'] })}
                            darkMode={darkMode}
                        />
                    </div>

                    {mediaType === 'video' && (
                        <div>
                            <label className={labelClass}>Frame Preset</label>
                            <select
                                value={media.videoSettings.framePreset}
                                onChange={e => updateVideoSettings({ framePreset: e.target.value as PopupVideoSettings['framePreset'] })}
                                className={selectClass}
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
                        <label className={labelClass}>Tipo de Filtro</label>
                        <FilterSelector
                            value={mediaType === 'video' ? media.videoSettings.filterId : media.imageStyle.filterId}
                            onChange={v => mediaType === 'video' ? updateVideoSettings({ filterId: v as PopupVideoSettings['filterId'] }) : updateImageStyle({ filterId: v as PopupImageStyle['filterId'] })}
                            darkMode={darkMode}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Intensidade</label>
                        <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            {['soft', 'strong'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => mediaType === 'video' ? updateVideoSettings({ filterVariant: v as PopupVideoSettings['filterVariant'] }) : updateImageStyle({ filterVariant: v as PopupImageStyle['filterVariant'] })}
                                    className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${(mediaType === 'video' ? media.videoSettings.filterVariant : media.imageStyle.filterVariant) === v ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
                                        }`}
                                >
                                    {v === 'soft' ? 'Suave' : 'Forte'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!hasVideo && (
                        <div>
                            <label className={labelClass}>Opacidade do Overlay ({media.imageStyle.overlayIntensity || 0}%)</label>
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
