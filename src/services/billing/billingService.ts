import { getSupabase } from '../core/supabaseClient';
import { logAction } from '../admin/auditService';

export interface BillingRecord {
    id?: string;
    user_id: string;
    advertiser_id?: string;
    amount: number;
    method: 'pix' | 'credit_card' | 'bank_transfer' | 'boleto';
    status: 'pending' | 'completed' | 'failed';
    sender_name?: string;
    sender_document?: string;
    proof_url?: string;
    metadata?: any;
    created_at?: string;
}

/**
 * Registra um novo comprovante ou intenção de pagamento no histórico
 */
export const recordPayment = async (record: BillingRecord) => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase não inicializado");

    // 1. Inserir registro de histórico
    const { data: billingData, error: billingError } = await supabase
        .from('billing_history')
        .insert([record])
        .select()
        .single();

    if (billingError) throw billingError;

    // 2. Se o pagamento for completado, atualizar créditos do usuário
    if (record.status === 'completed') {
        try {
            // Buscar saldo atual
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('site_credits')
                .eq('id', record.user_id)
                .single();

            if (!userError && user) {
                const currentCredits = Number(user.site_credits || 0);
                const newCredits = currentCredits + record.amount;

                await supabase
                    .from('users')
                    .update({ site_credits: newCredits })
                    .eq('id', record.user_id);

                await logAction(
                    record.user_id,
                    "Billing",
                    "credits_added",
                    record.user_id,
                    `Adicionados C$ ${record.amount} via recarga PIX.`
                );
            }

            if (record.advertiser_id) {
                await supabase
                    .from('advertisers')
                    .update({
                        isPaid: true,
                        billingStatus: 'paid'
                    })
                    .eq('id', record.advertiser_id);

                await logAction(
                    record.user_id,
                    "Advertiser",
                    "payment_status_updated",
                    record.advertiser_id,
                    `Status de pagamento do anunciante atualizado para PAGO.`
                );
            }

            await logAction(
                record.user_id,
                "Billing",
                "payment_completed",
                record.advertiser_id || record.user_id,
                `Pagamento ${record.method.toUpperCase()} de R$ ${record.amount} confirmado.`
            );
        } catch (e) {
            console.error("Erro ao atualizar créditos após pagamento:", e);
        }
    }

    return billingData;
};

/**
 * Busca histórico de pagamentos de um usuário ou anunciante
 */
export const getBillingHistory = async (filters: { user_id?: string, advertiser_id?: string }) => {
    const supabase = getSupabase();
    if (!supabase) return [];

    let query = supabase.from('billing_history').select('*').order('created_at', { ascending: false });

    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.advertiser_id) query = query.eq('advertiser_id', filters.advertiser_id);

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
};
