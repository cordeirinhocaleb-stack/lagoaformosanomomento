import { getSupabase } from '../../core/supabaseClient';
import { logAction } from '../../admin/auditService';
import { mapDbToUser } from '../userService';
import { logger } from '@/services/core/debugLogger';
import { validatePurchaseData, sanitizeNumber, PurchaseDetails } from './validation';

export const userPurchaseItem = async (
    userId: string,
    itemType: 'plan' | 'boost',
    itemId: string,
    cost: number,
    itemName: string,
    details?: PurchaseDetails,
    cashbackAmount: number = 0
) => {
    const supabase = getSupabase();
    if (!supabase) { return { success: false, message: "Erro de conexão" }; }

    try {
        const validation = validatePurchaseData(itemType, itemId, cost, itemName, details);
        if (!validation.isValid) {
            logger.error('[userPurchaseItem] Validação falhou:', validation.errors);
            return { success: false, message: `Dados inválidos: ${validation.errors.join(', ')}` };
        }

        const sanitizedCost = sanitizeNumber(cost, 0);
        if (sanitizedCost === 0) {
            return { success: false, message: "Custo inválido após sanitização" };
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('site_credits, active_plans, advertiser_plan, usage_credits, subscription_end, commercial_data')
            .eq('id', userId)
            .maybeSingle();

        if (userError || !user) {
            logger.error('[userPurchaseItem] Erro ao buscar usuário:', userError);
            throw new Error("Usuário não encontrado");
        }

        const currentCredits = sanitizeNumber(user.site_credits, 0);

        if (currentCredits < sanitizedCost) {
            return {
                success: false,
                message: `Saldo insuficiente. Necessário C$ ${sanitizedCost.toFixed(2)}, disponível C$ ${currentCredits.toFixed(2)}.`
            };
        }

        const updates: any = {
            site_credits: currentCredits - sanitizedCost + (sanitizeNumber(cashbackAmount, 0))
        };

        if (itemType === 'plan') {
            const currentPlans = Array.isArray(user.active_plans)
                ? user.active_plans
                : (user.advertiser_plan && user.advertiser_plan !== 'free' ? [user.advertiser_plan] : []);

            const uniquePlans = new Set([...currentPlans, itemId]);
            if (uniquePlans.size > 3) {
                return {
                    success: false,
                    message: "Limite de 3 tipos de planos diferentes atingido. Você pode repetir planos existentes, mas não adicionar um 4º tipo."
                };
            }

            const newPlans = [...currentPlans, itemId];
            updates.active_plans = newPlans;
            updates.advertiser_plan = newPlans[0];

            const now = new Date();
            const endDate = new Date();
            endDate.setDate(now.getDate() + 30);

            if (!user.subscription_end || new Date(user.subscription_end) < now) {
                updates.subscription_start = now.toISOString();
                updates.subscription_end = endDate.toISOString();
            } else {
                const currentEnd = new Date(user.subscription_end);
                currentEnd.setDate(currentEnd.getDate() + 30);
                updates.subscription_end = currentEnd.toISOString();
            }

            if (details && typeof details === 'object') {
                const currentUsage = user.usage_credits || {};
                updates.usage_credits = {
                    ...currentUsage,
                    postsRemaining: sanitizeNumber(currentUsage.postsRemaining, 0) + sanitizeNumber(details.maxProducts, 0),
                    videosRemaining: sanitizeNumber(currentUsage.videosRemaining, 0) + sanitizeNumber(details.videoLimit, 0),
                };
            }

        } else if (itemType === 'boost') {
            const currentUsage = user.usage_credits || {};
            const commercialData = user.commercial_data || {};
            const detailsObj = (details && typeof details === 'object') ? (details as any) : {};

            updates.usage_credits = {
                ...currentUsage,
                postsRemaining: sanitizeNumber(currentUsage.postsRemaining, 0) + sanitizeNumber(detailsObj.posts, 0),
                videosRemaining: sanitizeNumber(currentUsage.videosRemaining, 0) + sanitizeNumber(detailsObj.videos, 0),
                featuredDaysRemaining: sanitizeNumber(currentUsage.featuredDaysRemaining, 0) + sanitizeNumber(detailsObj.featuredDays, 0),
                bannersRemaining: sanitizeNumber(currentUsage.bannersRemaining, 0) + sanitizeNumber(detailsObj.banners, 0),
                popupsRemaining: sanitizeNumber(currentUsage.popupsRemaining, 0) + sanitizeNumber(detailsObj.popups, 0),
                jobsRemaining: sanitizeNumber(currentUsage.jobsRemaining, 0) + sanitizeNumber(detailsObj.jobs, 0),
                gigsRemaining: sanitizeNumber(currentUsage.gigsRemaining, 0) + sanitizeNumber(detailsObj.gigs, 0),
            };

            let newCommercialData = { ...commercialData };
            newCommercialData.socialPublications = newCommercialData.socialPublications || {};

            if (itemName.includes('Insta')) {
                const current = (newCommercialData.socialPublications.instagram || 0);
                newCommercialData.socialPublications.instagram = current + 1;
            } else if (itemName.includes('Face')) {
                const current = (newCommercialData.socialPublications.facebook || 0);
                newCommercialData.socialPublications.facebook = current + 1;
            } else if (itemName.includes('Youtube')) {
                const current = (newCommercialData.socialPublications.youtube || 0);
                newCommercialData.socialPublications.youtube = current + 1;
            } else if (itemName.includes('Vídeo') || itemName.includes('Video')) {
                const current = (newCommercialData.videoLimit || 0);
                newCommercialData.videoLimit = current + 1;
            }

            updates.commercial_data = newCommercialData;
        }

        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (updateError) {
            logger.error('[userPurchaseItem] Erro ao atualizar:', updateError);
            throw updateError;
        }

        await logAction(
            userId,
            "User",
            "purchase_item",
            userId,
            `Comprou ${itemType} "${itemName}" por C$ ${sanitizedCost.toFixed(2)}${cashbackAmount > 0 ? ` (+C$ ${cashbackAmount.toFixed(2)} Cashback)` : ''}`
        );

        if (cashbackAmount > 0) {
            await logAction(userId, "User", "cashback_received", userId, `Recebeu C$ ${cashbackAmount.toFixed(2)} de cashback`);
        }

        return {
            success: true,
            message: "Compra realizada com sucesso!",
            updatedUser: mapDbToUser({ ...user, ...updates })
        };

    } catch (e: unknown) {
        logger.error("[userPurchaseItem] Erro crítico:", e);
        const message = e instanceof Error ? e.message : "Erro ao processar compra";
        return { success: false, message };
    }
};
