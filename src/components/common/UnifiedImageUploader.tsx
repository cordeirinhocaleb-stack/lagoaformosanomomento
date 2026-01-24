'use client';

import React, { useState, useCallback } from 'react';

interface UnifiedImageUploaderProps {
    onUpload: (url: string) => void;
    currentUrl?: string;
    accept?: string;
    maxSizeMB?: number;
    label?: string;
    recommendedSize?: string; // Ex: "1920x400px"
    darkMode?: boolean;
}

const UnifiedImageUploader: React.FC<UnifiedImageUploaderProps> = ({
    onUpload,
    currentUrl,
    accept = 'image/*,video/*',
    maxSizeMB = 10,
    label = 'Upload de Mídia',
    recommendedSize,
    darkMode = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(currentUrl || null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }, []);

    const handleFile = async (file: File) => {
        setError(null);

        // Validação de tamanho
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            setError(`Arquivo muito grande! Máximo ${maxSizeMB}MB`);
            return;
        }

        // Validação de tipo
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
            setError('Apenas imagens e vídeos são permitidos');
            return;
        }

        // Preview local
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Salvar localmente (será enviado ao Cloudinary no salvamento)
        setIsUploading(true);
        try {
            const { storeLocalFile } = await import('../../services/storage/localStorageService');
            const localId = await storeLocalFile(file);

            // Criar URL local para preview
            const objectUrl = URL.createObjectURL(file);

            // Retornar o ID local (será convertido para URL do Cloudinary no salvamento)
            onUpload(localId);
            setPreview(objectUrl);
            setIsUploading(false);
        } catch (err) {
            setError('Erro ao processar arquivo. Tente novamente.');
            setIsUploading(false);
            console.error(err);
        }
    };

    return (
        <div className="space-y-3">
            <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {label}
            </label>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${isDragging
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : darkMode
                        ? 'border-white/10 bg-black/20 hover:border-white/20'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
            >
                {preview ? (
                    <div className="relative group">
                        <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setPreview(null);
                                setError(null);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3">
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileInput}
                            className="hidden"
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <>
                                <i className="fas fa-spinner fa-spin text-3xl text-green-600"></i>
                                <p className="text-sm font-bold text-green-600">Fazendo upload...</p>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Arraste arquivos aqui
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        ou clique para selecionar
                                    </p>
                                </div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    Máximo {maxSizeMB}MB • JPG, PNG, GIF, MP4
                                </p>
                            </>
                        )}
                    </label>
                )}
            </div>

            {recommendedSize && (
                <div className={`text-center mt-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <i className="fas fa-info-circle mr-2"></i>
                    <span className="text-xs font-bold">Tamanho recomendado: {recommendedSize}</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                </div>
            )}
        </div>
    );
};

export default UnifiedImageUploader;
