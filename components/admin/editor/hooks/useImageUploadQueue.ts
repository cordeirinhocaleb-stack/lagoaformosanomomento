import { useState, useCallback, useEffect } from 'react';
import { deleteFromCloudinary } from '../../../../services/cloudinaryService';

interface UseImageUploadQueueProps {
    bannerImages: string[];
    setBannerImages: React.Dispatch<React.SetStateAction<string[]>>;
    onImageUpload?: (file: File) => Promise<string>;
    setToast: (toast: { message: string, type: 'success' | 'error' | 'warning' | 'info' } | null) => void;
}

export const useImageUploadQueue = ({ bannerImages, setBannerImages, onImageUpload, setToast }: UseImageUploadQueueProps) => {
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadQueue, setUploadQueue] = useState<Array<{ file: File; index: number }>>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);

    // Process upload queue sequentially
    const processUploadQueue = useCallback(async () => {
        if (isProcessingQueue || uploadQueue.length === 0 || !onImageUpload) {return;}

        setIsProcessingQueue(true);
        const { file, index } = uploadQueue[0];

        try {
            // Delete old image if it exists and is from Cloudinary
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

            // Preview
            const previewUrl = URL.createObjectURL(file);
            setBannerImages((prev: string[]) => {
                const newImages = [...prev];
                newImages[index] = previewUrl;
                return newImages;
            });

            setUploadProgress(30);

            // Upload
            const localId = await onImageUpload(file);
            setUploadProgress(80);

            // Update with ID
            setBannerImages((prev: string[]) => {
                const finalImages = [...prev];
                finalImages[index] = localId;
                return finalImages;
            });

            // Enforce min time
            const uploadDuration = Date.now() - uploadStartTime;
            const remainingTime = Math.max(0, 5000 - uploadDuration);

            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }

            setUploadProgress(100);

            setTimeout(() => {
                setUploadingIndex(null);
                setUploadProgress(0);
            }, 500);

        } catch (error) {
            console.error('❌ Erro ao fazer upload da imagem:', error);
            setUploadingIndex(null);
            setUploadProgress(0);
        } finally {
            setUploadQueue(prev => prev.slice(1));
            setIsProcessingQueue(false);
        }
    }, [isProcessingQueue, uploadQueue, bannerImages, onImageUpload, setBannerImages, setToast]);

    // Trigger queue
    useEffect(() => {
        if (uploadQueue.length > 0 && !isProcessingQueue) {
            processUploadQueue();
        }
    }, [uploadQueue, isProcessingQueue, processUploadQueue]);

    const handleImageUpload = useCallback((file: File, index: number) => {
        if (!onImageUpload) {
            console.warn('⚠️ onImageUpload callback not provided');
            return;
        }
        setUploadQueue(prev => [...prev, { file, index }]);
    }, [onImageUpload]);

    const handleRemoveImage = useCallback(async (index: number) => {
        const imageUrl = bannerImages[index];
        if (imageUrl && imageUrl.includes('cloudinary.com')) {
            try {
                await deleteFromCloudinary(imageUrl, 'image');
                setToast({ message: 'Imagem removida do Cloudinary', type: 'success' });
            } catch (error) {
                console.warn('⚠️ Falha ao registrar deleção do Cloudinary:', error);
            }
        }
        setBannerImages((prev: string[]) => prev.filter((_, i) => i !== index));
    }, [bannerImages, setBannerImages, setToast]);

    const handleReorderImages = useCallback((fromIndex: number, toIndex: number) => {
        setBannerImages((prev: string[]) => {
            const newImages = [...prev];
            const [removed] = newImages.splice(fromIndex, 1);
            newImages.splice(toIndex, 0, removed);
            return newImages;
        });
    }, [setBannerImages]);

    return {
        uploadingIndex,
        uploadProgress,
        uploadQueue,
        handleImageUpload,
        handleRemoveImage,
        handleReorderImages
    };
};
