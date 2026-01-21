
import React, { useState, useEffect } from 'react';
import { storeLocalFile, getLocalFile } from '../../../../services/storage/localStorageService';
import { ContentBlock } from '../../../../types';
import MediaUploader from '../../../media/MediaUploader';
import VideoSourcePicker from '../media/VideoSourcePicker';
import YouTubeVideoUploader from '../banner/YouTubeVideoUploader';
import { VideoMetadata } from '../../../../services/youtubeService';
import { YouTubeVideoMetadata } from '../../../../services/upload/youtubeVideoService';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import UniversalMediaUploader from '../../../../components/media/UniversalMediaUploader';
import { VideoPlayer } from '../../../../components/ui/video-thumbnail-player';

// ... (props interface remains same)
export interface MediaBlockProps {
    user: import('../../../../types').User;
    block: ContentBlock;
    isSelected: boolean;
    isUploading?: boolean;
    onSelect: () => void;
    onUpdate: (content: unknown, settings?: any, extraProps?: Partial<ContentBlock>) => void;
}


const MediaBlock: React.FC<MediaBlockProps> = ({ user, block, isSelected, isUploading, onSelect, onUpdate }) => {
    const [showYouTubeWizard, setShowYouTubeWizard] = useState(false);
    const [pendingYouTubeFile, setPendingYouTubeFile] = useState<File | null>(null);

    // State for Custom Confirm Modal
    // ... rest of state
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
    const [showEffects, setShowEffects] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [panelPosition, setPanelPosition] = useState({ x: 20, y: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const isVideo = block.type === 'video';
    const style = block.settings.style || 'clean';
    const content = block.content;
    const thumbUrl = block.settings.thumbUrl;
    const videoSource = block.videoSource; // 'cloudinary' | 'youtube'

    // Video Settings
    const isMuted = block.settings.muted ?? false;
    const isLoop = block.settings.loop ?? false;
    const isAutoplay = block.settings.autoplay ?? false;

    // Safe defaults for effects to prevent undefined CSS values
    const defaultEffects = {
        brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, opacity: 100
    };
    const effects = { ...defaultEffects, ...(block.settings.effects || {}) };

    const isYouTube = typeof content === 'string' && (content.includes('youtube.com') || content.includes('youtu.be'));
    const isLocalBlob = typeof content === 'string' && (content.startsWith('blob:') || content.startsWith('data:') || content.startsWith('local_'));
    const isCloudinary = typeof content === 'string' && content.includes('cloudinary.com');

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

    const videoId = isYouTube ? content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11,})/)?.[1] : null;

    const getEmbedUrl = () => {
        if (!videoId) { return null; }
        let url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        if (isMuted) { url += '&mute=1'; }
        if (isAutoplay) { url += '&autoplay=1'; }
        if (isLoop) { url += `&loop=1&playlist=${videoId}`; }
        return url;
    };
    const embedUrl = getEmbedUrl();

    const handleSourceSelect = (source: 'cloudinary' | 'youtube') => {
        if (onUpdate) {
            onUpdate(block.content, { ...block.settings }, { videoSource: source });
        }
    };

    const handleMediaSelect = async (file: File | null, previewUrl: string, type: 'image' | 'video') => {
        if (!onUpdate) { return; }
        setUploadError(null);

        if (file) {
            // LOGIC FOR VIDEO UPLOAD LIMITS
            if (type === 'video') {
                const sizeMB = file.size / (1024 * 1024);

                // 1. Internal / Cloudinary Flow
                if (videoSource === 'cloudinary') {
                    if (sizeMB > 100) {
                        setUploadError(`O arquivo excede o limite de 100MB para hospedagem interna (${sizeMB.toFixed(1)}MB). Use o YouTube.`);
                        return;
                    }
                    try {
                        const localId = await storeLocalFile(file);
                        onUpdate(localId);
                        const event = new CustomEvent('lfnm:media-selected', { detail: { blockId: block.id, file, type, source: 'cloudinary' } });
                        window.dispatchEvent(event);
                    } catch (e) {
                        console.error("Erro upload interno:", e);
                    }

                    // 2. YouTube Flow
                } else if (videoSource === 'youtube') {
                    if (sizeMB > 1024) {
                        setUploadError(`O arquivo excede o limite de 1GB para upload no YouTube.`);
                        return;
                    }
                    try {
                        // Store locally for backup but open Wizard immediately
                        setPendingYouTubeFile(file);
                        setShowYouTubeWizard(true);
                    } catch (e) {
                        console.error("Erro prep youtube:", e);
                    }
                }
            } else {
                // Image Handling
                try {
                    const localId = await storeLocalFile(file);
                    onUpdate(localId);
                    const event = new CustomEvent('lfnm:media-selected', { detail: { blockId: block.id, file, type } });
                    window.dispatchEvent(event);
                } catch (e) {
                    console.error("Erro imagem:", e);
                }
            }
        }
    };

    const handleYouTubeComplete = (youtubeUrl: string, metadata: YouTubeVideoMetadata, videoId: string) => {
        if (onUpdate) {
            onUpdate(youtubeUrl, {
                ...block.settings,
                uploadStatus: 'ready'
            }, {
                youtubeMeta: metadata,
                videoSource: 'youtube'
            });
        }
        setShowYouTubeWizard(false);
        setPendingYouTubeFile(null);
    };


    const handleSettingChange = (key: string, value: unknown) => {
        if (onUpdate) { onUpdate(block.content, { ...block.settings, [key]: value }); }
    };

    const handleEffectChange = (key: string, value: number) => {
        const newEffects = { ...effects, [key]: value };
        handleSettingChange('effects', newEffects);
    };

    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - panelPosition.x,
            y: e.clientY - panelPosition.y
        });
    };

    const handleDragMove = (e: MouseEvent) => {
        if (isDragging) {
            setPanelPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            return () => {
                window.removeEventListener('mousemove', handleDragMove);
                window.removeEventListener('mouseup', handleDragEnd);
            };
        }
    }, [isDragging, dragStart]);

    const getFilterString = () => {
        return `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) blur(${effects.blur}px) sepia(${effects.sepia}%) opacity(${effects.opacity}%)`;
    };

    const getContainerStyles = () => {
        if (!isVideo) { return {}; }
        switch (style) {
            case 'cinema': return { backgroundColor: '#000', padding: '40px 0', width: '100%' };
            case 'shorts': return { width: '100%', maxWidth: '300px', margin: '0 auto', aspectRatio: '9/16' };
            case 'news_card': return { backgroundColor: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
            default: return {};
        }
    };

    const closeConfirm = () => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    };


    const resetSource = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Open Custom Modal instead of window.confirm
        setConfirmConfig({
            isOpen: true,
            title: 'Trocar Origem?',
            message: 'Trocar a origem removerá o vídeo atual. Você tem certeza que deseja continuar?',
            type: 'danger',
            onConfirm: () => {
                setUploadError(null);
                setLocalVideoUrl(null);
                if (onUpdate) {
                    onUpdate('', { ...block.settings }, { videoSource: undefined, youtubeMeta: undefined });
                }
                closeConfirm();
            }
        });
    };

    // ... (rest of component) ...

    // RENDER: STEP 1 - SOURCE PICKER
    if (isVideo && !videoSource && !content) {
        return (
            <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className={`p-4 ${isSelected ? 'z-50' : 'z-0'}`}>
                <VideoSourcePicker onSelect={handleSourceSelect} />
            </div>
        );
    }

    return (
        <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className={`p-2 sm:p-4 transition-all duration-300 ${isSelected ? 'z-50' : 'z-0'}`}>
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={closeConfirm}
                type={confirmConfig.type}
                confirmText="Continuar"
                cancelText="Cancelar"
            />
            {showYouTubeWizard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[6000] overflow-y-auto p-4 md:p-10 flex justify-center animate-fadeIn">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full my-auto overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-red-600 p-4 md:p-8 text-white flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl shrink-0">
                                    <i className="fab fa-youtube text-2xl md:text-3xl"></i>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg md:text-2xl font-[1000] uppercase italic tracking-tighter truncate">Wizard YouTube</h3>
                                    <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-80">Upload Direto & SEO</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowYouTubeWizard(false);
                                    setPendingYouTubeFile(null);
                                }}
                                className="text-white/50 hover:text-white transition-colors relative z-10"
                            >
                                <i className="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-10">
                            <YouTubeVideoUploader
                                initialFile={pendingYouTubeFile}
                                onUploadComplete={handleYouTubeComplete}
                                onUploadError={(error) => {
                                    setUploadError(error);
                                    setShowYouTubeWizard(false);
                                }}
                                isShorts={style === 'shorts'}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isVideo && style === 'native' && block.settings.videoTitle && (
                <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 mb-2">{block.settings.videoTitle}</h4>
            )}

            <div
                className={`relative overflow-hidden transition-all ${style === 'polaroid' ? 'p-4 bg-white border border-zinc-200 shadow-md' : 'rounded-2xl md:rounded-3xl'}`}
                style={{ ...getContainerStyles() }}
            >
                {isVideo ? (
                    <div className={`aspect-video bg-black flex flex-col items-center justify-center overflow-hidden ${style === 'shorts' ? 'h-full aspect-[9/16]' : 'shadow-xl'} group relative`}>

                        {/* Render Video/Iframe with Effects */}
                        <div style={{ filter: getFilterString(), width: '100%', height: '100%' }}>
                            {/* PENDING STATE HANDLING */}
                            {(block.settings?.uploadStatus === 'uploading' || (typeof content === 'string' && content.includes('pending_'))) ? (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-center p-6">
                                    <div className="w-12 h-12 border-4 border-white/20 border-t-red-600 rounded-full animate-spin mb-4"></div>
                                    <span className="text-white font-black uppercase text-xs tracking-widest mb-1">Processando Vídeo</span>
                                    <span className="text-zinc-500 text-[10px]">Isso pode levar alguns minutos...</span>
                                </div>
                            ) : (embedUrl || localVideoUrl || (content && !content.includes('pending_'))) ? (
                                <VideoPlayer
                                    thumbnailUrl={thumbUrl || (isYouTube ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P")}
                                    videoUrl={embedUrl || localVideoUrl || (content as string)}
                                    title={block.settings.videoTitle || (block.settings.caption as string) || "Vídeo em Destaque"}
                                    description={block.settings.videoTitle ? (block.settings.caption as string) : undefined}
                                    aspectRatio={style === 'shorts' ? '9/16' as any : '16/9'}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="w-full h-full z-0 p-4">
                                    <UniversalMediaUploader
                                        user={user}
                                        mediaType="video"
                                        onUploadComplete={(urls: string[]) => {
                                            if (urls.length > 0) {
                                                onUpdate(urls[0]);
                                            }
                                        }}
                                        variant="mini"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {uploadError && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-center p-6 animate-in fade-in zoom-in">
                                <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-3"></i>
                                <p className="text-white font-bold text-sm mb-4">{uploadError}</p>
                                <button onClick={() => setUploadError(null)} className="px-4 py-2 bg-white text-black rounded-full text-xs font-bold uppercase hover:bg-zinc-200">Tentar Novamente</button>
                            </div>
                        )}

                        {/* Controls Overlay */}
                        {isSelected && !uploadError && (
                            <>
                                <div className="absolute top-4 left-4 z-40 flex flex-col gap-2">
                                    <button onClick={resetSource} className="bg-white/90 text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-black/10 hover:bg-red-600 hover:text-white transition-colors">
                                        <i className="fas fa-undo"></i> Trocar Origem
                                    </button>
                                    {videoSource === 'youtube' && block.youtubeMeta && (
                                        <button onClick={(e) => { e.stopPropagation(); setShowYouTubeWizard(true); }} className="bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-red-700 hover:bg-red-700 transition-colors">
                                            <i className="fab fa-youtube"></i> Editar Info YouTube
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); setShowEffects(!showEffects); }} className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/10 hover:bg-blue-600 transition-colors">
                                        <i className="fas fa-sliders-h"></i> Ajustes
                                    </button>
                                </div>

                                {showEffects && (
                                    <div
                                        className="fixed bg-black/95 p-4 rounded-xl border-2 border-zinc-700 w-72 backdrop-blur-md shadow-2xl"
                                        style={{
                                            left: `${panelPosition.x}px`,
                                            top: `${panelPosition.y}px`,
                                            zIndex: 9999,
                                            cursor: isDragging ? 'grabbing' : 'default'
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {/* Draggable Header */}
                                        <div
                                            className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-700 cursor-grab active:cursor-grabbing"
                                            onMouseDown={handleDragStart}
                                        >
                                            <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                                                <i className="fas fa-grip-vertical text-zinc-500"></i>
                                                Configuração do Vídeo
                                            </h4>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowEffects(false); }}
                                                className="text-zinc-400 hover:text-white transition-colors"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <button onClick={() => handleSettingChange('muted', !isMuted)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${isMuted ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'}`}></i> Mudo
                                            </button>
                                            <button onClick={() => handleSettingChange('loop', !isLoop)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${isLoop ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <i className="fas fa-undo"></i> Loop
                                            </button>
                                            <button onClick={() => handleSettingChange('autoplay', !isAutoplay)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${isAutoplay ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <i className="fas fa-play"></i> Auto
                                            </button>
                                        </div>

                                        <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest border-t border-zinc-800 pt-3">Efeitos Visuais</h4>
                                        <div className="space-y-3">
                                            <EffectControl label="Brilho" icon="sun" value={effects.brightness} min={0} max={200} onChange={v => handleEffectChange('brightness', v)} />
                                            <EffectControl label="Contraste" icon="adjust" value={effects.contrast} min={0} max={200} onChange={v => handleEffectChange('contrast', v)} />
                                            <EffectControl label="Saturação" icon="palette" value={effects.saturation} min={0} max={200} onChange={v => handleEffectChange('saturation', v)} />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    // Default rendering for generic media (images/unknown)
                    <div className="relative group">
                        {block.content ? (
                            <img src={block.content} className="w-full h-auto object-cover rounded-2xl shadow-sm transition-all" alt="Media" style={{ filter: getFilterString() }} />
                        ) : <MediaUploader onMediaSelect={handleMediaSelect} />}
                    </div>
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-md z-50">
                        <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-10 h-10 animate-coin object-contain mb-3" alt="Loading" />
                        <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Enviando Mídia...</span>
                    </div>
                )}
            </div>
            {block.settings.caption && <p className="text-center font-serif italic mt-4 text-zinc-500 text-sm border-l-2 border-red-500 pl-4">{block.settings.caption}</p>}
        </div>
    );
};

const EffectControl = ({ label, icon, value, min, max, onChange }: { label: string, icon: string, value: number, min: number, max: number, onChange: (v: number) => void }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] uppercase font-bold text-zinc-500">
            <span><i className={`fas fa-${icon}`}></i> {label}</span>
            <span>{value}%</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    </div>
);

export default MediaBlock;
