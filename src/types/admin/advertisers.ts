/**
 * Tipos para componentes de Advertisers (Anunciantes)
 * @module types/admin/advertisers
 */

export interface BannerTabType {
    id: 'media' | 'text' | 'button';
    label: string;
}

export interface AdvertiserFormData {
    promotionType: 'banner' | 'popup' | 'sponsored';
    displayLocations: string[];
    mediaType: 'image' | 'video' | 'sequence';
    internal: InternalPageConfig;
}

export interface InternalPageConfig {
    enabled: boolean;
    targetPage: string;
    openInNewTab: boolean;
}

export interface PlanConfig {
    id: string;
    name: string;
    features: PlanFeature[];
    pricing: PlanPricing;
}

export interface PlanFeature {
    id: string;
    name: string;
    enabled: boolean;
    limit?: number;
}

export interface PlanPricing {
    monthly: number;
    quarterly: number;
    annual: number;
}

export type AdvertiserFilterType = 'all' | 'active' | 'paused' | 'expired';

export interface InternalPageData {
    description: string;
    products: unknown[];
    whatsapp: string;
    instagram: string;
    tiktok?: string;
    kwai?: string;
    telegram?: string;
    location: string;
}
