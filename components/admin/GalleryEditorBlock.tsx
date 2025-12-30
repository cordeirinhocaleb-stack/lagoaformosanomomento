
import React, { useState } from 'react';
import { ContentBlock, GalleryItem, GalleryStyle } from '../../types';
import { uploadFileToDrive } from '../../services/driveService';

interface GalleryEditorBlockProps {
  block: ContentBlock;
  onUpdate: (updatedBlock: ContentBlock) => void;
  accessToken: string | null;
}

const GALLERY_STYLES: { id: GalleryStyle; label: string; icon: string; maxItems: number }[] = [
    { id: 'hero_slider', label: 'Slider de Impacto', icon: 'fa-images', maxItems: 12 },
    { id: 'news_mosaic', label: 'Mosaico Notícias', icon: 'fa-th-large', maxItems: 3 },
    { id: 'filmstrip', label: 'Tira de Filme', icon: 'fa-film', maxItems: 15 },
    { id: 'comparison', label: 'Antes e Depois', icon: 'fa-arrows-left-right', maxItems: 2 },
    { id: 'masonry', label: 'Grid Dinâmico', icon: 'fa-border-all', maxItems: 20 },
    { id: 'stories_scroll', label: 'Modo Stories', icon: 'fa-mobile-screen', maxItems: 10 },
];

const GalleryEditorBlock: React.FC<GalleryEditorBlockProps> = ({ block, onUpdate, accessToken }) => {
    const [isUploading, setIsUploading] = useState(false);
    const items: GalleryItem[] = block.content?.items || [];
    const currentStyleId = block.settings.style as GalleryStyle | undefined;
    const styleConfig = GALLERY_STYLES.find(s => s.id === currentStyleId);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length === 0 || !accessToken || !styleConfig) return;

        const remainingSlots = styleConfig.maxItems - items.length;
        if (remainingSlots <= 0) {
            alert(`Este estilo permite apenas ${styleConfig.maxItems} fotos.`);
            return;
        }

        const filesToUpload = files.slice(0, remainingSlots);
        setIsUploading(true);
        
        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                const url = await uploadFileToDrive(file, accessToken);
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    url,
                    caption: '',
                    alt: file.name
                };
            });

            const newItems = await Promise.all(uploadPromises);
            onUpdate({
                ...block,
                content: { ...block.content, items: [...items, ...newItems] }
            });
        } catch (error) {
            alert("Erro ao hospedar mídia.");
        } finally {
            setIsUploading(false);
        }
    };

    const reorderItem = (index: number, direction: 'left' | 'right') => {
        const newItems = [...items];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        onUpdate({ ...block, content: { ...block.content, items: newItems } });
    };

    const removeItem = (id: string) => {
        onUpdate({ ...block, content: { ...block.content, items: items.filter(i => i.id !== id) } });
    };

    return (
        <div className="bg-white border-2 border-zinc-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm transition-all hover:border-zinc-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#003366] text-white flex items-center justify-center shadow-xl">
                        <i className="fas fa-photo-video"></i>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Editor de Galeria</h4>
                        <p className="text-sm font-black uppercase text-zinc-900 tracking-tighter">
                            {styleConfig ? `${styleConfig.label} (${items.length}/${styleConfig.maxItems})` : 'Escolha o layout primeiro'}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <input 
                        type="file" multiple accept="image/*" className="hidden" id={`gal-up-${block.id}`}
                        disabled={!styleConfig || items.length >= (styleConfig?.maxItems || 0)}
                        onChange={handleFileUpload}
                    />
                    <label 
                        htmlFor={`gal-up-${block.id}`}
                        className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 ${
                            !styleConfig ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed border border-zinc-200' : 
                            'bg-black text-white cursor-pointer hover:bg-red-600'
                        }`}
                    >
                        {isUploading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-cloud-arrow-up"></i>}
                        {!styleConfig ? 'Selecione o estilo primeiro' : 'Enviar Fotos'}
                    </label>
                </div>
            </div>

            {/* Seletor de Estilo Jornalístico */}
            <div className="mb-10 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {GALLERY_STYLES.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onUpdate({ ...block, settings: { ...block.settings, style: s.id } })}
                        className={`flex-shrink-0 px-6 py-4 rounded-[1.5rem] border transition-all text-left min-w-[160px] ${currentStyleId === s.id ? 'bg-blue-50 border-blue-600 ring-4 ring-blue-100' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
                    >
                        <i className={`fas ${s.icon} text-sm mb-2 ${currentStyleId === s.id ? 'text-blue-600' : 'text-zinc-400'}`}></i>
                        <span className={`block text-[10px] font-black uppercase tracking-widest ${currentStyleId === s.id ? 'text-blue-900' : 'text-zinc-600'}`}>{s.label}</span>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Máx. {s.maxItems} fotos</span>
                    </button>
                ))}
            </div>

            {/* Grade de Organização e Reordenação */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item, idx) => (
                    <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 group bg-zinc-50 shadow-sm animate-fadeIn">
                        <img src={item.url} className="w-full h-full object-cover" alt="" />
                        
                        {/* Overlay de Controles de Ordem */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => reorderItem(idx, 'left')} disabled={idx === 0} className="w-8 h-8 rounded-lg bg-white text-zinc-900 flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-20 transition-colors">
                                <i className="fas fa-chevron-left text-xs"></i>
                            </button>
                            <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-lg bg-white text-red-600 flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-lg">
                                <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                            <button onClick={() => reorderItem(idx, 'right')} disabled={idx === items.length - 1} className="w-8 h-8 rounded-lg bg-white text-zinc-900 flex items-center justify-center hover:bg-red-600 hover:text-white disabled:opacity-20 transition-colors">
                                <i className="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Posição {idx + 1}</div>
                    </div>
                ))}
                
                {styleConfig && items.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-300 border-4 border-dashed border-zinc-50 rounded-[2.5rem] bg-zinc-50/50">
                        <i className={`fas ${styleConfig.icon} text-5xl mb-4 opacity-20`}></i>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">O layout {styleConfig.label} está pronto</p>
                    </div>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100">
                <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block tracking-widest">Legenda Coletiva (Alinhamento Brasileiro)</label>
                <input 
                    type="text" dir="ltr"
                    value={block.settings.caption || ''} 
                    onChange={e => onUpdate({ ...block, settings: { ...block.settings, caption: e.target.value }})}
                    placeholder="Ex: Momentos exclusivos da Expô Lagoa 2025..."
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 text-left"
                />
            </div>
        </div>
    );
};

export default GalleryEditorBlock;
