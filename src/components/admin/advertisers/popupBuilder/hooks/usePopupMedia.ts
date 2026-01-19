import { useState, useCallback } from 'react';
import { PopupMediaConfig, PopupImagePresentation, PopupVideoSettings, PopupImageStyle } from '@/types';

export type MediaSubTab = 'source' | 'layout' | 'style' | 'filters';

interface UsePopupMediaProps {
    media: PopupMediaConfig;
    onChange: (media: Partial<PopupMediaConfig>) => void;
}

export const usePopupMedia = ({ media, onChange }: UsePopupMediaProps) => {
    const [activeSubTab, setActiveSubTab] = useState<MediaSubTab>('source');

    const hasVideo = !!media.videoUrl;
    const hasImages = !!(media.images && media.images.length > 0);
    const mediaType: 'image' | 'video' = hasVideo ? 'video' : 'image';

    const handleMediaAdd = useCallback((_file: File | null, preview: string, type: 'image' | 'video') => {
        if (type === 'video') {
            onChange({ videoUrl: preview, images: [] });
        } else {
            const currentImages = media.images || [];
            if (currentImages.length >= 3) {
                alert("Máximo de 3 imagens atingido. Remova uma para adicionar outra.");
                return;
            }
            const newImages = [...currentImages, preview];
            onChange({ images: newImages, videoUrl: '' });
        }
    }, [media.images, onChange]);

    const removeImage = useCallback((index: number) => {
        const newImages = [...(media.images || [])];
        newImages.splice(index, 1);
        onChange({ images: newImages });
    }, [media.images, onChange]);

    const updateImageStyle = useCallback((updates: Partial<PopupImageStyle>) => {
        onChange({ imageStyle: { ...(media.imageStyle || {}), ...updates } as PopupImageStyle });
    }, [media.imageStyle, onChange]);

    const updateVideoSettings = useCallback((updates: Partial<PopupVideoSettings>) => {
        onChange({ videoSettings: { ...(media.videoSettings || {}), ...updates } as PopupVideoSettings });
    }, [media.videoSettings, onChange]);

    return {
        activeSubTab,
        setActiveSubTab,
        mediaType,
        hasVideo,
        hasImages,
        actions: {
            handleMediaAdd,
            removeImage,
            updateImageStyle,
            updateVideoSettings
        }
    };
};
