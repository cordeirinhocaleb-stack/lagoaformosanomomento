import { Advertiser } from '../../types';
import { getSupabase } from '../core/supabaseClient';
import { mapAdvertiserToDb, mapAdvertiserFromDb } from './contentMappers';

export const upsertAdvertiser = async (advertiser: Advertiser): Promise<Advertiser | null> => {
    const supabase = getSupabase();
    if (!supabase) { return null; }
    const payload = mapAdvertiserToDb(advertiser);

    console.log("🔄 Upserting Advertiser:", {
        incomingId: advertiser.id,
        payloadId: payload.id,
        payloadName: payload.name
    });

    const { data, error } = await supabase.from('advertisers').upsert(payload).select().single();

    if (error) {
        console.error("❌ Upsert Error:", error);
        throw error;
    }

    console.log("✅ Upsert Success. Returned ID:", data?.id);
    return mapAdvertiserFromDb(data);
};

export const deleteAdvertiser = async (id: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.error("❌ Supabase não inicializado para exclusão");
        return false;
    }
    console.log(`📡 Tentando excluir parceiro ID: ${id}`);
    const { error } = await supabase.from('advertisers').delete().eq('id', id);
    if (error) {
        console.error(`❌ Erro Supabase ao excluir parceiro: ${error.message}`, error);
        throw error;
    }
    console.log(`✅ Parceiro ${id} excluído com sucesso do banco.`);
    return true;
};

export const getUserAdvertisers = async (userId: string): Promise<Advertiser[]> => {
    const supabase = getSupabase();
    if (!supabase) return [];

    // Attempt with both camelCase and snake_case for owner field
    let { data, error } = await supabase.from('advertisers').select('*').eq('ownerId', userId);

    if (error && error.message.includes('ownerId')) {
        ({ data, error } = await supabase.from('advertisers').select('*').eq('owner_id', userId));
    }

    if (error || !data) return [];
    return data.map(mapAdvertiserFromDb);
};

export const incrementAdvertiserClick = async (id: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) return;
    // RPC call is safer for atomic increments, but for now we'll do a simple update for speed
    // Ideally: await supabase.rpc('increment_advertiser_click', { row_id: id });

    // Fetch current clicks first (optimistic approach for now without RPC)
    const { data } = await supabase.from('advertisers').select('clicks').eq('id', id).single();
    if (data) {
        await supabase.from('advertisers').update({ clicks: (data.clicks || 0) + 1 }).eq('id', id);
    }
};

export const incrementAdvertiserView = async (id: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Fetch current views
    const { data } = await supabase.from('advertisers').select('views').eq('id', id).single();
    if (data) {
        await supabase.from('advertisers').update({ views: (data.views || 0) + 1 }).eq('id', id);
    }
};

