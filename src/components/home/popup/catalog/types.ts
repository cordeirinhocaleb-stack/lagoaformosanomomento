import {
    PopupFilterId,
    PopupOverlayPreset,
    VideoFramePresetId,
    PopupImagePresentation,
    PopupMediaFilterVariant,
    PopupThemeAdvanced
} from '@/types';

// Tipos de Efeitos Especiais Atualizados
export type PopupSpecialEffect =
    | 'none'
    | 'snow'
    | 'rain'
    | 'hearts'
    | 'pumpkins'
    | 'confetti'
    | 'sparkles'
    | 'pulse_red'
    | 'matrix'
    | 'camera_flash'
    | 'scanline'
    | 'noise'
    | 'bokeh'
    | 'gradient_wave'
    | 'clouds'
    | 'glitch';

export interface PopupThemeToken {
    id: string;
    name: string;
    description?: string;
    filterId: PopupFilterId;
    filterVariant: PopupMediaFilterVariant;
    overlayPreset: PopupOverlayPreset;
    framePreset: VideoFramePresetId;
    specialEffect?: PopupSpecialEffect; // Efeito de Fundo Animado
    colors: {
        background: string;
        title: string;
        body: string;
        buttonBg: string;
        buttonText: string;
        border?: string;
    };
    recommendedFontFamily: string;
    recommendedImagePresentation: PopupImagePresentation;
    defaults: PopupThemeAdvanced;
}
