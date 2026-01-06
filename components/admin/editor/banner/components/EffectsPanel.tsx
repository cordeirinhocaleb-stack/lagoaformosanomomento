/**
 * EffectsPanel Component
 * Controls for adjusting image brightness, contrast, saturation, blur, sepia, and opacity
 */

import React from 'react';

interface BannerEffects {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    sepia: number;
    opacity: number;
}

interface EffectsPanelProps {
    isOpen: boolean;
    bannerEffects: BannerEffects;
    onEffectsChange: (effects: BannerEffects) => void;
}

const EffectsPanel: React.FC<EffectsPanelProps> = ({
    isOpen,
    bannerEffects,
    onEffectsChange
}) => {
    if (!isOpen) return null;

    const handleChange = (key: keyof BannerEffects, value: number) => {
        onEffectsChange({ ...bannerEffects, [key]: value });
    };

    const handleReset = () => {
        onEffectsChange({
            brightness: 1,
            contrast: 1,
            saturation: 1,
            blur: 0,
            sepia: 0,
            opacity: 1
        });
    };

    return (
        <div className="mx-8 mt-4 mb-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-100 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-blue-800 flex items-center gap-2">
                    <i className="fas fa-sliders-h"></i>
                    Ajustes de Imagem
                </h4>
                <button
                    onClick={handleReset}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2.5 py-1 rounded-full shadow-sm transition-colors"
                >
                    <i className="fas fa-redo-alt mr-1"></i>
                    Resetar
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Brightness */}
                <div>
                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800/60 mb-2">
                        <span><i className="fas fa-sun mr-1"></i> Brilho</span>
                        <span className="bg-white text-blue-600 px-1.5 rounded shadow-sm">{Math.round(bannerEffects.brightness * 100)}%</span>
                    </label>
                    <input
                        type="range" min="0" max="2" step="0.1"
                        value={bannerEffects.brightness}
                        onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Contrast */}
                <div>
                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800/60 mb-2">
                        <span><i className="fas fa-adjust mr-1"></i> Contraste</span>
                        <span className="bg-white text-blue-600 px-1.5 rounded shadow-sm">{Math.round(bannerEffects.contrast * 100)}%</span>
                    </label>
                    <input
                        type="range" min="0" max="2" step="0.1"
                        value={bannerEffects.contrast}
                        onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Saturation */}
                <div>
                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800/60 mb-2">
                        <span><i className="fas fa-palette mr-1"></i> Saturação</span>
                        <span className="bg-white text-blue-600 px-1.5 rounded shadow-sm">{Math.round(bannerEffects.saturation * 100)}%</span>
                    </label>
                    <input
                        type="range" min="0" max="2" step="0.1"
                        value={bannerEffects.saturation}
                        onChange={(e) => handleChange('saturation', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Blur */}
                <div>
                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800/60 mb-2">
                        <span><i className="fas fa-tint mr-1"></i> Desfoque</span>
                        <span className="bg-white text-blue-600 px-1.5 rounded shadow-sm">{bannerEffects.blur}px</span>
                    </label>
                    <input
                        type="range" min="0" max="10" step="0.5"
                        value={bannerEffects.blur}
                        onChange={(e) => handleChange('blur', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Sepia */}
                <div>
                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800/60 mb-2">
                        <span><i className="fas fa-coffee mr-1"></i> Sépia</span>
                        <span className="bg-white text-blue-600 px-1.5 rounded shadow-sm">{Math.round(bannerEffects.sepia * 100)}%</span>
                    </label>
                    <input
                        type="range" min="0" max="1" step="0.1"
                        value={bannerEffects.sepia}
                        onChange={(e) => handleChange('sepia', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Opacity */}
                <div>
                    <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-800/60 mb-2">
                        <span><i className="fas fa-eye-slash mr-1"></i> Opacidade</span>
                        <span className="bg-white text-blue-600 px-1.5 rounded shadow-sm">{Math.round(bannerEffects.opacity * 100)}%</span>
                    </label>
                    <input
                        type="range" min="0" max="1" step="0.1"
                        value={bannerEffects.opacity}
                        onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>
        </div>
    );
};

export default EffectsPanel;
