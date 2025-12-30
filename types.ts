
export type UserRole = 'Desenvolvedor' | 'Editor-Chefe' | 'Repórter' | 'Jornalista' | 'Estagiário' | 'Anunciante';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string; 
  avatar?: string;
  password?: string;
  bio?: string;
  themePreference?: 'light' | 'dark';
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  permissions?: Record<string, boolean>;
  advertiserPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  twoFactorEnabled?: boolean;
}

export type PostStatus = 'draft' | 'in_review' | 'needs_changes' | 'approved' | 'scheduled' | 'published' | 'archived';

// OS 10 TIPOS DE ENGAJAMENTO LFNM
export type EngagementType = 
  | 'poll'          // 1. Enquete Tradicional
  | 'battle'        // 2. Batalha A/B
  | 'quiz'          // 3. Quiz (Certo/Errado)
  | 'reactions'     // 4. Reações Emojis
  | 'thermometer'   // 5. Termômetro
  | 'rating'        // 6. Estrelas
  | 'counter'       // 7. Like Viral (Coração)
  | 'visual_vote'   // 8. Votação Galeria
  | 'prediction'    // 9. Palpite/Bolão
  | 'impact_ask';   // 10. Sim/Não Gigante

export type GalleryStyle = 'hero_slider' | 'news_mosaic' | 'filmstrip' | 'comparison' | 'masonry' | 'stories_scroll' | 'card_peek';

export type VideoStyle = 'clean' | 'cinema' | 'shorts' | 'news_card' | 'native';

export interface VideoChapter {
    time: string;
    label: string;
}

export interface GalleryItem {
    id: string;
    url: string;
    caption?: string;
    alt?: string;
}

export interface NewsVersion {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
    editorName: string;
}

export interface SocialDistribution {
    platform: 'instagram_feed' | 'instagram_stories' | 'facebook' | 'whatsapp' | 'linkedin' | 'tiktok' | 'youtube';
    status: 'pending' | 'posted' | 'failed';
    content: string;
    postedAt?: string;
}

export interface WebhookPayload {
    event: string;
    timestamp: string;
    data: {
        id: string;
        title: string;
        url: string;
        imageUrl: string;
        socialText: string;
        author: string;
    };
}

export type AdPlan = string;
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
export type PromotionStyle = 'default' | 'sale' | 'flash' | 'bogo';

export interface AdvertiserProduct {
    id: string;
    name: string;
    price?: string;
    originalPrice?: string;
    promotionStyle?: PromotionStyle;
    description?: string;
    imageUrl?: string;
}

export interface Coupon {
    id: string;
    code: string;
    discount: string;
    description: string;
    active: boolean;
}

export interface AdPlanConfig {
    id: string;
    name: string;
    prices: Record<BillingCycle, number>;
    description: string;
    features: {
        placements: string[];
        canCreateJobs: boolean;
        maxProducts: number;
        socialVideoAd: boolean;
        videoLimit?: number;
        socialFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
        allowedSocialNetworks: string[];
        hasInternalPage: boolean;
    };
    cashbackPercent?: number;
    isPopular?: boolean;
}

export interface Invoice {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
}

export interface UserSession {
    id: string;
    device: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
}

export interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'gallery' | 'carousel' | 'quote' | 'separator' | 'cta' | 'ad' | 'related' | 'table' | 'list' | 'smart_block' | 'engagement';
  content: any; 
  settings: any;
}

export interface NewsItem {
  id: string;
  status: PostStatus;
  title: string;
  lead: string;
  content: string; 
  blocks?: ContentBlock[]; 
  category: string;
  authorId: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  imageUrl: string; 
  bannerMediaType: 'image' | 'video'; 
  bannerImages?: string[]; 
  bannerVideoUrl?: string;
  isBannerAnimated?: boolean;
  imageCredits: string;
  mediaType: 'image' | 'video';
  videoUrl?: string;
  galleryUrls?: string[];
  city: string;
  region: string;
  isBreaking: boolean;
  isFeatured: boolean;
  featuredPriority: number;
  seo: {
    slug: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    canonicalUrl?: string;
  };
  source: 'site' | 'instagram' | 'press_release' | 'rss_automation';
  views?: number;
  versions?: NewsVersion[];
  socialDistribution?: SocialDistribution[];
}

export interface SiteData {
    news: NewsItem[];
    advertisers: Advertiser[];
    users: User[];
    jobs: Job[];
}

export interface Advertiser {
    id: string;
    name: string;
    category: string;
    plan: AdPlan;
    billingCycle: BillingCycle;
    startDate: string;
    endDate: string;
    isActive: boolean;
    views: number;
    clicks: number;
    logoUrl?: string;
    logoIcon?: string;
    bannerUrl?: string;
    redirectType: 'internal' | 'external';
    externalUrl?: string;
    coupons?: Coupon[];
    internalPage?: {
        description: string;
        location?: string;
        whatsapp?: string;
        instagram?: string;
        products: AdvertiserProduct[];
    };
}

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

export interface AdPricingConfig {
    plans: AdPlanConfig[];
    promoText: string;
    active: boolean;
}

export interface SystemSettings {
  jobsModuleEnabled: boolean;
  enableOmnichannel: boolean;
  supabase?: { url: string; anonKey: string; };
  socialWebhookUrl?: string;
}

export interface AuditLog {
    userId: string;
    userName: string;
    action: string;
    entityId: string;
    details: string;
    timestamp: string;
}
