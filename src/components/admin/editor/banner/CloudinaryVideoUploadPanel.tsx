/**
 * Cloudinary Video Uploader Component
 * For internal video uploads (max 100MB, 1min duration)
 * 
 * IMPORTANT: This component stores videos LOCALLY and only uploads
 * to Cloudinary when the user saves/publishes the post.
 */

import React, { useState, useCallback } from 'react';
import { validateVideo, formatDuration, formatFileSize } from '@/utils/videoValidator';
import { storeLocalFile } from '@/services/storage/localStorageService';
import { logger } from '@/services/core/debugLogger';

interface CloudinaryVideoUploaderProps {
    onUploadComplete: (localId: string) => void;
    onUploadError: (error: string) => void;
}

export const CloudinaryVideoUploader: React.FC<CloudinaryVideoUploaderProps> = ({
    onUploadComplete,
    onUploadError
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [videoInfo, setVideoInfo] = useState<{
        duration: number;
        size: number;
        width?: number;
        height?: number;
    } | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) { return; }

        setIsValidating(true);
        setError('');

        try {
            // Validate video
            const validation = await validateVideo(file, 'internal');

            if (!validation.isValid) {
                setError(validation.error || 'Vídeo inválido');
                onUploadError(validation.error || 'Vídeo inválido');
                setIsValidating(false);
                return;
            }

            // Create blob URL for preview
            const blobUrl = URL.createObjectURL(file);
            setPreviewUrl(blobUrl);
            setSelectedFile(file);
            setVideoInfo({
                duration: validation.duration || 0,
                size: file.size,
                width: validation.width,
                height: validation.height
            });

            // Store file locally (will upload on save/publish)
            const localId = await storeLocalFile(file);

            // Return local ID as URL (will be replaced with real URL on upload)
            onUploadComplete(localId);

            logger.log('📹 Vídeo armazenado localmente:', localId);
            setIsValidating(false);

        } catch (error: unknown) {
            logger.error('❌ Erro ao processar vídeo:', error);
            const message = error instanceof Error ? error.message : 'Erro ao processar vídeo';
            setError(message);
            onUploadError(message);
            setIsValidating(false);
        }
    }, [onUploadComplete, onUploadError]);

    const handleRemove = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl('');
        setVideoInfo(null);
        setError('');
        onUploadComplete('');
    }, [previewUrl, onUploadComplete]);

    return (
        <div className="space-y-4">
            {!selectedFile ? (
                <div>
                    <label className="block w-full border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <i className="fas fa-cloud-upload-alt text-5xl text-blue-400 mb-3"></i>
                        <p className="text-gray-700 font-semibold mb-1">
                            Clique para selecionar vídeo
                        </p>
                        <p className="text-xs text-gray-500">
                            Máximo: 100MB, 1 minuto
                        </p>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={isValidating}
                        />
                    </label>

                    {isValidating && (
                        <div className="mt-4 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-gray-600 mt-2">Validando vídeo...</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="relative rounded-xl overflow-hidden bg-black">
                        <video
                            src={previewUrl}
                            controls
                            className="w-full"
                            style={{ maxHeight: '300px' }}
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-lg"
                            title="Remover vídeo"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Video Info */}
                    {videoInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <i className="fas fa-info-circle"></i>
                                Informações do Vídeo
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Duração:</span>
                                    <span className="ml-2 font-semibold text-gray-900">
                                        {formatDuration(videoInfo.duration)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Tamanho:</span>
                                    <span className="ml-2 font-semibold text-gray-900">
                                        {formatFileSize(videoInfo.size)}
                                    </span>
                                </div>
                                {videoInfo.width && videoInfo.height && (
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Resolução:</span>
                                        <span className="ml-2 font-semibold text-gray-900">
                                            {videoInfo.width}x{videoInfo.height}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-xs text-blue-700">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Vídeo pronto! Será enviado ao Cloudinary quando você salvar a postagem.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CloudinaryVideoUploader;
