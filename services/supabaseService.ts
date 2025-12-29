
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NewsItem, Advertiser, User, Job, AuditLog } from '../types';

let supabase: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

export const initSupabase = (url: string, key: string) => {
  // Singleton Pattern: Se já existe e as credenciais são as mesmas, retorna a instância atual
  if (supabase && currentUrl === url && currentKey === key) {
      return supabase;
  }

  // Se as credenciais mudaram ou é a primeira vez, cria nova instância
  try {
      supabase = createClient(url, key, {
          auth: {
              persistSession: true,
              autoRefreshToken: true,
          }
      });
      currentUrl = url;
      currentKey = key;
      console.log("✅ Supabase Client Initialized");
  } catch (e) {
      console.error("Failed to initialize Supabase:", e);
  }
  
  return supabase;
};

export const getSupabase = () => supabase;

// Teste de conexão
export const checkConnection = async (url: string, key: string) => {
    try {
        // Tenta usar a instância existente se possível para evitar overhead
        const client = (supabase && currentUrl === url) ? supabase : createClient(url, key);
        
        const { count, error } = await client.from('news').select('*', { count: 'exact', head: true });
        
        if (error && error.code !== 'PGRST116') {
             console.warn("Supabase Check Error:", error.message);
             return false;
        }
        return true;
    } catch (e) {
        console.warn("Supabase Connection Check Failed:", e);
        return false;
    }
};

// --- AUDIT LOGS OPERATIONS ---

export const logAction = async (userId: string, userName: string, action: string, entityId: string, details: string) => {
    // Log local para debug imediato
    console.log(`📝 [AUDIT] ${userName} -> ${action}: ${details}`);

    if (!supabase) return;

    try {
        const { error } = await supabase.from('audit_logs').insert([{
            userId,
            userName,
            action,
            entityId,
            details,
            timestamp: new Date().toISOString()
        }]);
        
        if (error) {
            console.error("Falha ao salvar log de auditoria no Supabase:", error.message);
        }
    } catch (e) {
        console.error("Erro exceção ao salvar log de auditoria:", e);
    }
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

    if (error) {
        console.error("Erro ao buscar logs:", error.message);
        return [];
    }
    return data as AuditLog[];
};

// --- SETTINGS OPERATIONS (GLOBAL CONFIG) ---

export const getSystemSetting = async (key: string) => {
    if (!supabase) return null;
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        
        if (error) {
            // Silently fail or log warning
            // console.warn(`Error fetching setting ${key}:`, error.message);
            return null;
        }
        return data?.value || null;
    } catch (e) {
        return null;
    }
};

export const saveSystemSetting = async (key: string, value: any) => {
    if (!supabase) throw new Error("Supabase offline");
    
    // Explicitly casting value to object/any for Supabase JSONB
    const { error } = await supabase
        .from('settings')
        .upsert({ 
            key, 
            value,
            updated_at: new Date().toISOString()
        })
        .select();

    if (error) {
        console.error(`❌ Failed to save setting [${key}]:`, error.message);
        throw new Error(error.message);
    }
};

// --- CRUD OPERATIONS (NEWS) ---

export const createNews = async (news: NewsItem) => {
    if (!supabase) throw new Error("Supabase offline");
    
    const { data, error } = await supabase
        .from('news')
        .insert([news])
        .select()
        .single();

    if (error) {
        console.error("Erro ao criar notícia no Supabase:", error.message);
        throw new Error(error.message);
    }
    
    // Log automático
    logAction(news.authorId, news.author, 'create_post', news.id, `Criou a notícia: ${news.title}`);
    
    return data;
};

export const updateNews = async (news: NewsItem) => {
    if (!supabase) throw new Error("Supabase offline");

    const { data, error } = await supabase
        .from('news')
        .update(news)
        .eq('id', news.id)
        .select()
        .single();

    if (error) {
        console.error("Erro ao atualizar notícia no Supabase:", error.message);
        throw new Error(error.message);
    }

    // Log automático
    logAction(news.authorId, news.author, 'update_post', news.id, `Atualizou a notícia: ${news.title} (${news.status})`);

    return data;
};

export const deleteNews = async (id: string) => {
    if (!supabase) throw new Error("Supabase offline");
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
        console.error("Erro ao deletar notícia no Supabase:", error.message);
        throw new Error(error.message);
    }
};

// --- CRUD OPERATIONS (ADVERTISERS) ---

export const upsertAdvertiser = async (advertiser: Advertiser) => {
    if (!supabase) throw new Error("Supabase offline");
    
    const { endDateObj, ...cleanAdvertiser } = advertiser;

    const { data, error } = await supabase
        .from('advertisers')
        .upsert(cleanAdvertiser)
        .select()
        .single();

    if (error) {
        console.error("Erro ao salvar anunciante no Supabase:", error.message);
        throw new Error(error.message);
    }
    return data;
};

// --- CRUD OPERATIONS (USERS) ---

export const createUser = async (user: User) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select()
        .single();
    
    if (error) {
        console.error("Erro ao criar usuário no Supabase:", error.message);
        throw new Error(error.message);
    }
    return data;
};

export const updateUser = async (user: User) => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('users')
        .update(user)
        .eq('id', user.id)
        .select()
        .single();

    if (error) {
        // Detailed logging to fix [object Object] error in console
        console.error("Erro ao atualizar usuário no Supabase:", error.message || error);
        throw new Error(error.message || "Erro desconhecido ao atualizar usuário");
    }
    return data;
};

// --- FETCH DATA ---

const MOCK_DATA = {
    news: [],
    advertisers: [],
    users: [],
    jobs: []
};

export interface SiteData {
    news: NewsItem[];
    advertisers: Advertiser[];
    users: User[];
    jobs: Job[];
}

export const fetchSiteData = async (): Promise<{ data: SiteData; source: 'database' | 'mock' | 'missing_tables' }> => {
    if (!supabase) {
        return { data: MOCK_DATA as any, source: 'mock' };
    }

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
        console.error("Erro ao buscar dados do Supabase:", error.message || error);
        
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
             return { data: MOCK_DATA as any, source: 'missing_tables' };
        }
        
        return { data: MOCK_DATA as any, source: 'mock' };
    }
};
