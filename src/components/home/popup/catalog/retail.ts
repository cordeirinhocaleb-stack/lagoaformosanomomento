import { PopupThemeToken } from './types';

export const RETAIL_THEMES: PopupThemeToken[] = [
    {
        id: 'retail_flash_sale',
        name: 'Flash Sale 🔥',
        description: 'Alta urgência com pulso vermelho.',
        filterId: 'saturate',
        filterVariant: 'strong',
        overlayPreset: 'dark_strong',
        framePreset: 'bold_border',
        specialEffect: 'pulse_red',
        colors: { background: '#dc2626', title: '#ffffff', body: '#fee2e2', buttonBg: '#fbbf24', buttonText: '#000000' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'compact' }
    },
    {
        id: 'retail_black_friday',
        name: 'Black Friday ⚫',
        description: 'Caos urbano e ruído digital.',
        filterId: 'contrast',
        filterVariant: 'strong',
        overlayPreset: 'none',
        framePreset: 'clean_border',
        specialEffect: 'noise', // Efeito de granulação/TV
        colors: { background: '#000000', title: '#ffffff', body: '#d4d4d4', buttonBg: '#ffffff', buttonText: '#000000' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'split_2col',
        defaults: { surfaceStyle: 'flat', borderRadius: 'none', shadow: 'glow', backdrop: 'dim_strong', headerAccent: 'top_bar', spacing: 'normal' }
    },
    {
        id: 'retail_cyber_week',
        name: 'Cyber Week 🤖',
        description: 'Estilo Matrix digital com glitch.',
        filterId: 'saturate',
        filterVariant: 'strong',
        overlayPreset: 'bottom_gradient',
        framePreset: 'floating_glow',
        specialEffect: 'matrix', // Mantém Matrix ou muda para Glitch
        colors: { background: '#0f172a', title: '#38bdf8', body: '#e0f2fe', buttonBg: '#2563eb', buttonText: '#ffffff' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'collage_3',
        defaults: { surfaceStyle: 'glass', borderRadius: 'strong', shadow: 'glow', backdrop: 'blur_soft', headerAccent: 'none', spacing: 'comfortable' }
    },
];
