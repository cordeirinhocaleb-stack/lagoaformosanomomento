
export type UserRole = 'Desenvolvedor' | 'Editor-Chefe' | 'Repórter' | 'Jornalista' | 'Estagiário' | 'Anunciante';
export type UserStatus = 'active' | 'suspended';
export type PostStatus = 'draft' | 'in_review' | 'needs_changes' | 'approved' | 'scheduled' | 'published' | 'archived';

// Added missing AdPlan type
export type AdPlan = 'master' | 'premium' | 'standard';
// Added missing BillingCycle type
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
// Added missing PromotionStyle type
export type PromotionStyle = 'default' | 'sale' | 'flash' | 'bogo';

// 10 ESTILOS EDITORIAIS CAMALEÃO
export type EditorialStyle = 
  | 'newspaper_standard' 
  | 'breaking_alert' 
  | 'impact_quote' 
  | 'footnote' 
  | 'hero_headline' 
  | 'checklist_pro' 
  | 'police_siren' 
  | 'tech_neon' 
  | 'vintage_letter' 
  | 'executive_summary';

// Extended GalleryStyle with missing values
export type GalleryStyle = 
  | 'hero_slider' 
  | 'news_mosaic' 
  | 'masonry' 
  | 'filmstrip' 
  | 'comparison' 
  | 'stories_scroll' 
  | 'card_peek'
  | '3d_cube'
  | 'coverflow'
  | 'polaroid_stack'
  | 'honeycomb'
  | 'ken_burns'
  | 'magazine_spread';

export type VideoStyle = 'clean' | 'cinema' | 'shorts_wrapper' | 'tv_news' | 'pip_floating' | 'retro_tv';
export type EngagementType = 'poll' | 'battle' | 'quiz' | 'reactions' | 'thermometer' | 'rating' | 'counter' | 'visual_vote' | 'prediction' | 'impact_ask';

// Added missing NewsVersion interface
export interface NewsVersion {
  id: string;
  title: string;
  content: any;
  updatedAt: string;
  authorName: string;
}

// Added missing SocialDistribution interface
export interface SocialDistribution {
  platform: 'instagram_feed' | 'instagram_stories' | 'facebook' | 'whatsapp' | 'linkedin' | 'tiktok';
  status: 'pending' | 'posted' | 'failed';
  content: string;
  postedAt?: string;
}

// Added missing GalleryItem interface
export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'gallery' | 'quote' | 'list' | 'separator' | 'engagement' | 'smart_block' | 'cta' | 'related' | 'table';
  content: any;
  settings: {
    editorialStyle?: EditorialStyle;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    width?: 'full' | '3/4' | '1/2' | '1/3' | '1/4';
    pulseEnabled?: boolean;
    isUppercase?: boolean;
    neonColor?: string;
    zebraStripes?: boolean;
    paperTexture?: boolean;
    fontSize?: number;
    shadowDepth?: number;
    borderWeight?: number;
    style?: string;
    caption?: string;
    engagementType?: EngagementType;
    [key: string]: any;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatar?: string;
  themePreference?: 'light' | 'dark';
  bio?: string;
  advertiserPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  permissions?: Record<string, boolean>;
}

// Updated NewsItem to include missing properties used in components and services
export interface NewsItem {
  id: string;
  status: PostStatus;
  title: string;
  lead: string;
  category: string;
  blocks: ContentBlock[];
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  bannerMediaType: 'image' | 'video';
  city: string;
  region: string;
  isBreaking: boolean;
  isFeatured: boolean;
  featuredPriority: number;
  seo: { slug: string; metaTitle: string; metaDescription: string; };
  source: 'site' | 'instagram' | 'rss_automation';
  views?: number;
  socialDistribution?: SocialDistribution[];
  videoUrl?: string;
  galleryUrls?: string[];
  imageCredits?: string;
  isBannerAnimated?: boolean;
  bannerImages?: string[];
  bannerVideoUrl?: string;
  content?: string;
}

// Added missing AdvertiserProduct interface
export interface AdvertiserProduct {
    id: string;
    name: string;
    price?: string;
    originalPrice?: string;
    promotionStyle?: PromotionStyle;
    description?: string;
    imageUrl?: string;
}

// Added missing Coupon interface
export interface Coupon {
    id: string;
    code: string;
    discount: string;
    description: string;
    active: boolean;
}

// Updated Advertiser to include missing properties used in services and admin panel
export interface Advertiser {
    id: string;
    name: string;
    category: string;
    plan: string;
    isActive: boolean;
    views: number;
    clicks: number;
    logoUrl?: string;
    logoIcon?: string;
    bannerUrl?: string;
    redirectType: 'internal' | 'external';
    externalUrl?: string;
    internalPage?: { description: string; products: AdvertiserProduct[]; whatsapp?: string; instagram?: string; location?: string; };
    startDate: string;
    endDate: string;
    billingCycle: BillingCycle;
    coupons?: Coupon[];
}

// Updated AdPlanConfig to include missing features properties
export interface AdPlanConfig {
    id: string;
    name: string;
    prices: Record<string, number>;
    description?: string;
    cashbackPercent?: number;
    isPopular?: boolean;
    features: { 
        placements: string[]; 
        canCreateJobs: boolean; 
        maxProducts: number; 
        socialVideoAd: boolean; 
        allowedSocialNetworks: string[]; 
        hasInternalPage: boolean; 
        videoLimit?: number; 
        socialFrequency?: string; 
    };
}

export interface AdPricingConfig { plans: AdPlanConfig[]; promoText: string; active: boolean; }

// Added missing Job interface
export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary?: string;
    description: string;
    whatsapp: string;
    postedAt: string;
    isActive: boolean;
}

// Added missing WebhookPayload interface
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

// Added missing AuditLog interface
export interface AuditLog {
    id?: string;
    userId: string;
    userName: string;
    action: string;
    entityId: string;
    details: string;
    timestamp: string;
}

// Added missing Invoice interface
export interface Invoice {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'pending' | 'canceled';
}

// Added missing UserSession interface
export interface UserSession {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
}

// Added missing SiteData interface
export interface SiteData {
    news: NewsItem[];
    advertisers: Advertiser[];
    users: User[];
    jobs: Job[];
}

export interface SystemSettings { jobsModuleEnabled: boolean; enableOmnichannel: boolean; supabase?: { url: string; anonKey: string; }; socialWebhookUrl?: string; }
