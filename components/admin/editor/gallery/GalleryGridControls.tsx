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
    { id: 'news_mosaic', label: 'Mosaico Capa', icon: 'fa-table-columns', maxItems: 3, description: 'Mosaico Jornalístico' },
    { id: 'spotlight', label: 'Destaque Ed.', icon: 'fa-star', maxItems: 5, description: 'Foco na primeira foto' },
    { id: 'hero_slider', label: 'Slider Premium', icon: 'fa-play-circle', maxItems: 10, description: 'Transição suave' },
    { id: 'masonry', label: 'Pinterest', icon: 'fa-crop-alt', maxItems: 10, description: 'Tamanhos Dinâmicos' },
    { id: 'polaroid', label: 'Polaroid', icon: 'fa-camera-retro', maxItems: 8, description: 'Retrô & Elegante' },
    { id: 'reel', label: 'Stories', icon: 'fa-film', maxItems: 10, description: 'Formato Vertical' }
];

interface GalleryGridControlsProps {
    currentStyle: string;
    showWatermark?: boolean;
    onChangeStyle: (id: string) => void;
    onToggleWatermark?: (enabled: boolean) => void;
}

export const GalleryGridControls: React.FC<GalleryGridControlsProps> = ({
    currentStyle,
    showWatermark = false,
    onChangeStyle,
    onToggleWatermark
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {/* Configurações Adicionais Premium */}
            <div className="pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 shadow-sm transition-colors">
                            <i className="fas fa-copyright text-lg"></i>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800">Marca d'Água Oficial</p>
                            <p className="text-[9px] text-zinc-500">Exibir lagoaformosanomomento.com.br</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onToggleWatermark?.(!showWatermark)}
                        className={`w-12 h-6 rounded-full transition-all relative ${showWatermark ? 'bg-blue-600' : 'bg-zinc-200'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showWatermark ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>
        </div>
    );
};
