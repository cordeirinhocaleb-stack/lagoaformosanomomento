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

export const ThermometerEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Configuração do Termômetro</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <input value={(settings.minTemp as string) || 'Gelo'} onChange={e => onChange({ minTemp: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Ex: Gelo" />
                <input value={(settings.maxTemp as string) || 'Fogo'} onChange={e => onChange({ maxTemp: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Ex: Fogo" />
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex items-center gap-4`}>
                <div className="flex-1 text-right text-xs font-bold opacity-60">{(settings.minTemp as string) || 'Gelo'}</div>
                <div className="w-full max-w-[150px] h-3 bg-black/5 rounded-full relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 ${activeTheme.classes.accent}`} style={{ width: '70%' }}></div>
                </div>
                <div className="flex-1 text-left text-xs font-bold opacity-60">{(settings.maxTemp as string) || 'Fogo'}</div>
            </div>
        </div>
    );
};
