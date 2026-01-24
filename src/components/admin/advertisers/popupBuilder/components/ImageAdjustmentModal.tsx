import React from 'react';
import { PopupImageStyle } from '@/types/ads';

interface ImageAdjustmentModalProps {
    style: PopupImageStyle;
    onChange: (updates: Partial<PopupImageStyle>) => void;
    onClose: () => void;
    darkMode?: boolean;
}

const ImageAdjustmentModal: React.FC<ImageAdjustmentModalProps> = ({ style, onChange, onClose, darkMode = true }) => {
    const sliderClass = `w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all`;
    const headerLabelStyle = "text-[9px] font-black uppercase tracking-[0.1em] text-gray-400 flex items-center gap-2";
    const valueStyle = "text-[10px] font-black text-orange-500 tabular-nums";
    const subLabelStyle = "text-[7px] font-bold text-gray-600 uppercase tracking-widest";

    // Safe fallback for style
    const safeStyle = style || { posX: 0, posY: 0, overlayIntensity: 0 };

    return (
        /* PANEL FLUTUANTE LATERAL - SEM BACKDROP BLUR PARA NÃO OBSTRUIR O PREVIEW */
        <div className="fixed top-6 right-6 bottom-6 z-[100] w-full max-w-[320px] animate-fadeIn">
            <div className={`h-full flex flex-col p-8 rounded-[2rem] border-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-slideInRight bg-[#0e0e0e] border-white/10`}>

                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
                            <i className="fas fa-arrows-alt text-xs"></i>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Ajustar</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/5"
                    >
                        <i className="fas fa-times text-xs"></i>
                    </button>
                </div>

                <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
                    {/* INFO ALERT */}
                    <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-1">
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">Live Edit</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase leading-relaxed">Arraste os controles e veja o resultado no preview à esquerda.</p>
                    </div>

                    {/* HORIZONTAL */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className={headerLabelStyle}>
                                <i className="fas fa-arrows-alt-h"></i> Horizontal
                            </div>
                            <span className={valueStyle}>{safeStyle.posX || 0}%</span>
                        </div>
                        <input
                            type="range" min="-100" max="100"
                            value={safeStyle.posX || 0}
                            onChange={e => onChange({ posX: parseInt(e.target.value) })}
                            className={sliderClass}
                        />
                        <div className="flex justify-between px-1">
                            <span className={subLabelStyle}>← Esq</span>
                            <span className={subLabelStyle}>Dir →</span>
                        </div>
                    </div>

                    {/* VERTICAL */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className={headerLabelStyle}>
                                <i className="fas fa-arrows-alt-v"></i> Vertical
                            </div>
                            <span className={valueStyle}>{safeStyle.posY || 0}%</span>
                        </div>
                        <input
                            type="range" min="-100" max="100"
                            value={safeStyle.posY || 0}
                            onChange={e => onChange({ posY: parseInt(e.target.value) })}
                            className={sliderClass}
                        />
                        <div className="flex justify-between px-1">
                            <span className={subLabelStyle}>↑ Topo</span>
                            <span className={subLabelStyle}>Base ↓</span>
                        </div>
                    </div>

                    {/* ESCURECIMENTO */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className={headerLabelStyle}>
                                <i className="fas fa-adjust"></i> Escurecer
                            </div>
                            <span className={valueStyle}>{safeStyle.overlayIntensity || 0}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100"
                            value={safeStyle.overlayIntensity || 0}
                            onChange={e => onChange({ overlayIntensity: parseInt(e.target.value) })}
                            className={sliderClass}
                        />
                        <div className="flex justify-between px-1">
                            <span className={subLabelStyle}>Claro</span>
                            <span className={subLabelStyle}>Noite</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                    <button
                        onClick={() => onChange({ posX: 0, posY: 0, scale: 1, overlayIntensity: 0 })}
                        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-undo-alt text-[8px]"></i> Resetar
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-lg flex items-center justify-center active:scale-95"
                    >
                        Concluído
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageAdjustmentModal;
