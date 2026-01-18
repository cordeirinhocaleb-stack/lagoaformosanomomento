
import { AuditLog } from '../../types';
import { getSupabase } from '../core/supabaseClient';

export const logAction = async (userId: string, userName: string, action: string, targetId: string, details: string) => {
    const supabase = getSupabase();
    if (!supabase) { return; }

    // Mapeia para o esquema do banco (audit_log singular)
    const log = {
        user_id: userId,
        user_name: userName,
        action,
        record_id: targetId,
        table_name: details.split(' ')[0] || 'unknown', // Tenta extrair a tabela do detalhe
        changes: { details },
        created_at: new Date().toISOString()
    };

    await supabase.from('audit_log').insert(log);
};

export const getAuditLogs = async (): Promise<any[]> => {
    const supabase = getSupabase();
    if (!supabase) { return []; }
    const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10);
    return data || [];
};

export const getUserPurchaseLogs = async (userId: string): Promise<any[]> => {
    const supabase = getSupabase();
    if (!supabase) { return []; }

    // Busca logs de "purchase_item" onde o record_id é o ID do usuário (já que logAction usa userId como targetId em compras)
    // Vimos no step 7516 (userService.ts) que logAction é chamado com:
    // logAction(userId, "User", "purchase_item", userId, details)

    const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .in('action', ['purchase_item', 'admin_pos_sale'])
        .eq('record_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching purchase logs:", error);
        return [];
    }
    return data || [];
};
