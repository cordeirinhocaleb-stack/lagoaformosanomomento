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

export const TestimonialEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Depoimento</label>
                    <textarea value={(settings.testimonialText as string) || '"Incrível!"'} onChange={e => onChange({ testimonialText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 h-20 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Autor</label>
                    <input value={(settings.authorName as string) || 'Maria S.'} onChange={e => onChange({ authorName: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Foto (URL)</label>
                    <input value={(settings.authorImage as string) || ''} onChange={e => onChange({ authorImage: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="https://" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors text-center italic`}>
                <p className={`text-lg mb-4 opacity-80 ${activeTheme.classes.text}`}>"{(settings.testimonialText as string) || 'Incrível!'}"</p>
                <div className="flex items-center justify-center gap-2 not-italic">
                    <div className={`w-8 h-8 rounded-full ${activeTheme.classes.accent} flex items-center justify-center text-white text-xs font-bold`}>
                        {settings.authorName ? (settings.authorName as string)[0] : 'M'}
                    </div>
                    <span className={`text-xs font-bold ${activeTheme.classes.text}`}>{(settings.authorName as string) || 'Maria S.'}</span>
                </div>
            </div>
        </div>
    );
};
