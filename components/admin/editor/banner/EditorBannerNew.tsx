
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
import { deleteVideoFromYouTube, extractYouTubeVideoId } from '../../../../services/upload/youtubeVideoService';
import SmartVideoPlayer from '../../../player/SmartVideoPlayer';
import Toast, { ToastType } from '../../../common/Toast';
import {
    MediaTypeSelector,
    LayoutSelector,
    LayoutPreview,
    EffectsPanel,
    ImageGallery
} from './components';
import VideoTrimSelector from './components/VideoTrimSelector';

// Custom Hooks
import { useImageUploadQueue } from '../hooks/useImageUploadQueue';

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

    // Video Trim
    videoStart?: number;
    setVideoStart?: (start: number) => void;
    videoEnd?: number;
    setVideoEnd?: (end: number) => void;
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
    onVideoUpload,
    videoStart = 0,
    setVideoStart,
    videoEnd = 0,
    setVideoEnd
}) => {
    const [showYouTubeModal, setShowYouTubeModal] = useState(false);
    const [showEffectsPanel, setShowEffectsPanel] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [showRemovalWarning, setShowRemovalWarning] = useState(false);
    const [showGaleriaConfirmation, setShowGaleriaConfirmation] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);

    // Extracted Hook for Image Queue
    const {
        uploadingIndex, uploadProgress, uploadQueue,
        handleImageUpload, handleRemoveImage, handleReorderImages
    } = useImageUploadQueue({
        bannerImages,
        setBannerImages,
        onImageUpload,
        setToast
    });

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Sync hook toast to local toast
    // The hook signature I created expects setToast. 
    // I need to update the hook usage above to pass this component's setToast.
    // Actually, I can pass the real setToast to the hook.

    const resolveMedia = useCallback((url: string | undefined): string => {
        if (!url) { return ''; }
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) { return url; }
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

        if (!currentEffects) { return {}; }

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

    // IMAGE MANAGEMENT Logic moved to useImageUploadQueue hook
    const canAddMoreImages = bannerImages.length < 5;

    // ========================================
    // VIDEO MANAGEMENT
    // ========================================

    const handleVideoSourceSelect = useCallback((source: 'internal' | 'youtube') => {
        setBannerVideoSource(source);
        setBannerVideoUrl('');
        if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(''); }
        if (setBannerYoutubeStatus) { setBannerYoutubeStatus('uploading'); }
    }, [setBannerVideoSource, setBannerVideoUrl, setBannerYoutubeVideoId, setBannerYoutubeStatus]);

    const handleVideoUpload = useCallback(async (file: File) => {
        if (!onVideoUpload || !bannerVideoSource) { return; }

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
                            // Check if switching would delete existing video
                            const hasVideo = bannerVideoUrl && bannerVideoUrl.trim() !== '';
                            const hasYouTubeVideo = bannerYoutubeVideoId && bannerYoutubeVideoId.trim() !== '';

                            if ((hasVideo || hasYouTubeVideo) && bannerMediaType === 'video') {
                                // Show custom confirmation modal
                                setShowGaleriaConfirmation(true);
                            } else {
                                setBannerMediaType('image');
                                setBannerVideoSource(null); // Reset source selection
                            }
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
                            // Check if switching would delete existing images
                            const hasImages = bannerImages && bannerImages.length > 0;

                            if (hasImages && bannerMediaType === 'image') {
                                // BLOCK the switch and show custom modal
                                setShowRemovalWarning(true);
                            } else {
                                setBannerMediaType('video');
                            }
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
                                if (Array.isArray(bannerEffects)) { return bannerEffects[selectedImageIndex] || defaultEffects; }
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
                                        const initial: any[] = bannerEffects ? [bannerEffects] : [];
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
                                                    if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(''); }
                                                    if (setBannerYoutubeStatus) { setBannerYoutubeStatus('uploading'); }
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
                                                    videoStart={videoStart}
                                                    videoEnd={videoEnd}
                                                    onLoadedMetadata={(e) => {
                                                        const video = e.target as HTMLVideoElement;
                                                        setVideoDuration(video.duration);
                                                        console.log('📹 Duração do vídeo:', video.duration);
                                                    }}
                                                    style={{
                                                        filter: bannerEffects && (Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects) ? `
                                                            brightness(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).brightness || 1})
                                                            contrast(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).contrast || 1})
                                                            saturate(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).saturation || 1})
                                                            blur(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).blur || 0}px)
                                                            sepia(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).sepia || 0})
                                                            opacity(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).opacity !== undefined ? (Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).opacity : 1})
                                                        `.replace(/\s+/g, ' ').trim() : undefined
                                                    }}
                                                />
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20"></div>
                                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Cinema Preview Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Video Trim Selector */}
                                        {setVideoStart && setVideoEnd && videoDuration > 0 && (
                                            <VideoTrimSelector
                                                videoUrl={resolveMedia(bannerVideoUrl)}
                                                duration={videoDuration}
                                                initialStart={videoStart}
                                                initialEnd={videoEnd || videoDuration}
                                                onTrimChange={(start, end) => {
                                                    setVideoStart(start);
                                                    setVideoEnd(end);
                                                }}
                                                maxDuration={60}
                                            />
                                        )}

                                        {/* Video Effects Panel */}
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all shadow-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                        <i className="fas fa-magic text-lg"></i>
                                                    </div>
                                                    <span className="font-black text-sm uppercase tracking-wider">
                                                        Ajustar Vídeo
                                                    </span>
                                                </div>
                                                <i className={`fas fa-chevron-${showEffectsPanel ? 'up' : 'down'} transition-transform`}></i>
                                            </button>

                                            {showEffectsPanel && setBannerEffects && (
                                                <EffectsPanel
                                                    isOpen={true}
                                                    bannerEffects={Array.isArray(bannerEffects) ? bannerEffects[0] : (bannerEffects || { brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0, opacity: 1 })}
                                                    onEffectsChange={(newEffects) => {
                                                        setBannerEffects([newEffects]);
                                                    }}
                                                />
                                            )}
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
                                onUploadComplete={(youtubeUrl, metadata, videoId) => {
                                    // Use the actual YouTube URL instead of localId
                                    // This prevents syncService from trying to re-upload it
                                    setBannerVideoUrl(youtubeUrl);
                                    if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(videoId); }
                                    if (setBannerYoutubeStatus) { setBannerYoutubeStatus('ready'); }
                                    if (setBannerYoutubeMetadata) { setBannerYoutubeMetadata(metadata); }

                                    console.log('✅ Vídeo enviado com sucesso para YouTube:', { youtubeUrl, videoId, metadata });
                                    setShowYouTubeModal(false);
                                }}
                                onUploadError={(error) => {
                                    console.error('❌ Erro no upload YouTube:', error);
                                    if (setBannerYoutubeStatus) { setBannerYoutubeStatus('failed'); }
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

            {/* Custom Removal Warning Modal */}
            {showRemovalWarning && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xl tracking-tight">Atenção</h3>
                                    <p className="text-white/80 text-sm font-medium">Ação necessária</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-gray-700 text-base leading-relaxed mb-2">
                                <strong className="text-gray-900">Retire todas as fotos</strong> para poder mudar para vídeo.
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Clique no <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-full text-white text-xs mx-1">✕</span> em cada foto para removê-las.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0">
                            <button
                                onClick={() => setShowRemovalWarning(false)}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Entendi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Galeria Confirmation Modal */}
            {showGaleriaConfirmation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <i className="fas fa-images text-white text-2xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xl tracking-tight">Mudar para Galeria?</h3>
                                    <p className="text-white/80 text-sm font-medium">O vídeo configurado será removido</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-4">
                                <div className="flex items-start gap-3">
                                    <i className="fas fa-exclamation-triangle text-amber-600 text-lg mt-0.5"></i>
                                    <div>
                                        <p className="text-amber-900 font-bold text-sm mb-1">Atenção: Esta ação não pode ser desfeita</p>
                                        <p className="text-amber-800 text-sm leading-relaxed">
                                            Ao mudar para <strong>Galeria</strong>, o vídeo atual será <strong>permanentemente removido</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                Você poderá adicionar até 5 imagens no modo Galeria. Deseja continuar?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => setShowGaleriaConfirmation(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setBannerMediaType('image');
                                    setBannerVideoUrl('');
                                    setBannerVideoSource(null);
                                    if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(''); }
                                    setShowGaleriaConfirmation(false);
                                }}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <i className="fas fa-images mr-2"></i>
                                Mudar para Galeria
                            </button>
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
