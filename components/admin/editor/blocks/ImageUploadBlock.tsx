import React, { useState, useRef, useEffect } from 'react';

interface ImageEffects {
    blur: number;
    brightness: number;
    contrast: number;
    saturation: number;
    sepia: number;
    opacity: number;
}

interface ImageUploadBlockProps {
    data: {
        url?: string;
        caption?: string;
        effects?: ImageEffects;
        layout?: 'cover' | 'contain' | 'fill';
        background?: boolean; // Se true, funciona como imagem de fundo para texto
    };
    onUpdate: (newData: any) => void;
    onUpload: (file: File) => Promise<string>;
    readOnly?: boolean;
}

const DEFAULT_EFFECTS: ImageEffects = {
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    opacity: 100
};

import { getLocalFile } from '../../../../services/storage/localStorageService';

export const ImageUploadBlock: React.FC<ImageUploadBlockProps> = ({ data, onUpdate, onUpload, readOnly }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(data.url || null);
    const [showEffects, setShowEffects] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const effects = data.effects || DEFAULT_EFFECTS;

    // Resolve URLs locais (IndexedDB) para Blob URLs visíveis
    useEffect(() => {
        const loadLocalImage = async () => {
            if (data.url && data.url.startsWith('local_')) {
                const blob = await getLocalFile(data.url);
                if (blob) {
                    const objectUrl = URL.createObjectURL(blob);
                    setPreviewUrl(objectUrl);
                    return () => URL.revokeObjectURL(objectUrl);
                }
            } else {
                setPreviewUrl(data.url || null);
            }
        };
        loadLocalImage();
    }, [data.url]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview imediato
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setIsUploading(true);

        try {
            const uploadedUrl = await onUpload(file);
            onUpdate({ ...data, url: uploadedUrl });
            // Não precisa setar previewUrl aqui pois o useEffect vai cuidar disso se for local_
        } catch (error) {
            console.error("Erro no upload:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleEffectChange = (key: keyof ImageEffects, value: number) => {
        const newEffects = { ...effects, [key]: value };
        onUpdate({ ...data, effects: newEffects });
    };

    const getFilterString = () => {
        return `blur(${effects.blur}px) brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%) sepia(${effects.sepia}%) opacity(${effects.opacity}%)`;
    };

    if (readOnly) {
        return (
            <div className="relative w-full overflow-hidden rounded-lg my-4 group" style={{ minHeight: '300px' }}>
                {data.url ? (
                    <>
                        <img
                            src={data.url}
                            alt={data.caption || "Imagem da notícia"}
                            className={`
                                transition-all duration-300
                                ${data.background || data.layout === 'fill' ? 'absolute inset-0 w-full h-full object-cover z-0' : `w-full h-full object-${data.layout || 'cover'}`}
                            `}
                            style={{ filter: getFilterString() }}
                        />
                        {/* Overlay para contraste se for fundo */}
                        {(data.background || data.layout === 'fill') && (
                            <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>
                        )}
                        {data.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm text-center backdrop-blur-sm z-10">
                                {data.caption}
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        );
    }

    return (
        <div className="border-2 border-dashed border-gray-700 bg-gray-900/50 rounded-xl p-4 transition-all hover:border-blue-500/50">
            {!previewUrl ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                    <i className="fas fa-cloud-upload-alt text-4xl text-blue-400 mb-3"></i>
                    <p className="text-gray-300 font-medium">Clique para fazer upload da imagem</p>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                </div>
            ) : (
                <div className="relative bg-black rounded-lg overflow-hidden group">
                    <div className="relative w-full h-[400px] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                        <img
                            src={previewUrl}
                            className={`w-full h-full object-${data.layout || 'cover'} transition-all`}
                            style={{ filter: getFilterString() }}
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                                <i className="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
                            </div>
                        )}

                        {/* Controles Overlay */}
                        <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setShowEffects(!showEffects)}
                                className={`p-2 rounded-full ${showEffects ? 'bg-blue-600 text-white' : 'bg-black/70 text-gray-200'} hover:bg-blue-500 backdrop-blur-md transition-all`}
                                title="Editar Efeitos"
                            >
                                <i className="fas fa-magic"></i>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-full bg-black/70 text-gray-200 hover:bg-white hover:text-black backdrop-blur-md transition-all"
                                title="Trocar Imagem"
                            >
                                <i className="fas fa-exchange-alt"></i>
                            </button>
                            <button
                                onClick={() => {
                                    setPreviewUrl(null);
                                    onUpdate({ ...data, url: '' });
                                }}
                                className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur-md transition-all"
                                title="Remover"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    {/* Painel de Efeitos */}
                    {showEffects && (
                        <div className="mt-4 p-4 bg-gray-800/90 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                    <i className="fas fa-sliders-h text-blue-400"></i> Ajustes Visuais
                                </h4>
                                <button
                                    onClick={() => onUpdate({ ...data, effects: DEFAULT_EFFECTS })}
                                    className="text-xs text-red-400 hover:text-red-300 hover:underline"
                                >
                                    Resetar
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <EffectControl
                                    label="Brilho"
                                    icon="sun"
                                    value={effects.brightness}
                                    min={0} max={200}
                                    onChange={(v) => handleEffectChange('brightness', v)}
                                />
                                <EffectControl
                                    label="Contraste"
                                    icon="adjust"
                                    value={effects.contrast}
                                    min={0} max={200}
                                    onChange={(v) => handleEffectChange('contrast', v)}
                                />
                                <EffectControl
                                    label="Saturação"
                                    icon="fill-drip"
                                    value={effects.saturation}
                                    min={0} max={200}
                                    onChange={(v) => handleEffectChange('saturation', v)}
                                />
                                <EffectControl
                                    label="Blur"
                                    icon="tint"
                                    value={effects.blur}
                                    min={0} max={20}
                                    step={0.5}
                                    onChange={(v) => handleEffectChange('blur', v)}
                                />
                                <EffectControl
                                    label="Sépia"
                                    icon="coffee"
                                    value={effects.sepia}
                                    min={0} max={100}
                                    onChange={(v) => handleEffectChange('sepia', v)}
                                />
                                <EffectControl
                                    label="Opacidade"
                                    icon="ghost"
                                    value={effects.opacity}
                                    min={0} max={100}
                                    onChange={(v) => handleEffectChange('opacity', v)}
                                />
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <label className="block text-xs font-medium text-gray-400 mb-2">Modo de Exibição</label>
                                <div className="flex gap-2">
                                    {['cover', 'contain', 'fill'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => onUpdate({ ...data, layout: mode, background: mode === 'fill' })}
                                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${(data.layout || 'cover') === mode
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {mode === 'fill' ? 'Fundo (Cheio)' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-medium text-gray-400 mb-1">Legenda da Imagem</label>
                                <input
                                    type="text"
                                    value={data.caption || ''}
                                    onChange={(e) => onUpdate({ ...data, caption: e.target.value })}
                                    placeholder="Digite uma legenda para a imagem..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

const EffectControl = ({ label, icon, value, min, max, step = 1, onChange }: {
    label: string, icon: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void
}) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-xs text-gray-400">
            <span><i className={`fas fa-${icon} mr-1`}></i> {label}</span>
            <span>{value}{label === 'Blur' ? 'px' : '%'}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
    </div>
);
