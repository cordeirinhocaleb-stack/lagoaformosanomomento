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

export const ComparisonEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção A (URL Imagem)</label>
                    <input value={(settings.imageA as string) || ''} onChange={e => onChange({ imageA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 text-xs mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} type="url" placeholder="https://..." />
                    <input value={(settings.labelA as string) || 'Opção A'} onChange={e => onChange({ labelA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome A" />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção B (URL Imagem)</label>
                    <input value={(settings.imageB as string) || ''} onChange={e => onChange({ imageB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 text-xs mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} type="url" placeholder="https://..." />
                    <input value={(settings.labelB as string) || 'Opção B'} onChange={e => onChange({ labelB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome B" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors grid grid-cols-2 gap-2 text-center`}>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square`}>
                    <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    <span className={`text-[10px] font-bold uppercase ${activeTheme.classes.text}`}>{(settings.labelA as string) || 'Opção A'}</span>
                </div>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square`}>
                    <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    <span className={`text-[10px] font-bold uppercase ${activeTheme.classes.text}`}>{(settings.labelB as string) || 'Opção B'}</span>
                </div>
            </div>
        </div>
    );
};
