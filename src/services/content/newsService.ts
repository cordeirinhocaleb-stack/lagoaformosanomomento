import { NewsItem } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { mapNewsFromDb, mapNewsToDb } from './contentMappers';

export const createNews = async (news: NewsItem) => {
    const supabase = getSupabase();
    if (!supabase) { throw new Error("Supabase client not initialized"); }

    const payload = mapNewsToDb(news);
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { data, error } = await supabase.from('news').insert(payload).select().single();

    if (error) {
        console.error("❌ Erro Create News:", JSON.stringify(error, null, 2));
        throw error;
    }
    return data;
};

export const updateNews = async (news: NewsItem) => {
    const supabase = getSupabase();
    if (!supabase) { throw new Error("Supabase client not initialized"); }

    const payload = mapNewsToDb(news);
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    // Proteção: IDs do Instagram ou outros não-UUIDs não estão no banco 'news'
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(news.id);
    if (!isUuid) {
        console.warn("Attempted to update non-UUID news item:", news.id);
        return;
    }

    const { error } = await supabase.from('news').update(payload).eq('id', news.id);

    if (error) {
        console.error("❌ Erro Update News:", JSON.stringify(error, null, 2));
        throw error;
    }
};

export const deleteNews = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) { throw error; }
};

export const incrementNewsView = async (id: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Proteção: IDs do Instagram ou outros não-UUIDs não estão no banco 'news'
    // UUIDs têm 36 caracteres e hífens. IDs do Instagram são apenas números longos.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return;

    try {
        // Fetch current views
        const { data } = await supabase.from('news').select('views').eq('id', id).single();
        if (data) {
            await supabase.from('news').update({ views: (data.views || 0) + 1 }).eq('id', id);
        }
    } catch (e) {
        console.warn("View counter error:", e);
    }
};
