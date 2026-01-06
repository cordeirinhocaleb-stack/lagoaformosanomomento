
/**
 * Cloudinary Upload Service for Banner Videos
 * Handles upload of internal videos (max 100MB, 1min duration)
 */

import { validateVideo } from '../../utils/videoValidator';

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    duration: number;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

export interface CloudinaryUploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

/**
 * Upload de vídeo para Cloudinary (Cloud Interno)
 * Limite: 100MB e máximo 1 minuto de duração
 */
export const uploadVideoToCloudinary = async (
    file: File,
    onProgress?: (progress: CloudinaryUploadProgress) => void
): Promise<CloudinaryUploadResult> => {

    // 1. Validar vídeo (tamanho e duração)
    const validation = await validateVideo(file, 'internal');
    console.log('✅ Vídeo validado:', validation);

    // 2. Preparar FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'lfnm_videos'); // Preset configurado no Cloudinary
    formData.append('resource_type', 'video');
    formData.append('folder', 'banner_videos');

    // 3. Upload com progress tracking
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress handler
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress({
                    loaded: e.loaded,
                    total: e.total,
                    percentage: Math.round((e.loaded / e.total) * 100)
                });
            }
        });

        // Success handler
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve({
                    url: response.secure_url,
                    publicId: response.public_id,
                    duration: response.duration,
                    width: response.width,
                    height: response.height,
                    format: response.format,
                    bytes: response.bytes
                });
            } else {
                reject(new Error(`Upload falhou: ${xhr.statusText}`));
            }
        });

        // Error handler
        xhr.addEventListener('error', () => {
            reject(new Error('Erro de rede durante upload'));
        });

        // Abort handler
        xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelado'));
        });

        // Enviar requisição
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${getCloudinaryCloudName()}/video/upload`);
        xhr.send(formData);
    });
};

/**
 * Deleta vídeo do Cloudinary
 */
export const deleteVideoFromCloudinary = async (publicId: string): Promise<void> => {
    // Implementar via backend (requer API secret)
    console.warn('Delete de vídeo deve ser feito via backend:', publicId);
    // TODO: Criar endpoint no backend para deletar
};

/**
 * Obtém Cloud Name do Cloudinary das configurações
 */
const getCloudinaryCloudName = (): string => {
    // Buscar das configurações do sistema ou variável de ambiente
    return process.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
};

/**
 * Gera URL de thumbnail do vídeo
 */
export const getVideoThumbnail = (publicId: string, width: number = 640): string => {
    const cloudName = getCloudinaryCloudName();
    return `https://res.cloudinary.com/${cloudName}/video/upload/w_${width},c_fill,f_jpg/${publicId}.jpg`;
};
