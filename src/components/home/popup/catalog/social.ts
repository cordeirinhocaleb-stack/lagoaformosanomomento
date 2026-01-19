import { PopupThemeToken } from './types';

export const SOCIAL_THEMES: PopupThemeToken[] = [
    {
        id: 'social_whatsapp',
        name: 'Zap Direct 💬',
        description: 'Padrão de fundo animado.',
        filterId: 'none',
        filterVariant: 'soft',
        overlayPreset: 'none',
        framePreset: 'clean_shadow',
        specialEffect: 'bokeh', // Reutilizando bokeh para simular bolhas de chat
        colors: { background: '#dcf8c6', title: '#075e54', body: '#128c7e', buttonBg: '#25d366', buttonText: '#ffffff' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'soft', backdrop: 'dim_soft', headerAccent: 'top_bar', spacing: 'compact' }
    },
    {
        id: 'social_insta_story',
        name: 'Influencer 📸',
        description: 'Gradiente animado vibrante.',
        filterId: 'saturate',
        filterVariant: 'soft',
        overlayPreset: 'top_gradient',
        framePreset: 'rounded_modern',
        specialEffect: 'gradient_wave',
        colors: { background: '#ffffff', title: '#be185d', body: '#374151', buttonBg: '#db2777', buttonText: '#ffffff' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'mini_slider',
        defaults: { surfaceStyle: 'solid', borderRadius: 'full', shadow: 'soft', backdrop: 'blur_soft', headerAccent: 'badge', spacing: 'comfortable' }
    },
];
