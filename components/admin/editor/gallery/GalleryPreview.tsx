import React from 'react';
import { ContentBlock } from '@/types';
import GalleryRenderer from '@/components/news/GalleryRenderer';

interface GalleryPreviewProps {
    block: ContentBlock;
    getImgSrc: (img: string | number) => string;
}

export const GalleryPreview: React.FC<GalleryPreviewProps> = ({ block, getImgSrc }) => {
    // Resolve current images or return empty array
    const currentImages = (block.settings.images as string[] | undefined || []);

    // Generate Preview Data
    const previewBlock = {
        ...block,
        content: Array.isArray(block.content) ? block.content : [],
        settings: {
            ...block.settings,
            style: block.settings.galleryStyle || 'grid', // Ensure style is passed correctly
            images: currentImages.length > 0
                ? currentImages.map(img => getImgSrc(img))
                : [] // No fallback to picsum
        }
    } as ContentBlock;

    if (currentImages.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-4 animate-pulse">
                <i className="fas fa-images text-4xl opacity-20"></i>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">Aguardando Mídia...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full animate-fadeIn">
            <GalleryRenderer
                block={previewBlock}
                isEditor={true}
            />
        </div>
    );
};
