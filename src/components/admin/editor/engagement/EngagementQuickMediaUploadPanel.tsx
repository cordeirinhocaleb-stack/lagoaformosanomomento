import React, { useRef, useState } from 'react';
import { uploadToCloudinary } from '@/services/cloudinaryService';

interface QuickUploaderProps {
    onUpload: (url: string) => void;
    currentUrl?: string;
    label?: string;
    compact?: boolean;
}

export const QuickUploader: React.FC<QuickUploaderProps> = ({ onUpload, currentUrl, label, compact }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadToCloudinary(file, 'lfnm_cms/engagement_options');
            onUpload(url);
        } catch (error: unknown) {
            console.error(error);
            alert('Erro no upload: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    if (compact) {
        return (
            <div className="relative group">
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />

                {currentUrl ? (
                    <div
                        className="w-8 h-8 rounded-lg bg-cover bg-center border border-zinc-200 cursor-pointer shadow-sm hover:opacity-80 transition-all relative overflow-hidden"
                        style={{ backgroundImage: `url(${currentUrl})` }}
                        onClick={() => fileRef.current?.click()}
                        title="Alterar Imagem"
                    >
                        {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-white text-[10px]"></i></div>}
                    </div>
                ) : (
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-blue-500 hover:border-blue-200 flex items-center justify-center transition-all"
                        title="Adicionar Imagem"
                    >
                        {uploading ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-image text-xs"></i>}
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
            {currentUrl && (
                <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-zinc-200 shadow-sm" style={{ backgroundImage: `url(${currentUrl})` }}></div>
            )}

            <div className="flex-1">
                {label && <label className="block text-[9px] font-black uppercase text-zinc-400 mb-1">{label}</label>}
                <div className="flex gap-2">
                    <input
                        value={currentUrl || ''}
                        onChange={(e) => onUpload(e.target.value)}
                        className="flex-1 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs"
                        placeholder="https://..."
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-lg text-xs font-bold text-zinc-600 transition-colors"
                    >
                        {uploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
                    </button>
                </div>
            </div>
        </div>
    );
};
