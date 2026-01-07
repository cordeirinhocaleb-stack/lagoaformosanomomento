
import React, { useState, useEffect } from 'react';
import { storeLocalFile, getLocalFile } from '../../../../services/storage/localStorageService';
import { ContentBlock } from '../../../../types';
import MediaUploader from '../../../media/MediaUploader';
import VideoSourcePicker from '../media/VideoSourcePicker';
import YouTubeConfigModal from '../../YouTubeConfigModal';
import { VideoMetadata } from '../../../../services/youtubeService';

interface MediaBlockProps {
    block: ContentBlock;
    isSelected: boolean;
    isUploading?: boolean;
    onSelect: () => void;
    onUpdate?: (content: any, settings?: any, extraProps?: Partial<ContentBlock>) => void;
}

const MediaBlock: React.FC<MediaBlockProps> = ({ block, isSelected, isUploading, onSelect, onUpdate }) => {
    const [showYouTubeWizard, setShowYouTubeWizard] = useState(false);
    const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
    const [showEffects, setShowEffects] = useState(false); // Controls effects panel
    const [uploadError, setUploadError] = useState<string | null>(null);

    const isVideo = block.type === 'video';
    const style = block.settings.style || 'clean';
    const content = block.content;
    const thumbUrl = block.settings.thumbUrl;
    const videoSource = block.videoSource; // 'cloudinary' | 'youtube'

    // Video Settings
    const isMuted = block.settings.muted ?? false;
    const isLoop = block.settings.loop ?? false;
    const isAutoplay = block.settings.autoplay ?? false;
    const effects = block.settings.effects || {
        brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, opacity: 100
    };

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

    const videoId = isYouTube ? content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] : null;

    const getEmbedUrl = () => {
        if (!videoId) {return null;}
        let url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
        if (isMuted) {url += '&mute=1';}
        if (isAutoplay) {url += '&autoplay=1';}
        if (isLoop) {url += `&loop=1&playlist=${videoId}`;}
        return url;
    };
    const embedUrl = getEmbedUrl();

    const handleSourceSelect = (source: 'cloudinary' | 'youtube') => {
        if (onUpdate) {
            onUpdate(block.content, { ...block.settings }, { videoSource: source });
        }
    };

    const handleMediaSelect = async (file: File | null, previewUrl: string, type: 'image' | 'video') => {
        if (!onUpdate) {return;}
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
                    // Trigger Cloudinary Upload (Simulated here by passing to parent handler or triggering specific service)
                    // For now we treat as local/generic upload which eventually goes to Cloud
                    try {
                        const localId = await storeLocalFile(file);
                        onUpdate(localId); // Placeholder: In real app, this would be the Cloudinary process start
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
                    // Proceed to Wizard
                    try {
                        const localId = await storeLocalFile(file); // Cache locally first for preview
                        onUpdate(localId);
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

    const handleYouTubeConfig = (metadata: VideoMetadata) => {
        // Trigger actual upload process with metadata
        const event = new CustomEvent('lfnm:youtube-upload-start', {
            detail: { blockId: block.id, metadata }
        });
        window.dispatchEvent(event);

        if (onUpdate) {onUpdate(block.content, { ...block.settings }, { youtubeMeta: metadata });}
        setShowYouTubeWizard(false);
    };

    const resetSource = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirm("Trocar a origem removerá o vídeo atual. Continuar?")) {
            setUploadError(null);
            setLocalVideoUrl(null);
            if (onUpdate) {
                // Clear content and videoSource to force source picker to show
                onUpdate('', { ...block.settings }, { videoSource: undefined, youtubeMeta: undefined });
            }
        }
    };

    const handleSettingChange = (key: string, value: any) => {
        if (onUpdate) {onUpdate(block.content, { ...block.settings, [key]: value });}
    };

    const handleEffectChange = (key: string, value: number) => {
        const newEffects = { ...effects, [key]: value };
        handleSettingChange('effects', newEffects);
    };

    const getFilterString = () => {
        return `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) blur(${effects.blur}px) sepia(${effects.sepia}%) opacity(${effects.opacity}%)`;
    };

    const getContainerStyles = () => {
        if (!isVideo) {return {};}
        switch (style) {
            case 'cinema': return { backgroundColor: '#000', padding: '40px 0', width: '100%' };
            case 'shorts': return { width: '300px', margin: '0 auto', aspectRatio: '9/16' };
            case 'news_card': return { backgroundColor: '#fff', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' };
            default: return {};
        }
    };

    // RENDER: STEP 1 - SOURCE PICKER
    if (isVideo && !videoSource && !content) {
        return (
            <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className={`p-4 ${isSelected ? 'z-50' : 'z-0'}`}>
                <VideoSourcePicker onSelect={handleSourceSelect} />
            </div>
        );
    }

    return (
        <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className={`p-4 transition-all duration-300 ${isSelected ? 'z-50' : 'z-0'}`}>
            {showYouTubeWizard && (
                <YouTubeConfigModal
                    videoFile={null}
                    onConfirm={handleYouTubeConfig}
                    onCancel={() => setShowYouTubeWizard(false)}
                />
            )}

            {isVideo && style === 'native' && block.settings.videoTitle && (
                <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 mb-2">{block.settings.videoTitle}</h4>
            )}

            <div
                className={`relative overflow-hidden transition-all ${style === 'polaroid' ? 'p-4 bg-white border border-zinc-200 shadow-md' : 'rounded-3xl'}`}
                style={{ ...getContainerStyles() }}
            >
                {isVideo ? (
                    <div className={`aspect-video bg-black flex flex-col items-center justify-center overflow-hidden ${style === 'shorts' ? 'h-full aspect-[9/16]' : 'shadow-xl'} group relative`}>

                        {/* Render Video/Iframe with Effects */}
                        <div style={{ filter: getFilterString(), width: '100%', height: '100%' }}>
                            {thumbUrl && !isYouTube && (
                                <img src={thumbUrl} className="absolute inset-0 w-full h-full object-cover z-10 opacity-60" alt="Capa" />
                            )}
                            {embedUrl ? (
                                <iframe src={embedUrl} className="w-full h-full pointer-events-none z-0" title="Preview YouTube" allow="autoplay" />
                            ) : (localVideoUrl || (content && !isYouTube)) ? ( // Check localVisualUrl OR content exists and is not youtube
                                <video
                                    src={localVideoUrl || content}
                                    className="w-full h-full object-contain z-0"
                                    controls={!isAutoplay}
                                    autoPlay={isAutoplay}
                                    muted={isMuted}
                                    loop={isLoop}
                                    playsInline
                                />
                            ) : (
                                <div className="w-full h-full z-0">
                                    <MediaUploader
                                        onMediaSelect={handleMediaSelect}
                                        // @ts-ignore
                                        acceptedTypes={['video/*']}
                                        label={videoSource === 'youtube' ? 'Upload para YouTube (max 1GB)' : 'Upload Interno (max 100MB)'}
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
                                    <button onClick={(e) => { e.stopPropagation(); setShowEffects(!showEffects); }} className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/10 hover:bg-blue-600 transition-colors">
                                        <i className="fas fa-sliders-h"></i> Ajustes
                                    </button>
                                </div>

                                {showEffects && (
                                    <div className="absolute top-14 left-4 z-50 bg-black/90 p-4 rounded-xl border border-zinc-700 w-64 backdrop-blur-md animate-in fade-in slide-in-from-left-4" onClick={e => e.stopPropagation()}>
                                        <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest">Configuração do Vídeo</h4>
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
