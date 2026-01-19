import React from 'react';
import { PopupMediaConfig, PopupImagePresentation, PopupVideoSettings, PopupImageStyle } from '@/types';
import { MediaSubTab } from '../hooks/usePopupMedia';

interface MediaVisualSectionProps {
    media: PopupMediaConfig;
    darkMode: boolean;
    activeSubTab: MediaSubTab;
    mediaType: 'image' | 'video';
    updateImageStyle: (updates: Partial<PopupImageStyle>) => void;
    updateVideoSettings: (updates: Partial<PopupVideoSettings>) => void;
    onChange: (media: Partial<PopupMediaConfig>) => void;
}

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

export const MediaVisualSection: React.FC<MediaVisualSectionProps> = ({
    media,
    darkMode,
    activeSubTab,
    mediaType,
    updateImageStyle,
    updateVideoSettings,
    onChange
}) => {
    const selectClass = `w-full border rounded-lg p-2 text-[10px] font-bold uppercase outline-none ${darkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`;
    const labelClass = `block text-[9px] font-bold uppercase mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* LAYOUT / PLAYBACK */}
            {activeSubTab === 'layout' && (
                <div className="space-y-6">
                    {mediaType === 'video' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Som</label>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <button onClick={() => updateVideoSettings({ muted: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${media.videoSettings?.muted ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Mudo</button>
                                    <button onClick={() => updateVideoSettings({ muted: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!media.videoSettings?.muted ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Som</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Loop</label>
                                <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <button onClick={() => updateVideoSettings({ loop: true })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${media.videoSettings?.loop ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Sim</button>
                                    <button onClick={() => updateVideoSettings({ loop: false })} className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${!media.videoSettings?.loop ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'}`}>Não</button>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Ajuste (Fit)</label>
                                <select
                                    value={media.videoSettings?.fit}
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
                                    value={media.videoSettings?.zoomMotion}
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
                                        value={media.imageStyle?.fit}
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
                                        value={media.imageStyle?.focusPoint}
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

            {/* STYLE (Visual) */}
            {activeSubTab === 'style' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Arredondamento</label>
                            <div className={`flex p-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                {['none', 'soft', 'strong'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => mediaType === 'video' ? updateVideoSettings({ borderRadius: r as PopupVideoSettings['borderRadius'] }) : updateImageStyle({ borderRadius: r as PopupImageStyle['borderRadius'] })}
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${(mediaType === 'video' ? media.videoSettings?.borderRadius : media.imageStyle?.borderRadius) === r ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
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
                                        className={`flex-1 py-2 rounded text-[8px] font-bold uppercase ${(mediaType === 'video' ? media.videoSettings?.shadow : media.imageStyle?.shadow) === s ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
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
                            value={mediaType === 'video' ? media.videoSettings?.overlayPreset || 'none' : media.imageStyle?.overlayPreset || 'none'}
                            onChange={v => mediaType === 'video' ? updateVideoSettings({ overlayPreset: v as PopupVideoSettings['overlayPreset'] }) : updateImageStyle({ overlayPreset: v as PopupImageStyle['overlayPreset'] })}
                            darkMode={darkMode}
                        />
                    </div>

                    {mediaType === 'video' && (
                        <div>
                            <label className={labelClass}>Frame Preset</label>
                            <select
                                value={media.videoSettings?.framePreset}
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

            {/* FILTERS */}
            {activeSubTab === 'filters' && (
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Tipo de Filtro</label>
                        <FilterSelector
                            value={mediaType === 'video' ? media.videoSettings?.filterId || 'none' : media.imageStyle?.filterId || 'none'}
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
                                    className={`flex-1 py-2 rounded text-[9px] font-bold uppercase ${(mediaType === 'video' ? media.videoSettings?.filterVariant : media.imageStyle?.filterVariant) === v ? (darkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white shadow-sm text-black') : 'text-gray-400'
                                        }`}
                                >
                                    {v === 'soft' ? 'Suave' : 'Forte'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {mediaType === 'image' && (
                        <div>
                            <label className={labelClass}>Opacidade do Overlay ({media.imageStyle?.overlayIntensity || 0}%)</label>
                            <input
                                type="range"
                                min="0" max="100"
                                value={media.imageStyle?.overlayIntensity || 0}
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
