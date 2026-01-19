import { PopupThemeToken } from './types';

export const MODERN_THEMES: PopupThemeToken[] = [
    {
        id: 'modern_glass_frost',
        name: 'Glass Frost 🧊',
        description: 'Luzes bokeh desfocadas.',
        filterId: 'none',
        filterVariant: 'soft',
        overlayPreset: 'glass_blur_strong',
        framePreset: 'glass_card',
        specialEffect: 'bokeh', // Luzes suaves
        colors: { background: 'rgba(255, 255, 255, 0.65)', title: '#0f172a', body: '#334155', buttonBg: '#0f172a', buttonText: '#ffffff' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'mini_slider',
        defaults: { surfaceStyle: 'glass', borderRadius: 'strong', shadow: 'soft', backdrop: 'blur_soft', headerAccent: 'none', spacing: 'comfortable' }
    },
    {
        id: 'modern_spotify',
        name: 'Dark Stream 🎵',
        description: 'Ondas de som gradient.',
        filterId: 'saturate',
        filterVariant: 'strong',
        overlayPreset: 'bottom_gradient',
        framePreset: 'rounded_modern',
        specialEffect: 'gradient_wave', // Onda de cor
        colors: { background: '#121212', title: '#1db954', body: '#b3b3b3', buttonBg: '#1db954', buttonText: '#000000' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'stack_cards',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'normal' }
    },
];
