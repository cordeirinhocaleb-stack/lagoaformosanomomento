
import { PopupOverlayPreset } from '../../../types';

export interface OverlayPresetDef {
    id: PopupOverlayPreset;
    label: string;
    className: string;
}

export const OVERLAY_PRESETS: OverlayPresetDef[] = [
    {
        id: 'none',
        label: 'Sem Overlay',
        className: 'bg-transparent'
    },
    {
        id: 'dark_soft',
        label: 'Escuro Suave',
        className: 'bg-black/20'
    },
    {
        id: 'dark_strong',
        label: 'Escuro Forte',
        className: 'bg-black/50'
    },
    {
        id: 'bottom_gradient',
        label: 'Gradiente Base',
        className: 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
    },
    {
        id: 'top_gradient',
        label: 'Gradiente Topo',
        className: 'bg-gradient-to-b from-black/80 via-black/20 to-transparent'
    },
    {
        id: 'vignette_soft',
        label: 'Vinheta Suave',
        className: 'bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.4)_100%)]'
    },
    {
        id: 'vignette_strong',
        label: 'Vinheta Forte',
        className: 'bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.8)_100%)]'
    },
    {
        id: 'glass_blur_soft',
        label: 'Blur Vidro',
        className: 'backdrop-blur-[2px] bg-white/10'
    },
    {
        id: 'glass_blur_strong',
        label: 'Blur Intenso',
        className: 'backdrop-blur-[8px] bg-black/10'
    },
    {
        id: 'color_brand_tint',
        label: 'Tintura Marca',
        className: 'bg-red-600/20 mix-blend-multiply'
    }
];

export const getOverlayPresetClass = (id: string | undefined): string => {
    const preset = OVERLAY_PRESETS.find(p => p.id === id);
    return preset ? preset.className : 'bg-transparent';
};
