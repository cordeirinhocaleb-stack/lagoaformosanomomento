import React from 'react';

export interface GalleryStyleOption {
    id: string;
    label: string;
    icon: string;
    maxItems: number;
    description: string;
}

export const GALLERY_STYLES: GalleryStyleOption[] = [
    { id: 'grid', label: 'Grade Fina', icon: 'fa-th', maxItems: 12, description: 'Organização clássica' },
    { id: 'masonry', label: 'Mosaico', icon: 'fa-crop-alt', maxItems: 10, description: 'Tamanhos Dinâmicos' },
    { id: 'carousel', label: 'Carrossel', icon: 'fa-images', maxItems: 20, description: 'Deslizar lateral' },
    { id: 'spotlight', label: 'Destaque', icon: 'fa-star', maxItems: 5, description: 'Foco na primeira' },
    { id: 'polaroid', label: 'Polaroid', icon: 'fa-camera-retro', maxItems: 8, description: 'Retrô & Elegante' },
    { id: 'reel', label: 'Reel Scroll', icon: 'fa-film', maxItems: 10, description: 'Formato Stories' }
];

interface GalleryGridControlsProps {
    currentStyle: string;
    onChangeStyle: (id: string) => void;
}

export const GalleryGridControls: React.FC<GalleryGridControlsProps> = ({ currentStyle, onChangeStyle }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {GALLERY_STYLES.map(style => {
                const isActive = currentStyle === style.id;
                return (
                    <button
                        key={style.id}
                        onClick={() => onChangeStyle(style.id)}
                        aria-label={`Estilo de galeria: ${style.label}`}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${isActive
                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                            : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 hover:shadow-sm'
                            }`}
                    >
                        <i className={`fas ${style.icon} text-xl mb-2 ${isActive ? 'text-blue-500' : 'opacity-50'}`}></i>
                        <span className="text-[10px] font-black uppercase tracking-wider">{style.label}</span>
                        <span className="text-[9px] opacity-60 mt-0.5">{style.maxItems} fotos máx</span>
                    </button>
                );
            })}
        </div>
    );
};
