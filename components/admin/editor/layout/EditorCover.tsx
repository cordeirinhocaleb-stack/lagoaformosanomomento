
import React from 'react';
import { BannerLayout, BannerTransition } from '../../../../types';
import MediaUploader from '../../../media/MediaUploader';

interface EditorCoverProps {
    bannerType: 'image' | 'video';
    setBannerType: (t: 'image' | 'video') => void;
    bannerLayout: BannerLayout;
    setBannerLayout: (l: BannerLayout) => void;
    bannerTransition: BannerTransition;
    setBannerTransition: (t: BannerTransition) => void;
    bannerDuration: number;
    setBannerDuration: (d: number) => void;
    bannerImages: string[];
    bannerVideoUrl: string;
    setBannerVideoUrl: (url: string) => void;
    mainImageUrl: string;
    requiredSlots: number;
    onMediaSelect: (file: File | null, preview: string, type: 'image' | 'video', slotIdx?: number) => void;
    onRemoveImage: (index: number) => void;
    uploadingSlot: number | null;
}

const TEMPLATES = [
    { id: 'single', label: 'Capa Única', icon: 'fa-square' },
    { id: 'split', label: 'Dividido', icon: 'fa-columns' },
    { id: 'mosaic', label: 'Mosaico 3', icon: 'fa-table-columns' },
    { id: 'grid', label: 'Grade 4', icon: 'fa-border-all' }
];

const TRANSITIONS = [
    { id: 'fade', label: 'Suave (Fade)', icon: 'fa-cloud' },
    { id: 'slide', label: 'Lado a Lado (Slide)', icon: 'fa-film' },
    { id: 'zoom', label: 'Efeito Zoom', icon: 'fa-magnifying-glass-plus' },
    { id: 'none', label: 'Sem Transição', icon: 'fa-ban' }
];

const EditorCover: React.FC<EditorCoverProps> = ({
    bannerType, setBannerType, bannerLayout, setBannerLayout, bannerTransition, setBannerTransition,
    bannerDuration, setBannerDuration, bannerImages, bannerVideoUrl, setBannerVideoUrl, mainImageUrl,
    requiredSlots, onMediaSelect, onRemoveImage, uploadingSlot
}) => {
    
    const handleTypeChange = (type: 'image' | 'video') => {
        if (type === bannerType) {return;}
        setBannerType(type);
    };

    // Wrapper para garantir que vídeo force o tipo para 'video'
    const handleInternalMediaSelect = (file: File | null, preview: string, type: 'image' | 'video', slotIdx?: number) => {
        if (!file) {return;}
        if (type === 'video') {
            setBannerType('video');
            onMediaSelect(file, preview, 'video'); 
        } else {
            setBannerType('image');
            onMediaSelect(file, preview, 'image', slotIdx);
        }
    };

    const BannerSlot = ({ index, className }: { index: number, className: string }) => (
        <div key={index} className={`border-zinc-800 overflow-hidden relative group/slot ${className}`}>
            <img src={bannerImages[index] || mainImageUrl} className="w-full h-full object-cover opacity-100" alt={`Capa ${index + 1}`} />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity bg-black/40">
                <div className="w-24 h-24">
                    <MediaUploader onMediaSelect={(f, p, t) => handleInternalMediaSelect(f, p, t, index)} />
                </div>
            </div>
            <div className="absolute top-2 left-2 bg-black px-2 py-0.5 rounded text-[8px] text-white font-black uppercase">Slot {index + 1}</div>
        </div>
    );

    return (
        <section className="w-full relative bg-zinc-900 group">
            <div className="absolute top-4 left-4 z-40 flex flex-col gap-3 pointer-events-auto">
                 <div className="bg-black p-1.5 rounded-full flex gap-1.5 border border-white/10 shadow-xl">
                    <button onClick={() => handleTypeChange('image')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${bannerType === 'image' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`} title="Modo Imagem"><i className="fas fa-image text-xs"></i></button>
                    <button onClick={() => handleTypeChange('video')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${bannerType === 'video' ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'}`} title="Modo Vídeo"><i className="fab fa-youtube text-xs"></i></button>
                 </div>
                 
                 {bannerType === 'image' && (
                     <div className="bg-black p-1.5 rounded-2xl flex flex-wrap max-w-[180px] gap-1.5 border border-white/10 shadow-xl animate-fadeIn">
                        {TEMPLATES.map(t => (
                            <button key={t.id} onClick={() => setBannerLayout(t.id as any)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${bannerLayout === t.id ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`} title={t.label}>
                                <i className={`fas ${t.icon} text-sm`}></i>
                            </button>
                        ))}
                        <div className="w-full h-px bg-white/10 my-1"></div>
                        <div className="flex gap-1.5 w-full">
                            {TRANSITIONS.map(tr => (
                                <button key={tr.id} onClick={() => setBannerTransition(tr.id as any)} className={`flex-1 h-8 rounded-lg flex items-center justify-center transition-all ${bannerTransition === tr.id ? 'bg-blue-600 text-white' : 'text-white/30 hover:text-white'}`} title={tr.label}><i className={`fas ${tr.icon} text-[10px]`}></i></button>
                            ))}
                        </div>
                     </div>
                 )}

                 {bannerType === 'image' && bannerTransition !== 'none' && (
                    <div className="bg-black p-3 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3">
                        <span className="text-[8px] font-black uppercase text-white/50 tracking-widest">Tempo:</span>
                        <div className="flex items-center gap-1">
                            <input 
                                type="number" 
                                value={(bannerDuration / 1000).toFixed(1)} 
                                onChange={(e) => setBannerDuration(Math.round(parseFloat(e.target.value) * 1000))} 
                                className="w-14 bg-white/10 text-white text-[10px] font-black rounded border border-white/10 px-2 py-1 outline-none focus:border-red-600 text-center"
                                step="0.1" min="0.5"
                            />
                            <span className="text-[8px] font-bold text-white/30 uppercase">seg</span>
                        </div>
                    </div>
                 )}
            </div>

            <div className="h-72 md:h-[400px] overflow-hidden relative">
                {bannerType === 'image' ? (
                    <div className="w-full h-full relative">
                        {bannerLayout === 'single' && <BannerSlot index={0} className="w-full h-full" />}
                        {bannerLayout === 'split' && (
                            <div className="w-full h-full grid grid-cols-2">
                                <BannerSlot index={0} className="border-r border-white/10" />
                                <BannerSlot index={1} className="" />
                            </div>
                        )}
                        {bannerLayout === 'mosaic' && (
                            <div className="w-full h-full grid grid-cols-12 grid-rows-2">
                                <BannerSlot index={0} className="col-span-8 row-span-2 border-r border-white/10" />
                                <BannerSlot index={1} className="col-span-4 row-span-1 border-b border-white/10" />
                                <BannerSlot index={2} className="col-span-4 row-span-1" />
                            </div>
                        )}
                        {bannerLayout === 'grid' && (
                            <div className="w-full h-full grid grid-cols-2 grid-rows-2">
                                <BannerSlot index={0} className="border-r border-white/10 border-b border-white/10" />
                                <BannerSlot index={1} className="border-b border-white/10" />
                                <BannerSlot index={2} className="border-r border-white/10" />
                                <BannerSlot index={3} className="" />
                            </div>
                        )}
                        {/* UPLOAD SLOTS VISUAIS INFERIORES */}
                        <div className="absolute bottom-6 left-6 right-6 z-20 flex gap-3 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
                            {Array.from({ length: requiredSlots }).map((_, slot) => (
                                <div key={slot} className="relative group/slot aspect-video w-32 shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 bg-black/40 backdrop-blur-md transition-all hover:border-red-500 hover:w-40 shadow-xl">
                                    {bannerImages[slot] ? (
                                        <>
                                            <img src={bannerImages[slot]} className="w-full h-full object-cover" alt={`Slot ${slot}`} />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <div className="w-8 h-8"><MediaUploader onMediaSelect={(f, p, t) => handleInternalMediaSelect(f, p, t, slot)} /></div>
                                                <button onClick={() => onRemoveImage(slot)} className="text-white hover:text-red-500 bg-black/50 p-2 rounded-full"><i className="fas fa-trash"></i></button>
                                            </div>
                                            <span className="absolute top-1 left-2 text-[8px] font-black text-white drop-shadow-md">CAM {slot + 1}</span>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-white/30 hover:text-white transition-colors relative">
                                            {uploadingSlot === slot ? <i className="fas fa-circle-notch fa-spin"></i> : <><i className="fas fa-plus text-lg"></i><span className="text-[7px] font-black uppercase mt-1">Adicionar</span></>}
                                            <div className="absolute inset-0 opacity-0"><MediaUploader onMediaSelect={(f, p, t) => handleInternalMediaSelect(f, p, t, slot)} /></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black group/video">
                        {bannerVideoUrl ? (
                            <div className="w-full h-full relative">
                                <video src={bannerVideoUrl} className="w-full h-full object-cover" muted autoPlay loop />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/40">
                                    <div className="w-48 h-48"><MediaUploader onMediaSelect={(f, p, t) => handleInternalMediaSelect(f, p, t)} /></div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/40">
                                <i className="fab fa-youtube text-7xl text-red-600 opacity-40"></i>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
                                    <input 
                                        type="text" 
                                        value={bannerVideoUrl} 
                                        onChange={e => setBannerVideoUrl(e.target.value)}
                                        placeholder="Cole o Link do YouTube..."
                                        className="w-full max-w-md bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white text-center font-bold outline-none focus:border-red-500 transition-all pointer-events-auto"
                                    />
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em] mt-4">Ou arraste um arquivo</p>
                                    <div className="w-full h-full absolute inset-0 opacity-0 pointer-events-auto"><MediaUploader onMediaSelect={(f, p, t) => handleInternalMediaSelect(f, p, t)} /></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default EditorCover;
