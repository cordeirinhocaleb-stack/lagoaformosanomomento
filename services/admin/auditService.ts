
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
