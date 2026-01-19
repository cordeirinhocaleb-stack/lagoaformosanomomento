import React from 'react';
import { Advertiser } from '@/types';

interface MediaControlsProps {
    data: Advertiser;
    onChange: (data: Advertiser) => void;
    darkMode?: boolean;
}

export const MediaTypeSelector: React.FC<MediaControlsProps> = ({ data, onChange, darkMode }) => {
    return (
        <div className="flex gap-2 mb-6 p-1 bg-gray-50 dark:bg-white/5 rounded-2xl">
            {[
                { id: 'image', label: 'Imagens / GIF', icon: 'fa-images' },
                { id: 'video', label: 'Vídeo (30s)', icon: 'fa-video' }
            ].map(type => (
                <button
                    key={type.id}
                    type="button"
                    onClick={() => onChange({ ...data, mediaType: type.id as 'image' | 'video' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${(data.mediaType || 'image') === type.id
                        ? 'bg-white dark:bg-zinc-800 text-red-600 shadow-sm border border-gray-100 dark:border-zinc-700'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <i className={`fas ${type.icon}`}></i>
                    {type.label}
                </button>
            ))}
        </div>
    );
};

export const TransitionTypeSelector: React.FC<MediaControlsProps> = ({ data, onChange, darkMode }) => {
    return (
        <div>
            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Transição entre Imagens</label>
            <div className="grid grid-cols-4 gap-2">
                {[
                    { id: 'none', label: 'Nenhum' },
                    { id: 'fade', label: 'Fade' },
                    { id: 'slide', label: 'Slide' },
                    { id: 'zoom', label: 'Zoom' }
                ].map(type => (
                    <button
                        key={type.id}
                        type="button"
                        onClick={() => onChange({ ...data, transitionType: type.id as 'none' | 'fade' | 'slide' | 'zoom' })}
                        className={`py-2 rounded-lg border text-[8px] font-black uppercase tracking-tight transition-all ${(data.transitionType || 'none') === type.id
                            ? 'bg-red-600 border-red-600 text-white shadow-md'
                            : darkMode ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-white border-gray-200 text-gray-400'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
