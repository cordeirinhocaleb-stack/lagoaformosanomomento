import React, { useState, useEffect } from 'react';
import { ContentBlock } from '../../types';
import { storeLocalFile, getLocalFile } from '../../services/storage/localStorageService';
import { GalleryPreview } from './editor/gallery/GalleryPreview';
import { GalleryGridControls, GALLERY_STYLES } from './editor/gallery/GalleryGridControls';

interface GalleryEditorProps {
    block: ContentBlock;
    accessToken?: string | null;
    onUpdate: (updatedBlock: ContentBlock) => void;
}

const GalleryEditorBlock: React.FC<GalleryEditorProps> = ({ block, onUpdate }) => {
    // Local state for image previews (base64 or blob urls)
    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);

    const currentStyle = (block.settings.galleryStyle as string) || 'grid';
    const images = (block.settings.images as string[]) || [];

    // Load previews for local images
    useEffect(() => {
        loadPreviews();
    }, [block.settings.images]);

    const loadPreviews = async () => {
        const newPreviews: Record<string, string> = {};
        const imgs = (block.settings.images as (string | number)[]) || [];

        for (const img of imgs) {
            if (typeof img === 'string' && img.startsWith('local_')) {
                // It's a local ID, fetch from local storage
                const file = await getLocalFile(img);
                if (file) {
                    newPreviews[img] = URL.createObjectURL(file);
                }
            }
        }
        setImagePreviews(prev => ({ ...prev, ...newPreviews }));
    };

    // Helper to get image src (either URL or Base64 from local)
    const getImgSrc = (img: string | number) => {
        const imgStr = typeof img === 'number' ? `local_${img}` : img;
        if (imgStr.startsWith('local_')) {
            return imagePreviews[imgStr] || '';
        }
        return imgStr;
    };


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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newImageIds: string[] = [];
        const newPreviews: Record<string, string> = {};

        try {
            for (const file of files) {
                // Store locally and get ID
                const id = await storeLocalFile(file);
                const localKey = `local_${id}`;
                newImageIds.push(localKey);

                // Immediate preview
                newPreviews[localKey] = URL.createObjectURL(file);
            }

            // Update previews immediately
            setImagePreviews(prev => ({ ...prev, ...newPreviews }));

            // Update block settings
            const currentImages = (block.settings.images as (string | number)[]) || [];
            updateSetting('images', [...currentImages, ...newImageIds]);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Erro ao processar imagens. Tente novamente.');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    const handleUrlAdd = () => {
        const url = prompt('Cole a URL da imagem:');
        if (url) {
            updateSetting('images', [...images, url]);
        }
    };

    const styleDef = GALLERY_STYLES.find(s => s.id === currentStyle);

    return (
        <div className="p-6 bg-zinc-50/50 rounded-2xl border border-zinc-100">
            {/* Header / Instructions */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black uppercase text-zinc-600 flex items-center gap-2">
                        <i className="fas fa-images text-blue-500"></i> Editor de Galeria
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        Estilo atual: <strong className="text-zinc-600">{styleDef?.label}</strong> ({images.length}/{styleDef?.maxItems} fotos)
                    </p>
                </div>
                <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${images.length >= (styleDef?.maxItems || 0) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {images.length} imagens
                    </span>
                </div>
            </div>

            {/* 1. Style Controls Extracted */}
            <GalleryGridControls
                currentStyle={currentStyle}
                onChangeStyle={(id) => updateSetting('galleryStyle', id)}
            />

            {/* 2. Upload Area (Kept Inline for simplicity as it's small, but separated logic) */}
            <div className="mb-6 bg-white p-4 rounded-xl border border-dashed border-zinc-300 hover:border-blue-400 transition-colors text-center group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                </div>
                <h4 className="text-xs font-bold text-zinc-700 mb-1">Upload de Fotos</h4>
                <p className="text-[10px] text-zinc-400 mb-4 px-8">Arraste fotos para cá ou clique para selecionar. Máximo de 5MB por arquivo.</p>

                <div className="flex justify-center gap-3">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        {uploading ? 'Processando...' : 'Selecionar Arquivos'}
                    </label>
                    <button
                        onClick={handleUrlAdd}
                        className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-all"
                        aria-label="Adicionar imagem via URL"
                        title="Adicionar via URL"
                    >
                        <i className="fas fa-link mr-1"></i> Via URL
                    </button>
                </div>
            </div>

            {/* 3. Image List Management */}
            {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-6 animate-fadeIn">
                    {images.map((img, idx) => (
                        <div key={idx} className="group relative aspect-square bg-zinc-200 rounded-lg overflow-hidden border border-zinc-200 shadow-sm">
                            <img
                                src={getImgSrc(img)}
                                className="w-full h-full object-cover"
                                alt={`Galeria ${idx}`}
                            />

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button
                                    onClick={() => removeImage(idx)}
                                    className="w-8 h-8 rounded-full bg-white text-red-500 hover:text-red-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                    title="Remover Imagem"
                                    aria-label={`Remover imagem ${idx + 1}`}
                                >
                                    <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                                <button
                                    className="w-8 h-8 rounded-full bg-white text-blue-500 hover:text-blue-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                    title="Mover Imagem"
                                    aria-label={`Mover imagem ${idx + 1}`}
                                >
                                    <i className="fas fa-arrows-alt text-xs"></i>
                                </button>
                            </div>

                            {/* Number Badge */}
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-md bg-black/40 text-white text-[9px] font-black flex items-center justify-center backdrop-blur-md">
                                {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 4. Live Preview Extracted */}
            <GalleryPreview
                block={block}
                getImgSrc={getImgSrc}
            />
        </div>
    );
};

export default GalleryEditorBlock;
