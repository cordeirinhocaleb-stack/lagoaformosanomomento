
import React, { useState } from 'react';
import { User, SocialPost, SystemSettings, SocialDistribution } from '../../types';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { dispatchGenericSocialPost } from '../../services/integrationService';
import { saveSocialPost } from '../../services/supabaseService';
import { VideoMetadata, queueYouTubeUpload } from '../../services/youtubeService';
import MediaUploader from '../media/MediaUploader';
import SocialDistributionOverlay from './SocialDistributionOverlay';
import Logo from '../common/Logo';
import VideoSourcePicker from './editor/media/VideoSourcePicker';
import YouTubeConfigModal from './YouTubeConfigModal';

interface SocialHubTabProps {
  user: User;
  systemSettings: SystemSettings;
}

const PLATFORMS: { id: SocialDistribution['platform'], icon: string, label: string, color: string }[] = [
    { id: 'instagram_feed', icon: 'fa-instagram', label: 'Insta Feed', color: 'bg-gradient-to-tr from-yellow-500 via-red-600 to-purple-600' },
    { id: 'facebook', icon: 'fa-facebook-f', label: 'Facebook', color: 'bg-blue-600' },
    { id: 'whatsapp', icon: 'fa-whatsapp', label: 'WhatsApp', color: 'bg-green-500' },
    { id: 'tiktok', icon: 'fa-tiktok', label: 'TikTok', color: 'bg-black' },
    { id: 'youtube', icon: 'fa-youtube', label: 'YouTube Shorts', color: 'bg-red-600' },
    { id: 'linkedin', icon: 'fa-linkedin-in', label: 'LinkedIn', color: 'bg-blue-800' }
];

const SocialHubTab: React.FC<SocialHubTabProps> = ({ user, systemSettings }) => {
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

    const togglePlatform = (id: SocialDistribution['platform']) => {
        setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleMediaSelect = (file: File | null, preview: string, type: 'image' | 'video') => {
        if (file) {
            setPendingMedia({ file, preview });
            setMediaType(type);
            
            if (type === 'video') {
                setShowSourcePicker(true);
            }
        } else {
            setPendingMedia(null);
        }
    };

    const handleVideoSourceSelect = (source: 'cloudinary' | 'youtube') => {
        setVideoSource(source);
        setShowSourcePicker(false);
        if (source === 'youtube') {
            setShowYouTubeWizard(true);
        }
    };

    const handleYouTubeConfig = (meta: VideoMetadata) => {
        setYoutubeMeta(meta);
        setShowYouTubeWizard(false);
    };

    const handleBroadcast = async () => {
        if (!content && !pendingMedia) return alert("Adicione texto ou mídia para postar.");
        if (selectedPlatforms.length === 0) return alert("Selecione ao menos uma rede social.");

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
                    // FLUXO YOUTUBE
                    // 1. Enfileira Upload
                    const { jobId } = await queueYouTubeUpload(pendingMedia.file, youtubeMeta, `social_${Date.now()}`);
                    // 2. Define URL (Placeholder ou Final se sync)
                    // Como é async, usamos o blob local para visualização imediata se necessário, 
                    // mas para o webhook precisamos de URL. Se não tiver, o webhook deve tratar ou falhar.
                    // Em um cenário real, esperaríamos o upload. Aqui, simulamos.
                    finalMediaUrl = `https://youtu.be/pending_upload_${jobId}`;
                } else {
                    // FLUXO CLOUDINARY
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

    return (
        <div className="animate-fadeIn w-full max-w-6xl mx-auto pb-20">
            <SocialDistributionOverlay 
                status={publishStatus === 'idle' ? 'idle' : publishStatus} 
                distributions={currentDistributions} 
                onClose={() => setPublishStatus('idle')} 
            />

            {/* MODALS */}
            {showSourcePicker && (
                <div className="fixed inset-0 z-[6000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full overflow-hidden relative">
                        <button onClick={() => setShowSourcePicker(false)} className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-red-600 hover:text-white transition-colors"><i className="fas fa-times"></i></button>
                        <div className="p-6 text-center border-b border-gray-100">
                            <h3 className="text-lg font-black uppercase text-gray-900">Origem do Vídeo</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Onde este vídeo será hospedado?</p>
                        </div>
                        <VideoSourcePicker onSelect={handleVideoSourceSelect} />
                    </div>
                </div>
            )}

            {showYouTubeWizard && (
                <YouTubeConfigModal 
                    videoFile={pendingMedia?.file || null}
                    onConfirm={handleYouTubeConfig}
                    onCancel={() => setShowYouTubeWizard(false)}
                    currentDescription={content}
                />
            )}

            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter text-gray-900 leading-none">
                        Hub <span className="text-red-600">Social</span> Omnichannel
                    </h1>
                    <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                        Postagem simultânea em todas as redes da Rede Welix Duarte
                    </p>
                </div>
                
                <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Webhook: {systemSettings.socialWebhookUrl ? 'Conectado' : 'Simulação'}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Editor Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 block">Mensagem da Postagem</label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            placeholder="O que está acontecendo agora em Lagoa Formosa?"
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-base font-medium text-gray-800 outline-none focus:border-red-500 transition-all resize-none"
                        />
                        
                        <div className="mt-8">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 block">Mídia de Fundo (Img / Vídeo)</label>
                            <div className="h-64">
                                <MediaUploader onMediaSelect={handleMediaSelect} />
                            </div>
                            {mediaType === 'video' && pendingMedia && (
                                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase bg-blue-50 p-2 rounded-lg">
                                    <i className={`fab ${videoSource === 'youtube' ? 'fa-youtube' : 'fa-cloud'}`}></i>
                                    Destino: {videoSource === 'youtube' ? 'YouTube Canal' : 'Hospedagem Interna'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 block">Destinos de Publicação</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {PLATFORMS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => togglePlatform(p.id)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${selectedPlatforms.includes(p.id) ? 'border-red-600 bg-red-50 shadow-md scale-105' : 'border-gray-100 text-gray-400 opacity-60'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${p.color}`}>
                                        <i className={`fab ${p.icon}`}></i>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-5">
                    <div className="sticky top-10 space-y-6">
                        <div className="bg-zinc-900 rounded-[3rem] p-1 shadow-2xl overflow-hidden aspect-[9/16] max-w-[320px] mx-auto border-[12px] border-zinc-800 relative">
                            {/* Fake App Header */}
                            <div className="h-10 bg-black/40 backdrop-blur-md absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6">
                                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-white/20"></div><div className="w-2 h-2 rounded-full bg-white/20"></div></div>
                                <span className="text-[8px] font-black text-white/40 uppercase">Preview Mobile</span>
                            </div>

                            {/* Post Content Preview */}
                            <div className="h-full w-full bg-black relative">
                                {pendingMedia ? (
                                    mediaType === 'image' ? (
                                        <img src={pendingMedia.preview} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                    ) : (
                                        <video src={pendingMedia.preview} autoPlay muted loop className="w-full h-full object-cover opacity-80" />
                                    )
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center p-12">
                                        <Logo className="opacity-20 scale-150" />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-6 flex flex-col justify-end">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full border-2 border-red-600 bg-white p-0.5"><Logo /></div>
                                        <div className="flex flex-col">
                                            <span className="text-white text-[10px] font-black uppercase tracking-tight">lagoaformosa</span>
                                            <span className="text-red-500 text-[8px] font-bold">Publicação Direta</span>
                                        </div>
                                    </div>
                                    <p className="text-white text-xs font-bold leading-relaxed line-clamp-4 mb-4">
                                        {content || 'Digite sua mensagem no editor para visualizar a prévia da postagem aqui...'}
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-red-600 w-1/3"></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleBroadcast}
                            disabled={publishStatus !== 'idle'}
                            className="w-full py-6 rounded-[2rem] bg-red-600 text-white font-[1000] uppercase italic text-lg tracking-tighter shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                            {publishStatus === 'idle' ? (
                                <>
                                    <i className="fas fa-tower-broadcast animate-pulse group-hover:scale-125 transition-transform"></i>
                                    DISPARAR PARA TUDO
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    PROCESSANDO...
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialHubTab;
