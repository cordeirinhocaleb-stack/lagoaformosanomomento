
import { NewsItem, Advertiser, SocialPost } from '../../types';

export const mapNewsFromDb = (dbNews: Record<string, any>): NewsItem => ({
    ...dbNews,
    id: dbNews.id,
    title: typeof dbNews.title === 'object' ? JSON.stringify(dbNews.title) : String(dbNews.title || ''),
    lead: typeof dbNews.lead === 'object' ? JSON.stringify(dbNews.lead) : String(dbNews.lead || ''),
    content: typeof dbNews.content === 'object' ? JSON.stringify(dbNews.content) : String(dbNews.content || ''),
    category: typeof dbNews.category === 'object' ? 'Geral' : String(dbNews.category || 'Geral'),
    status: dbNews.status,
    authorId: dbNews.author_id || dbNews.authorId,
    author: typeof dbNews.author === 'object' ? 'Redação' : String(dbNews.author || 'Redação'),
    imageUrl: dbNews.image_url || dbNews.imageUrl,
    imageCredits: typeof dbNews.image_credits === 'object' ? '' : (dbNews.image_credits || dbNews.imageCredits),
    mediaType: dbNews.media_type || dbNews.mediaType || 'image',
    bannerImages: Array.isArray(dbNews.banner_images || dbNews.bannerImages) ? (dbNews.banner_images || dbNews.bannerImages) : [],
    bannerImageLayout: dbNews.banner_image_layout || dbNews.bannerImageLayout,
    bannerEffects: dbNews.banner_effects || dbNews.bannerEffects,
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
    region: typeof dbNews.region === 'object' ? 'Brasil' : (dbNews.region || 'Brasil'),
    city: typeof dbNews.city === 'object' ? 'Brasil' : (dbNews.city || 'Brasil'),
    isBreaking: dbNews.is_breaking || dbNews.isBreaking,
    isFeatured: dbNews.is_featured || dbNews.isFeatured,
    featuredPriority: dbNews.featured_priority || dbNews.featuredPriority,
    blocks: dbNews.blocks || [],
    socialDistribution: dbNews.social_distribution || dbNews.socialDistribution || [],
    createdAt: String(dbNews.created_at || dbNews.createdAt || new Date().toISOString()),
    updatedAt: String(dbNews.updated_at || dbNews.updatedAt || new Date().toISOString()),
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
        name: typeof dbAd.name === 'object' ? JSON.stringify(dbAd.name) : String(dbAd.name || 'Anunciante'),
        category: typeof dbAd.category === 'object' ? 'Geral' : String(dbAd.category || 'Geral'),
        // Basic Info
        address: typeof dbAd.address === 'object' ? '' : (dbAd.address || ''),
        phone: typeof dbAd.phone === 'object' ? '' : (dbAd.phone || ''),
        email: dbAd.email,
        cpfCnpj: dbAd.cpfCnpj || dbAd.cpf_cnpj,

        logoUrl: typeof dbAd.logoUrl === 'object' ? '' : (dbAd.logoUrl || dbAd.logo_url || ''),
        logoUrls: Array.isArray(dbAd.logoUrls) ? dbAd.logoUrls : [],
        displayLocations: dbAd.display_locations || dbAd.displayLocations || ['home_top', 'article_sidebar', 'article_footer'],
        videoUrl: dbAd.videoUrl,
        mediaType: dbAd.mediaType || 'image',
        transitionType: dbAd.transitionType || 'fade',
        redirectType: dbAd.redirectType || 'external',
        externalUrl: dbAd.externalUrl,
        internalPage: dbAd.internalPage || { description: '', products: [], whatsapp: '', instagram: '', location: '' },
        plan: dbAd.plan,
        isActive: dbAd.is_active !== undefined ? dbAd.is_active : (dbAd.isActive !== false),
        views: dbAd.views || 0,
        clicks: dbAd.clicks || 0,
        ownerId: dbAd.ownerId || dbAd.owner_id,
        isPaid: dbAd.is_paid !== undefined ? dbAd.is_paid : dbAd.isPaid,
        billingValue: dbAd.billing_value || dbAd.billingValue,
        billingDueDate: dbAd.billing_due_date || dbAd.billingDueDate,
        billingStatus: dbAd.billing_status || dbAd.billingStatus,
        billingObs: dbAd.billing_obs || dbAd.billingObs,
        billingBarCode: dbAd.billing_barcode || dbAd.billingBarCode,
        installments: dbAd.installments || 1,
        interestRate: dbAd.interest_rate !== undefined ? dbAd.interest_rate : (dbAd.interestRate || 0),
        interestFreeInstallments: dbAd.interest_free_installments || dbAd.interestFreeInstallments || 1,
        lateFee: dbAd.late_fee !== undefined ? dbAd.late_fee : (dbAd.lateFee || 1),
        dailyInterest: dbAd.daily_interest !== undefined ? dbAd.daily_interest : (dbAd.dailyInterest || 0.3),
        totalWithInterest: dbAd.total_with_interest || dbAd.totalWithInterest || 0,
        billingCycle: dbAd.billing_cycle || dbAd.billingCycle,
        startDate: dbAd.start_date || dbAd.startDate,
        endDate: dbAd.end_date || dbAd.endDate
    } as Advertiser;
};

export const mapAdvertiserToDb = (ad: Advertiser): Record<string, any> => {
    const payload: any = {
        name: ad.name,
        category: ad.category,
        // Basic Info Mapped
        address: ad.address,
        phone: ad.phone,
        email: ad.email,
        cpf_cnpj: ad.cpfCnpj,

        logo_url: ad.logoUrl,
        logo_icon: ad.logoIcon,
        banner_url: ad.bannerUrl,
        plan: ad.plan,
        billing_cycle: ad.billingCycle,
        start_date: ad.startDate,
        end_date: ad.endDate,
        is_active: ad.isActive, // Assuming snake_case for consistency
        views: ad.views || 0,
        clicks: ad.clicks || 0,
        redirect_type: ad.redirectType,
        external_url: ad.externalUrl,
        internal_page: ad.internalPage,
        coupons: ad.coupons,
        owner_id: (ad.ownerId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ad.ownerId)) ? ad.ownerId : null,
        popup_set: ad.popupSet,
        promo_banners: ad.promoBanners,
        logo_urls: ad.logoUrls,
        display_locations: ad.displayLocations,
        transition_type: ad.transitionType,
        video_url: ad.videoUrl,
        media_type: ad.mediaType,

        // Campos Financeiros (snake_case obrigatório)
        is_paid: ad.isPaid,
        billing_value: ad.billingValue,
        billing_due_date: ad.billingDueDate,
        billing_status: ad.billingStatus,
        billing_obs: ad.billingObs,
        billing_barcode: ad.billingBarCode,
        installments: ad.installments,
        interest_rate: ad.interestRate,
        total_with_interest: ad.totalWithInterest,
        late_fee: ad.lateFee,
        daily_interest: ad.dailyInterest,
        interest_free_installments: ad.interestFreeInstallments
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
