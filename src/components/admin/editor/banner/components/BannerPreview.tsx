import React from 'react';
import LayoutPreview from './LayoutPreview';
import ImageGallery, { UploadQueueItem } from './BannerImageGalleryPanel';

interface BannerPreviewProps {
    bannerMediaType: 'image' | 'video';
    bannerImages: string[];
    bannerImageLayout: 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';
    uploadingIndex: number | null;
    uploadProgress: number;
    uploadQueue: UploadQueueItem[];
    resolveMedia: (path: string) => string;
    getPreviewStyle: (index?: number) => React.CSSProperties;
    handleImageUpload: (file: File, index: number) => void;
    handleRemoveImage: (index: number) => void;
    selectedImageIndex: number;
    setSelectedImageIndex: (index: number) => void;
}

export const BannerPreview: React.FC<BannerPreviewProps> = ({
    bannerMediaType,
    bannerImages,
    bannerImageLayout,
    uploadingIndex,
    uploadProgress,
    uploadQueue,
    resolveMedia,
    getPreviewStyle,
    handleImageUpload,
    handleRemoveImage,
    selectedImageIndex,
    setSelectedImageIndex
}) => {
    if (bannerMediaType === 'video') return null;

    return (
        <>
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
                getPreviewStyle={getPreviewStyle}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
                selectedImageIndex={selectedImageIndex}
                onSelectImage={setSelectedImageIndex}
            />
        </>
    );
};
