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
        console.error("❌ Erro Create News:", error);
        throw error;
    }
    return data;
};

export const updateNews = async (news: NewsItem) => {
    const supabase = getSupabase();
    if (!supabase) { throw new Error("Supabase client not initialized"); }

    const payload = mapNewsToDb(news);
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { error } = await supabase.from('news').update(payload).eq('id', news.id);

    if (error) {
        console.error("❌ Erro Update News:", error);
        throw error;
    }
};

export const deleteNews = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) { throw error; }
};
