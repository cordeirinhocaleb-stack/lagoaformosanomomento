import React, { useState, useEffect } from 'react';
import { ContentBlock, User } from '../../types';
import { getLocalFile } from '../../services/storage/localStorageService';
import { GalleryPreview } from './editor/gallery/GalleryPreview';
import { GalleryGridControls, GALLERY_STYLES } from './editor/gallery/GalleryGridControls';
import UniversalMediaUploader from '../media/UniversalMediaUploader';

interface GalleryEditorProps {
    block: ContentBlock;
    user: User; // Requisito para o novo uploader
    accessToken?: string | null;
    onUpdate: (updatedBlock: ContentBlock) => void;
}

const GalleryEditorBlock: React.FC<GalleryEditorProps> = ({ block, user, onUpdate }) => {
    const [isDragging, setIsDragging] = useState<number | null>(null);

    const currentStyle = (block.settings.galleryStyle as string) || 'grid';
    const images = (block.settings.images as string[]) || [];

    const updateSetting = (key: string, value: unknown) => {
        onUpdate({
            ...block,
            settings: {
                ...block.settings,
                [key]: value
            }
        });
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        updateSetting('images', newImages);
    };

    const handleUploadComplete = (urls: string[]) => {
        updateSetting('images', [...images, ...urls]);
    };

    const styleDef = GALLERY_STYLES.find(s => s.id === currentStyle);

    return (
        <div className="w-full relative bg-zinc-950 rounded-[3rem] p-1 shadow-2xl overflow-hidden border border-white/5 ring-1 ring-white/10">
            {/* 1. DARK PREVIEW AREA */}
            <div className="relative bg-black rounded-[2.8rem] h-64 md:h-[320px] overflow-hidden group/preview mb-1 border border-white/5">
                {/* TOOLBAR FLUTUANTE */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-xl rounded-2xl px-2 py-1.5 flex gap-1 border border-white/10 shadow-2xl pointer-events-auto">
                        {GALLERY_STYLES.map(style => {
                            const isActive = currentStyle === style.id;
                            return (
                                <button
                                    key={style.id}
                                    onClick={() => updateSetting('galleryStyle', style.id)}
                                    className={`w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                                    title={style.label}
                                >
                                    <i className={`fas ${style.icon} text-xs`}></i>
                                    <span className="text-[6px] font-black uppercase mt-0.5 tracking-tighter">{style.id}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* CONTENT PREVIEW */}
                <div className="w-full h-full relative z-0">
                    <GalleryPreview
                        block={block}
                        getImgSrc={(img) => typeof img === 'string' ? img : ''}
                    />
                </div>

                {/* OVERLAYS JORNALÍSTICOS */}
                <div className="absolute top-4 left-4 z-40">
                    <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        PREVIEW: {styleDef?.label}
                    </div>
                </div>
            </div>

            {/* 2. MEDIA MANAGEMENT AREA */}
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <h3 className="text-[12px] font-black uppercase text-white tracking-[0.3em] leading-none mb-1.5">
                            Mídias Arquivadas
                        </h3>
                        <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">
                            Controle de canais da galeria
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{images.length}</span>
                        <div className="w-px h-3 bg-white/10"></div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{styleDef?.maxItems} MÁX</span>
                    </div>
                </div>

                {/* IMAGES GRID */}
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                    {images.map((img, idx) => (
                        <div key={`cam-${idx}`} className="relative group/cam shrink-0 pb-12">
                            {/* BOTÃO REMOVER (FORA DA IMAGEM) */}
                            <button
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 text-white flex items-center justify-center hover:bg-red-600 hover:border-red-500 transition-all shadow-xl group-hover/cam:scale-110"
                                title="Remover Canal"
                            >
                                <i className="fas fa-times text-[10px]"></i>
                            </button>

                            <div className={`relative aspect-square w-32 rounded-3xl overflow-hidden border-2 transition-all duration-300 bg-zinc-800/50 backdrop-blur-md shadow-2xl ${isDragging === idx ? 'border-blue-500 scale-105 opacity-50' : 'border-white/5 group-hover/cam:border-white/20'}`}
                                draggable
                                onDragStart={() => setIsDragging(idx)}
                                onDragEnd={() => setIsDragging(null)}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />

                                {/* CANAL LABEL */}
                                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[8px] font-black border border-white/10 uppercase tracking-tighter shadow-lg backdrop-blur-md">
                                    CAM {idx + 1}
                                </div>
                            </div>

                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center w-full">
                                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest group-hover/cam:text-zinc-400 transition-colors">Arraste para Mover</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CENTRAL ADD BUTTON + WATERMARK TOGGLE */}
                {images.length < (styleDef?.maxItems || 0) && (
                    <div className="mt-4 flex flex-col items-center gap-4">
                        {/* TOGGLE: WATERMARK ON UPLOAD */}
                        <div className="flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Marca d'água Física</span>
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter">Inserir nos pixels do arquivo</span>
                            </div>
                            <button
                                onClick={() => updateSetting('bakeWatermark', !block.settings.bakeWatermark)}
                                className={`w-12 h-6 rounded-full transition-all relative flex items-center px-1 ${block.settings.bakeWatermark ? 'bg-red-600' : 'bg-white/10'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${block.settings.bakeWatermark ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="w-full h-24 relative rounded-[2.5rem] border-2 border-dashed border-white/10 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-blue-500/50 transition-all group/uploader overflow-hidden">
                            <UniversalMediaUploader
                                user={user}
                                mediaType="image"
                                maxFiles={(styleDef?.maxItems || 0) - images.length}
                                onUploadComplete={(urls) => handleUploadComplete(urls)}
                                variant="mini"
                                // Passing watermark preference to uploader
                                bakeWatermark={block.settings.bakeWatermark}
                            />
                            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/5 shadow-xl transition-transform group-hover/uploader:scale-110 group-hover/uploader:rotate-3">
                                    <i className="fas fa-plus text-blue-500"></i>
                                </div>
                                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] group-hover/uploader:text-zinc-300">Adicionar Mídias (Canais)</span>
                            </div>
                        </div>
                        <p className="mt-4 text-[7px] text-zinc-600 font-bold uppercase tracking-[0.4em] italic">Capacidade máxima para este layout: {styleDef?.maxItems} arquivos</p>
                    </div>
                )}
            </div>

            {/* 3. SETTINGS PILL */}
            <div className="p-4 pt-0 flex justify-center">
                <div className="bg-zinc-800/40 backdrop-blur-md border border-white/5 rounded-full px-6 py-2 flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-expand-alt text-blue-500 text-[10px]"></i>
                        <span className="text-white/60 text-[8px] font-black uppercase tracking-widest">Width: {block.settings.width || 'Full'}</span>
                    </div>
                    <div className="w-px h-3 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-layer-group text-zinc-500 text-[10px]"></i>
                        <span className="text-white/60 text-[8px] font-black uppercase tracking-widest">{images.length}/{styleDef?.maxItems} Canais</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GalleryEditorBlock;
