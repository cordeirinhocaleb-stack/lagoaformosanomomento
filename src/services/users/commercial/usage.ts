import { getSupabase } from '../../core/supabaseClient';
import { logAction } from '../../admin/auditService';
import { mapDbToUser, USER_DB_FIELDS } from '../mappers';
import { logger } from '@/services/core/debugLogger';

export const consumeUserBooster = async (userId: string, boosterKey: string, amount: number = 1, logIds: string[] = []) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de conexão" };

    try {
        logger.log(`[BOOSTER] Consumindo ${amount} unidades de ${boosterKey} para o usuário ${userId}. Logs:`, logIds);

        const { data: user, error: fetchError } = await supabase.from('users').select('commercial_data, usage_credits').eq('id', userId).single();
        if (fetchError || !user) throw new Error("Usuário não encontrado");

        const commercialData = user.commercial_data || {};
        const usageCredits = user.usage_credits || {};
        const updates: any = {};
        const key = boosterKey.toLowerCase();

        const currentConsumed = commercialData.consumed_log_ids || [];
        const newConsumed = [...new Set([...currentConsumed, ...logIds])];

        let newCommercialData = { ...commercialData, consumed_log_ids: newConsumed };

        const social = { ...(commercialData.socialPublications || {}) };

        const consumeSocial = (patterns: string[]) => {
            let total = 0;
            const remainingKeys: any = {};
            Object.keys(social).forEach(k => {
                const isMatch = patterns.some(p => k.toLowerCase().includes(p.toLowerCase()));
                if (isMatch) {
                    total += (social[k] || 0);
                } else {
                    remainingKeys[k] = social[k];
                }
            });
            if (total < amount) throw new Error(`Saldo insuficiente. Você possui ${total} unidades.`);
            const primaryKey = patterns[0].toLowerCase();
            return { ...remainingKeys, [primaryKey]: Math.max(0, total - amount) };
        };

        if (key.includes('insta')) {
            newCommercialData.socialPublications = consumeSocial(['instagram', 'insta']);
        } else if (key.includes('face')) {
            newCommercialData.socialPublications = consumeSocial(['facebook', 'face']);
        } else if (key.includes('youtu')) {
            newCommercialData.socialPublications = consumeSocial(['youtube', 'youtu']);
        } else if (key.includes('tiktok')) {
            newCommercialData.socialPublications = consumeSocial(['tiktok']);
        } else if (key.includes('whats')) {
            newCommercialData.socialPublications = consumeSocial(['whatsapp', 'whats']);
        } else if (key.includes('vídeo') || key.includes('video')) {
            const current = (commercialData.videoLimit || 0);
            if (current < amount) throw new Error(`Saldo insuficiente de Vídeo. Você possui ${current} unidades.`);
            newCommercialData.videoLimit = Math.max(0, current - amount);
        } else {
            const current = (usageCredits.postsRemaining || 0);
            if (current < amount && current !== undefined && current > 0) {
                updates.usage_credits = { ...usageCredits, postsRemaining: Math.max(0, current - amount) };
            }
        }

        updates.commercial_data = newCommercialData;

        const { error: updateError } = await supabase.from('users').update(updates).eq('id', userId);
        if (updateError) throw updateError;

        await logAction(userId, "User", "consume_booster", userId, `Consumiu ${amount} unidade(s) de booster: ${boosterKey}. Logs: ${logIds.join(', ')}`);

        const { data: updatedUser } = await supabase.from('users').select(USER_DB_FIELDS).eq('id', userId).single();

        return {
            success: true,
            message: "Boosters consumidos com sucesso!",
            updatedUser: mapDbToUser(updatedUser)
        };
    } catch (e: any) {
        logger.error("[BOOSTER ERROR]", e);
        return { success: false, message: e.message || "Erro ao consumir booster" };
    }
};
