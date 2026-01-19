/**
 * YouTube Video Uploader Component
 * For YouTube API uploads (max 1GB)
 * Includes full metadata form (title, description, tags, privacy)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { validateVideo, requiresSmartPlayback } from '@/utils/videoValidator';
import { storeLocalFile } from '@/services/storage/localStorageService';
import { YouTubeVideoMetadata, uploadVideoToYouTube } from '@/services/upload/youtubeVideoService';
import { useGoogleLogin } from '@react-oauth/google';
import { YouTubeMetadataForm } from './banner-components/YouTubeMetadataForm';
import { YouTubeUploadStatus } from './banner-components/YouTubeUploadStatusPanel';
import { logger } from '@/services/core/debugLogger';

interface YouTubeVideoUploaderProps {
    initialFile?: File | null;
    onUploadComplete: (youtubeUrl: string, metadata: YouTubeVideoMetadata, videoId: string) => void;
    onUploadError?: (error: string) => void;
    onSmartPlaybackRequired?: (duration: number) => void;
    isShorts?: boolean;
}

/**
 * YouTube Video Uploader Component (BASE)
 * Contém os hooks e a lógica principal.
 * Separado para evitar crash de hooks quando o ClientID está ausente.
 */
const YouTubeVideoUploaderBase: React.FC<YouTubeVideoUploaderProps> = ({
    initialFile,
    onUploadComplete,
    onUploadError,
    onSmartPlaybackRequired,
    isShorts = false
}) => {
    // RENDER DEBUG
    const gClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    logger.log('📹 [YOUTUBE RENDER DEBUG] Componente BASE montado. Client ID:', gClientId ? `${gClientId.substring(0, 10)}...` : 'Vazio');

    const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState<'validating' | 'uploading' | 'processing'>('validating');
    const [validationInfo, setValidationInfo] = useState<unknown>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Auto-validate initial file
    useEffect(() => {
        if (initialFile) {
            handleFileSelect(initialFile);
        }
    }, [initialFile]);

    // Metadata form state
    const [metadata, setMetadata] = useState<YouTubeVideoMetadata>({
        title: isShorts ? 'Novo Reels LFNM #Shorts' : 'Novo Vídeo LFNM',
        description: isShorts
            ? 'Vídeo exclusivo Portal Lagoa Formosa No Momento.\n\n#Shorts #LFNM #Noticias'
            : 'Vídeo exclusivo Portal Lagoa Formosa No Momento.',
        tags: isShorts ? ['shorts', 'lagoa formosa', 'noticias', 'vertical'] : ['lagoa formosa', 'noticias', 'regional', 'lfnm'],
        privacy: 'public',
        madeForKids: false
    });

    // Update metadata when file is selected or isShorts changes
    useEffect(() => {
        if (selectedFile) {
            const fileName = selectedFile.name.split('.')[0].substring(0, isShorts ? 80 : 100);
            setMetadata(prev => ({
                ...prev,
                title: isShorts ? `${fileName} #Shorts` : fileName
            }));
        }
    }, [selectedFile, isShorts]);

    // useGoogleLogin is the hook that crashes if GoogleOAuthProvider is misconfigured
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            logger.log('🚀 [YOUTUBE DEBUG] Google Auth Success:', tokenResponse);
            if (!tokenResponse.access_token) {
                logger.error('❌ [YOUTUBE DEBUG] Access token is empty in response');
                setError('Token de acesso não recebido do Google.');
                return;
            }
            setAccessToken(tokenResponse.access_token);
        },
        onError: (errorResponse) => {
            logger.error('❌ [YOUTUBE DEBUG] Google Auth Error:', errorResponse);
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao validar vídeo';
            setError(message);
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
            logger.log('📦 [YOUTUBE DEBUG] Inciando upload do arquivo: ' + selectedFile.name + ' Tamanho: ' + selectedFile.size);

            // 1. Store file locally (Backup/Preview)
            logger.log('📦 [YOUTUBE DEBUG] Armazenando arquivo localmente...');
            const localId = await storeLocalFile(selectedFile);
            logger.log('📦 [YOUTUBE DEBUG] Arquivo ID Local:', localId);

            // 2. Upload to YouTube API
            logger.log('🚀 [YOUTUBE DEBUG] Iniciando upload para YouTube API...');
            const uploadResult = await uploadVideoToYouTube(selectedFile, metadata, accessToken!, (progress) => {
                setUploadStage(progress.stage);
                setUploadProgress(progress.percentage);
            });
            logger.log('✅ [YOUTUBE DEBUG] Upload concluído:', uploadResult);

            // 3. Complete (Return YouTube URL + Metadata + Video ID)
            // Note: We return the real YouTube URL now so the Editor doesn't try to re-upload it.
            if (typeof onUploadComplete !== 'function') {
                logger.error('❌ [YOUTUBE DEBUG] onUploadComplete is not a function!', onUploadComplete);
                throw new Error('Erro interno: onUploadComplete não é uma função');
            }

            onUploadComplete(uploadResult.url, {
                ...metadata,
                videoId: uploadResult.videoId,
                uploadedAt: new Date().toISOString()
            }, uploadResult.videoId);

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
        } catch (err: unknown) {
            logger.error('❌ [YOUTUBE DEBUG] Falha catastrófica no upload:', err);
            const message = err instanceof Error ? err.message : String(err);
            alert(`Erro no upload: ${message}`);
            setError(message);
            if (onUploadError) { onUploadError(message); }
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

    return (
        <div className="space-y-4 text-black">

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
                            if (file) { handleFileSelect(file); }
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
                <YouTubeMetadataForm
                    selectedFile={selectedFile}
                    metadata={metadata}
                    setMetadata={setMetadata}
                    validationInfo={validationInfo}
                    error={error}
                    isUploading={isUploading}
                    accessToken={accessToken}
                    onUpload={handleUpload}
                    onCancel={handleCancel}
                />
            )}

            {/* Upload Progress */}
            {isUploading && (
                <YouTubeUploadStatus
                    uploadStage={uploadStage}
                    uploadProgress={uploadProgress}
                />
            )}

        </div>
    );
};

/**
 * YouTube Video Uploader Wrapper
 * Realiza as verificações de configuração ANTES de montar o componente BASE.
 * Isso evita crash de hooks (como useGoogleLogin) se o Provider não tiver um ClientID válido.
 */
export const YouTubeVideoUploader: React.FC<YouTubeVideoUploaderProps> = (props) => {
    // Check for Client ID
    const gClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isConfigured = !!gClientId && typeof gClientId === 'string' && gClientId.trim() !== '';

    // RENDER WRAPPER DEBUG
    logger.log('📹 [YOUTUBE WRAPPER DEBUG] Configurado: ' + isConfigured + ' Client ID: ' + (gClientId ? `${gClientId.substring(0, 10)}...` : 'Vazio'));

    if (!isConfigured) {
        return (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center text-black">
                <i className="fas fa-exclamation-circle text-red-600 text-3xl mb-3"></i>
                <h4 className="font-bold text-red-900 mb-2">Configuração Pendente</h4>
                <p className="text-sm text-red-800 mb-4">
                    O <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID</strong> não foi configurado no arquivo .env.
                </p>
                <div className="bg-white p-3 rounded border border-red-200 text-left text-xs text-gray-600 font-mono">
                    NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
                </div>
            </div>
        );
    }

    return <YouTubeVideoUploaderBase {...props} />;
};

export default YouTubeVideoUploader;
