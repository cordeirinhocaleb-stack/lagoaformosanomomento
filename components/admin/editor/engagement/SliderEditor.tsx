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

export const SliderEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;
    // Mock for preview
    const previewVal = 50;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji Esquerda</label>
                    <input value={(settings.leftLabel as string) || '👎'} onChange={e => onChange({ leftLabel: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji Direita</label>
                    <input value={(settings.rightLabel as string) || '👍'} onChange={e => onChange({ rightLabel: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <span className={`text-[9px] font-black uppercase block mb-3 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'default'})</span>
                <div className="flex items-center gap-3">
                    <span className="text-xl filter grayscale opacity-80">{settings.leftLabel || '👎'}</span>
                    <div className="flex-1 h-2 bg-black/5 rounded-full relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 ${activeTheme.classes.accent} rounded-full`} style={{ width: `${previewVal}%` }}></div>
                        <div className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md top-1/2 -translate-y-1/2 ${activeTheme.classes.accent}`} style={{ left: `${previewVal}%` }}></div>
                    </div>
                    <span className="text-xl filter grayscale opacity-80">{settings.rightLabel || '👍'}</span>
                </div>
            </div>
        </div>
    );
};
