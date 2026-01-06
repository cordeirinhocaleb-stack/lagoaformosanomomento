
import { 
    PopupFilterId, 
    PopupOverlayPreset, 
    VideoFramePresetId, 
    PopupImagePresentation, 
    PopupMediaFilterVariant,
    PopupThemeAdvanced
} from '../../../types';

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

export const POPUP_THEME_CATALOG: PopupThemeToken[] = [
    // ========================================================================
    // 1. RETAIL & PROMO
    // ========================================================================
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

    // ========================================================================
    // 2. LUXURY & EDITORIAL
    // ========================================================================
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

    // ========================================================================
    // 3. MODERN & TECH
    // ========================================================================
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

    // ========================================================================
    // 4. CREATIVE & BOLD
    // ========================================================================
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

    // ========================================================================
    // 5. SOCIAL & CHAT
    // ========================================================================
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

    // ========================================================================
    // 6. DATAS & SAZONAIS
    // ========================================================================
    {
        id: 'date_new_year',
        name: 'Réveillon Gold 🥂',
        description: 'Brilhos dourados animados.',
        filterId: 'contrast',
        filterVariant: 'strong',
        overlayPreset: 'dark_soft',
        framePreset: 'floating_glow',
        specialEffect: 'sparkles',
        colors: { background: '#000000', title: '#fbbf24', body: '#d4d4d4', buttonBg: '#fbbf24', buttonText: '#000000', border: '#fbbf24' },
        recommendedFontFamily: 'Merriweather',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'glow', backdrop: 'dim_strong', headerAccent: 'top_bar', spacing: 'comfortable' }
    },
    {
        id: 'date_valentines',
        name: 'Namorados ❤️',
        description: 'Corações flutuando.',
        filterId: 'saturate',
        filterVariant: 'soft',
        overlayPreset: 'vignette_soft',
        framePreset: 'rounded_modern',
        specialEffect: 'hearts',
        colors: { background: '#fff1f2', title: '#be123c', body: '#881337', buttonBg: '#e11d48', buttonText: '#ffffff' },
        recommendedFontFamily: 'Caveat',
        recommendedImagePresentation: 'stack_cards',
        defaults: { surfaceStyle: 'solid', borderRadius: 'strong', shadow: 'soft', backdrop: 'blur_soft', headerAccent: 'none', spacing: 'normal' }
    },
    {
        id: 'date_carnival',
        name: 'Carnaval Neon 🎉',
        description: 'Chuva de confetes.',
        filterId: 'saturate',
        filterVariant: 'strong',
        overlayPreset: 'none',
        framePreset: 'bold_border',
        specialEffect: 'confetti',
        colors: { background: '#2e1065', title: '#f0abfc', body: '#e9d5ff', buttonBg: '#22d3ee', buttonText: '#000000' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'collage_3',
        defaults: { surfaceStyle: 'glass', borderRadius: 'strong', shadow: 'glow', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'compact' }
    },
    {
        id: 'date_easter',
        name: 'Páscoa Choco 🍫',
        description: 'Brilhos suaves.',
        filterId: 'sepia',
        filterVariant: 'soft',
        overlayPreset: 'none',
        framePreset: 'clean_border',
        specialEffect: 'sparkles',
        colors: { background: '#451a03', title: '#fcd34d', body: '#fed7aa', buttonBg: '#f59e0b', buttonText: '#ffffff' },
        recommendedFontFamily: 'Merriweather',
        recommendedImagePresentation: 'mini_slider',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_soft', headerAccent: 'badge', spacing: 'normal' }
    },
    {
        id: 'date_mothers',
        name: 'Dia das Mães 🌸',
        description: 'Luzes bokeh delicadas.',
        filterId: 'brightness',
        filterVariant: 'soft',
        overlayPreset: 'glass_blur_soft',
        framePreset: 'glass_card',
        specialEffect: 'bokeh',
        colors: { background: '#fdf2f8', title: '#db2777', body: '#831843', buttonBg: '#db2777', buttonText: '#ffffff' },
        recommendedFontFamily: 'Merriweather',
        recommendedImagePresentation: 'split_2col',
        defaults: { surfaceStyle: 'glass', borderRadius: 'full', shadow: 'soft', backdrop: 'blur_soft', headerAccent: 'none', spacing: 'comfortable' }
    },
    {
        id: 'date_fathers',
        name: 'Dia dos Pais 👔',
        description: 'Sóbrio com scanline.',
        filterId: 'contrast',
        filterVariant: 'soft',
        overlayPreset: 'dark_soft',
        framePreset: 'clean_border',
        specialEffect: 'scanline',
        colors: { background: '#1e3a8a', title: '#ffffff', body: '#bfdbfe', buttonBg: '#ffffff', buttonText: '#1e3a8a' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_soft', headerAccent: 'left_bar', spacing: 'normal' }
    },
    {
        id: 'date_halloween',
        name: 'Halloween 🎃',
        description: 'Abóboras e névoa.',
        filterId: 'contrast',
        filterVariant: 'strong',
        overlayPreset: 'vignette_strong',
        framePreset: 'minimal_corner',
        specialEffect: 'pumpkins',
        colors: { background: '#1a0b2e', title: '#f97316', body: '#a855f7', buttonBg: '#f97316', buttonText: '#000000' },
        recommendedFontFamily: 'Creepster', 
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'outline', borderRadius: 'none', shadow: 'glow', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'compact' }
    },
    {
        id: 'date_christmas',
        name: 'Feliz Natal 🎄',
        description: 'Neve caindo.',
        filterId: 'contrast',
        filterVariant: 'strong',
        overlayPreset: 'vignette_soft',
        framePreset: 'rounded_modern',
        specialEffect: 'snow',
        colors: { background: '#14532d', title: '#fef2f2', body: '#bbf7d0', buttonBg: '#dc2626', buttonText: '#ffffff' },
        recommendedFontFamily: 'Merriweather',
        recommendedImagePresentation: 'stack_cards',
        defaults: { surfaceStyle: 'solid', borderRadius: 'strong', shadow: 'strong', backdrop: 'dim_soft', headerAccent: 'badge', spacing: 'normal' }
    },

    // ========================================================================
    // 7. INSTITUCIONAL & PADRÃO
    // ========================================================================
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

export const getThemeById = (id: string | undefined) => {
    return POPUP_THEME_CATALOG.find(t => t.id === id) || POPUP_THEME_CATALOG[0];
};
