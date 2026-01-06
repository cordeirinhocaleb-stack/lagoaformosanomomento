
/**
 * Video Validator Utility
 * Validates video files based on source (internal vs YouTube)
 */

export interface VideoValidationResult {
    isValid: boolean;
    error?: string;
    duration?: number;
    size?: number;
    width?: number;
    height?: number;
    resolution?: string;
}

export interface VideoValidationRules {
    maxSize: number; // bytes
    maxDuration: number; // seconds
    source: 'internal' | 'youtube';
}

const RULES: Record<'internal' | 'youtube', VideoValidationRules> = {
    internal: {
        maxSize: 100 * 1024 * 1024, // 100MB
        maxDuration: 60, // 1 minuto
        source: 'internal'
    },
    youtube: {
        maxSize: 1024 * 1024 * 1024, // 1GB
        maxDuration: Infinity, // Sem limite
        source: 'youtube'
    }
};

/**
 * Valida um arquivo de vídeo
 */
export const validateVideo = async (
    file: File,
    source: 'internal' | 'youtube'
): Promise<VideoValidationResult> => {
    const rules = RULES[source];

    // Validar tamanho
    if (file.size > rules.maxSize) {
        const maxSizeMB = rules.maxSize / 1024 / 1024;
        throw new Error(
            `Arquivo muito grande. Máximo permitido: ${maxSizeMB}MB (${source === 'internal' ? 'Cloud Interno' : 'YouTube'})`
        );
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('video/')) {
        throw new Error('O arquivo deve ser um vídeo válido');
    }

    // Validar duração e obter metadados
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);

            const duration = video.duration;
            const width = video.videoWidth;
            const height = video.videoHeight;

            // Validar duração
            if (duration > rules.maxDuration) {
                const maxDurationMin = Math.floor(rules.maxDuration / 60);
                const maxDurationSec = rules.maxDuration % 60;
                reject(
                    new Error(
                        `Vídeo muito longo. Máximo permitido: ${maxDurationMin}min ${maxDurationSec}s (${source === 'internal' ? 'Cloud Interno' : 'YouTube'})`
                    )
                );
                return;
            }

            resolve({
                duration,
                width,
                height,
                size: file.size,
                isValid: true
            });
        };

        video.onerror = () => {
            window.URL.revokeObjectURL(video.src);
            reject(new Error('Erro ao carregar vídeo. Verifique se o arquivo é válido.'));
        };

        video.src = URL.createObjectURL(file);
    });
};

/**
 * Formata duração em segundos para string legível
 */
export const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formata tamanho de arquivo para string legível
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

/**
 * Verifica se vídeo requer Smart Playback (>1min)
 */
export const requiresSmartPlayback = (duration: number): boolean => {
    return duration > 60;
};
