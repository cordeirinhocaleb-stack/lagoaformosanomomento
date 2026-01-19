import { useState, useCallback } from 'react';
import { BannerEffect, YoutubeMetadata } from '@/types';
import { ToastType } from '../../../../common/Toast';

interface UseEditorBannerProps {
    bannerImages: string[];
    bannerEffects?: BannerEffect[];
    bannerVideoUrl: string;
    bannerYoutubeVideoId?: string;
    setBannerVideoSource: (source: 'internal' | 'youtube' | null) => void;
    setBannerVideoUrl: (url: string) => void;
    setBannerYoutubeVideoId?: (id: string) => void;
    setBannerYoutubeStatus?: (status: 'uploading' | 'processing' | 'ready' | 'failed') => void;
    localPreviews?: Record<string, string>;
}

export const useEditorBanner = ({
    bannerImages,
    bannerEffects,
    bannerVideoUrl,
    bannerYoutubeVideoId,
    setBannerVideoSource,
    setBannerVideoUrl,
    setBannerYoutubeVideoId,
    setBannerYoutubeStatus,
    localPreviews = {}
}: UseEditorBannerProps) => {
    const [showEffectsPanel, setShowEffectsPanel] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [showRemovalWarning, setShowRemovalWarning] = useState(false);
    const [showGaleriaConfirmation, setShowGaleriaConfirmation] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const resolveMedia = useCallback((url: string | undefined): string => {
        if (!url) { return ''; }
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http')) { return url; }
        if (url.startsWith('local_')) {
            return localPreviews[url] || '';
        }
        return url;
    }, [localPreviews]);

    const getPreviewStyle = useCallback((index: number = 0) => {
        let currentEffects: BannerEffect | undefined;

        if (Array.isArray(bannerEffects)) {
            currentEffects = bannerEffects[index];
        } else {
            currentEffects = bannerEffects;
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

    const handleVideoSourceSelect = useCallback((source: 'internal' | 'youtube') => {
        setBannerVideoSource(source);
        setBannerVideoUrl('');
        if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(''); }
        if (setBannerYoutubeStatus) { setBannerYoutubeStatus('uploading'); }
    }, [setBannerVideoSource, setBannerVideoUrl, setBannerYoutubeVideoId, setBannerYoutubeStatus]);

    return {
        states: {
            showEffectsPanel,
            setShowEffectsPanel,
            toast,
            setToast,
            showRemovalWarning,
            setShowRemovalWarning,
            showGaleriaConfirmation,
            setShowGaleriaConfirmation,
            selectedImageIndex,
            setSelectedImageIndex
        },
        actions: {
            resolveMedia,
            getPreviewStyle,
            handleVideoSourceSelect
        }
    };
};
