import React from 'react';
import { SubEditorProps } from './SubEditorProps';
import { ColorTheme } from '../EngagementColors';

export const ReactionEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as ColorTheme;
    const emojis = (settings.reactionEmojis || '👍,❤️,😂,😮,😢,😡').toString().split(',');

    return (
        <div>
            <div className="mb-4">
                <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Emojis Disponíveis (separados por vírgula)</label>
                <input
                    value={settings.reactionEmojis || '👍,❤️,😂,😮,😢,😡'}
                    onChange={e => onChange({ reactionEmojis: e.target.value })}
                    className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`}
                />
            </div>

            {/* Preview */}
            <div className={`p-3 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <span className={`text-[9px] font-black uppercase block mb-2 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'default'})</span>
                <div className="flex justify-between gap-1 overflow-x-auto pb-2">
                    {emojis.map((emoji: string, i: number) => (
                        <div key={i} className={`w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:scale-110 transition-transform cursor-pointer ${activeTheme.classes.text}`}>
                            {emoji.trim()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
