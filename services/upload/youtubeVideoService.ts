
/**
 * YouTube Upload Service
 * Handles direct video upload to YouTube via API
 * Requires OAuth 2.0 authentication
 */

import { validateVideo } from '../../utils/videoValidator';

export interface YouTubeVideoMetadata {
    title: string;
    description: string;
    tags: string[];
    privacy: 'public' | 'unlisted' | 'private';
    categoryId?: string;
    madeForKids?: boolean;
    videoId?: string;
    uploadedAt?: string;
}

export interface YouTubeUploadResult {
    videoId: string;
    status: 'uploading' | 'processing' | 'ready' | 'failed';
    url: string;
    embedUrl: string;
    thumbnailUrl: string;
}

export interface YouTubeUploadProgress {
    loaded: number;
    total: number;
    percentage: number;
    stage: 'validating' | 'uploading' | 'processing';
}

/**
 * Upload de vídeo para YouTube via API
 * Limite: 1GB
 * 
 * NOTA: Este é um placeholder. A implementação real requer:
 * 1. Backend com credenciais OAuth 2.0
 * 2. Edge Function no Supabase para processar upload
 * 3. Tokens de acesso armazenados de forma segura
 */
export const uploadVideoToYouTube = async (
    file: File,
    metadata: YouTubeVideoMetadata,
    accessToken: string,
    onProgress?: (progress: YouTubeUploadProgress) => void
): Promise<YouTubeUploadResult> => {

    // 1. Validar vídeo
    if (onProgress) {
        onProgress({ loaded: 0, total: 100, percentage: 0, stage: 'validating' });
    }

    const validation = await validateVideo(file, 'youtube');
    console.log('✅ Vídeo validado para YouTube:', validation);

    // 2. Criar job de upload no backend
    // O upload real acontece via Edge Function para segurança
    const uploadJob = await createYouTubeUploadJob(file, metadata, accessToken, onProgress);

    return uploadJob;
};

/**
 * Cria job de upload no backend (Edge Function)
 * O backend faz o upload real para manter credenciais seguras
 */
const createYouTubeUploadJob = async (
    file: File,
    metadata: YouTubeVideoMetadata,
    accessToken: string,
    onProgress?: (progress: YouTubeUploadProgress) => void
): Promise<YouTubeUploadResult> => {

    // 1. Initiate Resumable Upload Session
    const initResponse = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Length': file.size.toString(),
            'X-Upload-Content-Type': file.type
        },
        body: JSON.stringify({
            snippet: {
                title: metadata.title,
                description: metadata.description,
                tags: metadata.tags,
                categoryId: metadata.categoryId || '22' // 22 = People & Blogs
            },
            status: {
                privacyStatus: metadata.privacy,
                selfDeclaredMadeForKids: metadata.madeForKids
            }
        })
    });

    if (!initResponse.ok) {
        throw new Error(`Falha ao iniciar upload: ${initResponse.statusText}`);
    }

    const uploadUrl = initResponse.headers.get('Location');
    if (!uploadUrl) { throw new Error('Não foi possível obter URL de upload do YouTube'); }

    // 2. Perform Binary Upload (XHR for Progress)
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percentage = Math.round((e.loaded / e.total) * 100);
                onProgress({
                    loaded: e.loaded,
                    total: e.total,
                    percentage: percentage,
                    stage: percentage < 100 ? 'uploading' : 'processing'
                });
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                resolve({
                    videoId: response.id,
                    status: 'ready', // YouTube returns ready state generally after processing
                    url: `https://youtu.be/${response.id}`,
                    embedUrl: `https://www.youtube.com/embed/${response.id}`,
                    thumbnailUrl: response.snippet?.thumbnails?.high?.url || ''
                });
            } else {
                reject(new Error(`Erro no upload: ${xhr.status} ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => reject(new Error('Erro de rede durante upload para o YouTube'));

        xhr.send(file);
    });
};

/**
 * Verifica status de upload no YouTube
 */
export const checkYouTubeUploadStatus = async (videoId: string): Promise<YouTubeUploadResult['status']> => {
    // TODO: Implementar verificação via API
    console.log('🔍 Verificando status do vídeo:', videoId);
    return 'processing';
};

/**
 * Cancela upload em andamento
 */
export const cancelYouTubeUpload = async (videoId: string): Promise<void> => {
    // TODO: Implementar cancelamento
    console.log('❌ Cancelando upload:', videoId);
};

/**
 * Deleta vídeo do YouTube
 */
export const deleteVideoFromYouTube = async (videoId: string): Promise<void> => {
    // TODO: Implementar via backend
    console.log('🗑️ Deletando vídeo do YouTube:', videoId);
};

/**
 * Gera URL de embed do YouTube
 */
export const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Extrai ID do vídeo de uma URL do YouTube
 */
export const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};
