
import { 
    PromoPopupItemConfig, 
    PromoPopupSetConfig, 
    PopupFilterId, 
    PopupImagePresentation, 
    PopupSize,
    PopupMediaConfig,
    PopupImageStyle,
    PopupVideoSettings,
    PopupEffectConfig,
    PopupTargetPage
} from '../types';

// --- CONSTANTES DE SEGURANÇA E LIMITES ---
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_ITEMS_PER_SET = 24; // ATUALIZADO: 3 slides x 8 locais possíveis
export const MAX_IMAGES_PER_ITEM = 3;

const TEXT_LIMITS = {
    title: 120,
    body: 800,
    ctaText: 40
};

// --- LISTAS DE VALORES PERMITIDOS (Allowlists) ---
const VALID_FILTERS: PopupFilterId[] = ['none', 'grayscale', 'sepia', 'saturate', 'contrast', 'brightness', 'blur', 'vintage'];
const VALID_PRESENTATIONS: PopupImagePresentation[] = ['hero_single', 'split_2col', 'collage_3', 'stack_cards', 'mini_slider'];
const VALID_SIZES: PopupSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'fullscreen', 'banner_top', 'banner_bottom', 'sidebar_left', 'sidebar_right'];
const VALID_TARGETS: PopupTargetPage[] = ['home', 'news_detail', 'jobs_board', 'advertiser_page', 'login_register', 'user_profile', 'admin_area', 'all'];

// --- UTILITÁRIOS DE SANITIZAÇÃO ---

/**
 * Verifica se uma URL é segura para uso em href ou src.
 * Bloqueia javascript:, data:, file: e vbscript:.
 */
export const isSafeUrl = (url: string | undefined | null): boolean => {
    if (!url || url.trim() === '') return false; // Vazio não é seguro para renderizar
    
    const lower = url.trim().toLowerCase();
    
    // Lista negra de protocolos perigosos (XSS vectors)
    const blockedProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
    if (blockedProtocols.some(p => lower.startsWith(p))) return false;

    return true; 
};

/**
 * Remove caracteres de controle perigosos e limita o tamanho do texto.
 */
export const sanitizeText = (str: string | undefined | null): string => {
    if (!str) return '';
    // Remove caracteres de controle não imprimíveis (exceto newline e tab)
    // eslint-disable-next-line no-control-regex
    return str.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "").trim();
};

/**
 * Clampa o texto ao tamanho máximo e aplica sanitização.
 */
export const clampText = (str: string | undefined, max: number): string => {
    const clean = sanitizeText(str);
    if (clean.length <= max) return clean;
    return clean.slice(0, max);
};

// --- DEFAULTS SEGUROS ---

const DEFAULT_TEXT_STYLE = {
    fontFamily: 'Inter, sans-serif',
    titleSize: '2xl',
    bodySize: 'md',
    titleColor: '#000000',
    bodyColor: '#4b5563'
};

const DEFAULT_IMAGE_STYLE: PopupImageStyle = {
    fit: 'cover',
    focusPoint: 'center',
    borderRadius: 'none',
    borderStyle: 'none',
    shadow: 'none',
    overlayPreset: 'none',
    overlayIntensity: 0,
    filterId: 'none',
    filterVariant: 'soft'
};

const DEFAULT_VIDEO_SETTINGS: PopupVideoSettings = {
    muted: true,
    loop: true,
    autoplay: true,
    fit: 'cover',
    zoomMotion: 'off',
    borderRadius: 'none',
    borderStyle: 'none',
    shadow: 'none',
    overlayPreset: 'none',
    filterId: 'none',
    filterVariant: 'soft',
    framePreset: 'clean_border'
};

/**
 * Fix: PopupEffectConfig initialization now correctly handles 'direction'.
 */
const DEFAULT_EFFECT_CONFIG: PopupEffectConfig = {
    enabled: false,
    type: 'none',
    intensity: 'normal',
    placement: 'over_media',
    direction: 'top_bottom',
    opacity: 100
};

const DEFAULT_ITEM: PromoPopupItemConfig = {
    id: '',
    active: true,
    title: 'Novo Destaque',
    body: '',
    ctaText: 'Saiba Mais',
    ctaUrl: '',
    targetPages: ['home', 'news_detail'],
    filterId: 'none',
    themePresetId: 'classic_default',
    popupSizePreset: 'md',
    textStyle: DEFAULT_TEXT_STYLE,
    media: {
        images: [],
        imagePresentation: 'hero_single',
        imageStyle: DEFAULT_IMAGE_STYLE,
        videoUrl: '',
        videoSettings: DEFAULT_VIDEO_SETTINGS,
        videoMuted: true,
        videoLoop: true,
        videoFit: 'cover',
        videoZoom: false
    },
    effectConfig: DEFAULT_EFFECT_CONFIG
};

// --- NORMALIZADORES (CORE LOGIC) ---

interface NormalizationResult<T> {
    normalized: T;
    warnings: string[];
}

/**
 * Normaliza um único item de popup, aplicando regras de negócio e segurança.
 * Preenche campos faltantes com defaults.
 */
export const normalizePopupItem = (input: Partial<PromoPopupItemConfig>): NormalizationResult<PromoPopupItemConfig> => {
    const warnings: string[] = [];
    const safeId = input.id || Math.random().toString(36).substr(2, 9);

    // 1. Textos
    const title = clampText(input.title, TEXT_LIMITS.title);
    if (input.title && input.title.length > TEXT_LIMITS.title) warnings.push(`Título cortado em ${TEXT_LIMITS.title} caracteres.`);

    const body = clampText(input.body, TEXT_LIMITS.body);
    if (input.body && input.body.length > TEXT_LIMITS.body) warnings.push(`Corpo do texto cortado em ${TEXT_LIMITS.body} caracteres.`);

    const ctaText = clampText(input.ctaText, TEXT_LIMITS.ctaText);
    
    // 2. URLs
    let ctaUrl = sanitizeText(input.ctaUrl);
    if (!isSafeUrl(ctaUrl)) {
        ctaUrl = '';
        if (input.ctaUrl) warnings.push("URL do botão removida por segurança (protocolo inválido).");
    }

    // 3. Mídia
    const inputMedia: Partial<PopupMediaConfig> = input.media || {};
    let images = inputMedia.images || [];
    
    if (images.length > MAX_IMAGES_PER_ITEM) {
        images = images.slice(0, MAX_IMAGES_PER_ITEM);
        warnings.push(`Máximo de ${MAX_IMAGES_PER_ITEM} imagens permitido. O excesso foi removido.`);
    }
    
    // Filtra URLs de imagem inseguras
    const safeImages = images.filter(img => {
        const safe = isSafeUrl(img);
        if (!safe) warnings.push("Uma imagem foi removida por conter URL insegura.");
        return safe;
    });

    let videoUrl = sanitizeText(inputMedia.videoUrl);
    if (videoUrl && !isSafeUrl(videoUrl)) {
        videoUrl = '';
        if (inputMedia.videoUrl) warnings.push("URL de vídeo removida por segurança.");
    }

    // 4. Enums & Validações de Estilo
    const filterId = VALID_FILTERS.includes(input.filterId as any) ? input.filterId as PopupFilterId : 'none';
    const popupSizePreset = VALID_SIZES.includes(input.popupSizePreset as any) ? input.popupSizePreset as PopupSize : 'md';
    const imagePresentation = VALID_PRESENTATIONS.includes(inputMedia.imagePresentation as any) ? inputMedia.imagePresentation as PopupImagePresentation : 'hero_single';

    // 5. Target Pages Sanitization
    let targetPages = input.targetPages || ['home', 'news_detail'];
    targetPages = targetPages.filter(t => VALID_TARGETS.includes(t));
    if (targetPages.length === 0) targetPages = ['home'];

    const normalizedImageStyle: PopupImageStyle = {
        ...DEFAULT_IMAGE_STYLE,
        ...(inputMedia.imageStyle || {})
    };

    const normalizedVideoSettings: PopupVideoSettings = {
        ...DEFAULT_VIDEO_SETTINGS,
        ...(inputMedia.videoSettings || {})
    };

    /**
     * Fix: Ensure effectConfig normalization handles updated PopupEffectConfig interface correctly.
     */
    const normalizedEffectConfig: PopupEffectConfig = {
        ...DEFAULT_EFFECT_CONFIG,
        ...(input.effectConfig || {})
    };

    // Montagem Final Segura
    const normalized: PromoPopupItemConfig = {
        id: safeId,
        active: input.active ?? true,
        title: title || DEFAULT_ITEM.title,
        body: body,
        ctaText: ctaText,
        ctaUrl: ctaUrl,
        targetPages,
        filterId: filterId,
        themePresetId: input.themePresetId || 'classic_default',
        popupSizePreset: popupSizePreset,
        textStyle: {
            fontFamily: input.textStyle?.fontFamily || DEFAULT_TEXT_STYLE.fontFamily,
            titleSize: input.textStyle?.titleSize || DEFAULT_TEXT_STYLE.titleSize,
            bodySize: input.textStyle?.bodySize || DEFAULT_TEXT_STYLE.bodySize,
            titleColor: input.textStyle?.titleColor || DEFAULT_TEXT_STYLE.titleColor,
            bodyColor: input.textStyle?.bodyColor || DEFAULT_TEXT_STYLE.bodyColor,
        },
        media: {
            images: safeImages,
            imagePresentation: imagePresentation,
            imageStyle: normalizedImageStyle,
            videoUrl: videoUrl,
            videoSettings: normalizedVideoSettings,
            videoMuted: inputMedia.videoMuted ?? true,
            videoLoop: inputMedia.videoLoop ?? true,
            videoZoom: inputMedia.videoZoom ?? false,
            videoFit: inputMedia.videoFit === 'contain' ? 'contain' : 'cover'
        },
        effectConfig: normalizedEffectConfig
    };

    return { normalized, warnings };
};

/**
 * Normaliza um conjunto completo de popups (Set).
 */
export const normalizePopupSet = (input: Partial<PromoPopupSetConfig>): NormalizationResult<PromoPopupSetConfig> => {
    const warnings: string[] = [];
    let items = input.items || [];

    // 1. Limite de Items
    if (items.length > MAX_ITEMS_PER_SET) {
        items = items.slice(0, MAX_ITEMS_PER_SET);
        warnings.push(`O conjunto excedeu ${MAX_ITEMS_PER_SET} popups. Itens excedentes foram removidos.`);
    }

    // 2. Normaliza cada item individualmente
    const normalizedItems: PromoPopupItemConfig[] = [];
    
    items.forEach((item, index) => {
        const result = normalizePopupItem(item);
        normalizedItems.push(result.normalized);
        
        // Adiciona prefixo aos warnings para identificar o item
        result.warnings.forEach(w => {
            warnings.push(`Item ${index + 1} ("${result.normalized.title}"): ${w}`);
        });
    });

    return {
        normalized: { items: normalizedItems },
        warnings
    };
};
