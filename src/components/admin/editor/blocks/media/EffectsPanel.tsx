import React, { useEffect, useState } from 'react';
import { EffectControl } from './EffectControl';

interface EffectsPanelProps {
    effects: {
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        sepia: number;
        opacity: number;
    };
    isMuted: boolean;
    isLoop: boolean;
    isAutoplay: boolean;
    onEffectChange: (key: string, value: number) => void;
    onSettingChange: (key: string, value: unknown) => void;
    onClose: () => void;
    initialPosition?: { x: number, y: number };
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
    effects, isMuted, isLoop, isAutoplay,
    onEffectChange, onSettingChange, onClose,
    initialPosition = { x: 20, y: 100 }
}) => {
    const [panelPosition, setPanelPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - panelPosition.x,
            y: e.clientY - panelPosition.y
        });
    };

    const handleDragMove = (e: MouseEvent) => {
        if (isDragging) {
            setPanelPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            return () => {
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
            };
        }
    }, [isDragging, dragStart]);

    return (
        <div
            className="fixed bg-black/95 p-4 rounded-xl border-2 border-zinc-700 w-72 backdrop-blur-md shadow-2xl"
            style={{
                left: `${panelPosition.x}px`,
                top: `${panelPosition.y}px`,
                zIndex: 9999,
                cursor: isDragging ? 'grabbing' : 'default'
            }}
            onClick={e => e.stopPropagation()}
        >
            {/* Draggable Header */}
            <div
                className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-700 cursor-grab active:cursor-grabbing"
                onMouseDown={handleDragStart}
            >
                <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                    <i className="fas fa-grip-vertical text-zinc-500"></i>
                    Configuração do Vídeo
                </h4>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="text-zinc-400 hover:text-white transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => onSettingChange('muted', !isMuted)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${isMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'}`}></i> Mudo
                </button>
                <button onClick={() => onSettingChange('loop', !isLoop)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${isLoop ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <i className="fas fa-undo"></i> Loop
                </button>
                <button onClick={() => onSettingChange('autoplay', !isAutoplay)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${isAutoplay ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <i className="fas fa-play"></i> Auto
                </button>
            </div>

            <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest border-t border-zinc-800 pt-3">Efeitos Visuais</h4>
            <div className="space-y-3">
                <EffectControl label="Brilho" icon="sun" value={effects.brightness} min={0} max={200} onChange={v => onEffectChange('brightness', v)} />
                <EffectControl label="Contraste" icon="adjust" value={effects.contrast} min={0} max={200} onChange={v => onEffectChange('contrast', v)} />
                <EffectControl label="Saturação" icon="palette" value={effects.saturation} min={0} max={200} onChange={v => onEffectChange('saturation', v)} />
            </div>
        </div>
    );
};
