
import { getSupabase } from '../core/supabaseClient';

export interface Tag {
    id: string;
    name: string;
    usage_count: number;
}

/**
 * Searches for tags matching the query.
 * Ordered by usage_count ASC (Least used to Most used) as requested by user.
 */
export const searchTags = async (query: string): Promise<Tag[]> => {
    const supabase = getSupabase();
    if (!supabase || !query) return [];

    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .ilike('name', `${query}%`)
        .order('usage_count', { ascending: true }) // Requested: "menos usados para mais usados"
        .limit(10);

    if (error) {
        console.error('Error searching tags:', error);
        return [];
    }

    return data || [];
};

/**
 * Increments usage count for an existing tag or creates a new one.
 * This should be called when a tag is selected/created in the UI.
 */
export const incrementTagUsage = async (tagName: string) => {
    const supabase = getSupabase();
    if (!supabase || !tagName) return;

    const cleanName = tagName.trim();
    if (!cleanName) return;

    // Check if exists
    const { data: existing } = await supabase
        .from('tags')
        .select('id, usage_count')
        .eq('name', cleanName)
        .single();

    if (existing) {
        // Increment
        await supabase.from('tags').update({
            usage_count: (existing.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
        }).eq('id', existing.id);
    } else {
        // Insert new
        await supabase.from('tags').insert({
            name: cleanName,
            usage_count: 1
        });
    }
};
