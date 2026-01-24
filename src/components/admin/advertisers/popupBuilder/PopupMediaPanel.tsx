import React, { useState } from 'react';
import { PopupMediaConfig, PopupImagePresentation, PopupVideoSettings, PopupImageStyle } from '@/types/ads';
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
            value={value || 'none'}
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

    // Safe accessors with defaults
    const imageStyle = media.imageStyle || {
        fit: 'cover',
        focusPoint: 'center',
        borderRadius: 'none',
        borderStyle: 'none',
        shadow: 'none',
        overlayPreset: 'none',
        overlayIntensity: 0,
        filterId: 'none',
        filterVariant: 'soft'
    };

    const videoSettings = media.videoSettings || {
        muted: true,
        loop: true,
        autoplay: true,
        fit: 'cover',
        zoomMotion: 'off',
        borderRadius: 'none',
        borderStyle: 'none',
        shadow: 'none',
        overlayPreset: 'none',
        filterId: 'none',
        filterVariant: 'soft',
        framePreset: 'clean_border'
    };

    // Determine active media type
    const hasVideo = !!media.videoUrl;
    const mediaType = hasVideo ? 'video' : 'image';

    const handleMediaAdd = (_file: File | null, preview: string, type: 'image' | 'video') => {
        if (type === 'video') {
            onChange({ videoUrl: preview, images: [] });
        } else {
            onChange({ images: [preview], videoUrl: '' });
        }
    };

    const updateImageStyle = (updates: Partial<PopupImageStyle>) => {
        onChange({ imageStyle: { ...imageStyle, ...updates } });
    };

    const updateVideoSettings = (updates: Partial<PopupVideoSettings>) => {
        onChange({ videoSettings: { ...videoSettings, ...updates } });
    };

    const labelClass = `block text-[9px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`;
    const headerTabClass = (tab: MediaSubTab) => `px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? (darkMode ? 'bg-white/10 text-white' : 'bg-white text-black shadow-sm') : (darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-600')}`;
    const selectClass = `w-full border rounded-lg p-2 text-[10px] font-bold uppercase outline-none ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-white border-gray-200 text-black focus:border-black'}`;

    return (
        <div className="space-y-6">
            {/* SUB-TABS INTERNAS */}
            <div className={`p-1 rounded-xl flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide ${darkMode ? 'bg-white/5' : 'bg-gray-100/50'}`}>
                <div className="flex gap-1">
                    {(['source', 'layout', 'style', 'filters'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveSubTab(tab)}
                            className={headerTabClass(tab)}
                        >
                            {tab === 'source' ? 'Arquivo' : tab === 'layout' ? 'Layout' : tab === 'style' ? 'Aparência' : 'Filtros'}
                        </button>
                    ))}
                </div>
            </div>

            {/* TAB CONTENT: SOURCE (Upload) */}
            {activeSubTab === 'source' && (
                <div className="space-y-6 animate-fadeIn">
                    <MediaUploader
                        onMediaSelect={handleMediaAdd}
                        compact={false}
                    />

                    {/* Quick Config based on type */}
                    {hasVideo && (
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <label className={labelClass}>Configuração do Vídeo</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={videoSettings.autoplay || false}
                                        onChange={e => updateVideoSettings({ autoplay: e.target.checked })}
                                        className="w-4 h-4 accent-black"
                                    />
                                    <span className="text-[10px] font-bold uppercase text-gray-500">Auto Play</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={videoSettings.muted || false}
                                        onChange={e => updateVideoSettings({ muted: e.target.checked })}
                                        className="w-4 h-4 accent-black"
                                    />
                                    <span className="text-[10px] font-bold uppercase text-gray-500">Mudo (Muted)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: LAYOUT (Positioning) */}
            {activeSubTab === 'layout' && (
                <div className="space-y-6 animate-fadeIn">
                    {hasVideo ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Som</label>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <button onClick={() => updateVideoSettings({ muted: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${videoSettings.muted ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Mudo</button>
                                    <button onClick={() => updateVideoSettings({ muted: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!videoSettings.muted ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Som</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Loop</label>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <button onClick={() => updateVideoSettings({ loop: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${videoSettings.loop ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Sim</button>
                                    <button onClick={() => updateVideoSettings({ loop: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!videoSettings.loop ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Não</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Ajuste (Fit)</label>
                                <select
                                    value={videoSettings.fit || 'cover'}
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
                                    value={videoSettings.zoomMotion || 'off'}
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
                                        value={imageStyle.fit || 'cover'}
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
                                        value={imageStyle.focusPoint || 'center'}
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

                            {/* PREVIEW SIMPLES */}
                            {media.images && media.images.length > 0 && (
                                <div className={`relative aspect-video rounded-[2rem] overflow-hidden border group ${darkMode ? 'bg-black border-white/10' : 'bg-gray-100 border-gray-200 shadow-inner'}`}>
                                    <img
                                        src={media.images[0]}
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 opacity-80"
                                        style={{
                                            transform: `translate(${imageStyle.posX || 0}%, ${imageStyle.posY || 0}%) scale(${imageStyle.scale || 1})`,
                                            objectPosition: imageStyle.focusPoint || 'center'
                                        }}
                                    />
                                </div>
                            )}
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
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${(mediaType === 'video' ? videoSettings.borderRadius : imageStyle.borderRadius) === r ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
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
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${(mediaType === 'video' ? videoSettings.shadow : imageStyle.shadow) === s ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
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
                            value={mediaType === 'video' ? videoSettings.overlayPreset : imageStyle.overlayPreset}
                            onChange={v => mediaType === 'video' ? updateVideoSettings({ overlayPreset: v as PopupVideoSettings['overlayPreset'] }) : updateImageStyle({ overlayPreset: v as PopupImageStyle['overlayPreset'] })}
                            darkMode={darkMode}
                        />
                    </div>

                    {mediaType === 'video' && (
                        <div>
                            <label className={labelClass}>Frame Preset</label>
                            <select
                                value={videoSettings.framePreset || 'clean_border'}
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
                            value={mediaType === 'video' ? videoSettings.filterId : imageStyle.filterId}
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
                                    className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${(mediaType === 'video' ? videoSettings.filterVariant : imageStyle.filterVariant) === v ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
                                        }`}
                                >
                                    {v === 'soft' ? 'Suave' : 'Forte'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {!hasVideo && (
                        <div>
                            <label className={labelClass}>Opacidade do Overlay ({imageStyle.overlayIntensity || 0}%)</label>
                            <input
                                type="range"
                                min="0" max="100"
                                value={imageStyle.overlayIntensity || 0}
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
