// Content Service - Aggregator for news, advertisers, users, jobs
import { NewsItem, Advertiser, SiteData, DailyBreadData, SocialPost, SystemSettings, AuditLog } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { mapNewsFromDb, mapAdvertiserFromDb } from './contentMappers';
import { logAction, getAuditLogs } from '../admin/auditService';
import { logger } from '../core/debugLogger';

// Re-exports
export * from './newsService';
export * from './advertiserService'; // Now includes incrementAdvertiserClick and incrementAdvertiserView
export * from './socialService';

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

        if (adsRes.error) { logger.log(`⚠️ Erro Anúncios: ${adsRes.error.message}`); }
        else { logger.log(`✅ Anúncios: ${adsRes.data?.length}`); }

        if (jobsRes.error) { logger.log(`⚠️ Erro Vagas: ${jobsRes.error.message}`); }

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
                news: (newsRes.data || []).map(mapNewsFromDb).map((news: NewsItem) => {
                    // Filtrar URLs antigas que causam erro
                    if (news.imageUrl && news.imageUrl.includes('portal.lagoaformosa.mg.gov.br')) {
                        return { ...news, imageUrl: 'https://placehold.co/800x600/000000/FFFFFF?text=LFNM' };
                    }
                    return news;
                }),
                advertisers: (adsRes.data || []).map(mapAdvertiserFromDb),
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

// Systems settings functions
export const saveSystemSetting = async (key: string, value: any) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const { error } = await supabase.from('system_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) { throw error; }
};

export const getSystemSetting = async (key: string) => {
    const supabase = getSupabase();
    if (!supabase) { return null; }
    const { data, error } = await supabase.from('system_settings').select('value').eq('key', key).maybeSingle();
    if (error) { return null; }
    return data?.value || null;
};

export const fetchDailyBreadWithLookahead = async (): Promise<{ today: DailyBreadData | null; upcoming: DailyBreadData[] }> => {
    const supabase = getSupabase();
    if (!supabase) { return { today: null, upcoming: [] }; }
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('daily_bread').select('*').gte('date', today).order('date', { ascending: true }).limit(5);
    if (error || !data) { return { today: null, upcoming: [] }; }
    const todayBread = data.find(d => d.date === today) || data[0];
    const upcoming = data.filter(d => d.date !== todayBread?.date);
    return { today: todayBread, upcoming };
};

export const recordEngagementVote = async (newsId: string, blockId: string, optionId: string, type: string) => {
    const supabase = getSupabase();
    if (!supabase) { return null; }
    // Logica simplificada: busca a notícia, atualiza o bloco e salva de volta
    const { data: news } = await supabase.from('news').select('*').eq('id', newsId).single();
    if (!news) { return null; }
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
                    if (content.optionA) { content.optionA.votes = (content.optionA.votes || 0) + 1; }
                    else { content.votesA = (content.votesA || 0) + 1; }
                } else {
                    if (content.optionB) { content.optionB.votes = (content.optionB.votes || 0) + 1; }
                    else { content.votesB = (content.votesB || 0) + 1; }
                }
            } else if (type === 'counter') {
                content.count = (content.count || 0) + 1;
            }
            return { ...block, content };
        }
        return block;
    });
    const { error } = await supabase.from('news').update({ blocks: updatedBlocks }).eq('id', newsId);
    if (error) { return null; }
    return { ...mappedNews, blocks: updatedBlocks };
};

export const getDatabaseSchemaSQL = async () => {
    // Retorna um link para o arquivo ou o SQL direto
    return "Consulte o arquivo database/migrations/002_consolidated_schema.sql para o esquema completo.";
};

export const logUserAction = async (userId: string, userName: string, action: string, targetId: string, details: string) => {
    await logAction(userId, userName, action, targetId, details);
};
