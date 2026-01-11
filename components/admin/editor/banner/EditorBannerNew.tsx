
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
import { User, YoutubeMetadata, BannerEffect } from '../../../../types';
import Toast, { ToastType } from '../../../common/Toast';
import {
    MediaTypeSelector,
    LayoutSelector,
    LayoutPreview,
    EffectsPanel,
    ImageGallery,
    VideoSection
} from './components';

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
    bannerYoutubeMetadata?: YoutubeMetadata;
    setBannerYoutubeMetadata?: (meta: YoutubeMetadata) => void;

    // Smart Playback State
    bannerSmartPlayback: boolean;
    setBannerSmartPlayback: (enabled: boolean) => void;

    // Effects State
    bannerEffects?: BannerEffect[];
    setBannerEffects?: (effects: BannerEffect[] | BannerEffect) => void;

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
            <div className="bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] p-6 md:p-10 border-b border-white/5 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-transparent bg-clip-text font-black text-[10px] uppercase tracking-[0.3em]">
                            PRO EDITION
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent"></div>
                    </div>

                    <h2 className="text-white font-black text-xl md:text-3xl flex items-center gap-3 md:gap-4 tracking-tighter">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20 flex-shrink-0">
                            <i className="fas fa-layer-group text-lg md:text-xl text-black"></i>
                        </div>
                        Premium Gallery Studio
                    </h2>
                    <p className="text-white/40 text-xs md:text-sm mt-3 font-medium max-w-md leading-relaxed border-l-2 border-amber-600/30 pl-3">
                        Interface de Produção Cinematográfica para gestão de ativos visuais de alta fidelidade.
                    </p>
                </div>
            </div>

            {/* Media Type Selector */}
            <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
                    <button
                        onClick={() => {
                            const hasVideo = bannerVideoUrl && bannerVideoUrl.trim() !== '';
                            const hasYouTubeVideo = bannerYoutubeVideoId && bannerYoutubeVideoId.trim() !== '';

                            if ((hasVideo || hasYouTubeVideo) && bannerMediaType === 'video') {
                                setShowGaleriaConfirmation(true);
                            } else {
                                setBannerMediaType('image');
                                setBannerVideoSource(null);
                            }
                        }}
                        className={`flex-1 py-2 md:py-3 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bannerMediaType === 'image'
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <i className="fas fa-film"></i>
                        Rolo de Câmera
                    </button>
                    <button
                        onClick={() => {
                            const hasImages = bannerImages && bannerImages.length > 0;

                            if (hasImages && bannerMediaType === 'image') {
                                setShowRemovalWarning(true);
                            } else {
                                setBannerMediaType('video');
                            }
                        }}
                        className={`flex-1 py-2 md:py-3 px-2 md:px-6 rounded-lg md:rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${bannerMediaType === 'video'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <i className="fas fa-video"></i>
                        Cine Studio
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
                            bannerEffects={((): BannerEffect => {
                                const defaultEffects = { brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0, opacity: 1 };
                                if (Array.isArray(bannerEffects)) { return bannerEffects[selectedImageIndex] || defaultEffects; }
                                return (bannerEffects as unknown as BannerEffect) || defaultEffects; // Cast unknown because prop type expects array
                            })()}
                            onEffectsChange={(newEffects: any) => {
                                if (setBannerEffects) {
                                    if (Array.isArray(bannerEffects)) {
                                        const updated = [...bannerEffects];
                                        updated[selectedImageIndex] = newEffects;
                                        setBannerEffects(updated);
                                    } else {
                                        // Initialize array if it was object or undefined, preserving existing if object
                                        const initial: BannerEffect[] = bannerEffects ? [bannerEffects as unknown as BannerEffect] : [];
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
                    <VideoSection
                        bannerVideoSource={bannerVideoSource}
                        bannerVideoUrl={bannerVideoUrl}
                        bannerSmartPlayback={bannerSmartPlayback}
                        videoStart={videoStart}
                        videoEnd={videoEnd}
                        bannerEffects={bannerEffects}
                        resolveMedia={resolveMedia}
                        handleVideoSourceSelect={handleVideoSourceSelect}
                        setBannerVideoSource={setBannerVideoSource}
                        setBannerVideoUrl={setBannerVideoUrl}
                        setBannerYoutubeVideoId={setBannerYoutubeVideoId}
                        setBannerYoutubeStatus={setBannerYoutubeStatus}
                        setBannerYoutubeMetadata={setBannerYoutubeMetadata}
                        setBannerSmartPlayback={setBannerSmartPlayback}
                        setVideoStart={setVideoStart}
                        setVideoEnd={setVideoEnd}
                        setBannerEffects={setBannerEffects}
                    />
                )}
            </div>

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
                                <strong className="text-gray-900">Limpe o Rolo de Câmera</strong> para ativar o modo Cine Studio.
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Clique no <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-full text-white text-xs mx-1">✕</span> em cada asset para removê-lo.
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
                                    <h3 className="text-white font-black text-xl tracking-tight">Ativar Rolo de Câmera?</h3>
                                    <p className="text-white/80 text-sm font-medium">O projeto Cine Studio atual será encerrado</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-4">
                                <div className="flex items-start gap-3">
                                    <i className="fas fa-exclamation-triangle text-amber-600 text-lg mt-0.5"></i>
                                    <div>
                                        <p className="text-amber-900 font-bold text-sm mb-1">Atenção: Esta ação resetará o estúdio</p>
                                        <p className="text-amber-800 text-sm leading-relaxed">
                                            Ao mudar para <strong>Rolo de Câmera</strong>, o vídeo atual será <strong>descartado</strong> do projeto.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                Você poderá adicionar até 5 assets no Rolo de Câmera. Deseja continuar?
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
                                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <i className="fas fa-film mr-2"></i>
                                Ativar Rolo de Câmera
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
