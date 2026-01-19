import React from 'react';
import { BannerEffect, YoutubeMetadata } from '@/types';
import EffectsPanel from './EffectsPanel';
import LayoutSelector from './BannerLayoutSelectorPanel';
import { VideoSection } from './VideoSection';

interface BannerSettingsPanelProps {
    bannerMediaType: 'image' | 'video';
    bannerImageLayout: 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';
    setBannerImageLayout: (layout: 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic') => void;
    showEffectsPanel: boolean;
    setShowEffectsPanel: (show: boolean) => void;
    bannerEffects?: BannerEffect[] | BannerEffect; // Updated to match use in EditorBanner
    setBannerEffects?: (effects: BannerEffect[] | BannerEffect) => void;
    selectedImageIndex: number;

    // Video Props
    bannerVideoSource: 'internal' | 'youtube' | null;
    bannerVideoUrl: string;
    bannerSmartPlayback: boolean;
    videoStart: number;
    videoEnd: number;
    resolveMedia: (path: string) => string;
    handleVideoSourceSelect: (source: 'internal' | 'youtube') => void;
    setBannerVideoSource: (source: 'internal' | 'youtube' | null) => void;
    setBannerVideoUrl: (url: string) => void;
    setBannerYoutubeVideoId?: (id: string) => void;
    setBannerYoutubeStatus?: (status: 'uploading' | 'processing' | 'ready' | 'failed') => void;
    setBannerYoutubeMetadata?: (meta: YoutubeMetadata) => void;
    setBannerSmartPlayback: (enabled: boolean) => void;
    setVideoStart: (start: number) => void;
    setVideoEnd: (end: number) => void;
}

export const BannerSettingsPanel: React.FC<BannerSettingsPanelProps> = ({
    bannerMediaType,
    bannerImageLayout,
    setBannerImageLayout,
    showEffectsPanel,
    setShowEffectsPanel,
    bannerEffects,
    setBannerEffects,
    selectedImageIndex,
    bannerVideoSource,
    bannerVideoUrl,
    bannerSmartPlayback,
    videoStart,
    videoEnd,
    resolveMedia,
    handleVideoSourceSelect,
    setBannerVideoSource,
    setBannerVideoUrl,
    setBannerYoutubeVideoId,
    setBannerYoutubeStatus,
    setBannerYoutubeMetadata,
    setBannerSmartPlayback,
    setVideoStart,
    setVideoEnd
}) => {
    if (bannerMediaType === 'video') {
        return (
            <VideoSection
                bannerVideoSource={bannerVideoSource}
                bannerVideoUrl={bannerVideoUrl}
                bannerSmartPlayback={bannerSmartPlayback}
                videoStart={videoStart}
                videoEnd={videoEnd}
                bannerEffects={bannerEffects as unknown}
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
        );
    }

    return (
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
                    return (bannerEffects as unknown as BannerEffect) || defaultEffects;
                })()}
                onEffectsChange={(newEffects: unknown) => {
                    if (setBannerEffects) {
                        if (Array.isArray(bannerEffects)) {
                            const updated = [...bannerEffects];
                            updated[selectedImageIndex] = newEffects as BannerEffect;
                            setBannerEffects(updated);
                        } else {
                            // Initialize array if it was object or undefined
                            const initial: BannerEffect[] = bannerEffects ? [bannerEffects as unknown as BannerEffect] : [];
                            initial[selectedImageIndex] = newEffects as BannerEffect;
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
        </div>
    );
};
