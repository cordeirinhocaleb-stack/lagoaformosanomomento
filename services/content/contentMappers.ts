
import { NewsItem, Advertiser, SocialPost } from '../../types';

export const mapNewsFromDb = (dbNews: Record<string, any>): NewsItem => ({
    ...dbNews,
    id: dbNews.id,
    title: dbNews.title,
    lead: dbNews.lead,
    content: dbNews.content,
    category: dbNews.category,
    status: dbNews.status,
    // Schema híbrido: verifica snake_case E camelCase
    authorId: dbNews.author_id || dbNews.authorId,
    author: dbNews.author,
    imageUrl: dbNews.image_url || dbNews.imageUrl,
    imageCredits: dbNews.image_credits || dbNews.imageCredits,
    mediaType: dbNews.media_type || dbNews.mediaType || 'image',
    bannerImages: dbNews.banner_images || dbNews.bannerImages || [],
    bannerImageLayout: dbNews.banner_image_layout || dbNews.bannerImageLayout,
    bannerEffects: dbNews.banner_effects || dbNews.bannerEffects, // Mapped
    bannerVideoSource: dbNews.banner_video_source || dbNews.bannerVideoSource,

    bannerVideoUrl: dbNews.banner_video_url || dbNews.bannerVideoUrl,
    bannerYoutubeVideoId: dbNews.banner_youtube_video_id || dbNews.bannerYoutubeVideoId,
    bannerYoutubeStatus: dbNews.banner_youtube_status || dbNews.bannerYoutubeStatus,
    bannerYoutubeMetadata: dbNews.banner_youtube_metadata || dbNews.bannerYoutubeMeta || {},
    bannerSmartPlayback: dbNews.banner_smart_playback || dbNews.bannerSmartPlayback,
    bannerPlaybackSegments: dbNews.banner_playback_segments || dbNews.bannerPlaybackSegments,
    bannerSegmentDuration: dbNews.banner_segment_duration || dbNews.bannerSegmentDuration,
    bannerTransition: dbNews.banner_transition || dbNews.bannerTransition,
    bannerDuration: dbNews.banner_duration || dbNews.bannerDuration,
    videoStart: dbNews.video_start || dbNews.videoStart,
    videoEnd: dbNews.video_end || dbNews.videoEnd,
    views: dbNews.views,
    tags: dbNews.tags || [],
    region: dbNews.region,
    city: dbNews.city,
    isBreaking: dbNews.is_breaking || dbNews.isBreaking,
    isFeatured: dbNews.is_featured || dbNews.isFeatured,
    featuredPriority: dbNews.featured_priority || dbNews.featuredPriority,
    blocks: dbNews.blocks || [],
    socialDistribution: dbNews.social_distribution || dbNews.socialDistribution || [],
    createdAt: dbNews.created_at || dbNews.createdAt,
    updatedAt: dbNews.updated_at || dbNews.updatedAt,
    seo: dbNews.seo || {},
    source: dbNews.source || 'site'
});

export const mapNewsToDb = (news: NewsItem): Record<string, any> => {
    // Mapeia explicitamente para snake_case (padrão Postgres)
    // Removemos os campos camelCase para evitar erro de "coluna não encontrada" no PostgREST
    return {
        id: news.id,
        title: news.title,
        lead: news.lead,
        content: news.content,
        category: news.category,
        status: news.status,
        author_id: news.authorId,
        author: news.author,
        image_url: news.imageUrl,
        image_credits: news.imageCredits,
        media_type: news.mediaType || (news as Record<string, any>).bannerMediaType || 'image',
        banner_images: news.bannerImages,
        banner_image_layout: news.bannerImageLayout,
        banner_effects: news.bannerEffects, // Mapped
        banner_video_source: news.bannerVideoSource,
        banner_video_url: news.bannerVideoUrl,
        banner_youtube_video_id: news.bannerYoutubeVideoId,
        banner_youtube_status: news.bannerYoutubeStatus,
        banner_youtube_metadata: news.bannerYoutubeMetadata,
        banner_smart_playback: news.bannerSmartPlayback,
        banner_playback_segments: news.bannerPlaybackSegments,
        banner_segment_duration: news.bannerSegmentDuration,
        banner_transition: news.bannerTransition,
        banner_duration: news.bannerDuration,
        video_start: news.videoStart,
        video_end: news.videoEnd,
        views: news.views,
        tags: news.tags,
        region: news.region,
        city: news.city,
        is_breaking: news.isBreaking,
        is_featured: news.isFeatured,
        featured_priority: news.featuredPriority,
        blocks: news.blocks,
        social_distribution: news.socialDistribution,
        seo: news.seo,
        source: news.source || 'site'
    };
};

export const mapAdvertiserToDb = (ad: Advertiser): Record<string, any> => ({
    id: ad.id,
    company_name: (ad as Record<string, any>).company_name || ad.name,
    trade_name: (ad as Record<string, any>).trade_name || ad.name,
    category: ad.category,
    logo_url: ad.logoUrl,
    banner_url: ad.bannerUrl,
    plan: ad.plan,
    status: ad.isActive ? 'active' : 'inactive',
    redirect_type: ad.redirectType,
    external_url: ad.externalUrl,
    address: ad.internalPage?.location ? { city: ad.internalPage.location } : {},
    social_links: {
        instagram: ad.internalPage?.instagram,
        whatsapp: ad.internalPage?.whatsapp
    },
    owner_id: ad.ownerId,
    popup_set: ad.popupSet
});

export const mapSocialPostToDb = (post: SocialPost): Record<string, any> => ({
    id: post.id,
    content: post.content,
    media_url: post.mediaUrl,
    media_type: post.mediaType,
    platform: Array.isArray(post.platforms) ? post.platforms[0] : post.platforms,
    status: post.status,
    author_id: post.authorId,
    created_at: post.createdAt
});
