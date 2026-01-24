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
    specialEffect?: PopupSpecialEffect;
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
    layout: 'classic' | 'split' | 'cover' | 'floating' | 'monolith' | 'asymmetric' | 'fragmented' | 'banner_top' | 'feature_list' | 'countdown';
    buttonPosition?: 'top' | 'bottom';
    suggestedTitle?: string;
    suggestedSubtitle?: string;
    suggestedBody?: string;
    suggestedCTA?: string;
    suggestedSmallNote?: string;
    badgeText?: string;
    category: 'retail' | 'luxury' | 'modern' | 'creative' | 'social';
}

export const POPUP_THEME_CATALOG: PopupThemeToken[] = [
    // ========================================================================
    // 1. IMAGE 1 & 4 (Tech & Travel)
    // ========================================================================
    {
        id: 'tech_minimal_light',
        name: 'Tech Minimalist',
        description: 'Design limpo, branco, estilo editorial moderno.',
        layout: 'split',
        buttonPosition: 'bottom',
        suggestedTitle: 'Apple M3 Chip',
        suggestedBody: 'O poder que você conhece, agora em dobro.',
        suggestedCTA: 'PRÉ-VENDA',
        colors: { background: '#ffffff', title: '#1d1d1f', body: '#86868b', buttonBg: '#0071e3', buttonText: '#ffffff', border: '#f5f5f7' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'flat', borderRadius: 'none', shadow: 'soft', backdrop: 'dim_soft', headerAccent: 'none', spacing: 'compact' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'clean_border',
        category: 'modern'
    },
    {
        id: 'travel_vibe_center',
        name: 'Travel Experience',
        description: 'Overlay imersivo com conteúdo centralizado.',
        layout: 'classic',
        buttonPosition: 'top',
        suggestedTitle: 'EXPLORE MALDIVAS',
        suggestedBody: 'Pacotes exclusivos com 30% OFF nesta semana.',
        suggestedCTA: 'RESERVAR AGORA',
        colors: { background: 'rgba(15,23,42,0.6)', title: '#ffffff', body: '#e2e8f0', buttonBg: '#0ea5e9', buttonText: '#ffffff' },
        recommendedFontFamily: 'Outfit',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'glass', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'comfortable' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'dark_strong', framePreset: 'glass_card',
        category: 'luxury'
    },

    // ========================================================================
    // 2. IMAGE 2 (Solid Urgency Cards)
    // ========================================================================
    {
        id: 'retail_solid_red',
        name: 'Urgent Red Alert',
        description: 'Impacto total vermelho para ofertas relâmpago.',
        layout: 'classic',
        buttonPosition: 'bottom',
        suggestedTitle: 'HORA H!',
        suggestedBody: 'Descontos de até 70% somente até meia-noite.',
        suggestedCTA: 'QUERO DESCONTO',
        colors: { background: '#dc2626', title: '#ffffff', body: '#fee2e2', buttonBg: '#ffffff', buttonText: '#dc2626' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'strong', backdrop: 'dim_strong', headerAccent: 'badge', spacing: 'normal' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'bold_border', specialEffect: 'pulse_red',
        category: 'retail'
    },
    {
        id: 'retail_solid_green',
        name: 'Eco Success Green',
        description: 'Verde vibrante para lançamentos e benefícios.',
        layout: 'classic',
        buttonPosition: 'top',
        suggestedTitle: 'TESTE GRÁTIS',
        suggestedBody: 'Experimente a nossa plataforma por 14 dias sem taxas.',
        suggestedCTA: 'COMEÇAR AGORA',
        colors: { background: '#16a34a', title: '#ffffff', body: '#dcfce7', buttonBg: '#000000', buttonText: '#ffffff' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'strong', shadow: 'glow', backdrop: 'dim_soft', headerAccent: 'badge', spacing: 'normal' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'rounded_modern',
        category: 'retail'
    },
    {
        id: 'retail_solid_blue',
        name: 'Corporate Blue Trust',
        description: 'Azul royal para confiança e segurança.',
        layout: 'classic',
        buttonPosition: 'bottom',
        suggestedTitle: 'SUPORTE VIP 24H',
        suggestedBody: 'Nossos especialistas estão prontos para te ajudar.',
        suggestedCTA: 'FALAR COM TIME',
        colors: { background: '#1d4ed8', title: '#ffffff', body: '#dbeafe', buttonBg: '#ffffff', buttonText: '#1d4ed8' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'none', shadow: 'soft', backdrop: 'dim_soft', headerAccent: 'none', spacing: 'compact' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'clean_border',
        category: 'retail'
    },

    // ========================================================================
    // 3. IMAGE 5 (Functional Banners/Lists)
    // ========================================================================
    {
        id: 'banner_top_breaking',
        name: 'Breaking News Bar',
        description: 'Barra fina no topo para avisos globais.',
        layout: 'banner_top',
        suggestedTitle: 'ATENÇÃO:',
        suggestedBody: 'Cupom PRIMEIRACOMPRA ativo para 20% OFF.',
        suggestedCTA: 'COPIAR',
        colors: { background: '#dc2626', title: '#ffffff', body: '#ffffff', buttonBg: '#ffffff', buttonText: '#dc2626' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'none', shadow: 'none', backdrop: 'none', headerAccent: 'none', spacing: 'compact' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'minimal_corner',
        category: 'retail'
    },
    {
        id: 'feature_list_premium',
        name: 'Feature Checklist',
        description: 'Layout vertical com ícones de check.',
        layout: 'feature_list',
        suggestedTitle: 'SEJA PREMIUM',
        suggestedBody: 'Suporte 24h | Zero Anúncios | Alta Qualidade',
        suggestedCTA: 'ASSINAR AGORA',
        colors: { background: '#7c3aed', title: '#ffffff', body: '#f5f3ff', buttonBg: '#ffffff', buttonText: '#7c3aed' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'strong', shadow: 'strong', backdrop: 'blur_soft', headerAccent: 'none', spacing: 'comfortable' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'glass_card',
        category: 'retail'
    },
    {
        id: 'countdown_urgency',
        name: 'Countdown Timer',
        description: 'Urgência máxima com cronômetro real.',
        layout: 'countdown',
        suggestedTitle: 'A OFERTA ACABA EM:',
        suggestedBody: 'Não restará nada amanhã. Garanta o seu estoque.',
        suggestedCTA: 'CORRER !',
        colors: { background: '#0284c7', title: '#ffffff', body: '#e0f2fe', buttonBg: '#ffffff', buttonText: '#0284c7' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'glow', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'normal' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'bold_border',
        category: 'retail'
    },

    // ========================================================================
    // 4. IMAGE 3 & 4 (Monolith & Artistic)
    // ========================================================================
    {
        id: 'monolith_brutalist',
        name: 'Brutalist Impact',
        description: 'Tipografia massiva e cores ácidas.',
        layout: 'monolith',
        buttonPosition: 'bottom',
        suggestedTitle: 'DESIGN\nSYSTEM',
        suggestedBody: 'A revolução visual que você esperava.',
        suggestedCTA: 'VER MAIS',
        colors: { background: '#000000', title: '#fbbf24', body: '#ffffff', buttonBg: '#fbbf24', buttonText: '#000000' },
        recommendedFontFamily: 'Anton',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'none', shadow: 'strong', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'comfortable' },
        filterId: 'contrast', filterVariant: 'strong', overlayPreset: 'none', framePreset: 'bold_border',
        category: 'creative'
    },
    {
        id: 'fragmented_void',
        name: 'The Void State',
        description: 'Layout fragmentado com elementos flutuantes.',
        layout: 'fragmented',
        buttonPosition: 'top',
        suggestedTitle: 'PROFUNDIDADE',
        suggestedBody: 'Sinta a nova experiência de usuário fragmentada.',
        suggestedCTA: 'EXPERIMENTAR',
        colors: { background: 'rgba(30,58,138,0.7)', title: '#34d399', body: '#93c5fd', buttonBg: '#34d399', buttonText: '#064e3b' },
        recommendedFontFamily: 'Space Grotesk',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'glass', borderRadius: 'full', shadow: 'glow', backdrop: 'blur_soft', headerAccent: 'none', spacing: 'comfortable' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'glass_blur_strong', framePreset: 'glass_card', specialEffect: 'glitch',
        category: 'creative'
    },
    {
        id: 'cover_vogue_editorial',
        name: 'Vogue Editorial',
        description: 'Imagem full-size com tipografia moderna.',
        layout: 'cover',
        suggestedTitle: 'THE NEW LOOK',
        suggestedBody: 'Tendências globais para o seu closet local.',
        suggestedCTA: 'COMPRAR LOOK',
        colors: { background: '#000000', title: '#ffffff', body: '#f3f4f6', buttonBg: '#ffffff', buttonText: '#000000' },
        recommendedFontFamily: 'Playfair Display',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'flat', borderRadius: 'none', shadow: 'none', backdrop: 'dim_strong', headerAccent: 'none', spacing: 'comfortable' },
        filterId: 'grayscale', filterVariant: 'strong', overlayPreset: 'bottom_gradient', framePreset: 'editorial_frame',
        category: 'creative'
    },
    {
        id: 'sponsored_story_brand',
        name: 'Sponsored Brand Story',
        description: 'Design elegante para parcerias e marcas premium.',
        layout: 'split',
        buttonPosition: 'bottom',
        suggestedTitle: 'A NOVA ERA',
        suggestedBody: 'Descubra como a inovação está mudando o mercado local.',
        suggestedCTA: 'VER CAMPANHA',
        colors: { background: '#f8fafc', title: '#0f172a', body: '#475569', buttonBg: '#0f172a', buttonText: '#ffffff', border: '#e2e8f0' },
        recommendedFontFamily: 'Inter',
        recommendedImagePresentation: 'hero_single',
        defaults: { surfaceStyle: 'solid', borderRadius: 'soft', shadow: 'soft', backdrop: 'dim_soft', headerAccent: 'badge', spacing: 'normal' },
        filterId: 'none', filterVariant: 'soft', overlayPreset: 'none', framePreset: 'clean_border',
        badgeText: 'PATROCINADO',
        category: 'social'
    },
];

export const getThemeById = (id: string | undefined): PopupThemeToken => {
    return POPUP_THEME_CATALOG.find(t => t.id === id) || POPUP_THEME_CATALOG[0];
};
