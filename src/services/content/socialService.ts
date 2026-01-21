import { SocialPost } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { mapSocialPostToDb } from './contentMappers';

export const saveSocialPost = async (post: SocialPost) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const payload = mapSocialPostToDb(post);
    const { error } = await supabase.from('social_posts').insert(payload);
    if (error) { throw error; }
};
