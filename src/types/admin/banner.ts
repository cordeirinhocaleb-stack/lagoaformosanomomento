/**
 * Tipos para componentes de Banner Editor
 * @module types/admin/banner
 */

export interface BannerEffects {
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface YouTubeMetadata {
    videoId: string;
    title: string;
    description?: string;
    validationInfo: ValidationInfo;
}

export interface ValidationInfo {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

export interface CloudinaryUploadError {
    message: string;
    code?: string;
    details?: unknown;
}

export interface BannerVideoSource {
    type: 'cloudinary' | 'youtube';
    url: string;
    metadata?: YouTubeMetadata;
}
