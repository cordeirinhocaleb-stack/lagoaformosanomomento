import { POPUP_THEME_CATALOG, PopupThemeToken } from './popupThemeCatalog';
import { PopupThemeAdvanced } from '../../../types';

export interface PopupThemeDef {
    id: string;
    name: string;
    category: string;
    layout: 'classic' | 'split' | 'cover' | 'floating' | 'monolith' | 'asymmetric' | 'fragmented' | 'banner_top' | 'feature_list' | 'countdown';
    styles: {
        wrapper: string;
        container: string;
        closeBtn: string;
        mediaContainer: string;
        contentContainer: string;
        title: string;
        description: string;
        button: string;
    };
    colors: {
        background: string;
        title: string;
        body: string;
        buttonBg: string;
        buttonText: string;
        border?: string;
    };
    specialEffect?: string;
    headerAccent?: 'none' | 'top_bar' | 'left_bar' | 'badge';
    buttonPosition?: 'top' | 'bottom';
}

// ============================================================================
// ADAPTER: Converte o Token do Catálogo (Dados) em Definição de Tema (Styles)
// ============================================================================
const generateThemeStyles = (token: PopupThemeToken) => {
    const { colors, defaults, recommendedFontFamily } = token;

    // 1. Container Wrapper (Backdrop)
    let wrapperClass = 'bg-black/50 backdrop-blur-sm';
    if (defaults.backdrop === 'dim_strong') wrapperClass = 'bg-black/80 backdrop-blur-md';
    if (defaults.backdrop === 'blur_soft') wrapperClass = 'bg-white/10 backdrop-blur-xl';

    // 2. Container Surface
    let containerClass = 'overflow-hidden transition-all duration-500';

    // Border Radius
    if (defaults.borderRadius === 'none') containerClass += ' rounded-none';
    if (defaults.borderRadius === 'soft') containerClass += ' rounded-2xl';
    if (defaults.borderRadius === 'strong') containerClass += ' rounded-[2rem]';
    if (defaults.borderRadius === 'full') containerClass += ' rounded-[2.5rem]';

    // Shadow
    if (defaults.shadow === 'soft') containerClass += ' shadow-xl';
    if (defaults.shadow === 'strong') containerClass += ' shadow-2xl';
    if (defaults.shadow === 'glow') containerClass += ` shadow-[0_0_40px_${colors.buttonBg}40]`;

    // Surface Style (Bg & Border)
    // Nota: Cores injetadas via style={} no componente, aqui definimos estrutura
    if (defaults.surfaceStyle === 'solid') containerClass += ' border border-transparent';
    if (defaults.surfaceStyle === 'outline') containerClass += ' border-4 bg-transparent backdrop-blur-md';
    if (defaults.surfaceStyle === 'glass') containerClass += ' bg-opacity-80 backdrop-blur-xl border border-white/20';
    if (defaults.surfaceStyle === 'flat') containerClass += ' border-0';

    // 3. Typography & Spacing
    const fontClass = `font-['${recommendedFontFamily}']`;
    let paddingClass = 'p-6 md:p-8';
    if (defaults.spacing === 'compact') paddingClass = 'p-4 md:p-6';
    if (defaults.spacing === 'comfortable') paddingClass = 'p-8 md:p-12';

    return {
        wrapper: wrapperClass,
        container: containerClass, // Style properties handled inline in view if needed, or mapped here if simple
        closeBtn: 'z-50', // Base class, colors injected via inline styles or specific mapping below
        mediaContainer: 'aspect-video w-full relative overflow-hidden',
        contentContainer: `${paddingClass} text-center flex flex-col items-center justify-center`,
        title: 'text-2xl md:text-4xl font-bold leading-tight mb-2',
        description: 'text-sm md:text-base opacity-90 mb-6 max-w-lg mx-auto',
        button: 'px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-transform hover:scale-105 active:scale-95 shadow-lg'
    };
};

// ============================================================================
// FACTORY: Cria o Objeto de Tema Completo
// ============================================================================
const createThemeFromToken = (token: PopupThemeToken): PopupThemeDef => {
    const styles = generateThemeStyles(token);

    // Ajustes finos de cores baseados em classes utilitárias onde possível
    // Para maior fidelidade, o PromoPopupView deve usar as cores do token (colors) via style={}

    return {
        id: token.id,
        name: token.name,
        category: 'Moderno',
        layout: token.layout,
        styles: {
            ...styles,
            // Injeção de cores específicas via classes utilitárias construtivas
            // Isso é um fallback, o ideal é o componente View usar style={{ color: token.colors.title }}
            container: `${styles.container}`,
            closeBtn: `absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors`,
        },
        colors: token.colors,
        specialEffect: token.specialEffect,
        headerAccent: token.defaults.headerAccent,
        buttonPosition: token.buttonPosition || 'bottom'
    };
};

// ============================================================================
// PUBLIC API
// ============================================================================
export const getThemeById = (id: string | undefined): PopupThemeDef => {
    const token = POPUP_THEME_CATALOG.find(t => t.id === id) || POPUP_THEME_CATALOG[0];
    const themeDef = createThemeFromToken(token);

    // Inject color overrides into the returned object if needed by the consumer
    // Mas o PromoPopupView atual lê 'styles', nós vamos injetar as cores via style prop lá?
    // Não, o PromoPopupView lê config.colors ou fallback. 
    // Vamos garantir que ele use as cores do tema.

    return themeDef;
};

export const POPUP_THEMES = POPUP_THEME_CATALOG.map(createThemeFromToken);
