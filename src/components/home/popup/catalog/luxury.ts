import { PopupThemeToken } from './types';

export const LUXURY_THEMES: PopupThemeToken[] = [
    {
        id: 'luxury_vogue',
        name: 'Vogue Editorial 👠',
        description: 'Flashes de câmera de passarela.',
        filterId: 'grayscale',
        filterVariant: 'soft',
        overlayPreset: 'none',
        framePreset: 'editorial_frame',
        specialEffect: 'camera_flash', // Flashes sutis
        colors: { background: '#ffffff', title: '#171717', body: '#525252', buttonBg: '#171717', buttonText: '#ffffff' },
        recommendedFontFamily: 'Merriweather',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'outline', borderRadius: 'none', shadow: 'none', backdrop: 'dim_soft', headerAccent: 'left_bar', spacing: 'comfortable' }
    },
    {
        id: 'luxury_gold_royal',
        name: 'Gold Royal 👑',
        description: 'Partículas de ouro flutuantes.',
        filterId: 'contrast',
        filterVariant: 'soft',
        overlayPreset: 'vignette_soft',
        framePreset: 'glass_card',
        specialEffect: 'sparkles',
        colors: { background: '#1c1917', title: '#d6d3d1', body: '#a8a29e', buttonBg: '#b45309', buttonText: '#ffffff' },
        recommendedFontFamily: 'Merriweather',
        recommendedImagePresentation: 'split_2col',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'comfortable' }
    },
];
