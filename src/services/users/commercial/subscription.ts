import { getSupabase } from '../../core/supabaseClient';
import { logAction } from '../../admin/auditService';
import { logger } from '@/services/core/debugLogger';

export const removeUserItem = async (userId: string, itemType: string, itemId: string) => {
    const supabase = getSupabase();
    if (!supabase) return { success: false, message: "Erro de conexão" };

    try {
        const { data: user, error: fetchError } = await supabase.from('users').select('activePlans, advertiser_plan').eq('id', userId).single();
        if (fetchError || !user) throw new Error("Usuário não encontrado");

        if (itemType === 'plan') {
            const currentPlans = (user.activePlans as string[]) || [];

            // Remove TODOS os planos com esse ID
            const newPlans = currentPlans.filter(p => String(p).trim() !== String(itemId).trim());

            const updates: any = {
                activePlans: newPlans,
                advertiser_plan: newPlans.length > 0 ? newPlans[0] : null
            };

            if (newPlans.length === 0) {
                updates.subscriptionEnd = null;
                updates.subscriptionStart = null;
            }

            const { error: updateError } = await supabase.from('users').update(updates).eq('id', userId);

            if (updateError) {
                return { success: false, message: `Erro no banco (Schema/RLS): ${updateError.message}` };
            }

            try {
                await logAction(userId, "User", "remove_item", userId, `Removeu plano: ${itemId}`);
            } catch (logErr) {
                logger.warn("Aviso: Log de auditoria falhou (403), mas a remoção foi enviada.");
            }

            return { success: true, message: "Plano removido com sucesso", updatedPlans: newPlans };
        }

        return { success: false, message: "Tipo de item não suportado para remoção" };
    } catch (e: any) {
        return { success: false, message: e.message || "Erro ao remover item" };
    }
};
