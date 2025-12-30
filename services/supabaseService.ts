
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NewsItem, Advertiser, User, Job, AuditLog, ContentBlock, SiteData } from '../types';

let supabase: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

export const initSupabase = (url: string, key: string) => {
  if (supabase && currentUrl === url && currentKey === key) return supabase;
  try {
      supabase = createClient(url, key, {
          auth: { persistSession: true, autoRefreshToken: true }
      });
      currentUrl = url;
      currentKey = key;
  } catch (e) {
      console.error("Failed to initialize Supabase:", e);
  }
  return supabase;
};

export const getSupabase = () => supabase;

export const checkConnection = async (url: string, key: string) => {
    try {
        const client = (supabase && currentUrl === url) ? supabase : createClient(url, key);
        const { error } = await client.from('news').select('*', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') return false;
        return true;
    } catch (e) { return false; }
};

export const recordEngagementVote = async (newsId: string, blockId: string, optionId: string, type: string) => {
    if (!supabase) return null;

    try {
        const { data: news, error: fetchError } = await supabase
            .from('news')
            .select('blocks')
            .eq('id', newsId)
            .single();

        if (fetchError || !news?.blocks) throw fetchError;

        const updatedBlocks = (news.blocks as ContentBlock[]).map(block => {
            if (block.id !== blockId) return block;
            const newBlock = { ...block, content: { ...block.content } };

            // LÓGICA DE INCREMENTO UNIVERSAL LFNM
            if (type === 'poll' || type === 'quiz') {
                newBlock.content.options = newBlock.content.options.map((opt: any) => 
                    opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
                );
            } else if (type === 'battle' || type === 'visual_vote' || type === 'impact_ask') {
                if (optionId === 'A' || optionId === 'YES') {
                   if (newBlock.content.optionA) newBlock.content.optionA.votes = (newBlock.content.optionA.votes || 0) + 1;
                   else newBlock.content.votesA = (newBlock.content.votesA || 0) + 1;
                } else if (optionId === 'B' || optionId === 'NO') {
                   if (newBlock.content.optionB) newBlock.content.optionB.votes = (newBlock.content.optionB.votes || 0) + 1;
                   else newBlock.content.votesB = (newBlock.content.votesB || 0) + 1;
                }
            } else if (type === 'reactions') {
                newBlock.content.options = newBlock.content.options.map((opt: any) => 
                    opt.emoji === optionId ? { ...opt, count: (opt.count || 0) + 1 } : opt
                );
            } else if (type === 'thermometer' || type === 'rating') {
                const val = parseInt(optionId) || 50;
                newBlock.content.totalSum = (newBlock.content.totalSum || 0) + val;
                newBlock.content.totalVotes = (newBlock.content.totalVotes || 0) + 1;
            } else if (type === 'counter') {
                newBlock.content.count = (newBlock.content.count || 0) + 1;
            } else if (type === 'prediction') {
                newBlock.content.totalParticipations = (newBlock.content.totalParticipations || 0) + 1;
            }

            return newBlock;
        });

        const { data, error: updateError } = await supabase
            .from('news')
            .update({ blocks: updatedBlocks })
            .eq('id', newsId)
            .select()
            .single();

        if (updateError) throw updateError;
        return data;

    } catch (e) {
        console.error("Erro ao registrar interação:", e);
        return null;
    }
};

export const logAction = async (userId: string, userName: string, action: string, entityId: string, details: string) => {
    if (!supabase) return;
    try {
        await supabase.from('audit_logs').insert([{ userId, userName, action, entityId, details, timestamp: new Date().toISOString() }]);
    } catch (e) {}
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100);
    return error ? [] : data as AuditLog[];
};

export const saveSystemSetting = async (key: string, value: any) => {
    if (!supabase) throw new Error("Supabase offline");
    const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select();
    if (error) throw new Error(error.message);
};

export const getSystemSetting = async (key: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    return error ? null : data?.value || null;
};

export const createNews = async (news: NewsItem) => {
    if (!supabase) throw new Error("Supabase offline");
    const { data, error } = await supabase.from('news').insert([news]).select().single();
    if (error) throw new Error(error.message);
    logAction(news.authorId, news.author, 'create_post', news.id, `Criou a notícia: ${news.title}`);
    return data;
};

export const updateNews = async (news: NewsItem) => {
  if (!supabase) throw new Error("Supabase offline");
  const { data, error } = await supabase.from('news').update(news).eq('id', news.id).select().single();
  if (error) throw new Error(error.message);
  logAction(news.authorId, news.author, 'update_post', news.id, `Atualizou: ${news.title}`);
  return data;
};

export const deleteNews = async (id: string) => {
    if (!supabase) throw new Error("Supabase offline");
    await supabase.from('news').delete().eq('id', id);
};

export const upsertAdvertiser = async (advertiser: Advertiser) => {
    if (!supabase) throw new Error("Supabase offline");
    const { endDateObj, ...cleanAdvertiser } = advertiser as any;
    const { data, error } = await supabase.from('advertisers').upsert(cleanAdvertiser).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const createUser = async (user: User) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateUser = async (user: User) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('users').update(user).eq('id', user.id).select().single();
    if (error) throw new Error(error.message || "Erro ao atualizar usuário");
    return data;
};

export const fetchSiteData = async (): Promise<{ data: SiteData; source: 'database' | 'mock' | 'missing_tables' }> => {
    if (!supabase) return { data: { news: [], advertisers: [], users: [], jobs: [] }, source: 'mock' };
    try {
        const [newsRes, adsRes, usersRes, jobsRes] = await Promise.all([
            supabase.from('news').select('*').order('createdAt', { ascending: false }),
            supabase.from('advertisers').select('*').eq('isActive', true),
            supabase.from('users').select('*'),
            supabase.from('jobs').select('*').eq('isActive', true)
        ]);
        if (newsRes.error) throw newsRes.error;
        return {
            data: {
                news: (newsRes.data as unknown as NewsItem[]) || [],
                advertisers: (adsRes.data as unknown as Advertiser[]) || [],
                users: (usersRes.data as unknown as User[]) || [],
                jobs: (jobsRes.data as unknown as Job[]) || []
            },
            source: 'database'
        };
    } catch (error: any) {
        if (error.code === '42P01') return { data: { news: [], advertisers: [], users: [], jobs: [] }, source: 'missing_tables' };
        return { data: { news: [], advertisers: [], users: [], jobs: [] }, source: 'mock' };
    }
};
