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

export const CountdownEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Data e Hora Alvo</label>
            <input
                type="datetime-local"
                value={(settings.targetDate as string) || ''}
                onChange={e => onChange({ targetDate: e.target.value })}
                className={`w-full border-none rounded-lg px-3 py-2 mb-3 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`}
            />
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Mensagem Final (Opcional)</label>
            <input
                value={(settings.endMessage as string) || 'O evento começou!'}
                onChange={e => onChange({ endMessage: e.target.value })}
                className={`w-full border-none rounded-lg px-3 py-2 mb-4 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`}
                placeholder="Ex: O evento começou!"
            />

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors text-center`}>
                <span className={`text-[9px] font-black uppercase block mb-3 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'digital'})</span>
                <div className={`grid grid-cols-4 gap-2 mb-2 ${activeTheme.classes.text}`}>
                    {[10, 0, 59, 30].map((val, i) => (
                        <div key={i} className={`p-2 rounded-lg bg-black/5 flex flex-col items-center justify-center`}>
                            <span className="text-xl font-black">{val}</span>
                            <span className="text-[8px] uppercase opacity-50">{['D', 'H', 'M', 'S'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
