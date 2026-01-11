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

interface TimelineEvent {
    date: string;
    title: string;
    description: string;
}

export const TimelineEditor = ({ settings, style: _style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || DEFAULT_THEME;
    const events = (settings.timelineEvents as TimelineEvent[]) || [{ date: '2024', title: 'Início', description: 'Descrição aqui' }];

    const updateEvent = (idx: number, field: keyof TimelineEvent, val: string) => {
        const newEvents = [...events];
        newEvents[idx] = { ...newEvents[idx], [field]: val };
        onChange({ timelineEvents: newEvents });
    };
    const addEvent = () => onChange({ timelineEvents: [...events, { date: '', title: '', description: '' }] });
    const removeEvent = (idx: number) => onChange({ timelineEvents: events.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-3">
            <label className={`block text-[9px] font-black uppercase opacity-60 ${activeTheme.classes.text}`}>Eventos da Linha do Tempo</label>
            {events.map((ev, idx) => (
                <div key={idx} className={`p-3 rounded-xl border relative mb-2 ${activeTheme.classes.secondary} bg-white/50`}>
                    <button onClick={() => removeEvent(idx)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-500"><i className="fas fa-times"></i></button>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <input value={ev.date} onChange={e => updateEvent(idx, 'date', e.target.value)} placeholder="Data/Ano" className={`col-span-1 border-none rounded px-2 py-1 text-xs ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                        <input value={ev.title} onChange={e => updateEvent(idx, 'title', e.target.value)} placeholder="Título" className={`col-span-2 border-none rounded px-2 py-1 text-xs font-bold ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                    </div>
                    <textarea value={ev.description} onChange={e => updateEvent(idx, 'description', e.target.value)} placeholder="Descrição" className={`w-full border-none rounded px-2 py-1 text-xs h-16 resize-none ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            ))}
            <button onClick={addEvent} className={`w-full py-2 border-2 border-dashed rounded-xl text-xs font-bold hover:border-current hover:opacity-100 opacity-60 transition-colors ${activeTheme.classes.secondary} ${activeTheme.classes.text}`}>+ Adicionar Evento</button>

            {/* Preview */}
            <div className={`mt-4 p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${activeTheme.classes.accent}`}></div>
                        <div className={`w-0.5 h-full ${activeTheme.classes.accent} opacity-20`}></div>
                    </div>
                    <div className="pb-4">
                        <span className={`text-[10px] font-bold ${activeTheme.classes.accent} block`}>{events[0]?.date || '2024'}</span>
                        <h4 className={`text-sm font-bold ${activeTheme.classes.text}`}>{events[0]?.title || 'Título'}</h4>
                        <p className={`text-[10px] opacity-70 ${activeTheme.classes.text} line-clamp-2`}>{events[0]?.description || '...'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
