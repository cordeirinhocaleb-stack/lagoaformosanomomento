import { PopupThemeToken } from './types';

export const INSTITUTIONAL_THEMES: PopupThemeToken[] = [
    {
        id: 'inst_clean_blue',
        name: 'Corporativo 🏢',
        description: 'Nuvens passando suavemente.',
        filterId: 'none',
        filterVariant: 'soft',
        overlayPreset: 'none',
        framePreset: 'clean_border',
        specialEffect: 'clouds',
        colors: { background: '#f8fafc', title: '#0f172a', body: '#475569', buttonBg: '#0284c7', buttonText: '#ffffff' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'split_2col',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'soft', backdrop: 'blur_soft', headerAccent: 'left_bar', spacing: 'normal' }
    }
];
