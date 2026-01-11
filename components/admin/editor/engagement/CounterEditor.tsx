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

export const CounterEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Texto do Botão</label>
                    <input value={(settings.buttonText as string) || 'Apoiar'} onChange={e => onChange({ buttonText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji ao Clicar</label>
                    <input value={(settings.clickEmoji as string) || '💖'} onChange={e => onChange({ clickEmoji: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center`}>
                <button className={`px-6 py-2 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${activeTheme.classes.accent}`}>
                    <span>{(settings.clickEmoji as string) || '💖'}</span>
                    <span>{(settings.buttonText as string) || 'Apoiar'}</span>
                    <span className="bg-white/20 px-1.5 rounded text-[10px] ml-1">128</span>
                </button>
            </div>
        </div>
    );
};
