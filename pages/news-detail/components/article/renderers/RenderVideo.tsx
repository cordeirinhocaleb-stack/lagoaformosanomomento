import React from 'react';
import { ContentBlock } from '@/types';

interface RenderVideoProps {
    block: ContentBlock;
}

export const RenderVideo: React.FC<RenderVideoProps> = ({ block }) => {
    // Check if it's a YouTube video (via source flag OR content detection)
    const isYouTube = block.videoSource === 'youtube' ||
        block.youtubeMeta ||
        (typeof block.content === 'string' && (block.content.includes('youtube.com') || block.content.includes('youtu.be')));

    // Pending State Handling
    if (typeof block.content === 'string' && block.content.includes('pending_')) {
        return (
            <div key={block.id} className="my-10 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-8 text-center aspect-video flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Processando Vídeo</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Este conteúdo estará disponível em breve.</p>
            </div>
        );
    }

    // Helper to determine container classes based on style
    const isShorts = block.settings?.style === 'shorts';
    const videoContainerClass = isShorts
        ? "aspect-[9/16] w-[320px] mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black border border-gray-100 dark:border-zinc-800"
        : "aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-gray-100 dark:border-zinc-800";

    if (isYouTube) {
        // Robust ID helper
        const getYouTubeId = (url: string | undefined) => {
            if (!url) { return null; }
            if (/^[a-zA-Z0-9_-]{11,}$/.test(url) && !url.includes('pending_')) { return url; }
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11,})/);
            return match ? match[1] : null;
        };

        const youtubeId = getYouTubeId(block.content);

        if (!youtubeId && block.content && (block.content.startsWith('http') || block.content.startsWith('//'))) {
            // Fallthrough to standard video
        } else if (!youtubeId) {
            return null;
        } else {
            return (
                <div className="my-10">
                    {block.settings?.videoTitle && (
                        <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 mb-4">{block.settings.videoTitle}</h4>
                    )}
                    <div className={videoContainerClass}>
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            className="w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                    </div>
                    {block.settings?.caption && (
                        <p className="text-center font-serif italic mt-4 text-zinc-500 dark:text-zinc-400 text-sm border-l-2 border-red-500 pl-4">{block.settings.caption}</p>
                    )}
                </div>
            );
        }
    }

    // Cloudinary or direct video URL
    if (block.content) {
        const effects = block.settings?.effects || {};
        const filterString = `brightness(${effects.brightness || 100}%) contrast(${effects.contrast || 100}%) saturate(${effects.saturation || 100}%) blur(${effects.blur || 0}px) sepia(${effects.sepia || 0}%) opacity(${effects.opacity || 100}%)`;

        return (
            <div className="my-10">
                {block.settings?.videoTitle && (
                    <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 mb-4">{block.settings.videoTitle}</h4>
                )}
                <div className={videoContainerClass}>
                    <video
                        src={block.content}
                        className="w-full h-full object-cover"
                        controls
                        muted={block.settings?.muted ?? false}
                        loop={block.settings?.loop ?? false}
                        autoPlay={block.settings?.autoplay ?? false}
                        playsInline
                        style={{ filter: filterString }}
                    />
                </div>
                {block.settings?.caption && (
                    <p className="text-center font-serif italic mt-4 text-zinc-500 dark:text-zinc-400 text-sm border-l-2 border-red-500 pl-4">{block.settings.caption}</p>
                )}
            </div>
        );
    }

    return null;
};
