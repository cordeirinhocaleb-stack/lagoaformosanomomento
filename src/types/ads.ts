
export type AdPlan = string;
export type BillingCycle = 'single' | 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';

export interface AdPlanConfig {
    id: string;
    name: string;
    description: string;
    prices: Record<BillingCycle, number>;
    features: {
        placements: string[];
        canCreateJobs: boolean;
        maxProducts: number;
        socialVideoAd: boolean;
        videoLimit: number;
        socialFrequency: string;
        allowedSocialNetworks: string[];
        hasInternalPage: boolean;
    };
    cashbackPercent: number;
    isPopular: boolean;
}

export type BannerLayout = 'single' | 'split' | 'mosaic' | 'grid' | 'pentagon';
export type BannerTransition = 'fade' | 'slide' | 'zoom' | 'none';
export type BannerTextPositionPreset = 'gradient_bottom_left' | 'glass_center' | 'solid_right_bar' | 'floating_box_top_left' | 'hero_centered_clean' | 'floating_bottom_right' | 'newspaper_clipping' | 'vertical_sidebar_left' | 'full_overlay_impact' | 'tv_news_bottom_bar';

export interface PromoBanner {
    id: string;
    type: 'image' | 'video';
    image?: string;
    images?: string[];
    videoUrl?: string;
    layout: 'classic' | 'split' | 'mosaic' | 'grid' | 'pentagon';
    align: 'left' | 'right' | 'center';
    overlayOpacity: number;
    tag: string;
    title: string;
    description: string;
    buttonText: string;
    link: string;
    active: boolean;
    redirectType?: 'external' | 'whatsapp' | 'instagram' | 'tiktok' | 'kwai' | 'telegram';
    textPositionPreset?: BannerTextPositionPreset;
    buttonConfig?: {
        label: string;
        link: string;
        style: 'solid' | 'outline' | 'glass';
        size: 'sm' | 'md' | 'lg' | 'xl';
        rounded: 'none' | 'md' | 'full';
        effect: 'none' | 'pulse' | 'shine' | 'bounce';
    };
    textConfig?: {
        titleSize: 'md' | 'lg' | 'xl' | '2xl';
        titleShadow: 'none' | 'soft' | 'strong';
        descriptionVisible: boolean;
        fontFamily: string;
        customColor: string;
    };
    // Image adjustment properties
    imagePositionX?: number;
    imagePositionY?: number;
    imageScale?: number;
    imagePosition?: string;
    fit?: 'cover' | 'contain';
    advertiserId?: string;
}

export interface AdvertiserProduct {
    id: string;
    name: string;
    price?: string;
    description?: string;
    imageUrl?: string;
    promotionStyle?: 'default' | 'sale';
}

export interface Coupon {
    id: string;
    code: string;
    discount: string;
    description: string;
    active: boolean;
}

// Popup Types
export type PopupSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fullscreen' | 'banner_top' | 'banner_bottom' | 'sidebar_left' | 'sidebar_right';
export type PopupTargetPage = 'home' | 'news_detail' | 'jobs_board' | 'advertiser_page' | 'login_register' | 'user_profile' | 'admin_area' | 'all';
export type PopupFilterId = 'none' | 'grayscale' | 'sepia' | 'saturate' | 'contrast' | 'brightness' | 'blur' | 'vintage';
export type PopupImagePresentation = 'hero_single' | 'split_2col' | 'collage_3' | 'stack_cards' | 'mini_slider';
export type MediaThemeId = 'clean_minimal' | 'premium_glass' | 'neon_urban' | 'cinema_dark' | 'newspaper_classic' | 'warm_local' | 'tech_blue' | 'alert_red' | 'soft_pastel' | 'gold_lux' | 'mono_editorial' | 'sports_energy';
export type VideoFramePresetId = 'clean_border' | 'clean_shadow' | 'glass_card' | 'floating_glow' | 'editorial_frame' | 'rounded_modern' | 'bold_border' | 'minimal_corner';
export type PopupOverlayPreset = 'none' | 'dark_soft' | 'dark_strong' | 'bottom_gradient' | 'top_gradient' | 'vignette_soft' | 'vignette_strong' | 'glass_blur_soft' | 'glass_blur_strong' | 'color_brand_tint';
export type PopupMediaFilter = 'none' | 'grayscale' | 'sepia' | 'saturate' | 'contrast' | 'brightness' | 'blur' | 'vintage';
export type PopupMediaFilterVariant = 'soft' | 'strong';

export interface PopupTextStyle {
    fontFamily: string;
    titleSize: string;
    bodySize: string;
    titleColor: string;
    bodyColor: string;
    buttonColor?: string;
    buttonTextColor?: string;
    titleWeight?: string;
    bodyWeight?: string;
    titleTransform?: 'none' | 'uppercase' | 'lowercase';
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: string;
    textShadow?: 'none' | 'soft' | 'strong';
    buttonRounded?: 'none' | 'md' | 'full';
    buttonStyle?: 'solid' | 'outline' | 'glass';
    themeColorMode?: 'light' | 'dark' | 'auto';
}

export interface PopupImageStyle {
    fit: 'cover' | 'contain';
    focusPoint: 'center' | 'top' | 'bottom' | 'left' | 'right';
    borderRadius: 'none' | 'soft' | 'strong';
    borderStyle: 'none' | 'thin' | 'bold';
    shadow: 'none' | 'soft' | 'strong';
    overlayPreset: string;
    overlayIntensity: number;
    filterId: PopupFilterId;
    filterVariant: PopupMediaFilterVariant;
    posX?: number;
    posY?: number;
    scale?: number;
}

export interface PopupVideoSettings {
    muted: boolean;
    loop: boolean;
    autoplay: boolean;
    fit: 'cover' | 'contain';
    zoomMotion: 'off' | 'soft' | 'strong';
    borderRadius: 'none' | 'soft' | 'strong';
    borderStyle: 'none' | 'thin' | 'bold';
    shadow: 'none' | 'soft' | 'strong';
    overlayPreset: string;
    filterId: PopupFilterId;
    filterVariant: PopupMediaFilterVariant;
    framePreset: string;
    closeButtonStyle?: 'x' | 'circle' | 'square';
}

export type PopupEffectDirection = 'top_bottom' | 'bottom_top' | 'left_right' | 'right_left' | 'random';

export interface PopupEffectConfig {
    enabled: boolean;
    type: string;
    intensity: 'low' | 'normal' | 'high';
    placement: 'background' | 'over_media' | 'screen_overlay';
    direction?: PopupEffectDirection;
    color?: string;
    opacity: number;
}

export interface PopupThemeAdvanced {
    surfaceStyle: 'solid' | 'glass' | 'flat' | 'outline';
    borderRadius: 'none' | 'soft' | 'strong' | 'full';
    shadow: 'none' | 'soft' | 'strong' | 'glow';
    backdrop: 'none' | 'dim_soft' | 'dim_strong' | 'blur_soft';
    headerAccent: 'none' | 'top_bar' | 'left_bar' | 'badge';
    spacing: 'compact' | 'normal' | 'comfortable';
}

export interface PopupMediaConfig {
    images: string[];
    imagePresentation: PopupImagePresentation;
    imageStyle: PopupImageStyle;
    videoUrl: string;
    videoSettings: PopupVideoSettings;
    videoZoom?: boolean;
    logoUrl?: string;
    backgroundUrl?: string;
}

export interface PromoPopupItemConfig {
    id: string;
    active: boolean;
    title: string;
    body: string;
    ctaText: string;
    ctaUrl: string;
    targetPages: PopupTargetPage[];
    filterId: PopupFilterId;
    filterVariant?: PopupMediaFilterVariant;
    themePresetId: string;
    popupSizePreset: PopupSize;
    textStyle: PopupTextStyle;
    media: PopupMediaConfig;
    themeAdvanced?: PopupThemeAdvanced;
    effectConfig?: PopupEffectConfig;
    // New Content Fields
    subtitle?: string;
    badgeText?: string;
    smallNote?: string;
    // Targeting & Triggering
    displayMode?: 'onPageLoad' | 'afterSeconds' | 'onScrollPercent' | 'exitIntent' | 'manual';
    displayDelay?: number; // seconds or percent
    frequency?: 'once_per_session' | 'once_per_day' | 'always';
    deviceTarget?: 'mobile' | 'desktop' | 'all';
    // Legacy support
    shape?: any;
    position?: any;
    overlay?: any;
    animation?: any;
    advertiserInfo?: AdvertiserInfoSummary;
}

export interface AdvertiserInfoSummary {
    id: string;
    name: string;
    phone?: string;
    whatsapp?: string; // derived from phone or separate
    whatsappMessage?: string;
    address?: string;
    logoUrl?: string;
    category?: string;
    location?: string; // from internalPage?
}

export interface PromoPopupSetConfig {
    items: PromoPopupItemConfig[];
}

export interface PromoPopupConfig {
    active: boolean;
    frequency: 'once_per_session' | 'once_per_day' | 'always';
    theme: string;
    title: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaUrl: string;
    images?: string[];
    buttonText: string;
    buttonLink: string;
    targetPages: PopupTargetPage[];
    shape?: 'default' | 'square' | 'rounded' | 'circle' | 'leaf' | 'heart' | 'hexagon';
    size?: PopupSize;
    position?: 'center' | 'top-center' | 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-left' | 'top-right' | 'center-left' | 'center-right';
    overlay?: 'dark' | 'transparent' | 'blur';
    animation?: 'zoom' | 'fade' | 'slide-up' | 'slide-in-right' | 'slide-in-left';
    fontFamily?: string;
    fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    mediaThemeId?: string;
    overlayPreset?: string;
    videoFramePreset?: string;
    mediaFilter?: PopupMediaFilter;
    mediaFilterVariant?: PopupMediaFilterVariant;
    imagePresentation?: PopupImagePresentation;
    subtitle?: string;
    logoUrl?: string;
    smallNote?: string;
    badgeText?: string;
    textStyle?: PopupTextStyle;
    closeButtonStyle?: 'x' | 'circle' | 'square';
    media?: PopupMediaConfig;
    colors?: {
        background: string;
        text: string;
        buttonBg: string;
        buttonText: string;
    };
}

export interface Advertiser {
    id: string;
    name: string;
    category: string;
    // Basic contact information
    address?: string;
    phone?: string;
    email?: string;
    cpfCnpj?: string;
    // Media
    logoUrl?: string;
    logoUrls?: string[];
    transitionType?: 'fade' | 'slide' | 'zoom' | 'none';
    videoUrl?: string;
    mediaType?: 'image' | 'video' | 'mixed';
    logoIcon?: string;
    bannerUrl?: string;
    // Contract details
    plan: string;
    billingCycle: BillingCycle;
    startDate: string;
    endDate: string;
    isActive: boolean;
    contractDuration?: number; // Duração em meses (para cálculo de total)
    isPaid?: boolean; // Payment status

    // Billing Info (boleto simples)
    billingValue?: number;
    billingDueDate?: string;
    billingStatus?: 'pending' | 'paid' | 'overdue' | 'cancelled';
    billingObs?: string;
    billingBarCode?: string;
    installments?: number;
    interestRate?: number;
    interestFreeInstallments?: number;
    lateFee?: number;
    dailyInterest?: number;
    totalWithInterest?: number;

    views: number;
    clicks: number;
    redirectType: 'external' | 'whatsapp' | 'instagram' | 'tiktok' | 'kwai' | 'telegram';
    externalUrl?: string;
    internalPage?: {
        description: string;
        products: AdvertiserProduct[];
        whatsapp: string;
        whatsappMessage?: string;
        instagram: string;
        tiktok?: string;
        kwai?: string;
        telegram?: string;
        location: string;
    };
    coupons?: Coupon[];
    ownerId: string;
    popupSet?: PromoPopupSetConfig;
    promoBanners?: PromoBanner[];
    displayLocations?: string[];
}

export interface AdPricingConfig {
    plans: AdPlanConfig[];
    promoText: string;
    active: boolean;
    promoBanners?: PromoBanner[];
    boostsValues?: Record<string, number>; // Preços customizáveis dos itens avulsos
}

export const DEFAULT_THEME_ADVANCED: PopupThemeAdvanced = {
    surfaceStyle: 'solid',
    borderRadius: 'soft',
    shadow: 'soft',
    backdrop: 'dim_soft',
    headerAccent: 'none',
    spacing: 'normal'
};

export const DEFAULT_POPUP_ITEM: PromoPopupItemConfig = {
    id: '',
    active: true,
    title: 'Promo Relâmpago',
    body: '',
    ctaText: 'Saiba Mais',
    ctaUrl: '',
    targetPages: ['home', 'news_detail'],
    filterId: 'none',
    themePresetId: 'retail_flash_sale',
    popupSizePreset: 'md',
    textStyle: {
        fontFamily: 'Inter',
        titleSize: '2xl',
        bodySize: 'md',
        titleColor: '#000000',
        bodyColor: '#4b5563'
    },
    media: {
        images: [],
        imagePresentation: 'hero_single',
        imageStyle: {
            fit: 'cover',
            focusPoint: 'center',
            borderRadius: 'none',
            borderStyle: 'none',
            shadow: 'none',
            overlayPreset: 'none',
            overlayIntensity: 0,
            filterId: 'none',
            filterVariant: 'soft'
        },
        videoUrl: '',
        videoSettings: {
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
        }
    },
    effectConfig: {
        enabled: false,
        type: 'none',
        intensity: 'normal',
        placement: 'over_media',
        direction: 'top_bottom',
        opacity: 100
    }
};
