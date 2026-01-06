// Content Service - Handles news, advertisers, users, jobs
import { NewsItem, Advertiser, SiteData, DailyBreadData, SocialPost, SystemSettings, AuditLog } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { generateDailyBreadContent } from '../geminiService';
import { logAction, getAuditLogs } from '../admin/auditService';

// ---------- Mapping helpers ----------
const mapNewsFromDb = (dbNews: any): NewsItem => ({
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

const mapNewsToDb = (news: NewsItem): any => {
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
        media_type: news.mediaType || (news as any).bannerMediaType || 'image',
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

const mapAdvertiserToDb = (ad: Advertiser): any => ({
    id: ad.id,
    company_name: (ad as any).company_name || ad.name,
    trade_name: (ad as any).trade_name || ad.name,
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

const mapSocialPostToDb = (post: SocialPost): any => ({
    id: post.id,
    content: post.content,
    media_url: post.mediaUrl,
    media_type: post.mediaType,
    platform: Array.isArray(post.platforms) ? post.platforms[0] : post.platforms,
    status: post.status,
    author_id: post.authorId,
    created_at: post.createdAt
});

// Imports de log
import { logger } from '../core/debugLogger';

export const fetchSiteData = async (): Promise<{ source: 'database' | 'mock'; data: SiteData } | null> => {
    const supabase = getSupabase();
    if (!supabase) {
        logger.log("❌ Supabase client not initialized");
        return null;
    }

    try {
        logger.log("🔄 Iniciando carga de dados (Cascade Mode)...");

        // 1. Fetch News (CRÍTICO)
        logger.log("📡 Buscando Notícias...");
        let newsRes = await supabase.from('news').select('*').order('created_at', { ascending: false });

        // Fallback para createdAt (camelCase) se created_at falhar
        if (newsRes.error && newsRes.error.message?.includes('created_at')) {
            logger.log("⚠️ Coluna 'created_at' não encontrada, tentando 'createdAt'...");
            newsRes = await supabase.from('news').select('*').order('createdAt', { ascending: false });
        }

        if (newsRes.error) {
            logger.log(`❌ Erro ao buscar notícias: ${newsRes.error.message}`, newsRes.error);
        } else {
            logger.log(`✅ Notícias recebidas: ${newsRes.data?.length}`);
            if (newsRes.data && newsRes.data.length > 0) {
                logger.log(`📋 Exemplo: ${newsRes.data[0].title} (${newsRes.data[0].status})`);
            }
        }

        // 2. Fetch Auxiliares (Advertisers, Jobs)
        logger.log("📡 Buscando Anúncios e Vagas...");
        const [adsRes, jobsRes] = await Promise.all([
            supabase.from('advertisers').select('*'),
            supabase.from('jobs').select('*')
        ]);

        if (adsRes.error) logger.log(`⚠️ Erro Anúncios: ${adsRes.error.message}`);
        else logger.log(`✅ Anúncios: ${adsRes.data?.length}`);

        if (jobsRes.error) logger.log(`⚠️ Erro Vagas: ${jobsRes.error.message}`);

        // 3. Fetch Users (Protegido - Pode falhar)
        let users: any[] = [];
        try {
            logger.log("📡 Buscando Usuários...");
            // Verifica sessão antes
            const sessionRes = await supabase.auth.getSession();
            if (sessionRes.data.session) {
                const usersRes = await supabase.from('users').select('*');
                if (!usersRes.error && usersRes.data) {
                    users = usersRes.data;
                    logger.log(`✅ Usuários: ${users.length}`);
                } else {
                    logger.log(`⚠️ Usuários vazios ou erro: ${usersRes.error?.message || 'Empty'}`);
                }
            } else {
                logger.log("ℹ️ Sem sessão ativa: ignorando tabela users (RLS)");
            }
        } catch (authError: any) {
            logger.log(`⚠️ Falha segura ao buscar usuários: ${authError.message}`);
        }

        // 4. Fetch Audit Logs
        let auditLogs: any[] = [];
        try {
            auditLogs = await getAuditLogs();
        } catch (e) {
            logger.log("⚠️ Erro ao buscar Audit Logs");
        }

        return {
            source: 'database',
            data: {
                news: (newsRes.data || []).map(mapNewsFromDb),
                advertisers: adsRes.data || [],
                users: users.map((u: any) => ({ ...u, id: u.id || u.auth_id || u.user_id })),
                jobs: jobsRes.data || [],
                auditLogs: auditLogs.map((log: any) => ({
                    userId: log.user_id,
                    userName: log.user_name || 'Usuário',
                    action: log.action,
                    targetId: log.record_id,
                    details: log.changes?.details || log.field_name || log.action,
                    timestamp: log.created_at || log.changed_at
                }))
            }
        };

    } catch (e: any) {
        logger.log(`❌ ERRO CRÍTICO fetchSiteData: ${e.message}`);
        return null;
    }
};

export const createNews = async (news: NewsItem) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase client not initialized");

    // Ensure ID is undefined so Postgres generates UUID if not provided, or respect provided ID
    const payload = mapNewsToDb(news);

    // Safety: Remove undefined keys to let Postgres defaults take over
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase.from('news').insert(payload).select().single();

    if (error) {
        console.error("❌ Erro Create News:", error);
        throw error;
    }
    return data;
};

export const updateNews = async (news: NewsItem) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase client not initialized");

    const payload = mapNewsToDb(news);

    // Safety clean
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { error } = await supabase.from('news').update(payload).eq('id', news.id);

    if (error) {
        console.error("❌ Erro Update News:", error);
        throw error;
    }
};

export const deleteNews = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw error;
};

export const upsertAdvertiser = async (advertiser: Advertiser) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const payload = mapAdvertiserToDb(advertiser);
    const { error } = await supabase.from('advertisers').upsert(payload);
    if (error) throw error;
};

export const saveSystemSetting = async (key: string, value: any) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.from('system_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
};

export const getSystemSetting = async (key: string) => {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.from('system_settings').select('value').eq('key', key).maybeSingle();
    if (error) return null;
    return data?.value || null;
};

export const fetchDailyBreadWithLookahead = async (): Promise<{ today: DailyBreadData | null; upcoming: DailyBreadData[] }> => {
    const supabase = getSupabase();
    if (!supabase) return { today: null, upcoming: [] };
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('daily_bread').select('*').gte('date', today).order('date', { ascending: true }).limit(5);
    if (error || !data) return { today: null, upcoming: [] };
    const todayBread = data.find(d => d.date === today) || data[0];
    const upcoming = data.filter(d => d.date !== todayBread?.date);
    return { today: todayBread, upcoming };
};

export const recordEngagementVote = async (newsId: string, blockId: string, optionId: string, type: string) => {
    const supabase = getSupabase();
    if (!supabase) return null;
    // Logica simplificada: busca a notícia, atualiza o bloco e salva de volta
    const { data: news } = await supabase.from('news').select('*').eq('id', newsId).single();
    if (!news) return null;
    const mappedNews = mapNewsFromDb(news);
    const updatedBlocks = (mappedNews.blocks || []).map(block => {
        if (block.id === blockId) {
            const content = { ...block.content };
            if (['poll', 'quiz', 'reactions'].includes(type)) {
                content.options = content.options.map((opt: any) =>
                    (opt.id === optionId || opt.emoji === optionId) ? { ...opt, votes: (opt.votes || 0) + 1, count: (opt.count || 0) + 1 } : opt
                );
            } else if (['battle', 'visual_vote', 'impact_ask'].includes(type)) {
                if (optionId === 'A' || optionId === 'YES') {
                    if (content.optionA) content.optionA.votes = (content.optionA.votes || 0) + 1;
                    else content.votesA = (content.votesA || 0) + 1;
                } else {
                    if (content.optionB) content.optionB.votes = (content.optionB.votes || 0) + 1;
                    else content.votesB = (content.votesB || 0) + 1;
                }
            } else if (type === 'counter') {
                content.count = (content.count || 0) + 1;
            }
            return { ...block, content };
        }
        return block;
    });
    const { error } = await supabase.from('news').update({ blocks: updatedBlocks }).eq('id', newsId);
    if (error) return null;
    return { ...mappedNews, blocks: updatedBlocks };
};

export const saveSocialPost = async (post: SocialPost) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const payload = mapSocialPostToDb(post);
    const { error } = await supabase.from('social_posts').insert(payload);
    if (error) throw error;
};

export const getDatabaseSchemaSQL = async () => {
    // Retorna um link para o arquivo ou o SQL direto
    return "Consulte o arquivo database/migrations/002_consolidated_schema.sql para o esquema completo.";
};

export const logUserAction = async (userId: string, userName: string, action: string, targetId: string, details: string) => {
    await logAction(userId, userName, action, targetId, details);
};
