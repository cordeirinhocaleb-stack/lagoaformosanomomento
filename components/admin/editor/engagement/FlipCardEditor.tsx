import React from 'react';
import { SubEditorProps } from './SubEditorProps';
import { ColorTheme } from '../EngagementColors';

const DEFAULT_THEME: ColorTheme = {
    id: 'default_fallback',
    label: 'Fallback',
    preview: 'bg-gray-500',
    classes: {
        wrapper: 'bg-white',
        text: 'text-zinc-600',
        accent: 'bg-blue-500',
        secondary: 'border-zinc-200',
        button: 'hover:bg-blue-600'
    }
};

export const FlipCardEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-xl border ${activeTheme.classes.secondary} bg-white/50`}>
                    <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Frente</label>
                    <textarea value={(settings.frontText as string) || ''} onChange={e => onChange({ frontText: e.target.value })} placeholder="Texto Frente" className={`w-full border-none rounded px-2 py-1 text-xs h-20 mb-2 bg-white ${activeTheme.classes.text}`} />
                    <input value={(settings.frontImage as string) || ''} onChange={e => onChange({ frontImage: e.target.value })} placeholder="URL Imagem" className={`w-full border-none rounded px-2 py-1 text-[10px] bg-white ${activeTheme.classes.text}`} />
                </div>
                <div className={`p-3 rounded-xl border-2 border-stone-800 bg-stone-900`}>
                    <label className="block text-[9px] font-black uppercase text-yellow-400 mb-2 opacity-80">Verso</label>
                    <textarea value={(settings.backText as string) || ''} onChange={e => onChange({ backText: e.target.value })} placeholder="Texto Verso" className="w-full bg-stone-800 text-white border-none rounded px-2 py-1 text-xs h-20 mb-2" />
                    <input value={(settings.backImage as string) || ''} onChange={e => onChange({ backImage: e.target.value })} placeholder="URL Imagem" className="w-full bg-stone-800 text-white border-none rounded px-2 py-1 text-[10px]" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center perspective-1000`}>
                <div className={`w-32 h-20 rounded-xl ${activeTheme.classes.accent} shadow-xl flex items-center justify-center text-white font-bold p-2 text-center text-xs transform hover:rotate-y-180 transition-transform duration-500 cursor-pointer`}>
                    {(settings.frontText as string) || 'Frente'}
                </div>
            </div>
        </div>
    );
};
