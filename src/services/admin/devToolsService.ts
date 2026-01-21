// Dev Tools Service - Ferramentas de desenvolvimento
import { getSupabase } from '../core/supabaseClient';
import { logger } from '../core/debugLogger';

export const resetAllUsersBoosters = async () => {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, message: 'Supabase client não disponível', count: 0 };
        }

        // Reset boosters for all users
        const { data, error } = await supabase
            .from('users')
            .update({ boosters: {} })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all except dummy

        if (error) {
            logger.error('Erro ao resetar boosters:', error);
            return { success: false, message: error.message, count: 0 };
        }

        const count = 0; // Supabase update doesn't return affected rows count by default
        logger.log(`✅ Boosters resetados com sucesso`);

        return {
            success: true,
            message: 'Boosters resetados com sucesso!',
            count
        };
    } catch (error) {
        logger.error('Erro crítico em resetAllUsersBoosters:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Erro desconhecido',
            count: 0
        };
    }
};
