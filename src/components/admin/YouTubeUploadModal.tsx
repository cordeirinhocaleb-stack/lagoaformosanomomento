import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { validateVideo, requiresSmartPlayback } from '@/utils/videoValidator';
import { storeLocalFile } from '@/services/storage/localStorageService';
import { YouTubeVideoMetadata, uploadVideoToYouTube } from '@/services/upload/youtubeVideoService';
import YouTubeMetadataForm from '@/components/media/YouTubeMetadataForm';
import { logger } from '@/services/core/debugLogger';

interface YouTubeUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (youtubeUrl: string, metadata: YouTubeVideoMetadata, videoId: string) => void;
    onUploadError?: (error: string) => void;
    initialFile?: File | null;
    isShorts?: boolean;
    darkMode?: boolean;
}

/**
 * Unified YouTube Upload Modal
 * Replaces YouTubeConfigModal, YouTubeVideoUploader, and YouTubeVideoUploadPanel
 * 
 * Features:
 * - File selection and validation
 * - Google OAuth authentication
 * - Comprehensive metadata form (via YouTubeMetadataForm)
 * - Upload progress tracking
 * - Support for Shorts and normal videos
 */
const YouTubeUploadModalBase: React.FC<YouTubeUploadModalProps> = ({
    isOpen,
    onClose,
    onUploadComplete,
    onUploadError,
    initialFile = null,
    isShorts = false,
    darkMode = true
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState<'validating' | 'uploading' | 'processing'>('validating');
    const [validationInfo, setValidationInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isMetadataValid, setIsMetadataValid] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Default metadata
    const [metadata, setMetadata] = useState<YouTubeVideoMetadata>({
        title: isShorts ? 'Novo Reels LFNM #Shorts' : 'Novo Vídeo LFNM',
        description: isShorts
            ? 'Vídeo exclusivo Portal Lagoa Formosa No Momento.\n\n#Shorts #LFNM #Noticias'
            : 'Vídeo exclusivo Portal Lagoa Formosa No Momento.',
        tags: isShorts ? ['shorts', 'lagoa formosa', 'noticias', 'vertical'] : ['lagoa formosa', 'noticias', 'regional', 'lfnm'],
        privacy: 'public',
        categoryId: '25',
        madeForKids: false
    });

    // Auto-validate initial file
    useEffect(() => {
        if (initialFile) {
            handleFileSelect(initialFile);
        }
    }, [initialFile]);

    // Update metadata title when file is selected
    useEffect(() => {
        if (selectedFile) {
            const fileName = selectedFile.name.split('.')[0].substring(0, isShorts ? 80 : 100);
            setMetadata(prev => ({
                ...prev,
                title: isShorts ? `${fileName} #Shorts` : fileName
            }));
        }
    }, [selectedFile, isShorts]);

    // Google OAuth login
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            logger.log('🚀 [YOUTUBE] Google Auth Success');
            if (!tokenResponse.access_token) {
                setError('Token de acesso não recebido do Google.');
                return;
            }
            setAccessToken(tokenResponse.access_token);
        },
        onError: (errorResponse) => {
            logger.error('❌ [YOUTUBE] Google Auth Error:', errorResponse);
            setError('Falha na autenticação com Google.');
        },
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
    });

    const handleFileSelect = useCallback(async (file: File) => {
        setError(null);
        setSelectedFile(file);

        try {
            const info = await validateVideo(file, 'youtube');
            setValidationInfo(info);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Erro ao validar vídeo';
            setError(message);
            setSelectedFile(null);
            setValidationInfo(null);
        }
    }, []);

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
            logger.log('📦 [YOUTUBE] Iniciando upload:', selectedFile.name);

            // Store file locally
            const localId = await storeLocalFile(selectedFile);
            logger.log('📦 [YOUTUBE] Arquivo armazenado localmente:', localId);

            // Upload to YouTube
            const uploadResult = await uploadVideoToYouTube(selectedFile, metadata, accessToken, (progress) => {
                setUploadStage(progress.stage);
                setUploadProgress(progress.percentage);
            });

            logger.log('✅ [YOUTUBE] Upload concluído:', uploadResult);

            onUploadComplete(uploadResult.url, {
                ...metadata,
                videoId: uploadResult.videoId,
                uploadedAt: new Date().toISOString()
            }, uploadResult.videoId);

            // Reset and close
            handleClose();
        } catch (err: unknown) {
            logger.error('❌ [YOUTUBE] Erro no upload:', err);
            const message = err instanceof Error ? err.message : String(err);
            setError(message);
            if (onUploadError) onUploadError(message);
        } finally {
            setIsUploading(false);
        }
    }, [selectedFile, metadata, accessToken, onUploadComplete, onUploadError, login]);

    const handleClose = useCallback(() => {
        setSelectedFile(null);
        setValidationInfo(null);
        setError(null);
        setUploadProgress(0);
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div
            className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto custom-scrollbar"
            onClick={handleClose} // Fecha ao clicar fora
        >
            <div
                className={`w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative my-8 border ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-transparent'}`}
                onClick={(e) => e.stopPropagation()} // Previne fechamento ao clicar no conteúdo
            >
                {/* Header */}
                <div className="bg-red-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl">
                            <i className="fab fa-youtube text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter">
                                {isShorts ? 'Upload YouTube Shorts' : 'Upload YouTube'}
                            </h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                {selectedFile ? 'Configure os metadados' : 'Selecione um vídeo'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isUploading}
                        className="text-white/50 hover:text-white transition-colors relative z-10 disabled:opacity-30"
                    >
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    {/* Auth Section */}
                    {!accessToken && (
                        <div className={`p-4 rounded-2xl flex items-center justify-between border ${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'
                            }`}>
                            <div>
                                <h4 className={`font-bold text-sm ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                                    Conta YouTube
                                </h4>
                                <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                    Conecte para fazer uploads
                                </p>
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
                        <div className={`p-3 rounded-xl flex items-center gap-3 border ${darkMode ? 'bg-green-900/10 border-green-900/30' : 'bg-green-50 border-green-200'
                            }`}>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <p className={`text-xs font-bold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                                Conectado e pronto para envio
                            </p>
                        </div>
                    )}

                    {/* File Selection */}
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
                                    Máximo: 1GB (Upload direto para YouTube)
                                </p>
                            </label>
                        </div>
                    )}

                    {/* Metadata Form */}
                    {selectedFile && !isUploading && (
                        <div className="space-y-6">
                            <div className={`p-4 rounded-2xl flex items-start gap-3 border ${darkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-blue-50 border-blue-100'
                                }`}>
                                <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                                <div>
                                    <p className={`text-[10px] font-[1000] uppercase ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                                        Processamento Automático
                                    </p>
                                    <p className={`text-[9px] leading-relaxed ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                        O upload será iniciado automaticamente. Não feche a aba do navegador durante o processo.
                                    </p>
                                </div>
                            </div>

                            <YouTubeMetadataForm
                                initialData={metadata}
                                onChange={setMetadata}
                                onValidationChange={setIsMetadataValid}
                            />

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {error}
                                </div>
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

                    {/* Action Buttons */}
                    {selectedFile && !isUploading && (
                        <div className={`pt-8 border-t flex flex-col md:flex-row gap-4 justify-end ${darkMode ? 'border-white/5' : 'border-gray-100'
                            }`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!isMetadataValid || !accessToken}
                                className="px-12 py-4 bg-red-600 text-white rounded-2xl font-[1000] uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fab fa-youtube"></i>
                                {accessToken ? 'Enviar para YouTube' : 'Conectar Conta'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

/**
 * Wrapper component that checks for Google Client ID configuration
 */
export const YouTubeUploadModal: React.FC<YouTubeUploadModalProps> = (props) => {
    const gClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const isConfigured = !!gClientId && typeof gClientId === 'string' && gClientId.trim() !== '';

    if (!isConfigured && props.isOpen) {
        return ReactDOM.createPortal(
            <div
                className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                onClick={props.onClose} // Fecha ao clicar fora
            >
                <div
                    className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center text-black max-w-md"
                    onClick={(e) => e.stopPropagation()} // Previne fechamento ao clicar no conteúdo
                >
                    <i className="fas fa-exclamation-circle text-red-600 text-3xl mb-3"></i>
                    <h4 className="font-bold text-red-900 mb-2">Configuração Pendente</h4>
                    <p className="text-sm text-red-800 mb-4">
                        O <strong>NEXT_PUBLIC_GOOGLE_CLIENT_ID</strong> não foi configurado no arquivo .env.
                    </p>
                    <div className="bg-white p-3 rounded border border-red-200 text-left text-xs text-gray-600 font-mono">
                        NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
                    </div>
                    <button
                        onClick={props.onClose}
                        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                    >
                        Fechar
                    </button>
                </div>
            </div>,
            document.body
        );
    }

    return <YouTubeUploadModalBase {...props} />;
};

export default YouTubeUploadModal;
