import { getSupabase } from '../core/supabaseClient';

export interface Interaction {
    newsId: string;
    blockId: string;
    type: EngagementType;
    data: any;
}

export type EngagementType =
    | 'poll'
    | 'quiz'
    | 'slider'
    | 'comparison'
    | 'reaction'
    | 'counter'
    | 'thermometer'
    | 'ranking';

export interface InteractionStats {
    total: number;
    distribution: Record<string, number>;
    average?: number;
}

// Gera um identificador único simples para o navegador atual (persistente)
const getDeviceId = (): string => {
    // Proteção SSR: só acessa localStorage no cliente
    if (typeof window === 'undefined') {
        return 'server_' + Math.random().toString(36).substring(2);
    }

    let deviceId = localStorage.getItem('lfnm_device_id');
    if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('lfnm_device_id', deviceId);
    }
    return deviceId;
};

export const recordInteraction = async (interaction: Interaction): Promise<{ success: boolean; error?: string }> => {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: 'Supabase not initialized' };
        }

        const userIdentifier = getDeviceId();

        const { error } = await supabase
            .from('engagement_interactions')
            .insert({
                news_id: interaction.newsId,
                block_id: interaction.blockId,
                engagement_type: interaction.type,
                user_identifier: userIdentifier,
                interaction_data: interaction.data
            });

        if (error) {
            // Ignora erro de duplicidade (usuário já votou)
            if (error.code === '23505') {
                return { success: false, error: 'already_voted' };
            }
            throw error;
        }

        return { success: true };
    } catch (error: any) {
        console.error("Erro ao registrar interação:", error);
        return { success: false, error: error.message };
    }
};

export const getInteractionStats = async (newsId: string, blockId: string): Promise<InteractionStats> => {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { total: 0, distribution: {} };
        }

        // Opção 1: Usando a RPC Function (Mais performática se criada no DB)
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_interaction_stats', {
            p_news_id: newsId,
            p_block_id: blockId
        });

        if (!rpcError && rpcData) {
            return {
                total: rpcData.total_count || 0,
                distribution: rpcData.data || {}
            };
        }

        // Fallback: Query direta (menos otimizado, mas funciona sem a function)
        const { data, error } = await supabase
            .from('engagement_interactions')
            .select('interaction_data')
            .eq('news_id', newsId)
            .eq('block_id', blockId);

        if (error) { throw error; }

        const distribution: Record<string, number> = {};
        let total = 0;

        data.forEach((row: any) => {
            const value = row.interaction_data?.value || row.interaction_data?.selectedOption;
            if (value) {
                distribution[value] = (distribution[value] || 0) + 1;
                total++;
            }
        });

        return { total, distribution };

    } catch (error) {
        console.error("Erro ao buscar stats:", error);
        return { total: 0, distribution: {} };
    }
};

export const hasUserInteracted = async (newsId: string, blockId: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) { return false; }

    const userIdentifier = getDeviceId();
    const { count } = await supabase
        .from('engagement_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('news_id', newsId)
        .eq('block_id', blockId)
        .eq('user_identifier', userIdentifier);

    return (count || 0) > 0;
};
