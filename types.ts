
export type UserRole = 'Desenvolvedor' | 'Editor-Chefe' | 'Repórter' | 'Jornalista' | 'Estagiário' | 'Anunciante';

export type PostStatus = 'draft' | 'in_review' | 'needs_changes' | 'approved' | 'scheduled' | 'published' | 'archived';

// AdPlan agora é apenas um alias para string (ID do plano), pois os planos são dinâmicos
export type AdPlan = string;

export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';

export interface SystemSettings {
  jobsModuleEnabled: boolean;
  enableOmnichannel: boolean; // Novo flag para controlar publicação em massa
  supabase?: {
    url: string;
    anonKey: string;
  };
  // Deprecated Nhost config kept for compatibility if needed during migration, but should be removed
  nhost?: {
    subdomain: string;
    region: string;
  };
  socialWebhookUrl?: string; // URL para disparo omnichannel (Make/Zapier)
}

export interface AdPlanPrices {
  daily: number;
  weekly: number; // Nova opção semanal
  monthly: number;
  quarterly: number;
  semiannual: number;
  yearly: number;
}

export interface AdPlanFeatures {
  placements: ('master_carousel' | 'live_tab' | 'sidebar' | 'standard_list')[]; // Alterado para array de locais
  canCreateJobs: boolean;
  maxProducts: number; // 0 = ilimitado
  socialVideoAd: boolean;
  videoLimit?: number; // Limite de vídeos por mês
  socialFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'; // Frequência de postagem
  allowedSocialNetworks: ('instagram' | 'facebook' | 'whatsapp' | 'linkedin' | 'tiktok')[]; // Adicionado TikTok
  hasInternalPage: boolean;
}

export interface AdPlanConfig {
  id: string;
  name: string;
  prices: AdPlanPrices; // Alterado de dailyPrice para objeto de preços
  features: AdPlanFeatures;
  description?: string;
  isPopular?: boolean; 
  cashbackPercent?: number; // Cashback individual por plano
}

export interface AdPricingConfig {
  plans: AdPlanConfig[];
  promoText: string; // Texto global ainda existe, mas cashback saiu daqui
  active: boolean;
}

export interface EditorialComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
}

export interface NewsVersion {
  id: string;
  postId: string;
  versionNumber: number;
  timestamp: string;
  authorId: string;
  authorName: string;
  changeSummary: string;
  snapshot: {
    title: string;
    lead: string;
    content: string;
    category: string;
    imageUrl: string;
    imageCredits: string;
    seo: SEOData;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  // Extended Profile
  bio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  permissions?: Record<string, boolean>; // PERMISSÕES REAIS
  twoFactorEnabled?: boolean;
  // Advertiser Specifics
  advertiserPlan?: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
}

export interface UserSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface SEOData {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaType?: 'NewsArticle' | 'BlogPosting' | 'Report';
}

export interface SocialDistribution {
  platform: 'instagram_feed' | 'instagram_stories' | 'facebook' | 'whatsapp' | 'linkedin' | 'twitter';
  status: 'idle' | 'scheduled' | 'published' | 'failed';
  content: string;
  publishedAt?: string;
  postId?: string;
  metrics?: {
    likes: number;
    shares: number;
    views: number;
  };
}

export interface NewsItem {
  id: string;
  status: PostStatus;
  title: string;
  lead: string;
  content: string;
  category: string;
  authorId: string;
  author: string;
  editorId?: string;
  editorName?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  imageUrl: string;
  imageCredits: string;
  mediaType: 'image' | 'video';
  videoUrl?: string;
  galleryUrls?: string[]; 
  city: string;
  region: string;
  isBreaking: boolean;
  isFeatured: boolean;
  featuredPriority: number;
  seo: SEOData;
  source: 'site' | 'instagram' | 'press_release' | 'rss_automation';
  comments?: EditorialComment[];
  versions?: NewsVersion[];
  socialDistribution?: SocialDistribution[];
  views?: number; 
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export type PromotionStyle = 'default' | 'sale' | 'bogo' | 'flash' | 'limited';

export interface AdvertiserProduct {
  id: string;
  name: string;
  price?: string;
  originalPrice?: string; 
  promotionStyle?: PromotionStyle;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
}

export interface Coupon {
  id: string;
  code: string; 
  discount: string; 
  description: string;
  active: boolean;
}

export interface Advertiser {
  id: string;
  name: string;
  category: string;
  plan: AdPlan; 
  billingCycle: BillingCycle; 
  logoIcon?: string;
  logoUrl?: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  endDateObj?: Date; 
  isActive: boolean;
  views: number;
  clicks: number;
  redirectType: 'internal' | 'external';
  externalUrl?: string;
  coupons?: Coupon[]; 
  internalPage?: {
    description: string;
    whatsapp?: string;
    instagram?: string;
    location?: string;
    products: AdvertiserProduct[];
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'CLT' | 'PJ' | 'Estágio' | 'Temporário';
  salary?: string;
  description: string;
  whatsapp: string; 
  postedAt: string;
  isActive: boolean;
}

export interface WebhookPayload {
  event: 'post_published' | 'ad_expired';
  timestamp: string;
  data: {
    id: string;
    title?: string;
    url?: string;
    imageUrl?: string;
    socialText?: string; 
    author?: string;
  };
}