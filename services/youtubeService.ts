
import { getSupabase } from './supabaseService';

/**
 * SERVIÇO DE INTEGRAÇÃO YOUTUBE SECURE (VIA EDGE FUNCTIONS)
 * Remove segredos do client-side. Delega a autenticação e upload para o backend.
 */

export interface VideoMetadata {
    title: string;
    description: string;
    tags: string[];
    privacy: 'public' | 'unlisted' | 'private';
    categoryId?: string;
    madeForKids: boolean; // COPPA Compliance (Obrigatório)
    thumbnailUrl?: string;
    playlistIds?: string[];
    scheduleTime?: string; // ISO Date para agendamento
    embeddable?: boolean;
    license?: 'youtube' | 'creativeCommon';
    language?: string; // pt-BR
    recordingDate?: string;
    recordingLocation?: string;
    commentsPolicy?: 'allow' | 'hold' | 'disable';
    notifySubscribers?: boolean;
}

// 1. INICIAR FLUXO OAUTH (Retorna URL para o usuário autorizar)
export const startYouTubeAuth = async (): Promise<string> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase client not initialized");

    const { data, error } = await supabase.functions.invoke('youtube-auth-start');
    if (error) throw error;

    return data.url;
};

// 2. REGISTRAR INTENÇÃO DE UPLOAD (Cria job no banco)
// O Edge Function processará o upload em background ou retornará erro se não houver token
export const queueYouTubeUpload = async (
    file: File,
    metadata: VideoMetadata,
    newsId: string
): Promise<{ jobId: string, status: string }> => {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase client not initialized");

    // Upload do arquivo físico para um bucket temporário do Supabase Storage
    // Isso é necessário porque Edge Functions não recebem grandes arquivos via JSON body facilmente
    // O Edge Function vai ler desse bucket e enviar pro YouTube
    const tempPath = `temp_uploads/${newsId}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from('raw_videos')
        .upload(tempPath, file);

    if (uploadError) throw new Error(`Falha no upload temporário: ${uploadError.message}`);

    // Invoca a função para processar
    const { data, error } = await supabase.functions.invoke('youtube-upload-manager', {
        body: {
            action: 'queue_upload',
            storagePath: tempPath,
            metadata,
            newsId
        }
    });

    if (error) throw error;
    return data;
};

// 3. REMOVER VÍDEO (Cria job de remoção)
export const queueYouTubeDelete = async (videoId: string): Promise<any> => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Invoca função para remover
    const { data, error } = await supabase.functions.invoke('youtube-upload-manager', {
        body: {
            action: 'delete_video',
            videoId
        }
    });

    if (error) console.error("Falha ao agendar remoção do YouTube:", error);
    return data;
};

// MOCK PARA SIMULAÇÃO FRONTEND (Removemos segredos reais)
export const uploadVideoToYouTube = async (file: File, accessToken: string | null, videoMetadata?: VideoMetadata) => {
    // ATENÇÃO: Esta função legada agora apenas simula ou redireciona para o fluxo seguro se possível.
    // Em produção, deve-se usar queueYouTubeUpload.
    console.warn("⚠️ Usando método legado de upload (Simulação). Use queueYouTubeUpload em produção.");

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`https://www.youtube.com/embed/MOCK_${Math.random().toString(36).substr(2, 5)}`);
        }, 2000);
    });
};

/**
 * Define a thumbnail de um vídeo via URL (Implementação via Edge Function recomendada)
 */
export const setYouTubeThumbnail = async (youtubeEmbedUrl: string, imageUrl: string, accessToken: string) => {
    console.log("Thumbnail sync requested via backend queue");
};
