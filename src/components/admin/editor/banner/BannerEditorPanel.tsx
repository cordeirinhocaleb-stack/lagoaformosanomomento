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
import { User, YoutubeMetadata, BannerEffect } from '@/types';
import Toast, { ToastType } from '../../../common/Toast';
import {
    MediaTypeSelector,
    BannerSettingsPanel,
    BannerPreview
} from './components';
import { RemovalWarningModal, GalleryConfirmationModal } from './components/Modals';

// Custom Hooks
import { useImageUploadQueue } from '../hooks/useImageUploadQueue';
import { useEditorBanner } from './hooks/useEditorBanner';

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
    const { states, actions } = useEditorBanner({
        bannerImages,
        bannerEffects,
        bannerVideoUrl,
        bannerYoutubeVideoId,
        setBannerVideoSource,
        setBannerVideoUrl,
        setBannerYoutubeVideoId,
        setBannerYoutubeStatus,
        localPreviews
    });

    const {
        showEffectsPanel, setShowEffectsPanel,
        toast, setToast,
        showRemovalWarning, setShowRemovalWarning,
        showGaleriaConfirmation, setShowGaleriaConfirmation,
        selectedImageIndex, setSelectedImageIndex
    } = states;

    const { resolveMedia, getPreviewStyle, handleVideoSourceSelect } = actions;

    // Extracted Hook for Image Queue
    const {
        uploadingIndex, uploadProgress, uploadQueue,
        handleImageUpload, handleRemoveImage
    } = useImageUploadQueue({
        bannerImages,
        setBannerImages,
        onImageUpload,
        setToast
    });

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
                <BannerSettingsPanel
                    bannerMediaType={bannerMediaType}
                    bannerImageLayout={bannerImageLayout}
                    setBannerImageLayout={setBannerImageLayout}
                    showEffectsPanel={showEffectsPanel}
                    setShowEffectsPanel={setShowEffectsPanel}
                    bannerEffects={bannerEffects}
                    setBannerEffects={setBannerEffects}
                    selectedImageIndex={selectedImageIndex}
                    bannerVideoSource={bannerVideoSource}
                    bannerVideoUrl={bannerVideoUrl}
                    bannerSmartPlayback={bannerSmartPlayback}
                    videoStart={videoStart}
                    videoEnd={videoEnd}
                    resolveMedia={resolveMedia}
                    handleVideoSourceSelect={handleVideoSourceSelect}
                    setBannerVideoSource={setBannerVideoSource}
                    setBannerVideoUrl={setBannerVideoUrl}
                    setBannerYoutubeVideoId={setBannerYoutubeVideoId}
                    setBannerYoutubeStatus={setBannerYoutubeStatus}
                    setBannerYoutubeMetadata={setBannerYoutubeMetadata}
                    setBannerSmartPlayback={setBannerSmartPlayback}
                    setVideoStart={setVideoStart || (() => { })}
                    setVideoEnd={setVideoEnd || (() => { })}
                />

                <BannerPreview
                    bannerMediaType={bannerMediaType}
                    bannerImages={bannerImages}
                    bannerImageLayout={bannerImageLayout}
                    uploadingIndex={uploadingIndex}
                    uploadProgress={uploadProgress}
                    uploadQueue={uploadQueue}
                    resolveMedia={resolveMedia}
                    getPreviewStyle={(idx) => getPreviewStyle(idx) || {}}
                    handleImageUpload={handleImageUpload}
                    handleRemoveImage={handleRemoveImage}
                    selectedImageIndex={selectedImageIndex}
                    setSelectedImageIndex={setSelectedImageIndex}
                />
            </div>

            <RemovalWarningModal
                visible={showRemovalWarning}
                onClose={() => setShowRemovalWarning(false)}
            />

            <GalleryConfirmationModal
                visible={showGaleriaConfirmation}
                onClose={() => setShowGaleriaConfirmation(false)}
                onConfirm={() => {
                    setBannerMediaType('image');
                    setBannerVideoUrl('');
                    setBannerVideoSource(null);
                    if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(''); }
                    setShowGaleriaConfirmation(false);
                }}
            />

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
