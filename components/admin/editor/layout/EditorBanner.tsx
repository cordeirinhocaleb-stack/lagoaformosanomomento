
import React, { useRef } from 'react';
import { User, BannerLayout, BannerTransition } from '../../../../types';
import UniversalMediaUploader from '../../../media/UniversalMediaUploader';

interface EditorBannerProps {
    user: User;
    bannerType: 'image' | 'video';
    setBannerType: (type: 'image' | 'video') => void;
    bannerLayout: BannerLayout;
    setBannerLayout: (layout: BannerLayout) => void;
    bannerTransition: BannerTransition;
    setBannerTransition: (transition: BannerTransition) => void;
    bannerDuration: number;
    setBannerDuration: (duration: number) => void;
    bannerImages: string[];
    setBannerImages: (images: string[]) => void;
    mainImageUrl: string;
    setMainImageUrl: (url: string) => void;
    bannerVideoUrl: string;
    setBannerVideoUrl: (url: string) => void;
    bannerVideoConfig: any; // Using any for simplicity with new type
    setBannerVideoConfig: (config: any) => void;
    requiredSlots: number;
    setToast: (toast: { message: string, type: 'success' | 'error' | 'warning' | 'info' }) => void;
}

const TEMPLATES = [
    { id: 'single', label: 'Capa Única', icon: 'fa-square' },
    { id: 'split', label: 'Dividido', icon: 'fa-columns' },
    { id: 'mosaic', label: 'Mosaico', icon: 'fa-table-columns' },
    { id: 'grid', label: 'Grade 4', icon: 'fa-border-all' },
    { id: 'slider', label: 'Slider 5', icon: 'fa-images' }
];

const TRANSITIONS = [
    { id: 'fade', label: 'Suave', icon: 'fa-cloud' },
    { id: 'slide', label: 'Slide', icon: 'fa-film' },
    { id: 'zoom', label: 'Zoom', icon: 'fa-magnifying-glass-plus' },
    { id: 'none', label: 'Fixo', icon: 'fa-ban' }
];

const EffectControl = ({ label, icon, value, min, max, onChange }: { label: string, icon: string, value: number, min: number, max: number, onChange: (v: number) => void }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[8px] uppercase font-bold text-zinc-500">
            <span><i className={`fas fa-${icon}`}></i> {label}</span>
            <span>{value}%</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
    </div>
);

const EditorBanner: React.FC<EditorBannerProps> = ({
    user,
    bannerType, setBannerType,
    bannerLayout, setBannerLayout,
    bannerTransition, setBannerTransition,
    bannerDuration, setBannerDuration,
    bannerImages, setBannerImages,
    mainImageUrl, setMainImageUrl,
    bannerVideoUrl, setBannerVideoUrl,
    bannerVideoConfig, setBannerVideoConfig,
    requiredSlots,
    setToast
}) => {
    const [showEffects, setShowEffects] = React.useState(false);

    const removeBannerImage = (index: number) => {
        if (bannerLayout === 'single' && bannerImages.length <= 1) {
            setToast({ message: "Mínimo 1 imagem necessária.", type: 'warning' });
            return;
        }
        const newImages = [...bannerImages];
        if (requiredSlots > 1) {
            newImages[index] = 'https://placehold.co/800x600?text=Vazio';
        } else {
            newImages.splice(index, 1);
        }
        setBannerImages(newImages);
        if (index === 0 && newImages[0]) {setMainImageUrl(newImages[0]);}
    };

    const handleConfigChange = (key: string, value: any) => {
        setBannerVideoConfig({ ...bannerVideoConfig, [key]: value });
    };

    const handleEffectChange = (key: string, value: number) => {
        setBannerVideoConfig({
            ...bannerVideoConfig,
            effects: { ...bannerVideoConfig.effects, [key]: value }
        });
    };

    const getFilterString = () => {
        const e = bannerVideoConfig.effects;
        return `brightness(${e.brightness}%) contrast(${e.contrast}%) saturate(${e.saturation}%) blur(${e.blur}px) sepia(${e.sepia}%) opacity(${e.opacity}%)`;
    };

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
            if (videoId) {
                let embed = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
                if (bannerVideoConfig.muted) {embed += '&mute=1';}
                if (bannerVideoConfig.autoplay) {embed += '&autoplay=1';}
                if (bannerVideoConfig.loop) {embed += `&loop=1&playlist=${videoId}`;}
                return embed;
            }
        }
        return url;
    };

    const embedUrl = bannerVideoUrl ? getEmbedUrl(bannerVideoUrl) : '';

    return (
        <section className="w-full relative bg-zinc-900 group">
            {/* Visualização Dinâmica do Layout */}
            <div className="h-64 md:h-[320px] overflow-hidden relative">
                {bannerType === 'image' ? (
                    <div className="w-full h-full relative">
                        {bannerLayout === 'single' && (
                            <div className="absolute inset-0 w-full h-full z-0">
                                <img src={bannerImages[0] || mainImageUrl} className="w-full h-full object-cover" alt="Capa" />
                                <div className="absolute inset-0 bg-black/20" /> {/* Overlay for text contrast if needed */}
                            </div>
                        )}
                        {bannerLayout === 'split' && (
                            <div className="w-full h-full grid grid-cols-2 relative z-0">
                                {[0, 1].map(i => <div key={i} className="border-r border-white/10 overflow-hidden"><img src={bannerImages[i] || mainImageUrl} className="w-full h-full object-cover" /></div>)}
                            </div>
                        )}
                        {bannerLayout === 'mosaic' && (
                            <div className="w-full h-full grid grid-cols-3 grid-rows-2 relative z-0">
                                <div className="col-span-2 row-span-2 border-r border-white/10 overflow-hidden"><img src={bannerImages[0] || mainImageUrl} className="w-full h-full object-cover" /></div>
                                <div className="border-b border-white/10 overflow-hidden"><img src={bannerImages[1] || mainImageUrl} className="w-full h-full object-cover" /></div>
                                <div className="overflow-hidden"><img src={bannerImages[2] || mainImageUrl} className="w-full h-full object-cover" /></div>
                            </div>
                        )}
                        {bannerLayout === 'grid' && (
                            <div className="w-full h-full grid grid-cols-2 grid-rows-2 relative z-0">
                                {[0, 1, 2, 3].map(i => <div key={i} className="border-r border-b border-white/10 overflow-hidden"><img src={bannerImages[i] || mainImageUrl} className="w-full h-full object-cover" /></div>)}
                            </div>
                        )}
                        {String(bannerLayout) === 'slider' && (
                            <div className="w-full h-full grid grid-cols-5 relative z-0">
                                {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-r border-white/10 overflow-hidden bg-black"><img src={bannerImages[i] || mainImageUrl} className="w-full h-full object-cover opacity-80" /></div>)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 p-10">
                        {bannerVideoUrl ? (
                            <div className="relative w-full h-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/video z-20">
                                <div style={{ filter: getFilterString(), width: '100%', height: '100%' }}>
                                    {(embedUrl.includes('youtube')) ? (
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-full pointer-events-none"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            src={bannerVideoUrl}
                                            className="w-full h-full object-cover"
                                            controls={!bannerVideoConfig.autoplay}
                                            autoPlay={bannerVideoConfig.autoplay}
                                            muted={bannerVideoConfig.muted}
                                            loop={bannerVideoConfig.loop}
                                            playsInline
                                        />
                                    )}
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); setBannerVideoUrl(''); }}
                                    className="absolute top-4 right-4 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
                                    title="Remover Vídeo"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>

                                <div className="absolute bottom-4 left-4 z-50 flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setShowEffects(!showEffects); }} className="bg-zinc-800 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/10 hover:bg-blue-600 transition-colors">
                                        <i className="fas fa-sliders-h"></i> Ajustes & Efeitos
                                    </button>
                                </div>

                                {showEffects && (
                                    <div className="absolute bottom-14 left-4 z-50 bg-black/90 p-4 rounded-xl border border-zinc-700 w-64 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
                                        <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest">Configuração do Vídeo</h4>
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <button onClick={() => handleConfigChange('muted', !bannerVideoConfig.muted)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${bannerVideoConfig.muted ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <i className={`fas fa-volume-${bannerVideoConfig.muted ? 'mute' : 'up'}`}></i> Mudo
                                            </button>
                                            <button onClick={() => handleConfigChange('loop', !bannerVideoConfig.loop)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${bannerVideoConfig.loop ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <i className="fas fa-undo"></i> Loop
                                            </button>
                                            <button onClick={() => handleConfigChange('autoplay', !bannerVideoConfig.autoplay)} className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[9px] font-bold uppercase ${bannerVideoConfig.autoplay ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                                <i className="fas fa-play"></i> Auto
                                            </button>
                                        </div>

                                        <h4 className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest border-t border-zinc-800 pt-3">Efeitos Visuais</h4>
                                        <div className="space-y-3">
                                            <EffectControl label="Brilho" icon="sun" value={bannerVideoConfig.effects.brightness} min={0} max={200} onChange={v => handleEffectChange('brightness', v)} />
                                            <EffectControl label="Contraste" icon="adjust" value={bannerVideoConfig.effects.contrast} min={0} max={200} onChange={v => handleEffectChange('contrast', v)} />
                                            <EffectControl label="Saturação" icon="palette" value={bannerVideoConfig.effects.saturation} min={0} max={200} onChange={v => handleEffectChange('saturation', v)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full max-w-md aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden relative z-20">
                                <UniversalMediaUploader
                                    user={user}
                                    mediaType="video"
                                    onUploadComplete={(urls) => setBannerVideoUrl(urls[0])}
                                    onError={(msg) => setToast({ message: msg, type: 'error' })}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BARRA DE FERRAMENTAS FLUTUANTE (TOP) */}
            <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-start pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                    {/* Toggle Media Type */}
                    <div className="bg-black/80 backdrop-blur-md rounded-full p-1 flex gap-1 border border-white/10 w-fit shadow-lg">
                        <button onClick={() => setBannerType('image')} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${bannerType === 'image' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`} title="Imagem"><i className="fas fa-image text-xs"></i></button>
                        <button onClick={() => setBannerType('video')} className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${bannerType === 'video' ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'}`} title="Vídeo"><i className="fab fa-youtube text-xs"></i></button>
                    </div>

                    {/* Template Selector (Only for Image) */}
                    {bannerType === 'image' && (
                        <div className="bg-black/80 backdrop-blur-md rounded-xl p-1 flex gap-1 border border-white/10 w-fit animate-fadeIn shadow-lg">
                            {TEMPLATES.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setBannerLayout(t.id as BannerLayout)}
                                    className={`p-2 rounded-lg transition-all ${bannerLayout === t.id ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}
                                    title={t.label}
                                >
                                    <i className={`fas ${t.icon}`}></i>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Configs (Transition / Time) */}
                {bannerType === 'image' && (
                    <div className="flex flex-col gap-2 items-end pointer-events-auto">
                        <div className="bg-black/80 backdrop-blur-md rounded-xl p-1 flex gap-1 border border-white/10 w-fit shadow-lg">
                            {TRANSITIONS.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setBannerTransition(t.id as BannerTransition)}
                                    className={`p-2 rounded-lg transition-all ${bannerTransition === t.id ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
                                    title={t.label}
                                >
                                    <i className={`fas ${t.icon}`}></i>
                                </button>
                            ))}
                        </div>

                        {bannerTransition !== 'none' && (
                            <div className="bg-black/80 backdrop-blur-md rounded-xl p-2 flex items-center gap-2 border border-white/10 shadow-lg">
                                <span className="text-white text-[8px] font-black uppercase pl-1">Tempo</span>
                                <input
                                    type="number"
                                    value={bannerDuration}
                                    onChange={(e) => setBannerDuration(Number(e.target.value))}
                                    className="w-14 bg-white/10 text-white text-[10px] font-bold text-center rounded-lg py-1 outline-none border border-white/10"
                                    step={500} min={1000}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* UPLOAD SLOTS GRID */}
            {bannerType === 'image' && (
                <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {Array.from({ length: requiredSlots }).map((_, slot) => (
                        <div key={slot} className="relative group/slot aspect-video w-32 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-md transition-all hover:border-red-500 hover:w-40 shadow-xl">
                            {bannerImages[slot] ? (
                                <>
                                    <img src={bannerImages[slot]} className="w-full h-full object-cover" alt={`Slot ${slot}`} />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => removeBannerImage(slot)} className="text-white hover:text-red-500 bg-black/50 p-2 rounded-full"><i className="fas fa-trash"></i></button>
                                    </div>
                                    <span className="absolute top-1 left-2 text-[8px] font-black text-white drop-shadow-md">CAM {slot + 1}</span>
                                </>
                            ) : (
                                <div className="w-full h-full p-1">
                                    <UniversalMediaUploader
                                        user={user}
                                        mediaType="image"
                                        maxFiles={1}
                                        onUploadComplete={(urls) => {
                                            const newImages = [...bannerImages];
                                            newImages[slot] = urls[0];
                                            if (slot === 0) {setMainImageUrl(urls[0]);}
                                            setBannerImages(newImages);
                                            setToast({ message: "Imagem carregada", type: 'success' });
                                        }}
                                        onError={(msg) => setToast({ message: msg, type: 'error' })}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default EditorBanner;
