import React, { useState } from 'react';
import { ContentBlock } from '../../../../types';
import { VideoPlayer } from '../../../../components/ui/video-thumbnail-player';

interface VideoLinkBlockProps {
    block: ContentBlock;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate?: (content: string) => void;
}

const VideoLinkBlock: React.FC<VideoLinkBlockProps> = ({ block, isSelected, onSelect, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(!block.content);
    const [inputUrl, setInputUrl] = useState(block.content || '');

    const extractVideoId = (url: string): { platform: 'youtube' | 'vimeo' | 'dailymotion' | null; id: string | null } => {
        // YouTube
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (youtubeMatch) { return { platform: 'youtube', id: youtubeMatch[1] }; }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) { return { platform: 'vimeo', id: vimeoMatch[1] }; }

        // Dailymotion
        const dailymotionMatch = url.match(/dailymotion\.com\/video\/([^_]+)/);
        if (dailymotionMatch) { return { platform: 'dailymotion', id: dailymotionMatch[1] }; }

        return { platform: null, id: null };
    };

    const getEmbedUrl = (url: string): string | null => {
        const { platform, id } = extractVideoId(url);
        if (!id) { return null; }

        switch (platform) {
            case 'youtube':
                return `https://www.youtube.com/embed/${id}`;
            case 'vimeo':
                return `https://player.vimeo.com/video/${id}`;
            case 'dailymotion':
                return `https://www.dailymotion.com/embed/video/${id}`;
            default:
                return null;
        }
    };

    const handleSave = () => {
        if (onUpdate && inputUrl) {
            onUpdate(inputUrl);
            setIsEditing(false);
        }
    };

    const embedUrl = block.content ? getEmbedUrl(block.content) : null;

    return (
        <div onClick={onSelect} className={`p-4 transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
            {isEditing ? (
                <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                    <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <i className="fas fa-link text-blue-600"></i>
                        Colar Link do Vídeo
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                        Suporta: YouTube, Vimeo, Dailymotion
                    </p>
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Cole o link do vídeo aqui..."
                        className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 dark:bg-zinc-800 dark:text-white mb-4"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={!inputUrl}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                        >
                            <i className="fas fa-check mr-2"></i>
                            Confirmar
                        </button>
                        {block.content && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            ) : embedUrl ? (
                <div className="relative group h-full">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-gray-100 dark:border-zinc-800">
                        <VideoPlayer
                            thumbnailUrl={extractVideoId(block.content!).platform === 'youtube' && extractVideoId(block.content!).id
                                ? `https://img.youtube.com/vi/${extractVideoId(block.content!).id}/maxresdefault.jpg`
                                : "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"
                            }
                            videoUrl={embedUrl}
                            title={block.settings?.videoTitle || "Vídeo Linkado"}
                            description={block.settings?.caption || "Clique para assistir"}
                            className="w-full h-full"
                        />
                    </div>
                    {isSelected && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="absolute top-4 left-4 bg-white/90 hover:bg-white text-black px-3 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-2 transition-colors z-10"
                        >
                            <i className="fas fa-edit"></i>
                            Editar Link
                        </button>
                    )}
                </div>
            ) : (
                <div className="aspect-video w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                    <p className="text-zinc-400 text-sm">Link inválido ou não suportado</p>
                </div>
            )}
        </div>
    );
};

export default VideoLinkBlock;
