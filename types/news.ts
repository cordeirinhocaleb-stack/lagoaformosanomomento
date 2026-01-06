
import { BannerLayout, BannerTransition } from './ads';

export interface ContentBlock {
    id: string;
    type: 'paragraph' | 'heading' | 'image' | 'video' | 'quote' | 'list' | 'separator' | 'gallery' | 'engagement' | 'smart_block';
    content: any;
    settings: any;
    videoSource?: 'cloudinary' | 'youtube';
    youtubeMeta?: {
        title: string;
        description: string;
        tags: string[];
        privacy: 'public' | 'unlisted' | 'private';
        categoryId?: string;
        madeForKids?: boolean;
    };
    fileRef?: File | null;
}

export interface SocialDistribution {
    platform: 'instagram_feed' | 'instagram_stories' | 'facebook' | 'whatsapp' | 'linkedin' | 'tiktok' | 'youtube';
    content: string;
    status: 'pending' | 'posted' | 'failed';
}

export interface NewsItem {
    id: string;
    title: string;
    lead: string;
    content: string;
    category: string;
    author: string;
    authorId: string;
    status: 'draft' | 'in_review' | 'published' | 'archived';
    source?: 'site' | 'rss_automation';
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    created_at?: string; // Compabilidade com DB
    updated_at?: string; // Compabilidade com DB
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
    city: string;
    tags?: string[]; // Novos Filtros (Max 3)
    region: string;
    views: number;
    blocks?: ContentBlock[];

    // ========================================
    // NEW BANNER SYSTEM (v1.173+)
    // ========================================

    // Multi-Image Banner (até 5 imagens)
    bannerImages: string[]; // Array de URLs (max 5)
    bannerImageLayout?: 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';

    // Image Effects (brightness, contrast, etc.)
    // Image Effects (brightness, contrast, etc.)
    // Changed to Array for per-image effects (v1.200)
    bannerEffects?: Array<{
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        sepia: number;
        opacity: number;
    }>;

    // Video Management
    bannerMediaType?: 'image' | 'video';
    bannerVideoSource?: 'internal' | 'youtube' | null;
    bannerVideoUrl?: string; // URL do vídeo (interno ou YouTube embed)

    // YouTube Integration
    bannerYoutubeVideoId?: string;
    bannerYoutubeStatus?: 'uploading' | 'processing' | 'ready' | 'failed';
    bannerYoutubeMetadata?: {
        title: string;
        description: string;
        tags: string[];
        privacy: 'public' | 'unlisted' | 'private';
        categoryId?: string;
        madeForKids?: boolean;
        uploadedAt?: string;
    };

    // Smart Playback (para vídeos >1min)
    bannerSmartPlayback?: boolean;
    bannerPlaybackSegments?: Array<{
        start: number; // segundos
        end: number;   // segundos
    }>;
    bannerSegmentDuration?: number; // duração de cada segmento (padrão: 10s)

    // Legacy Banner Fields (manter para compatibilidade)
    bannerLayout?: BannerLayout;
    bannerTransition?: BannerTransition;
    bannerDuration?: number;
    videoStart?: number;
    videoEnd?: number;
    bannerVideoSettings?: {
        muted: boolean;
        loop: boolean;
        autoplay: boolean;
        effects: {
            brightness: number;
            contrast: number;
            saturation: number;
            blur: number;
            sepia: number;
            opacity: number;
        };
    };
    isBannerAnimated?: boolean;
    imageCredits?: string;
    socialDistribution?: SocialDistribution[];
    mediaType?: 'image' | 'video';
}

export interface SocialPost {
    id: string;
    content: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    platforms: string[];
    createdAt: string;
    status: 'draft' | 'posted' | 'failed';
    authorId: string;
    authorName: string;
}

export interface DailyBreadData {
    date: string;
    verse: string;
    reference: string;
    reflection: string;
    wordOfDay: string;
    theme: string;
}

export type EngagementType = 'poll' | 'quiz' | 'battle' | 'visual_vote' | 'reactions' | 'thermometer' | 'rating' | 'counter' | 'prediction' | 'impact_ask';

export interface GalleryItem {
    id: string;
    url: string;
    caption: string;
    alt: string;
    isPending?: boolean;
}

export type GalleryStyle = 'hero_slider' | 'news_mosaic' | 'filmstrip' | 'comparison' | 'masonry' | 'stories_scroll' | 'card_peek';
