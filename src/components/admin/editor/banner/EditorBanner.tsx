
import React from 'react';
import UniversalMediaUploader from '../../../media/UniversalMediaUploader';
import { BannerLayout, BannerTransition, User } from '../../../../types';

interface EditorBannerProps {
    user: User;
    bannerType: 'image' | 'video';
    setBannerType: (val: 'image' | 'video') => void;
    bannerLayout: BannerLayout;
    setBannerLayout: (val: BannerLayout) => void;
    bannerTransition: BannerTransition;
    setBannerTransition: (val: BannerTransition) => void;
    bannerDuration: number;
    setBannerDuration: (val: number) => void;
    bannerImages: string[];
    bannerVideoUrl: string;
    setBannerVideoUrl: (url: string) => void;
    mainImageUrl: string;
    requiredSlots: number;
    resolveImage: (url: string | undefined) => string;
    handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => void;
    removeBannerImage: (index: number) => void;
    miniUploaderProps: {
        onUploadStart: (previewUrl: string, slot: number) => void;
        onUploadComplete: (ids: string[], slot: number) => void;
        onError: (msg: string) => void;
    };
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

export const EditorBanner: React.FC<EditorBannerProps> = ({
    user, bannerType, setBannerType,
    bannerLayout, setBannerLayout,
    bannerTransition, setBannerTransition,
    bannerDuration, setBannerDuration,
    bannerImages, bannerVideoUrl, setBannerVideoUrl,
    mainImageUrl, requiredSlots, resolveImage,
    handleBannerUpload, removeBannerImage,
    miniUploaderProps
}) => {
    return (
        <section className="w-full relative bg-zinc-900 group">
            {/* Visualização Dinâmica do Layout */}
            <div className="h-64 md:h-[320px] overflow-hidden relative">
                {bannerType === 'image' ? (
                    <div className="w-full h-full">
                        {bannerLayout === 'single' && (
                            <img src={resolveImage(bannerImages[0] || mainImageUrl)} className="w-full h-full object-cover opacity-60" alt="Capa" />
                        )}
                        {bannerLayout === 'split' && (
                            <div className="w-full h-full grid grid-cols-2">
                                {[0, 1].map(i => <div key={i} className="border-r border-white/10 overflow-hidden"><img src={resolveImage(bannerImages[i] || mainImageUrl)} className="w-full h-full object-cover" /></div>)}
                            </div>
                        )}
                        {bannerLayout === 'mosaic' && (
                            <div className="w-full h-full grid grid-cols-3 grid-rows-2">
                                <div className="col-span-2 row-span-2 border-r border-white/10 overflow-hidden"><img src={resolveImage(bannerImages[0] || mainImageUrl)} className="w-full h-full object-cover" /></div>
                                <div className="border-b border-white/10 overflow-hidden"><img src={resolveImage(bannerImages[1] || mainImageUrl)} className="w-full h-full object-cover" /></div>
                                <div className="overflow-hidden"><img src={resolveImage(bannerImages[2] || mainImageUrl)} className="w-full h-full object-cover" /></div>
                            </div>
                        )}
                        {bannerLayout === 'grid' && (
                            <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                                {[0, 1, 2, 3].map(i => <div key={i} className="border-r border-b border-white/10 overflow-hidden"><img src={resolveImage(bannerImages[i] || mainImageUrl)} className="w-full h-full object-cover" /></div>)}
                            </div>
                        )}
                        {bannerLayout === 'pentagon' && (
                            <div className="w-full h-full grid grid-cols-5">
                                {[0, 1, 2, 3, 4].map(i => <div key={i} className="border-r border-white/10 overflow-hidden bg-black"><img src={resolveImage(bannerImages[i] || mainImageUrl)} className="w-full h-full object-cover opacity-80" /></div>)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 p-10">
                        {bannerVideoUrl ? (
                            <div className="relative w-full h-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group/video z-20">
                                {bannerVideoUrl.includes('youtube') || bannerVideoUrl.includes('vimeo') ? (
                                    <iframe
                                        src={bannerVideoUrl.includes('youtube') ? bannerVideoUrl.replace('watch?v=', 'embed/') : bannerVideoUrl}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        src={bannerVideoUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        loop
                                        playsInline
                                    />
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setBannerVideoUrl(''); }}
                                    className="absolute top-4 right-4 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50"
                                    title="Trocar Vídeo"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ) : (
                            <div className="w-full max-w-md aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden relative z-20">
                                <UniversalMediaUploader
                                    user={user}
                                    mediaType="video"
                                    onUploadComplete={(urls) => setBannerVideoUrl(urls[0])}
                                    onError={(msg) => miniUploaderProps.onError(msg)}
                                // REMOVED: onUploadStart causes premature unmount of the uploader before "YouTube vs Cloud" decision can be made.
                                // The Uploader component handles its own preview state internally.
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* BARRA DE FERRAMENTAS FLUTUANTE (TOP) */}
            <div className="absolute top-6 left-6 right-6 z-30 flex justify-between items-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    {Array.from({ length: requiredSlots || 1 }).map((_, slot) => (
                        <div key={slot} className="relative group/slot aspect-video w-32 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-md transition-all hover:border-red-500 hover:w-40 shadow-xl">
                            {bannerImages[slot] ? (
                                <>
                                    <img src={resolveImage(bannerImages[slot])} className="w-full h-full object-cover" alt={`Slot ${slot}`} />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <input
                                            type="file"
                                            id={`banner-upload-replace-${slot}`}
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handleBannerUpload(e, slot)}
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); document.getElementById(`banner-upload-replace-${slot}`)?.click(); }}
                                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-blue-600 text-white backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110"
                                            title="Trocar Imagem"
                                        >
                                            <i className="fas fa-camera"></i>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeBannerImage(slot); }}
                                            className="w-10 h-10 rounded-full bg-white/20 hover:bg-red-600 text-white backdrop-blur-md flex items-center justify-center transition-all transform hover:scale-110"
                                            title="Remover Imagem"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                    {requiredSlots > 1 && <span className="absolute top-1 left-2 text-[8px] font-black text-white drop-shadow-md">CAM {slot + 1}</span>}
                                </>
                            ) : (
                                <div className="w-full h-full p-1">
                                    <UniversalMediaUploader
                                        user={user}
                                        mediaType="image"
                                        variant="mini"
                                        maxFiles={1}
                                        uploadMode="local"
                                        onUploadStart={(previewUrl) => miniUploaderProps.onUploadStart(previewUrl, slot)}
                                        onUploadComplete={(ids) => miniUploaderProps.onUploadComplete(ids, slot)}
                                        onError={miniUploaderProps.onError}
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
