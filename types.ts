
export type UserRole = 'Desenvolvedor' | 'Editor-Chefe' | 'Repórter' | 'Jornalista' | 'Estagiário';

export type PostStatus = 'draft' | 'in_review' | 'needs_changes' | 'approved' | 'scheduled' | 'published' | 'archived';

export type AdPlan = 'master' | 'premium' | 'standard';

export interface AdPricingConfig {
  masterDailyPrice: number;
  premiumDailyPrice: number;
  standardDailyPrice: number;
  cashbackPercent: number;
  promoText: string;
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
  galleryUrls?: string[]; // Novo campo para Carrossel de Imagens
  city: string;
  region: string;
  isBreaking: boolean;
  isFeatured: boolean;
  featuredPriority: number;
  seo: SEOData;
  source: 'site' | 'instagram' | 'press_release';
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

export interface AdvertiserProduct {
  id: string;
  name: string;
  price?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
}

export interface Advertiser {
  id: string;
  name: string;
  category: string;
  plan: AdPlan;
  logoIcon?: string;
  logoUrl?: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  endDateObj?: Date; // Helper for logic
  isActive: boolean;
  views: number;
  clicks: number;
  redirectType: 'internal' | 'external';
  externalUrl?: string;
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
  whatsapp: string; // Para contato direto
  postedAt: string;
  isActive: boolean;
}

// Estrutura do Webhook para Integração Externa (Make/Zapier)
export interface WebhookPayload {
  event: 'post_published' | 'ad_expired';
  timestamp: string;
  data: {
    id: string;
    title?: string;
    url?: string;
    imageUrl?: string;
    socialText?: string; // Conteúdo gerado para redes
    author?: string;
  };
}