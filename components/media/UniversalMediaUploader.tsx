import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { User } from '../../types';
import { getSupabase } from '../../services/supabaseService';
import { startYouTubeAuth, queueYouTubeUpload, VideoMetadata } from '../../services/youtubeService';
import { storeLocalFile } from '../../services/storage/localStorageService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import YouTubeMetadataForm from './YouTubeMetadataForm';
import Toast from '../common/Toast';

interface UniversalMediaUploaderProps {
    user: User; // Necessário para nomenclatura do arquivo
    mediaType: 'video' | 'image';
    maxFiles?: number; // Para imagens multiple
    onUploadComplete: (urls: string[]) => void;
    onError?: (error: string) => void;
    // Opcional: AccessToken se ainda formos suportar Drive legacy, mas foco é Cloud Interno
    googleAccessToken?: string | null;
    variant?: 'default' | 'mini';
    onUploadStart?: (previewUrl: string) => void;
    uploadMode?: 'cloud' | 'local'; // NOVO: Defaults to 'cloud'
}

const UniversalMediaUploader: React.FC<UniversalMediaUploaderProps> = ({
    user, mediaType, maxFiles = 1, onUploadComplete, onError, googleAccessToken, variant = 'default', onUploadStart, uploadMode = 'cloud'
}) => {
    const [currentUploadMode, setCurrentUploadMode] = useState<'cloud' | 'youtube' | 'local' | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Cloud Progress
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // YouTube State
    const [showYouTubeForm, setShowYouTubeForm] = useState(false);
    const [youTubeMetadata, setYouTubeMetadata] = useState<VideoMetadata>({
        title: '', description: '', tags: [], privacy: 'public', madeForKids: false
    });
    const [isYouTubeFormValid, setIsYouTubeFormValid] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMini = variant === 'mini';

    // Cleanup preview
    useEffect(() => {
        return () => {
            // Se onUploadStart foi passado, o pai assume a responsabilidade (ou o risco) do blob
            // para permitir transição suave de UI onde o Uploader desmonta.
            if (onUploadStart) { return; }

            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, onUploadStart]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            // 1. Validar Tipo
            if (mediaType === 'video' && !file.type.startsWith('video/')) {
                onError?.("Por favor, selecione um arquivo de vídeo.");
                return;
            }
            if (mediaType === 'image' && !file.type.startsWith('image/')) {
                onError?.("Por favor, selecione um arquivo de imagem.");
                return;
            }

            // 2. Definir Preview
            const objectUrl = URL.createObjectURL(file);
            setSelectedFile(file);
            setPreviewUrl(objectUrl);

            // Notificar pai sobre inicio do upload com preview
            if (onUploadStart) { onUploadStart(objectUrl); }

            // 3. Reset mode se for nova seleção
            if (mediaType === 'image') {
                if (uploadMode === 'local') {
                    // Upload Local Imediato
                    setIsUploading(true);
                    try {
                        const localId = await storeLocalFile(file);
                        // Simula delay de loading para UX visual apenas (opcional, mas bom pra o usuario ver que "salvou")
                        await new Promise(r => setTimeout(r, 500));
                        onUploadComplete([localId]);
                        setIsUploading(false);
                    } catch (e: unknown) {
                        const message = e instanceof Error ? e.message : "Erro desconhecido";
                        onError?.("Erro ao salvar localmente: " + message);
                        setIsUploading(false);
                    }
                } else {
                    // Cloud direto
                    setCurrentUploadMode('cloud');
                    await validateAndUploadCloud(file);
                }
            } else {
                // Vídeo pede decisão do usuário (exceto se for local forçado, mas video costuma ser grandão)
                setCurrentUploadMode(null);
            }
        }
    };

    const validateAndUploadCloud = async (file: File) => {
        // Validação Limite 100MB
        if (file.size > 100 * 1024 * 1024) {
            handleError("O arquivo excede o limite de 100MB para Cloud Interno.");
            clearSelection();
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Usa o serviço centralizado do Cloudinary
            const url = await uploadToCloudinary(file, 'editor_gallery');

            onUploadComplete([url]);
            setIsUploading(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            handleError("Erro no upload Cloudinary: " + message);
            setIsUploading(false);
            clearSelection();
        }
    };

    const handleYouTubeFlow = async () => {
        // Validação Limite 1GB
        if (!selectedFile) { return; }
        if (selectedFile.size > 1024 * 1024 * 1024) {
            handleError("O arquivo excede o limite de 1GB para YouTube.");
            return;
        }

        // Abrir Form
        setShowYouTubeForm(true);
    };

    const submitYouTubeUpload = async () => {
        if (!selectedFile || !youTubeMetadata) { return; }

        setIsUploading(true);
        try {
            // Tenta usar serviço (pode requerer auth via Edge Function flow)
            // Aqui assumimos que o serviço gerencia isso ou retorna URL Oauth
            // Devido à complexidade Oauth no client, usamos o queueYouTubeUpload que manda para backend processar

            const result = await queueYouTubeUpload(selectedFile, youTubeMetadata, 'editor_direct');

            // Sucesso (agendado)
            // Retorna um placeholder ou ID do job por enquanto, pois o processamento é assíncrono
            onUploadComplete([`https://youtube-processing.placeholder/job/${result.jobId}`]);

            // Se fosse upload direto com token no client (não recomendado mas possível), seria diferente.
            // Seguindo arquitetura "segura".

            setIsUploading(false);
            setShowYouTubeForm(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
            // Se erro for de Auth, redirecionar
            if (message.includes('Auth required')) {
                const authUrl = await startYouTubeAuth();
                window.open(authUrl, '_blank');
                handleError("Autenticação necessária. Autorize na janela aberta e tente novamente.");
            } else {
                handleError("Erro no envio para YouTube: " + message);
            }
            setIsUploading(false);
        }
    };

    const handleError = (msg: string) => {
        onError?.(msg);
        alert(msg); // Fallback visual simples
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCurrentUploadMode(null);
        if (fileInputRef.current) { fileInputRef.current.value = ''; }
    };

    return (
        <div className={`w-full h-full ${isMini ? 'bg-black/20 border-white/20 hover:bg-black/40 hover:border-white/50' : 'min-h-[200px] bg-gray-50 border-gray-300 hover:border-red-400'} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group transition-all`}>

            {/* INPUT INVISÍVEL */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileSelect}
                multiple={mediaType === 'image' && maxFiles > 1}
            />

            {/* 1. ESTADO INICIAL: SELEÇÃO */}
            {!selectedFile && (
                <div
                    className={`flex flex-col items-center cursor-pointer w-full h-full justify-center ${isMini ? 'p-1' : 'p-8'}`}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className={`${isMini ? 'w-full h-full flex items-center justify-center' : 'w-16 h-16 mb-4 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110'} transition-transform`}>
                        <i className={`fas ${mediaType === 'video' ? 'fa-video' : 'fa-camera'} ${isMini ? 'text-2xl text-white/50 group-hover:text-white' : 'text-2xl text-red-600'}`}></i>
                    </div>
                    {!isMini && (
                        <>
                            <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest mb-2">
                                {mediaType === 'video' ? 'Adicionar Vídeo' : 'Adicionar Fotos'}
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                                {mediaType === 'video' ? 'Cloud (100MB) ou YouTube (1GB)' : 'Upload Interno Seguro'}
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* 2. PREVIEW E DECISÃO (VÍDEO) */}
            {selectedFile && !isUploading && !showYouTubeForm && (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10 p-4">

                    {/* Background Preview */}
                    {mediaType === 'image' ? (
                        <img src={previewUrl!} className="absolute inset-0 w-full h-full object-cover z-0" alt="Preview" />
                    ) : (
                        <video src={previewUrl!} className="absolute inset-0 w-full h-full object-cover z-0" autoPlay loop muted playsInline />
                    )}

                    {/* Dark Overlay for Readability */}
                    <div className="absolute inset-0 bg-black/60 z-0"></div>

                    {/* Content on top */}
                    <div className="relative z-10 flex flex-col items-center w-full">
                        <p className="text-xs font-bold text-white mb-6 max-w-[200px] truncate text-center drop-shadow-md">{selectedFile.name}</p>

                        {mediaType === 'video' ? (
                            <div className="flex gap-4">
                                {/* Opção A: Cloud */}
                                <button
                                    onClick={() => { setCurrentUploadMode('cloud'); validateAndUploadCloud(selectedFile); }}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-md hover:border-blue-400 hover:bg-blue-500/20 transition-all w-32 group/btn"
                                >
                                    <i className="fas fa-cloud text-blue-400 group-hover/btn:text-white text-xl transition-colors"></i>
                                    <span className="text-[10px] font-black uppercase text-white shadow-black drop-shadow-sm">Cloud Interno</span>
                                    <span className="text-[8px] text-gray-300">Máx 100MB</span>
                                </button>

                                {/* Opção B: YouTube */}
                                <button
                                    onClick={() => { setCurrentUploadMode('youtube'); handleYouTubeFlow(); }}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-md hover:border-red-500 hover:bg-red-600/20 transition-all w-32 group/btn"
                                >
                                    <i className="fab fa-youtube text-red-500 group-hover/btn:text-white text-xl transition-colors"></i>
                                    <span className="text-[10px] font-black uppercase text-white shadow-black drop-shadow-sm">YouTube Full</span>
                                    <span className="text-[8px] text-gray-300">Máx 1GB • Studio</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white animate-pulse">Preparando envio...</span>
                            </div>
                        )}

                        <button onClick={clearSelection} className="mt-8 text-[10px] font-bold text-white/50 hover:text-white underline transition-colors">Cancelar</button>
                    </div>
                </div>
            )}

            {/* 3. FORMULÁRIO YOUTUBE (OVERLAY) */}
            {showYouTubeForm && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-slideUp">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <i className="fab fa-youtube text-red-600 text-lg"></i>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-700">Painel Completo</span>
                        </div>
                        <button onClick={() => setShowYouTubeForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">
                            <i className="fas fa-times text-gray-500"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <YouTubeMetadataForm
                            initialData={{ title: selectedFile?.name.split('.')[0] || '' }}
                            onChange={setYouTubeMetadata}
                            onValidationChange={setIsYouTubeFormValid}
                        />
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                        <button onClick={() => setShowYouTubeForm(false)} className="px-6 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-gray-100">
                            Cancelar
                        </button>
                        <button
                            onClick={submitYouTubeUpload}
                            disabled={!isYouTubeFormValid}
                            className={`px-8 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all ${isYouTubeFormValid ? 'bg-red-600 hover:bg-red-700 hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            <i className="fas fa-cloud-upload-alt mr-2"></i> Enviar para YouTube
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* 4. LOADING STATE COM PREVIEW */}
            {isUploading && (
                <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                    {previewUrl && mediaType === 'image' && (
                        <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" alt="Preview" />
                    )}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                        {!isMini && (
                            <>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white shadow-black drop-shadow-md">Enviando...</h3>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversalMediaUploader;
