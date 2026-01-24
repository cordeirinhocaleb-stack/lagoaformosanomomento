
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
    const payload: any = {
        title: news.title,
        lead: news.lead,
        content: news.content,
        category: news.category,
        status: news.status,
        author_id: (news.authorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(news.authorId)) ? news.authorId : null,
        author: news.author,
        image_url: news.imageUrl,
        image_credits: news.imageCredits,
        media_type: news.mediaType || (news as Record<string, any>).bannerMediaType || 'image',
        banner_images: news.bannerImages,
        banner_image_layout: news.bannerImageLayout,
        banner_effects: news.bannerEffects, // Mapped
        banner_video_source: (news.bannerVideoSource === 'internal' || news.bannerVideoSource === 'youtube') ? news.bannerVideoSource : null,
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
        slug: news.slug || (news.seo?.slug || null),
        source: news.source || 'site'
    };

    // Só inclui ID se for um UUID válido (evita erros no INSERT/UPSERT)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (news.id && uuidRegex.test(news.id)) {
        payload.id = news.id;
    }

    return payload;
};

export const mapAdvertiserFromDb = (dbAd: Record<string, any>): Advertiser => {
    return {
        ...dbAd,
        id: dbAd.id,
        name: dbAd.name,
        category: dbAd.category,
        logoUrl: dbAd.logoUrl || dbAd.logo_url,
        logoUrls: dbAd.logoUrls || [],
        displayLocations: dbAd.display_locations || dbAd.displayLocations || ['home_top', 'article_sidebar', 'article_footer'],
        videoUrl: dbAd.videoUrl,
        mediaType: dbAd.mediaType || 'image',
        transitionType: dbAd.transitionType || 'fade',
        redirectType: dbAd.redirectType || 'external',
        externalUrl: dbAd.externalUrl,
        internalPage: dbAd.internalPage || { description: '', products: [], whatsapp: '', instagram: '', location: '' },
        plan: dbAd.plan,
        isActive: dbAd.isActive !== false,
        views: dbAd.views || 0,
        clicks: dbAd.clicks || 0,
        ownerId: dbAd.ownerId || dbAd.owner_id
    } as Advertiser;
};

export const mapAdvertiserToDb = (ad: Advertiser): Record<string, any> => {
    const payload: any = {
        name: ad.name,
        category: ad.category,
        logoUrl: ad.logoUrl,
        logoIcon: ad.logoIcon,
        bannerUrl: ad.bannerUrl,
        plan: ad.plan,
        billingCycle: ad.billingCycle,
        startDate: ad.startDate,
        endDate: ad.endDate,
        isActive: ad.isActive,
        views: ad.views || 0,
        clicks: ad.clicks || 0,
        redirectType: ad.redirectType,
        externalUrl: ad.externalUrl,
        internalPage: ad.internalPage,
        coupons: ad.coupons,
        ownerId: (ad.ownerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ad.ownerId)) ? ad.ownerId : null,
        popupSet: ad.popupSet,
        promoBanners: ad.promoBanners,
        logoUrls: ad.logoUrls,
        display_locations: ad.displayLocations,
        transitionType: ad.transitionType,
        videoUrl: ad.videoUrl,
        mediaType: ad.mediaType
    };

    // Só inclui ID se ele for um UUID válido.
    // Se for vazio ou formato inválido, deixamos o Postgres/Supabase gerar um novo UUID.
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (ad.id && uuidRegex.test(ad.id)) {
        payload.id = ad.id;
    }

    return payload;
};

export const mapSocialPostToDb = (post: SocialPost): Record<string, any> => {
    const payload: any = {
        content: post.content,
        media_url: post.mediaUrl,
        media_type: post.mediaType,
        platform: Array.isArray(post.platforms) ? post.platforms[0] : post.platforms,
        status: post.status,
        author_id: (post.authorId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(post.authorId)) ? post.authorId : null,
        created_at: post.createdAt
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (post.id && uuidRegex.test(post.id)) {
        payload.id = post.id;
    }

    return payload;
};
