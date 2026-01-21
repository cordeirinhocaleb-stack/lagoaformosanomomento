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

export const RankingEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;
    const items = ((settings.rankingItems as string) || 'Item 1, Item 2, Item 3').split(',');

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Itens para Ranquear (separados por vírgula)</label>
            <textarea
                value={(settings.rankingItems as string) || 'Item 1, Item 2, Item 3'}
                onChange={e => onChange({ rankingItems: e.target.value })}
                className={`w-full border-none rounded-lg px-3 py-2 h-20 mb-4 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`}
            />

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors space-y-2`}>
                <span className={`text-[9px] font-black uppercase block mb-2 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'default'})</span>
                {items.map((item: string, i: number) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg bg-white/50 border border-black/5 ${activeTheme.classes.text}`}>
                        <div className={`w-6 h-6 rounded-full ${activeTheme.classes.accent} text-white flex items-center justify-center text-xs font-bold`}>{i + 1}</div>
                        <span className="text-xs font-medium">{item.trim()}</span>
                        <i className="fas fa-bars ml-auto opacity-20 text-xs"></i>
                    </div>
                ))}
            </div>
        </div>
    );
};
