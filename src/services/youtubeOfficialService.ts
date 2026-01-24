/**
 * YouTube Official Service
 * Handles YouTube Official configuration and upload history
 */

import { getSupabase } from './core/supabaseClient';
import { YouTubeOfficialConfig } from '@/components/admin/YouTubeOfficialConfigModal';

export interface UploadHistoryRecord {
    id: string;
    userId: string;
    fileName: string;
    fileSize: number;
    fileType: 'video' | 'image';
    localId?: string;
    destination: 'youtube' | 'cloudinary' | 'instagram' | 'facebook' | 'tiktok';
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    progress: number;
    finalUrl?: string;
    youtubeVideoId?: string;
    errorMessage?: string;
    metadata?: any;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    newsId?: string;
}

/**
 * Get YouTube Official configuration for a user
 */
export async function getYouTubeOfficialConfig(userId: string): Promise<YouTubeOfficialConfig | null> {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('youtube_official_configs')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No config found
            return null;
        }
        throw error;
    }

    if (!data) return null;

    return {
        id: data.id,
        userId: data.user_id,
        googleAccessToken: data.google_access_token,
        googleRefreshToken: data.google_refresh_token,
        channelId: data.channel_id,
        defaultMetadata: {
            title: data.default_title,
            description: data.default_description,
            tags: data.default_tags || [],
            privacy: data.default_privacy,
            categoryId: data.default_category_id,
            madeForKids: data.default_made_for_kids
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}

/**
 * Save or update YouTube Official configuration
 */
export async function saveYouTubeOfficialConfig(config: YouTubeOfficialConfig): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const dbConfig = {
        user_id: config.userId,
        google_access_token: config.googleAccessToken,
        google_refresh_token: config.googleRefreshToken,
        channel_id: config.channelId,
        default_title: config.defaultMetadata.title,
        default_description: config.defaultMetadata.description,
        default_tags: config.defaultMetadata.tags,
        default_privacy: config.defaultMetadata.privacy,
        default_category_id: config.defaultMetadata.categoryId,
        default_made_for_kids: config.defaultMetadata.madeForKids,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('youtube_official_configs')
        .upsert(dbConfig, {
            onConflict: 'user_id'
        });

    if (error) {
        throw error;
    }
}

/**
 * Create upload history record
 */
export async function createUploadHistoryRecord(record: Omit<UploadHistoryRecord, 'id' | 'createdAt'>): Promise<string> {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
        .from('upload_history')
        .insert({
            user_id: record.userId,
            file_name: record.fileName,
            file_size: record.fileSize,
            file_type: record.fileType,
            local_id: record.localId,
            destination: record.destination,
            status: record.status,
            progress: record.progress,
            final_url: record.finalUrl,
            youtube_video_id: record.youtubeVideoId,
            error_message: record.errorMessage,
            metadata: record.metadata,
            started_at: record.startedAt,
            completed_at: record.completedAt,
            news_id: record.newsId
        })
        .select('id')
        .single();

    if (error) {
        throw error;
    }

    return data.id;
}

/**
 * Update upload history record
 */
export async function updateUploadHistoryRecord(
    id: string,
    updates: Partial<Omit<UploadHistoryRecord, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const dbUpdates: any = {};

    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.finalUrl !== undefined) dbUpdates.final_url = updates.finalUrl;
    if (updates.youtubeVideoId !== undefined) dbUpdates.youtube_video_id = updates.youtubeVideoId;
    if (updates.errorMessage !== undefined) dbUpdates.error_message = updates.errorMessage;
    if (updates.startedAt !== undefined) dbUpdates.started_at = updates.startedAt;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    if (updates.metadata !== undefined) dbUpdates.metadata = updates.metadata;

    const { error } = await supabase
        .from('upload_history')
        .update(dbUpdates)
        .eq('id', id);

    if (error) {
        throw error;
    }
}

/**
 * Get upload history for a user
 */
export async function getUploadHistory(
    userId: string,
    options?: {
        limit?: number;
        destination?: string;
        status?: string;
    }
): Promise<UploadHistoryRecord[]> {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    let query = supabase
        .from('upload_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (options?.destination) {
        query = query.eq('destination', options.destination);
    }

    if (options?.status) {
        query = query.eq('status', options.status);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return (data || []).map((record: any) => ({
        id: record.id,
        userId: record.user_id,
        fileName: record.file_name,
        fileSize: record.file_size,
        fileType: record.file_type,
        localId: record.local_id,
        destination: record.destination,
        status: record.status,
        progress: record.progress,
        finalUrl: record.final_url,
        youtubeVideoId: record.youtube_video_id,
        errorMessage: record.error_message,
        metadata: record.metadata,
        createdAt: record.created_at,
        startedAt: record.started_at,
        completedAt: record.completed_at,
        newsId: record.news_id
    }));
}

/**
 * Delete old completed upload history records
 * (Keep only last 30 days)
 */
export async function cleanupOldUploadHistory(userId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { error } = await supabase
        .from('upload_history')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'completed')
        .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
        throw error;
    }
}
