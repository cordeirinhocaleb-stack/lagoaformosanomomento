
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// SINGLETON INSTANCE
let supabaseInstance: SupabaseClient | null = null;
let currentUrl: string | null = null;
let currentKey: string | null = null;

/**
 * Inicializa o cliente Supabase usando padrão Singleton.
 * Evita o erro "Multiple GoTrueClient instances detected".
 */
export const initSupabase = (url: string, anonKey: string): SupabaseClient | null => {
    if (!url || !anonKey) {
        console.warn("⚠️ Supabase: URL ou AnonKey ausentes.");
        return null;
    }

    // Validação básica de URL para evitar erro crítico do createClient
    if (!url.startsWith('http')) {
        console.error(`❌ Supabase: URL Inválida detectada: "${url}". Deve começar com http/https.`);
        return null;
    }

    // Se já existe uma instância com as mesmas credenciais, retorna ela (a menos que forçado a recriar)
    if (supabaseInstance && currentUrl === url && currentKey === anonKey) {
        return supabaseInstance;
    }

    try {
        // Opções padrão explicitando localStorage para garantir comportamento default
        const options = {
            auth: {
                storage: localStorage,
                persistSession: true,
                detectSessionInUrl: true
            }
        };

        supabaseInstance = createClient(url, anonKey, options);
        currentUrl = url;
        currentKey = anonKey;
        console.log("⚡ Supabase: Singleton inicializado com sucesso.");
        return supabaseInstance;
    } catch (e) {
        console.error("❌ Supabase: Erro crítico na inicialização:", e);
        return null;
    }
};

/**
 * Get current Supabase client singleton.
 */
export const getSupabase = (): SupabaseClient | null => supabaseInstance;

/**
 * Test connection usando a instância singleton se disponível,
 * ou criando uma temporária apenas se necessário, mas evitando concorrência de Auth.
 */
export const checkConnection = async (url?: string, anonKey?: string): Promise<boolean> => {
    const targetUrl = url || currentUrl;
    const targetKey = anonKey || currentKey;

    if (!targetUrl || !targetKey) {
        console.warn("🔌 Supabase: Impossível verificar conexão (URL ou Key não definidos).");
        return false;
    }

    try {
        // Tenta usar a instância global primeiro para não criar múltiplos clients
        const client = (supabaseInstance && currentUrl === targetUrl)
            ? supabaseInstance
            : createClient(targetUrl, targetKey, { auth: { persistSession: false } }); // Desativa persistência se for teste temporário

        // Teste de 'ping' via seleção head na tabela de notícias
        const { error, status } = await client.from('news').select('id', { head: true, count: 'exact' }).limit(1);

        if (error) {
            // Se o erro for 401 ou 403, a conexão EXISTE mas as permissões RLS estão ativas (isso é OK para teste de conexão)
            if (status === 401 || status === 403 || status === 404) {
                console.log(`🔌 Supabase: Conectado (Acesso restringido: ${status})`);
                return true;
            }
            console.warn("🔌 Supabase: Erro de conexão detectado:", error.message);
            return false;
        }

        console.log("🔌 Supabase: Conectado e respondendo.");
        return true;
    } catch (e) {
        console.error("🔌 Supabase: Falha total na conexão:", e);
        return false;
    }
};
