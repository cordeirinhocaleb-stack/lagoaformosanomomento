import React from 'react';
import { ContentBlock } from '@/types';
import GalleryRenderer from '@/components/news/GalleryRenderer';

interface GalleryPreviewProps {
    block: ContentBlock;
    getImgSrc: (img: string | number) => string;
}

export const GalleryPreview: React.FC<GalleryPreviewProps> = ({ block, getImgSrc }) => {
    // Generate Preview Data on the fly based on current settings
    const previewBlock = {
        ...block,
        content: Array.isArray(block.content) ? block.content : [], // Ensure content is array
        settings: {
            ...block.settings,
            // Mock images if empty for preview purposes
            images: (block.settings.images as unknown[] || []).length > 0
                ? block.settings.images
                : [1, 2, 3, 4].map(n => `https://picsum.photos/400/300?random=${n}`)
        }
    } as ContentBlock;

    return (
        <div className="mt-8 border-t border-zinc-100 pt-6">
            <h4 className="text-xs font-black uppercase text-zinc-400 mb-4 tracking-widest flex items-center gap-2">
                <i className="fas fa-eye"></i> Preview em Tempo Real
            </h4>

            {/* 
                   We wrap the renderer in a container that mimics the mobile/reader viewport 
                   to give a realistic preview of the grid layout.
                */}
            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm max-w-md mx-auto">
                <div className="bg-zinc-100 px-4 py-2 flex items-center justify-between border-b border-zinc-200">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Leitor</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                </div>
                <div className="p-4 bg-white relative">
                    <GalleryRenderer
                        block={previewBlock}
                    />

                    {/* Overlay to prevent interactions if needed */}
                    <div className="absolute inset-0 z-10 bg-transparent"></div>
                </div>
            </div>
        </div>
    );
};
