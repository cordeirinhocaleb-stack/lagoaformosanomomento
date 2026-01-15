
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { User } from '../../types';
import { getSupabase } from '../../services/supabaseService';
import { startYouTubeAuth, queueYouTubeUpload, VideoMetadata } from '../../services/youtubeService';
import { storeLocalFile } from '../../services/storage/localStorageService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import YouTubeMetadataForm from './YouTubeMetadataForm';
import Toast from '../common/Toast';
import { applyPhysicalWatermark as processWatermark } from './uploader/watermarkProcessor';

interface UniversalMediaUploaderProps {
    user: User;
    mediaType: 'video' | 'image';
    maxFiles?: number;
    onUploadComplete: (urls: string[]) => void;
    onError?: (error: string) => void;
    googleAccessToken?: string | null;
    variant?: 'default' | 'mini';
    onUploadStart?: (previewUrl: string) => void;
    uploadMode?: 'cloud' | 'local';
    bakeWatermark?: boolean;
    uploadCategory?: string;
}

const UniversalMediaUploader: React.FC<UniversalMediaUploaderProps> = ({
    user, mediaType, maxFiles = 1, onUploadComplete, onError, variant = 'default', onUploadStart, uploadMode = 'cloud', bakeWatermark = false, uploadCategory
}) => {
    const [currentUploadMode, setCurrentUploadMode] = useState<'cloud' | 'youtube' | 'local' | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [hasWatermark, setHasWatermark] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showYouTubeForm, setShowYouTubeForm] = useState(false);
    const [youTubeMetadata, setYouTubeMetadata] = useState<VideoMetadata>({
        title: '', description: '', tags: [], privacy: 'public', madeForKids: false
    });
    const [isYouTubeFormValid, setIsYouTubeFormValid] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const isMini = variant === 'mini';

    useEffect(() => {
        return () => {
            if (onUploadStart) { return; }
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, onUploadStart]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const invalidFiles = files.filter(f =>
                (mediaType === 'video' && !f.type.startsWith('video/')) ||
                (mediaType === 'image' && !f.type.startsWith('image/'))
            );

            if (invalidFiles.length > 0) {
                onError?.(`Arquivo(s) inválido(s) detectado(s). Use apenas ${mediaType === 'video' ? 'vídeo' : 'imagem'}.`);
                return;
            }

            if (isMini) {
                setIsUploading(true);
                try {
                    const uploadedUrls: string[] = [];
                    for (let i = 0; i < files.length; i++) {
                        let file = files[i];
                        if (bakeWatermark && mediaType === 'image') {
                            file = await processWatermark(file);
                        }
                        const cleanUsername = user.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                        const category = (uploadCategory || 'geral').toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const url = await uploadToCloudinary(file, `lfnm_cms/${category}/${cleanUsername}`);
                        uploadedUrls.push(url);
                    }
                    onUploadComplete(uploadedUrls);
                    setIsUploading(false);
                    clearSelection();
                } catch (error: any) {
                    handleError("Erro no upload: " + error.message);
                    setIsUploading(false);
                    clearSelection();
                }
                return;
            }

            const file = files[0];
            const objectUrl = URL.createObjectURL(file);
            setSelectedFile(file);
            setPreviewUrl(objectUrl);
            if (onUploadStart) { onUploadStart(objectUrl); }

            if (mediaType === 'image') {
                if (uploadMode === 'local') {
                    setIsUploading(true);
                    try {
                        const localId = await storeLocalFile(file);
                        onUploadComplete([localId]);
                        setIsUploading(false);
                    } catch (e: any) {
                        onError?.("Erro local: " + e.message);
                        setIsUploading(false);
                    }
                } else {
                    setCurrentUploadMode('cloud');
                }
            } else {
                setCurrentUploadMode(null);
            }
        }
    };

    const validateAndUploadCloud = async (file: File) => {
        if (file.size > 100 * 1024 * 1024) {
            handleError("O arquivo excede o limite de 100MB para Cloud Interno.");
            clearSelection();
            return;
        }

        setIsUploading(true);
        try {
            let fileToUpload = file;
            if ((hasWatermark || bakeWatermark) && mediaType === 'image') {
                fileToUpload = await processWatermark(file);
            }
            const cleanUsername = user.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const category = (uploadCategory || 'geral').toLowerCase().replace(/[^a-z0-9]/g, '_');
            const url = await uploadToCloudinary(fileToUpload, `lfnm_cms/${category}/${cleanUsername}`);

            onUploadComplete([url]);
            setIsUploading(false);
        } catch (error: unknown) {
            handleError("Erro no upload: " + (error instanceof Error ? error.message : "Erro desconhecido"));
            setIsUploading(false);
            clearSelection();
        }
    };

    const handleYouTubeFlow = async () => {
        if (!selectedFile) { return; }
        if (selectedFile.size > 1024 * 1024 * 1024) {
            handleError("O arquivo excede o limite de 1GB para YouTube.");
            return;
        }
        setShowYouTubeForm(true);
    };

    const submitYouTubeUpload = async () => {
        if (!selectedFile || !youTubeMetadata) { return; }
        setIsUploading(true);
        try {
            const result = await queueYouTubeUpload(selectedFile, youTubeMetadata, 'editor_direct');
            onUploadComplete([`https://youtube-processing.placeholder/job/${result.jobId}`]);
            setIsUploading(false);
            setShowYouTubeForm(false);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erro desconhecido";
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
        console.error(msg);
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCurrentUploadMode(null);
        if (fileInputRef.current) { fileInputRef.current.value = ''; }
    };

    return (
        <div className={`w-full h-full relative overflow-hidden group transition-all duration-500 rounded-3xl border-2 
            ${isMini ? 'bg-[#0a0a0a] border-white/5 hover:border-white/20 border-dashed'
                : 'min-h-[220px] bg-white border-zinc-200 border-dashed hover:border-red-600 hover:bg-zinc-50/30'} 
            ${isUploading ? 'border-solid border-red-600/20' : ''}`}
        >
            <input type="file" ref={fileInputRef} className="hidden" accept={mediaType === 'video' ? 'video/*' : 'image/*'} onChange={handleFileSelect} multiple={mediaType === 'image' && maxFiles > 1} />

            {!selectedFile && (
                <div className={`flex flex-col items-center cursor-pointer w-full h-full justify-center transition-all duration-300 ${isMini ? 'p-1 hover:bg-white/5' : 'p-8'}`} onClick={() => fileInputRef.current?.click()}>
                    <div className={`${isMini ? 'w-full h-full flex flex-col items-center justify-center gap-2' : 'w-24 h-24 mb-6 bg-zinc-950 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all'}`}>
                        <i className={`fas ${mediaType === 'video' ? 'fa-video' : (isMini ? 'fa-plus' : 'fa-camera-retro')} ${isMini ? 'text-xl text-white/10 group-hover:text-blue-500' : 'text-4xl text-white group-hover:text-red-500'}`}></i>
                        {isMini && <span className="text-[7px] font-black uppercase text-white/5 tracking-widest">Upload</span>}
                    </div>
                    {!isMini && (
                        <div className="text-center">
                            <h3 className="text-[13px] font-[1000] uppercase text-zinc-900 tracking-[0.2em] mb-3 italic">{mediaType === 'video' ? 'Upload Profissional' : 'Capturar Imagem'}</h3>
                            <div className="flex items-center justify-center gap-3"><span className="h-[2px] w-5 bg-red-600"></span><p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.25em]">LFNM News Suite</p><span className="h-[2px] w-5 bg-red-600"></span></div>
                        </div>
                    )}
                </div>
            )}

            {selectedFile && !isUploading && !showYouTubeForm && (
                <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10 animate-fadeIn">
                    <div className="absolute inset-0 z-0">
                        {mediaType === 'image' ? <img src={previewUrl!} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt="" /> : <video src={previewUrl!} className="w-full h-full object-cover" autoPlay loop muted playsInline />}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
                        {hasWatermark && mediaType === 'image' && (
                            <div className="absolute bottom-6 left-0 right-0 z-20 px-8 animate-slideUp">
                                <div className="bg-red-600/90 backdrop-blur-md text-white py-2 px-4 inline-flex items-center gap-3 skew-x-[-12deg] shadow-2xl border-l-[6px] border-white">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] skew-x-[12deg]">Lagoa Formosa no Momento</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative z-30 flex flex-col items-center w-full px-6">
                        {mediaType === 'image' ? (
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl">
                                    <div className="flex flex-col"><span className="text-[9px] font-black text-white uppercase tracking-widest">Marca d'água</span><span className="text-[7px] font-bold text-white/50 uppercase">Selo de Autenticidade LFNM</span></div>
                                    <button onClick={() => setHasWatermark(!hasWatermark)} className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${hasWatermark ? 'bg-red-600' : 'bg-white/20'}`}><div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${hasWatermark ? 'translate-x-6' : 'translate-x-0'}`}></div></button>
                                </div>
                                <button onClick={() => validateAndUploadCloud(selectedFile)} className="px-12 py-4 bg-white text-black text-[12px] font-black uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"><i className="fas fa-check-circle"></i> Confirmar Envio</button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button onClick={() => { setCurrentUploadMode('cloud'); validateAndUploadCloud(selectedFile); }} className="flex flex-col items-center gap-3 p-6 rounded-none bg-black/80 backdrop-blur-md border-l-4 border-blue-500 hover:bg-blue-600 transition-all w-36 shadow-2xl"><i className="fas fa-cloud text-blue-400 text-xl font-bold"></i><span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Cloud SVR</span></button>
                                <button onClick={() => { setCurrentUploadMode('youtube'); handleYouTubeFlow(); }} className="flex flex-col items-center gap-3 p-6 rounded-none bg-black/80 backdrop-blur-md border-l-4 border-red-600 hover:bg-red-600 transition-all w-36 shadow-2xl"><i className="fab fa-youtube text-red-500 text-xl"></i><span className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Broadcast</span></button>
                            </div>
                        )}
                        <button onClick={clearSelection} className="mt-12 text-[9px] font-black uppercase text-white/40 hover:text-red-500 tracking-[0.4em] transition-all flex items-center gap-2"><i className="fas fa-undo-alt"></i> Cancelar Captura</button>
                    </div>
                </div>
            )}

            {showYouTubeForm && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl animate-fadeIn" onClick={() => setShowYouTubeForm(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-slideUp border border-white/10">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-50 bg-zinc-50/50">
                            <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20"><i className="fab fa-youtube text-white text-lg"></i></div><div><span className="text-[11px] font-black uppercase text-zinc-800 block">Configurar Vídeo</span><span className="text-[9px] font-bold text-zinc-400 uppercase">YouTube Cloud Sync</span></div></div>
                            <button onClick={() => setShowYouTubeForm(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-zinc-200 transition-colors text-zinc-400 hover:text-zinc-800"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6"><YouTubeMetadataForm initialData={{ title: selectedFile?.name.split('.')[0] || '' }} onChange={setYouTubeMetadata} onValidationChange={setIsYouTubeFormValid} /></div>
                        <div className="p-6 border-t border-zinc-50 bg-zinc-50/30 flex justify-end gap-3">
                            <button onClick={() => setShowYouTubeForm(false)} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-600">Cancelar</button>
                            <button onClick={submitYouTubeUpload} disabled={!isYouTubeFormValid} className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all ${isYouTubeFormValid ? 'bg-gradient-to-r from-red-600 to-red-500 hover:scale-105 shadow-red-500/25' : 'bg-zinc-200 cursor-not-allowed opacity-50'}`}><i className="fas fa-rocket mr-2"></i> Iniciar Upload</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isUploading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 border-[8px] border-white/5 rounded-full"></div>
                        <div className="absolute inset-0 border-t-[8px] border-red-600 rounded-full animate-spin"></div>
                        <div className="flex flex-col items-center animate-pulse"><span className="text-[20px] font-black text-white italic">LFNM</span><span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Processando</span></div>
                    </div>
                    <div className="mt-10 flex flex-col items-center gap-3"><p className="text-[10px] font-black uppercase text-white tracking-[0.5em] animate-pulse">Enviando p/ Redação</p><div className="w-40 h-[4px] bg-white/10 overflow-hidden"><div className="h-full bg-red-600 animate-loading-bar shadow-red-500/50"></div></div></div>
                </div>
            )}
        </div>
    );
};

export default UniversalMediaUploader;
