
/**
 * YouTube Video Uploader Component
 * For YouTube API uploads (max 1GB)
 * Includes full metadata form (title, description, tags, privacy)
 */

import React, { useState, useCallback, useRef } from 'react';
import { validateVideo, formatDuration, formatFileSize, requiresSmartPlayback } from '../../../../utils/videoValidator';
import { storeLocalFile } from '../../../../services/storage/localStorageService';
import { YouTubeVideoMetadata, uploadVideoToYouTube } from '../../../../services/upload/youtubeVideoService';
import { useGoogleLogin } from '@react-oauth/google';

interface YouTubeVideoUploaderProps {
    onUploadComplete: (localId: string, metadata: YouTubeVideoMetadata) => void;
    onUploadError?: (error: string) => void;
    onSmartPlaybackRequired?: (duration: number) => void;
}

export const YouTubeVideoUploader: React.FC<YouTubeVideoUploaderProps> = ({
    onUploadComplete,
    onUploadError,
    onSmartPlaybackRequired
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState<'validating' | 'uploading' | 'processing'>('validating');
    const [validationInfo, setValidationInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Metadata form state
    const [metadata, setMetadata] = useState<YouTubeVideoMetadata>({
        title: '',
        description: '',
        tags: [],
        privacy: 'unlisted',
        madeForKids: false
    });

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log('Google Auth Success:', tokenResponse);
            setAccessToken(tokenResponse.access_token);
        },
        onError: () => {
            setError('Falha na autenticação com Google. Verifique se o Client ID está configurado.');
        },
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
    });

    const handleFileSelect = useCallback(async (file: File) => {
        setError(null);
        setSelectedFile(file);

        try {
            const info = await validateVideo(file, 'youtube');
            setValidationInfo(info);

            // Check if Smart Playback is required
            const duration = info.duration || 0;
            if (requiresSmartPlayback(duration) && onSmartPlaybackRequired) {
                onSmartPlaybackRequired(duration);
            }
        } catch (err: any) {
            setError(err.message);
            setSelectedFile(null);
            setValidationInfo(null);
        }
    }, [onSmartPlaybackRequired]);

    const handleUpload = useCallback(async () => {
        if (!selectedFile || !metadata.title.trim()) {
            setError('Título é obrigatório');
            return;
        }

        if (!accessToken) {
            setError('É necessário conectar sua conta Google primeiro.');
            login();
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadStage('uploading');
        setUploadProgress(0);

        try {
            // 1. Store file locally (Backup/Preview)
            const localId = await storeLocalFile(selectedFile);

            // 2. Upload to YouTube API
            await uploadVideoToYouTube(selectedFile, metadata, accessToken, (progress) => {
                setUploadStage(progress.stage);
                setUploadProgress(progress.percentage);
            });

            // 3. Complete (Return Local ID + Metadata)
            // Note: We return localId so the Editor can show the local preview immediately 
            // while YouTube processes the video in the background.
            // The metadata now contains that it was sent to YouTube.
            onUploadComplete(localId, metadata);

            // Reset form
            setSelectedFile(null);
            setValidationInfo(null);
            setMetadata({
                title: '',
                description: '',
                tags: [],
                privacy: 'unlisted',
                madeForKids: false
            });
            setUploadProgress(0);
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao enviar vídeo para YouTube';
            setError(errorMsg);
            if (onUploadError) onUploadError(errorMsg);
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, metadata, accessToken, onUploadComplete, onUploadError, login]);

    const handleCancel = useCallback(() => {
        setSelectedFile(null);
        setValidationInfo(null);
        setError(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const handleTagsChange = useCallback((value: string) => {
        const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        setMetadata(prev => ({ ...prev, tags }));
    }, []);

    // Configuration Check
    const isConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!isConfigured) {
        return (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center">
                <i className="fas fa-exclamation-circle text-red-600 text-3xl mb-3"></i>
                <h4 className="font-bold text-red-900 mb-2">Configuração Pendente</h4>
                <p className="text-sm text-red-800 mb-4">
                    O <strong>VITE_GOOGLE_CLIENT_ID</strong> não foi configurado no arquivo .env.
                </p>
                <div className="bg-white p-3 rounded border border-red-200 text-left text-xs text-gray-600 font-mono">
                    VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">

            {/* Auth Section */}
            {!accessToken && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm">Conta YouTube</h4>
                        <p className="text-xs text-blue-700">Conecte para fazer uploads</p>
                    </div>
                    <button
                        onClick={() => login()}
                        className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm flex items-center gap-2 text-xs transition-all"
                    >
                        <i className="fab fa-google text-red-500"></i>
                        Conectar Conta
                    </button>
                </div>
            )}

            {accessToken && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xs font-bold text-green-800">Conectado e pronto para envio</p>
                </div>
            )}

            {/* File Input */}
            {!selectedFile && !isUploading && (
                <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center hover:border-red-500 transition-colors bg-red-50/30">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                        }}
                        className="hidden"
                        id="youtube-video-input"
                    />
                    <label htmlFor="youtube-video-input" className="cursor-pointer">
                        <i className="fab fa-youtube text-6xl text-red-600 mb-4"></i>
                        <p className="text-gray-700 font-semibold mb-2">
                            Clique para selecionar vídeo
                        </p>
                        <p className="text-xs text-gray-500">
                            Máximo: 1GB (Upload direto)
                        </p>
                    </label>
                </div>
            )}

            {/* Metadata Form */}
            {selectedFile && !isUploading && (
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">

                    {/* File Info */}
                    <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-2">
                                <i className="fas fa-file-video mr-2 text-red-600"></i>
                                {selectedFile.name}
                            </h4>
                            {validationInfo && (
                                <div className="space-y-1 text-sm text-gray-600">
                                    <p><i className="fas fa-clock mr-2"></i>Duração: {formatDuration(validationInfo.duration)}</p>
                                    <p><i className="fas fa-hdd mr-2"></i>Tamanho: {formatFileSize(validationInfo.size)}</p>
                                    <p><i className="fas fa-expand mr-2"></i>Resolução: {validationInfo.width}x{validationInfo.height}</p>
                                    {requiresSmartPlayback(validationInfo.duration) && (
                                        <p className="text-blue-600 font-semibold">
                                            <i className="fas fa-magic mr-2"></i>
                                            Smart Playback será ativado (vídeo &gt;1min)
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleCancel}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Título <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={metadata.title}
                            onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ex: Notícia Importante em Lagoa Formosa"
                            maxLength={100}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">{metadata.title.length}/100 caracteres</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={metadata.description}
                            onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descreva o conteúdo do vídeo..."
                            maxLength={5000}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">{metadata.description.length}/5000 caracteres</p>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tags (separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            value={metadata.tags.join(', ')}
                            onChange={(e) => handleTagsChange(e.target.value)}
                            placeholder="Ex: lagoa formosa, notícia, cidade"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {metadata.tags.length} tag{metadata.tags.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Privacy */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Privacidade
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['public', 'unlisted', 'private'] as const).map((privacy) => (
                                <button
                                    key={privacy}
                                    onClick={() => setMetadata(prev => ({ ...prev, privacy }))}
                                    className={`py-2 px-4 rounded-lg border-2 font-semibold transition-all ${metadata.privacy === privacy
                                        ? 'border-red-600 bg-red-50 text-red-700'
                                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    {privacy === 'public' && 'Público'}
                                    {privacy === 'unlisted' && 'Não Listado'}
                                    {privacy === 'private' && 'Privado'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Made for Kids */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="made-for-kids"
                            checked={metadata.madeForKids}
                            onChange={(e) => setMetadata(prev => ({ ...prev, madeForKids: e.target.checked }))}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <label htmlFor="made-for-kids" className="text-sm text-gray-700">
                            Este vídeo é feito para crianças
                        </label>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!metadata.title.trim() || isUploading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-lg"
                    >
                        <i className="fab fa-youtube mr-2"></i>
                        {accessToken ? 'Enviar para o YouTube' : 'Conectar Conta para Enviar'}
                    </button>
                    {!accessToken && (
                        <p className="text-xs text-center text-gray-500 mt-2">Você precisa conectar sua conta Google primeiro.</p>
                    )}
                </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
                <div className="bg-red-50 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-red-900">
                            {uploadStage === 'validating' && 'Validando vídeo...'}
                            {uploadStage === 'uploading' && 'Fazendo upload para YouTube...'}
                            {uploadStage === 'processing' && 'Processando no YouTube...'}
                        </span>
                        <span className="text-sm font-bold text-red-600">
                            {uploadProgress}%
                        </span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-red-600 h-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-red-700 text-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        {uploadStage === 'processing'
                            ? 'O YouTube está processando seu vídeo. Isso pode levar alguns minutos...'
                            : 'Mantenha esta janela aberta.'}
                    </p>
                </div>
            )}

        </div>
    );
};

export default YouTubeVideoUploader;
