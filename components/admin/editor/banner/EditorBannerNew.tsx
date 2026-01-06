
/**
 * NEW BANNER SYSTEM - EditorBanner Component
 * Complete refactoring with multi-image and dual-source video support
 * 
 * Features:
 * - Multi-image banner (up to 5 images)
 * - Layout selector (carousel, grid, fade, split, mosaic)
 * - Dual-source video (Cloudinary internal OR YouTube API)
 * - Smart Playback for videos >1min
 */

import React, { useState, useCallback } from 'react';
import { User } from '../../../../types';
import CloudinaryVideoUploader from './CloudinaryVideoUploader';
import YouTubeVideoUploader from './YouTubeVideoUploader';
import { deleteFromCloudinary } from '../../../../services/cloudinaryService';
import SmartVideoPlayer from '../../../player/SmartVideoPlayer';
import Toast, { ToastType } from '../../../common/Toast';
import {
    MediaTypeSelector,
    LayoutSelector,
    LayoutPreview,
    EffectsPanel,
    ImageGallery
} from './components';

interface EditorBannerProps {
    user: User;

    // Multi-Image State
    bannerImages: string[];
    setBannerImages: React.Dispatch<React.SetStateAction<string[]>>;
    bannerImageLayout: 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';
    setBannerImageLayout: (layout: 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic') => void;

    // Video State
    bannerMediaType: 'image' | 'video';
    setBannerMediaType: (type: 'image' | 'video') => void;
    bannerVideoSource: 'internal' | 'youtube' | null;
    setBannerVideoSource: (source: 'internal' | 'youtube' | null) => void;
    bannerVideoUrl: string;
    setBannerVideoUrl: (url: string) => void;

    bannerYoutubeVideoId?: string;
    setBannerYoutubeVideoId?: (id: string) => void;
    bannerYoutubeStatus?: 'uploading' | 'processing' | 'ready' | 'failed';
    setBannerYoutubeStatus?: (status: 'uploading' | 'processing' | 'ready' | 'failed') => void;
    bannerYoutubeMetadata?: any;
    setBannerYoutubeMetadata?: (meta: any) => void;

    // Smart Playback State
    bannerSmartPlayback: boolean;
    setBannerSmartPlayback: (enabled: boolean) => void;

    // Effects State
    // Effects State
    bannerEffects?: Array<{
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        sepia: number;
        opacity: number;
    }>;
    setBannerEffects?: (effects: any) => void;

    // Local Previews (from parent)
    localPreviews?: Record<string, string>;

    // Callbacks
    onImageUpload?: (file: File) => Promise<string>;
    onVideoUpload?: (file: File, source: 'internal' | 'youtube') => Promise<string>;
}

export const EditorBanner: React.FC<EditorBannerProps> = ({
    user,
    bannerImages,
    setBannerImages,
    bannerImageLayout,
    setBannerImageLayout,
    bannerMediaType,
    setBannerMediaType,
    bannerVideoSource,
    setBannerVideoSource,
    bannerVideoUrl,
    setBannerVideoUrl,
    bannerYoutubeVideoId,
    setBannerYoutubeVideoId,
    bannerYoutubeStatus,
    setBannerYoutubeStatus,
    bannerYoutubeMetadata,
    setBannerYoutubeMetadata,
    bannerSmartPlayback,
    setBannerSmartPlayback,
    bannerEffects,
    setBannerEffects,
    localPreviews = {},
    onImageUpload,
    onVideoUpload
}) => {

    const [showYouTubeModal, setShowYouTubeModal] = useState(false);
    const [showEffectsPanel, setShowEffectsPanel] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [uploadQueue, setUploadQueue] = useState<Array<{ file: File; index: number }>>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);


    const resolveMedia = useCallback((url: string | undefined): string => {
        if (!url) return '';
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) return url;
        if (url.startsWith('local_')) {
            return localPreviews[url] || '';
        }
        return url;
    }, [localPreviews]);

    // Helper to get real-time preview styles
    const getPreviewStyle = useCallback((index: number = 0) => {
        let currentEffects = bannerEffects as any;

        // Handle array vs object
        if (Array.isArray(currentEffects)) {
            currentEffects = currentEffects[index];
        }

        if (!currentEffects) return {};

        return {
            filter: `
                brightness(${currentEffects.brightness || 1}) 
                contrast(${currentEffects.contrast || 1}) 
                saturate(${currentEffects.saturation || 1}) 
                blur(${currentEffects.blur || 0}px) 
                sepia(${currentEffects.sepia || 0}) 
                opacity(${currentEffects.opacity !== undefined ? currentEffects.opacity : 1})
            `.replace(/\s+/g, ' ').trim()
        };
    }, [bannerEffects]);

    // ========================================
    // IMAGE MANAGEMENT WITH SEQUENTIAL QUEUE
    // ========================================

    // Process upload queue sequentially (one at a time)
    const processUploadQueue = useCallback(async () => {
        if (isProcessingQueue || uploadQueue.length === 0) return;

        setIsProcessingQueue(true);
        const { file, index } = uploadQueue[0];

        try {
            // Se está substituindo uma imagem existente, deleta a antiga do Cloudinary
            if (bannerImages[index] && bannerImages[index].includes('cloudinary.com')) {
                try {
                    await deleteFromCloudinary(bannerImages[index], 'image');
                    setToast({
                        message: 'Imagem antiga removida do Cloudinary',
                        type: 'info'
                    });
                } catch (error) {
                    console.warn('⚠️ Falha ao registrar deleção do Cloudinary:', error);
                }
            }

            setUploadingIndex(index);
            setUploadProgress(0);

            console.log('📸 Uploading image to slot', index, ':', file.name);

            const uploadStartTime = Date.now();

            // Create preview URL immediately
            const previewUrl = URL.createObjectURL(file);

            // Update array with preview first
            setBannerImages((prev: string[]) => {
                const newImages = [...prev];
                newImages[index] = previewUrl;
                return newImages;
            });

            setUploadProgress(30);

            // Then upload to server (returns local ID for now)
            const localId = await onImageUpload!(file);

            setUploadProgress(80);

            // Update with local ID (will be replaced with real URL on save/publish)
            setBannerImages((prev: string[]) => {
                const finalImages = [...prev];
                finalImages[index] = localId;
                return finalImages;
            });

            // Enforce minimum 5-second upload time for better UX
            const uploadDuration = Date.now() - uploadStartTime;
            const minUploadTime = 5000; // 5 seconds
            const remainingTime = Math.max(0, minUploadTime - uploadDuration);

            if (remainingTime > 0) {
                console.log(`⏳ Aguardando ${(remainingTime / 1000).toFixed(1)}s para completar upload...`);
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            setUploadProgress(100);
            console.log('✅ Image stored locally:', localId);

            setTimeout(() => {
                setUploadingIndex(null);
                setUploadProgress(0);
            }, 500);
        } catch (error) {
            console.error('❌ Erro ao fazer upload da imagem:', error);
            setUploadingIndex(null);
            setUploadProgress(0);
        } finally {
            // Remove from queue and process next
            setUploadQueue(prev => prev.slice(1));
            setIsProcessingQueue(false);
        }
    }, [isProcessingQueue, uploadQueue, bannerImages, onImageUpload, setBannerImages]);

    // Trigger queue processing when queue has items
    React.useEffect(() => {
        if (uploadQueue.length > 0 && !isProcessingQueue) {
            processUploadQueue();
        }
    }, [uploadQueue, isProcessingQueue, processUploadQueue]);

    const handleImageUpload = useCallback((file: File, index: number) => {
        if (!onImageUpload) {
            console.warn('⚠️ onImageUpload callback not provided');
            return;
        }

        // Add to queue for sequential processing
        setUploadQueue(prev => [...prev, { file, index }]);
        console.log(`📋 Adicionado à fila de upload: ${file.name} (posição ${index + 1}/${uploadQueue.length + 1})`);
    }, [onImageUpload, uploadQueue.length]);

    const handleRemoveImage = useCallback(async (index: number) => {
        const imageUrl = bannerImages[index];

        // Deleta do Cloudinary se for uma URL do Cloudinary
        if (imageUrl && imageUrl.includes('cloudinary.com')) {
            try {
                await deleteFromCloudinary(imageUrl, 'image');
                setToast({
                    message: 'Imagem removida do Cloudinary',
                    type: 'success'
                });
            } catch (error) {
                console.warn('⚠️ Falha ao registrar deleção do Cloudinary:', error);
                // Não bloqueia a remoção da UI
            }
        }

        const newImages = bannerImages.filter((_, i) => i !== index);
        setBannerImages(newImages);
    }, [bannerImages, setBannerImages]);

    const handleReorderImages = useCallback((fromIndex: number, toIndex: number) => {
        const newImages = [...bannerImages];
        const [removed] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, removed);
        setBannerImages(newImages);
    }, [bannerImages, setBannerImages]);

    const canAddMoreImages = bannerImages.length < 5;

    // ========================================
    // VIDEO MANAGEMENT
    // ========================================

    const handleVideoSourceSelect = useCallback((source: 'internal' | 'youtube') => {
        setBannerVideoSource(source);
        setBannerVideoUrl('');
        if (setBannerYoutubeVideoId) setBannerYoutubeVideoId('');
        if (setBannerYoutubeStatus) setBannerYoutubeStatus('uploading');
    }, [setBannerVideoSource, setBannerVideoUrl, setBannerYoutubeVideoId, setBannerYoutubeStatus]);

    const handleVideoUpload = useCallback(async (file: File) => {
        if (!onVideoUpload || !bannerVideoSource) return;

        try {
            const url = await onVideoUpload(file, bannerVideoSource);
            setBannerVideoUrl(url);
        } catch (error) {
            console.error('Erro ao fazer upload do vídeo:', error);
        }
    }, [bannerVideoSource, setBannerVideoUrl, onVideoUpload]);

    // ========================================
    // RENDER
    // ========================================

    return (
        <div className="w-full bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden animate-fadeIn">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] p-8 md:p-10 border-b border-white/5">
                <h2 className="text-white font-black text-2xl md:text-3xl flex items-center gap-4 tracking-tighter">
                    <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                        <i className="fas fa-magic text-xl"></i>
                    </div>
                    Design do Banner
                </h2>
                <p className="text-white/50 text-sm mt-3 font-medium max-w-md leading-relaxed">
                    Personalize o impacto visual da sua reportagem com imagens de alta resolução ou vídeos imersivos.
                </p>
            </div>

            {/* Media Type Selector */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                    <button
                        onClick={() => {
                            setBannerMediaType('image');
                            // Clear video if needed, or just switch view
                            setBannerVideoUrl('');
                            if (setBannerYoutubeVideoId) setBannerYoutubeVideoId('');
                        }}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bannerMediaType === 'image'
                            ? 'bg-black text-white shadow-xl'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <i className="fas fa-images"></i>
                        Galeria
                    </button>
                    <button
                        onClick={() => {
                            setBannerMediaType('video');
                            // Clear images if needed? No, user might want to keep them if they switch back. BUT public view only shows one.
                            // The user request "não pode os 2" is satisfied by this toggle being 'image' OR 'video'.
                        }}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bannerMediaType === 'video'
                            ? 'bg-red-600 text-white shadow-xl shadow-red-600/20'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <i className="fas fa-play"></i>
                        Cinema
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {bannerMediaType === 'image' ? (
                    <div className="space-y-6">

                        {/* Effects Toggle Header */}
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-gray-700">Imagens & Ajustes</h3>
                            <button
                                onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-2 ${showEffectsPanel
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            >
                                <i className="fas fa-sliders-h"></i>
                                {showEffectsPanel ? 'Ocultar Efeitos' : 'Ajustar Efeitos'}
                            </button>
                        </div>

                        {/* Effects Panel Component */}
                        <EffectsPanel
                            isOpen={showEffectsPanel}
                            bannerEffects={((): any => {
                                const defaultEffects = { brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0, opacity: 1 };
                                if (Array.isArray(bannerEffects)) return bannerEffects[selectedImageIndex] || defaultEffects;
                                return bannerEffects || defaultEffects;
                            })() as any}
                            onEffectsChange={(newEffects: any) => {
                                if (setBannerEffects) {
                                    if (Array.isArray(bannerEffects)) {
                                        const updated = [...bannerEffects];
                                        updated[selectedImageIndex] = newEffects;
                                        setBannerEffects(updated);
                                    } else {
                                        // Initialize array if it was object or undefined, preserving existing if object
                                        const initial = bannerEffects ? [bannerEffects] : [];
                                        initial[selectedImageIndex] = newEffects;
                                        setBannerEffects(initial);
                                    }
                                }
                            }}
                        />

                        {/* Layout Selector Component */}
                        <LayoutSelector
                            currentLayout={bannerImageLayout}
                            onLayoutChange={setBannerImageLayout}
                        />

                        {/* Layout Preview Component */}
                        <LayoutPreview
                            bannerImages={bannerImages}
                            bannerImageLayout={bannerImageLayout}
                            resolveMedia={resolveMedia}
                            getPreviewStyle={getPreviewStyle}
                        />

                        {/* Image Gallery Component */}
                        <ImageGallery
                            bannerImages={bannerImages}
                            bannerImageLayout={bannerImageLayout}
                            uploadingIndex={uploadingIndex}
                            uploadProgress={uploadProgress}
                            uploadQueue={uploadQueue}
                            resolveMedia={resolveMedia}
                            getPreviewStyle={getPreviewStyle} // Now accepts index
                            onImageUpload={handleImageUpload}
                            onRemoveImage={handleRemoveImage}
                            selectedImageIndex={selectedImageIndex}
                            onSelectImage={setSelectedImageIndex}
                        />

                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* Video Source Selector */}
                        {!bannerVideoSource ? (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    <i className="fas fa-cloud-upload-alt mr-2"></i>
                                    Escolha a Fonte do Vídeo
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleVideoSourceSelect('internal')}
                                        className="p-6 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all group"
                                    >
                                        <i className="fas fa-server text-4xl text-gray-400 group-hover:text-blue-600 mb-3"></i>
                                        <h3 className="font-bold text-gray-800 mb-1">Cloud Interno</h3>
                                        <p className="text-xs text-gray-600">Cloudinary</p>
                                        <p className="text-xs text-gray-500 mt-2">Máx: 100MB, 1min</p>
                                    </button>

                                    <button
                                        onClick={() => {
                                            handleVideoSourceSelect('youtube');
                                            setShowYouTubeModal(true);
                                        }}
                                        className="p-6 border-2 border-gray-300 rounded-xl hover:border-red-600 hover:bg-red-50 transition-all group"
                                    >
                                        <i className="fab fa-youtube text-4xl text-gray-400 group-hover:text-red-600 mb-3"></i>
                                        <h3 className="font-bold text-gray-800 mb-1">YouTube</h3>
                                        <p className="text-xs text-gray-600">Upload Direto</p>
                                        <p className="text-xs text-gray-500 mt-2">Máx: 1GB</p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-gray-700">
                                        <i className={`${bannerVideoSource === 'youtube' ? 'fab fa-youtube' : 'fas fa-server'} mr-2`}></i>
                                        {bannerVideoSource === 'youtube' ? 'YouTube Upload' : 'Cloud Interno (Cloudinary)'}
                                    </label>
                                    <button
                                        onClick={() => setBannerVideoSource(null)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        <i className="fas fa-exchange-alt mr-1"></i>
                                        Trocar Fonte
                                    </button>
                                </div>
                                {bannerVideoUrl && (
                                    <div className="mt-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                                Preview do Teaser
                                            </label>
                                            <button
                                                onClick={() => {
                                                    setBannerVideoUrl('');
                                                    if (setBannerYoutubeVideoId) setBannerYoutubeVideoId('');
                                                    if (setBannerYoutubeStatus) setBannerYoutubeStatus('uploading');
                                                }}
                                                className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <i className="fas fa-trash"></i> Remover Vídeo
                                            </button>
                                        </div>
                                        <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative group border-4 border-white">
                                            {bannerVideoSource === 'youtube' && !bannerVideoUrl.startsWith('local_') ? (
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${bannerVideoUrl.split('v=')[1] || bannerVideoUrl.split('/').pop()}?autoplay=1&mute=1&controls=0&loop=1&playlist=${bannerVideoUrl.split('v=')[1] || bannerVideoUrl.split('/').pop()}`}
                                                    className="w-full h-full pointer-events-none"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                />
                                            ) : (
                                                <SmartVideoPlayer
                                                    src={resolveMedia(bannerVideoUrl)}
                                                    smartPlayback={bannerSmartPlayback}
                                                    className="w-full h-full object-cover"
                                                    muted={true}
                                                    loop={true}
                                                />
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20"></div>
                                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Cinema Preview Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Video Upload Components */}
                                {!bannerVideoUrl && (
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        {bannerVideoSource === 'internal' && (
                                            <CloudinaryVideoUploader
                                                onUploadComplete={(url) => {
                                                    setBannerVideoUrl(url);
                                                    console.log('✅ Vídeo enviado para Cloudinary:', url);
                                                }}
                                                onUploadError={(error) => {
                                                    console.error('❌ Erro no upload:', error);
                                                }}
                                            />
                                        )}

                                        {bannerVideoSource === 'youtube' && (
                                            <div className="text-center p-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 hover:border-red-500/30 transition-all group">
                                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/5 group-hover:scale-110 transition-transform">
                                                    <i className="fab fa-youtube text-4xl text-red-600"></i>
                                                </div>
                                                <h3 className="text-zinc-900 font-black text-xl mb-2 tracking-tight">Studio YouTube</h3>
                                                <p className="text-zinc-500 text-sm mb-8 font-medium max-w-xs mx-auto">
                                                    O vídeo será enviado diretamente para o seu canal com todas as configurações de SEO.
                                                </p>
                                                <button
                                                    onClick={() => setShowYouTubeModal(true)}
                                                    className="bg-red-600 hover:bg-black text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-red-600/20 hover:shadow-none active:scale-95"
                                                >
                                                    Configurar Publicação
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* YouTube Upload Modal */}
            {showYouTubeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                    <i className="fab fa-youtube"></i>
                                    Upload para YouTube
                                </h3>
                                <p className="text-white/80 text-sm mt-1">
                                    Preencha os dados do vídeo
                                </p>
                            </div>
                            <button
                                onClick={() => setShowYouTubeModal(false)}
                                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <YouTubeVideoUploader
                                onUploadComplete={(localId, metadata) => {
                                    setBannerVideoUrl(localId);
                                    if (setBannerYoutubeVideoId) setBannerYoutubeVideoId(`job_${Date.now()}`); // Placeholder ID
                                    if (setBannerYoutubeStatus) setBannerYoutubeStatus('ready');
                                    if (setBannerYoutubeMetadata) setBannerYoutubeMetadata(metadata);

                                    console.log('✅ Vídeo preparado localmente para YouTube:', { localId, metadata });
                                    setShowYouTubeModal(false);
                                }}
                                onUploadError={(error) => {
                                    console.error('❌ Erro no upload YouTube:', error);
                                    if (setBannerYoutubeStatus) setBannerYoutubeStatus('failed');
                                }}
                                onSmartPlaybackRequired={(duration) => {
                                    console.log('🎬 Smart Playback será ativado (duração:', duration, 's)');
                                    setBannerSmartPlayback(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

        </div>
    );
};

export default EditorBanner;
