import { useState, useEffect, useCallback } from 'react';
import { storeLocalFile, getLocalFile } from '@/services/storage/localStorageService';
import { ContentBlock } from '@/types';
import { YouTubeVideoMetadata } from '@/services/upload/youtubeVideoService';

interface MediaSettings {
    style?: string;
    thumbnailUrl?: string;
    thumbUrl?: string;
    muted?: boolean;
    loop?: boolean;
    autoplay?: boolean;
    effects?: Record<string, number>;
    videoTitle?: string;
    caption?: string;
    uploadStatus?: string;
}

interface UseMediaBlockProps {
    block: ContentBlock;
    onUpdate: (content: unknown, settings?: unknown, extraProps?: Partial<ContentBlock>) => void;
}

export const useMediaBlock = ({ block, onUpdate }: UseMediaBlockProps) => {
    const [showYouTubeWizard, setShowYouTubeWizard] = useState(false);
    const [pendingYouTubeFile, setPendingYouTubeFile] = useState<File | null>(null);
    const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
    const [showEffects, setShowEffects] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [panelPosition, setPanelPosition] = useState({ x: 20, y: 100 });

    const settings = (block.settings || {}) as MediaSettings;
    const isVideo = block.type === 'video';
    const videoSource = block.videoSource;
    const content = block.content;

    // Effects logic
    const defaultEffects = {
        brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, opacity: 100
    };
    const effects = { ...defaultEffects, ...(settings.effects || {}) };

    const getFilterString = useCallback(() => {
        return `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) blur(${effects.blur}px) sepia(${effects.sepia}%) opacity(${effects.opacity}%)`;
    }, [effects]);

    // Resolve Local Video URL
    useEffect(() => {
        if (typeof content === 'string' && content.startsWith('local_')) {
            getLocalFile(content).then(blob => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    setLocalVideoUrl(url);
                    return () => URL.revokeObjectURL(url);
                }
            });
        } else {
            setLocalVideoUrl(null);
        }
    }, [content]);

    // YouTube logic
    const isYouTube = typeof content === 'string' && (content.includes('youtube.com') || content.includes('youtu.be'));
    const videoId = isYouTube ? (content as string).match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11,})/)?.[1] : null;

    const getEmbedUrl = useCallback(() => {
        if (!videoId) return null;
        let url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        if (settings.muted) url += '&mute=1';
        if (settings.autoplay) url += '&autoplay=1';
        if (settings.loop) url += `&loop=1&playlist=${videoId}`;
        return url;
    }, [videoId, settings]);

    const handleSourceSelect = (source: 'cloudinary' | 'youtube') => {
        onUpdate(block.content, { ...settings }, { videoSource: source });
    };

    const handleMediaSelect = async (file: File | null, previewUrl: string, type: 'image' | 'video') => {
        setUploadError(null);
        if (!file) return;

        if (type === 'video') {
            const sizeMB = file.size / (1024 * 1024);
            if (videoSource === 'cloudinary') {
                if (sizeMB > 100) {
                    setUploadError(`O arquivo excede o limite de 100MB para hospedagem interna (${sizeMB.toFixed(1)}MB). Use o YouTube.`);
                    return;
                }
                const localId = await storeLocalFile(file);
                onUpdate(localId);
                window.dispatchEvent(new CustomEvent('lfnm:media-selected', { detail: { blockId: block.id, file, type, source: 'cloudinary' } }));
            } else if (videoSource === 'youtube') {
                if (sizeMB > 1024) {
                    setUploadError(`O arquivo excede o limite de 1GB para upload no YouTube.`);
                    return;
                }
                setPendingYouTubeFile(file);
                setShowYouTubeWizard(true);
            }
        } else {
            const localId = await storeLocalFile(file);
            onUpdate(localId);
            window.dispatchEvent(new CustomEvent('lfnm:media-selected', { detail: { blockId: block.id, file, type } }));
        }
    };

    const handleYouTubeComplete = (youtubeUrl: string, metadata: YouTubeVideoMetadata) => {
        onUpdate(youtubeUrl, { ...settings, uploadStatus: 'ready' }, { youtubeMeta: metadata, videoSource: 'youtube' });
        setShowYouTubeWizard(false);
        setPendingYouTubeFile(null);
    };

    const handleSettingChange = (key: string, value: unknown) => {
        onUpdate(block.content, { ...settings, [key]: value });
    };

    const handleEffectChange = (key: string, value: number) => {
        onUpdate(block.content, { ...settings, effects: { ...effects, [key]: value } });
    };

    return {
        states: {
            showYouTubeWizard,
            pendingYouTubeFile,
            localVideoUrl,
            showEffects,
            uploadError,
            panelPosition,
            settings,
            effects,
            videoId,
            embedUrl: getEmbedUrl(),
            filterString: getFilterString()
        },
        actions: {
            setShowYouTubeWizard,
            setPendingYouTubeFile,
            setLocalVideoUrl,
            setShowEffects,
            setUploadError,
            setPanelPosition,
            handleSourceSelect,
            handleMediaSelect,
            handleYouTubeComplete,
            handleSettingChange,
            handleEffectChange
        }
    };
};
