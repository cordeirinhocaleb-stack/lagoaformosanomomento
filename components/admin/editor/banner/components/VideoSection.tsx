import React, { useState } from 'react';
import CloudinaryVideoUploader from '../CloudinaryVideoUploader';
import YouTubeVideoUploader from '../YouTubeVideoUploader';
import SmartVideoPlayer from '../../../../player/SmartVideoPlayer';
import VideoTrimSelector from './VideoTrimSelector';
import { EffectsPanel } from './index';

interface VideoSectionProps {
    bannerVideoSource: 'internal' | 'youtube' | null;
    bannerVideoUrl: string;
    bannerSmartPlayback: boolean;
    videoStart?: number;
    videoEnd?: number;
    bannerEffects?: any;
    resolveMedia: (url: string) => string;
    handleVideoSourceSelect: (source: 'internal' | 'youtube') => void;
    setBannerVideoSource: (source: 'internal' | 'youtube' | null) => void;
    setBannerVideoUrl: (url: string) => void;
    setBannerYoutubeVideoId?: (id: string) => void;
    setBannerYoutubeStatus?: (status: 'uploading' | 'processing' | 'ready' | 'failed') => void;
    setBannerYoutubeMetadata?: (meta: any) => void;
    setBannerSmartPlayback: (enabled: boolean) => void;
    setVideoStart?: (start: number) => void;
    setVideoEnd?: (end: number) => void;
    setBannerEffects?: (effects: any) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
    bannerVideoSource,
    bannerVideoUrl,
    bannerSmartPlayback,
    videoStart,
    videoEnd,
    bannerEffects,
    resolveMedia,
    handleVideoSourceSelect,
    setBannerVideoSource,
    setBannerVideoUrl,
    setBannerYoutubeVideoId,
    setBannerYoutubeStatus,
    setBannerYoutubeMetadata,
    setBannerSmartPlayback,
    setVideoStart,
    setVideoEnd,
    setBannerEffects
}) => {
    const [showYouTubeModal, setShowYouTubeModal] = useState(false);
    const [showEffectsPanel, setShowEffectsPanel] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);

    return (
        <div className="space-y-6">
            {!bannerVideoSource ? (
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                        <i className="fas fa-cloud-upload-alt mr-2"></i>
                        Escolha a Fonte do Vídeo
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleVideoSourceSelect('internal')}
                            className="p-6 border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 rounded-xl hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <i className="fas fa-server text-2xl text-gray-400 group-hover:text-white"></i>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">Acervo Interno</h3>
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Cloudinary PRO</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
                                    <span className="bg-gray-200 px-1.5 py-0.5 rounded">HD</span>
                                    <span>Máx: 100MB</span>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                handleVideoSourceSelect('youtube');
                                setShowYouTubeModal(true);
                            }}
                            className="p-6 border-2 border-gray-100 bg-gradient-to-br from-white to-gray-50 rounded-xl hover:border-red-600 hover:shadow-lg hover:shadow-red-600/10 transition-all group relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <i className="fab fa-youtube text-2xl text-gray-400 group-hover:text-white"></i>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">Cine Broadcast</h3>
                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">YouTube 4K</p>
                                <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
                                    <span className="bg-gray-200 px-1.5 py-0.5 rounded">4K</span>
                                    <span>Máx: 1GB</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-gray-700">
                            <i className={`${bannerVideoSource === 'youtube' ? 'fab fa-youtube' : 'fas fa-server'} mr-2`}></i>
                            {bannerVideoSource === 'youtube' ? 'YouTube Upload' : 'Cloud Interno (Cloudinary)'}
                        </label>
                        <button
                            onClick={() => setBannerVideoSource(null)}
                            className="text-xs text-blue-600 hover:underline"
                        >
                            <i className="fas fa-exchange-alt mr-1"></i>
                            Trocar Fonte
                        </button>
                    </div>
                    {bannerVideoUrl && (
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                                    Preview do Teaser
                                </label>
                                <button
                                    onClick={() => {
                                        setBannerVideoUrl('');
                                        if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(''); }
                                        if (setBannerYoutubeStatus) { setBannerYoutubeStatus('uploading'); }
                                    }}
                                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1"
                                >
                                    <i className="fas fa-trash"></i> Remover Vídeo
                                </button>
                            </div>
                            <div className="aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl relative group border-4 border-white">
                                {bannerVideoSource === 'youtube' && !bannerVideoUrl.startsWith('local_') ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${bannerVideoUrl.split('v=')[1] || bannerVideoUrl.split('/').pop()}?autoplay=1&mute=1&controls=0&loop=1&playlist=${bannerVideoUrl.split('v=')[1] || bannerVideoUrl.split('/').pop()}`}
                                        className="w-full h-full pointer-events-none"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                ) : (
                                    <SmartVideoPlayer
                                        src={resolveMedia(bannerVideoUrl)}
                                        smartPlayback={bannerSmartPlayback}
                                        className="w-full h-full object-cover"
                                        muted={true}
                                        loop={true}
                                        videoStart={videoStart}
                                        videoEnd={videoEnd}
                                        onLoadedMetadata={(e) => {
                                            const video = e.target as HTMLVideoElement;
                                            setVideoDuration(video.duration);
                                            console.log('📹 Duração do vídeo:', video.duration);
                                        }}
                                        style={{
                                            filter: bannerEffects && (Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects) ? `
                                                brightness(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).brightness || 1})
                                                contrast(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).contrast || 1})
                                                saturate(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).saturation || 1})
                                                blur(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).blur || 0}px)
                                                sepia(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).sepia || 0})
                                                opacity(${(Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).opacity !== undefined ? (Array.isArray(bannerEffects) ? bannerEffects[0] : bannerEffects).opacity : 1})
                                            `.replace(/\s+/g, ' ').trim() : undefined
                                        }}
                                    />
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20"></div>
                                        <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Cinema Preview Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Video Trim Selector */}
                            {setVideoStart && setVideoEnd && videoDuration > 0 && (
                                <VideoTrimSelector
                                    videoUrl={resolveMedia(bannerVideoUrl)}
                                    duration={videoDuration}
                                    initialStart={videoStart}
                                    initialEnd={videoEnd || videoDuration}
                                    onTrimChange={(start, end) => {
                                        setVideoStart(start);
                                        setVideoEnd(end);
                                    }}
                                    maxDuration={60}
                                />
                            )}

                            {/* Video Effects Panel */}
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-black hover:to-zinc-900 text-white rounded-xl transition-all shadow-lg border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <i className="fas fa-magic text-lg text-amber-500"></i>
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-wider text-amber-500">
                                            Ajustar Renderização
                                        </span>
                                    </div>
                                    <i className={`fas fa-chevron-${showEffectsPanel ? 'up' : 'down'} transition-transform`}></i>
                                </button>

                                {showEffectsPanel && setBannerEffects && (
                                    <EffectsPanel
                                        isOpen={true}
                                        bannerEffects={Array.isArray(bannerEffects) ? bannerEffects[0] : (bannerEffects || { brightness: 1, contrast: 1, saturation: 1, blur: 0, sepia: 0, opacity: 1 })}
                                        onEffectsChange={(newEffects) => {
                                            setBannerEffects([newEffects]);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Video Upload Components */}
                    {!bannerVideoUrl && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            {bannerVideoSource === 'internal' && (
                                <CloudinaryVideoUploader
                                    onUploadComplete={(url) => {
                                        setBannerVideoUrl(url);
                                        console.log('✅ Vídeo enviado para Cloudinary:', url);
                                    }}
                                    onUploadError={(error) => {
                                        console.error('❌ Erro no upload:', error);
                                    }}
                                />
                            )}

                            {bannerVideoSource === 'youtube' && (
                                <div className="text-center p-12 bg-white rounded-[2rem] border-2 border-dashed border-zinc-200 hover:border-red-500/50 transition-all group shadow-xl shadow-zinc-200/50">
                                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-600/30 group-hover:scale-110 transition-transform">
                                        <i className="fab fa-youtube text-4xl text-white"></i>
                                    </div>
                                    <h3 className="text-zinc-900 font-black text-xl mb-2 tracking-tight">Cine Broadcast Station</h3>
                                    <p className="text-zinc-500 text-sm mb-8 font-medium max-w-xs mx-auto">
                                        Transmita conteúdo cinematográfico 4K diretamente para sua audiência global com metadados otimizados.
                                    </p>
                                    <button
                                        onClick={() => setShowYouTubeModal(true)}
                                        className="bg-black hover:bg-zinc-900 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-2xl active:scale-95 border border-zinc-800"
                                    >
                                        Iniciar Transmissão
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* YouTube Upload Modal */}
            {showYouTubeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xl flex items-center gap-2">
                                    <i className="fab fa-youtube"></i>
                                    Upload para YouTube
                                </h3>
                                <p className="text-white/80 text-sm mt-1">
                                    Preencha os dados do vídeo
                                </p>
                            </div>
                            <button
                                onClick={() => setShowYouTubeModal(false)}
                                className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <YouTubeVideoUploader
                                onUploadComplete={(youtubeUrl, metadata, videoId) => {
                                    setBannerVideoUrl(youtubeUrl);
                                    if (setBannerYoutubeVideoId) { setBannerYoutubeVideoId(videoId); }
                                    if (setBannerYoutubeStatus) { setBannerYoutubeStatus('ready'); }
                                    if (setBannerYoutubeMetadata) { setBannerYoutubeMetadata(metadata); }

                                    console.log('✅ Vídeo enviado com sucesso para YouTube:', { youtubeUrl, videoId, metadata });
                                    setShowYouTubeModal(false);
                                }}
                                onUploadError={(error) => {
                                    console.error('❌ Erro no upload YouTube:', error);
                                    if (setBannerYoutubeStatus) { setBannerYoutubeStatus('failed'); }
                                }}
                                onSmartPlaybackRequired={(duration) => {
                                    console.log('🎬 Smart Playback será ativado (duração:', duration, 's)');
                                    setBannerSmartPlayback(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
