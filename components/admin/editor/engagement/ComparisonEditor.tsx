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

import { QuickUploader } from './QuickUploader';

export const ComparisonEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção A</label>
                    <div className="mb-2">
                        <QuickUploader
                            onUpload={(url) => onChange({ imageA: url })}
                            currentUrl={(settings.imageA as string)}
                            label="Imagem A"
                            compact={false}
                        />
                    </div>
                    <input value={(settings.labelA as string) || 'Opção A'} onChange={e => onChange({ labelA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome A" />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção B</label>
                    <div className="mb-2">
                        <QuickUploader
                            onUpload={(url) => onChange({ imageB: url })}
                            currentUrl={(settings.imageB as string)}
                            label="Imagem B"
                            compact={false}
                        />
                    </div>
                    <input value={(settings.labelB as string) || 'Opção B'} onChange={e => onChange({ labelB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome B" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors grid grid-cols-2 gap-2 text-center`}>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square relative overflow-hidden`}>
                    {(settings.imageA as string) ? (
                        <img src={settings.imageA as string} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    ) : (
                        <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    )}
                    <span className={`text-[10px] font-bold uppercase relative z-10 ${activeTheme.classes.text}`}>{(settings.labelA as string) || 'Opção A'}</span>
                </div>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square relative overflow-hidden`}>
                    {(settings.imageB as string) ? (
                        <img src={settings.imageB as string} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    ) : (
                        <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    )}
                    <span className={`text-[10px] font-bold uppercase relative z-10 ${activeTheme.classes.text}`}>{(settings.labelB as string) || 'Opção B'}</span>
                </div>
            </div>
        </div>
    );
};
