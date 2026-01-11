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

export const CTAEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Texto do Botão</label>
                    <input value={(settings.ctaText as string) || 'Clique Aqui'} onChange={e => onChange({ ctaText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Link de Destino</label>
                    <input value={(settings.ctaLink as string) || ''} onChange={e => onChange({ ctaLink: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="https://" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center`}>
                <button className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all text-sm ${activeTheme.classes.accent}`}>
                    {(settings.ctaText as string) || 'Clique Aqui'} <i className="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
    );
};
