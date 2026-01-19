import { useState, useCallback } from 'react';
import { User, SocialPost, SystemSettings, SocialDistribution } from '@/types';
import { uploadToCloudinary } from '@/services/cloudinaryService';
import { dispatchGenericSocialPost } from '@/services/integrationService';
import { saveSocialPost } from '@/services/supabaseService';
import { VideoMetadata, queueYouTubeUpload } from '@/services/youtubeService';

interface UseSocialHubProps {
    user: User;
    systemSettings: SystemSettings;
}

export const useSocialHub = ({ user, systemSettings }: UseSocialHubProps) => {
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [pendingMedia, setPendingMedia] = useState<{ file: File, preview: string } | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<SocialDistribution['platform'][]>(['instagram_feed', 'facebook', 'whatsapp']);
    const [publishStatus, setPublishStatus] = useState<'idle' | 'uploading' | 'distributing' | 'success' | 'error'>('idle');
    const [currentDistributions, setCurrentDistributions] = useState<SocialDistribution[]>([]);

    // Video Source Logic
    const [showSourcePicker, setShowSourcePicker] = useState(false);
    const [showYouTubeWizard, setShowYouTubeWizard] = useState(false);
    const [youtubeMeta, setYoutubeMeta] = useState<VideoMetadata | null>(null);
    const [videoSource, setVideoSource] = useState<'cloudinary' | 'youtube'>('cloudinary');

    const togglePlatform = useCallback((id: SocialDistribution['platform']) => {
        setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    }, []);

    const handleMediaSelect = useCallback((file: File | null, preview: string, type: 'image' | 'video') => {
        if (file) {
            setPendingMedia({ file, preview });
            setMediaType(type);

            if (type === 'video') {
                setShowSourcePicker(true);
            }
        } else {
            setPendingMedia(null);
        }
    }, []);

    const handleVideoSourceSelect = useCallback((source: 'cloudinary' | 'youtube') => {
        setVideoSource(source);
        setShowSourcePicker(false);
        if (source === 'youtube') {
            setShowYouTubeWizard(true);
        }
    }, []);

    const handleYouTubeConfig = useCallback((meta: VideoMetadata) => {
        setYoutubeMeta(meta);
        setShowYouTubeWizard(false);
    }, []);

    const handleBroadcast = async () => {
        if (!content && !pendingMedia) { return alert("Adicione texto ou mídia para postar."); }
        if (selectedPlatforms.length === 0) { return alert("Selecione ao menos uma rede social."); }

        setPublishStatus('uploading');

        setCurrentDistributions(selectedPlatforms.map(p => ({
            platform: p,
            content: content,
            status: 'pending'
        })));

        let finalMediaUrl = '';
        try {
            if (pendingMedia) {
                if (mediaType === 'video' && videoSource === 'youtube' && youtubeMeta) {
                    const { jobId } = await queueYouTubeUpload(pendingMedia.file, youtubeMeta, `social_${Date.now()}`);
                    finalMediaUrl = `https://youtu.be/pending_upload_${jobId}`;
                } else {
                    finalMediaUrl = await uploadToCloudinary(pendingMedia.file, `social_hub/${user.id}`, 'hub_post');
                }
            }

            const postData: SocialPost = {
                id: `hub_${Date.now()}`,
                content,
                mediaUrl: finalMediaUrl,
                mediaType,
                platforms: selectedPlatforms,
                createdAt: new Date().toISOString(),
                status: 'posted',
                authorId: user.id,
                authorName: user.name
            };

            setPublishStatus('distributing');

            await dispatchGenericSocialPost(postData, systemSettings.socialWebhookUrl, (plat, status) => {
                setCurrentDistributions(prev => prev.map(d => d.platform === plat ? { ...d, status: status === 'success' ? 'posted' : status === 'error' ? 'failed' : 'pending' } : d));
            });

            await saveSocialPost(postData);

            setPublishStatus('success');
            setContent('');
            setPendingMedia(null);
            setYoutubeMeta(null);

        } catch (e) {
            console.error(e);
            setPublishStatus('error');
        }
    };

    return {
        states: {
            content,
            setContent,
            mediaType,
            setMediaType,
            pendingMedia,
            setPendingMedia,
            selectedPlatforms,
            publishStatus,
            setPublishStatus,
            currentDistributions,
            showSourcePicker,
            setShowSourcePicker,
            showYouTubeWizard,
            setShowYouTubeWizard,
            youtubeMeta,
            setYoutubeMeta,
            videoSource
        },
        actions: {
            togglePlatform,
            handleMediaSelect,
            handleVideoSourceSelect,
            handleYouTubeConfig,
            handleBroadcast
        }
    };
};
