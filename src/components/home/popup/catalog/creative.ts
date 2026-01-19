import { PopupThemeToken } from './types';

export const CREATIVE_THEMES: PopupThemeToken[] = [
    {
        id: 'creative_brutalist',
        name: 'Neo-Brutalism 🏗️',
        description: 'Glitch art e contraste.',
        filterId: 'contrast',
        filterVariant: 'strong',
        overlayPreset: 'none',
        framePreset: 'bold_border',
        specialEffect: 'glitch',
        colors: { background: '#f0abfc', title: '#000000', body: '#000000', buttonBg: '#000000', buttonText: '#ffffff', border: '#000000' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'outline', borderRadius: 'none', shadow: 'none', backdrop: 'dim_soft', headerAccent: 'none', spacing: 'compact' }
    },
    {
        id: 'creative_retro_90',
        name: 'Vaporwave 90s 👾',
        description: 'Linhas de varredura CRT.',
        filterId: 'vintage',
        filterVariant: 'strong',
        overlayPreset: 'color_brand_tint',
        framePreset: 'minimal_corner',
        specialEffect: 'scanline', // Efeito TV antiga
        colors: { background: '#2e1065', title: '#f472b6', body: '#e879f9', buttonBg: '#22d3ee', buttonText: '#000000' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'collage_3',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'glow', backdrop: 'dim_strong', headerAccent: 'badge', spacing: 'normal' }
    },
];
