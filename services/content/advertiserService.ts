import { Advertiser } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { mapAdvertiserToDb } from './contentMappers';

export const upsertAdvertiser = async (advertiser: Advertiser) => {
    const supabase = getSupabase();
    if (!supabase) { return; }
    const payload = mapAdvertiserToDb(advertiser);
    const { error } = await supabase.from('advertisers').upsert(payload);
    if (error) { throw error; }
};
