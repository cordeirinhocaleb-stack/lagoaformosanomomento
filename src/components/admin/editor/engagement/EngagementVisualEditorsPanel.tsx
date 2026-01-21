
import React from 'react';
import { SubEditorProps } from './EngagementTypes';

export const SliderEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };
    // Mock for preview
    const previewVal = 50;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji Esquerda</label>
                    <input value={(s.leftLabel as string) || '👎'} onChange={e => onChange({ leftLabel: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji Direita</label>
                    <input value={(s.rightLabel as string) || '👍'} onChange={e => onChange({ rightLabel: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <span className={`text-[9px] font-black uppercase block mb-3 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'default'})</span>
                <div className="flex items-center gap-3">
                    <span className="text-xl filter grayscale opacity-80">{(s.leftLabel as string) || '👎'}</span>
                    <div className="flex-1 h-2 bg-black/5 rounded-full relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 ${activeTheme.classes.accent} rounded-full`} style={{ width: `${previewVal}%` }}></div>
                        <div className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md top-1/2 -translate-y-1/2 ${activeTheme.classes.accent}`} style={{ left: `${previewVal}%` }}></div>
                    </div>
                    <span className="text-xl filter grayscale opacity-80">{(s.rightLabel as string) || '👍'}</span>
                </div>
            </div>
        </div>
    );
};

export const ReactionEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };
    const emojis = ((s.reactionEmojis as string) || '👍,❤️,😂,😮,😢,😡').split(',');

    return (
        <div>
            <div className="mb-4">
                <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Emojis Disponíveis (separados por vírgula)</label>
                <input
                    value={(s.reactionEmojis as string) || '👍,❤️,😂,😮,😢,😡'}
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

export const ComparisonEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção A (URL Imagem)</label>
                    <input value={(s.imageA as string) || ''} onChange={e => onChange({ imageA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 text-xs mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} type="url" placeholder="https://..." />
                    <input value={(s.labelA as string) || 'Opção A'} onChange={e => onChange({ labelA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome A" />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção B (URL Imagem)</label>
                    <input value={(s.imageB as string) || ''} onChange={e => onChange({ imageB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 text-xs mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} type="url" placeholder="https://..." />
                    <input value={(s.labelB as string) || 'Opção B'} onChange={e => onChange({ labelB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome B" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors grid grid-cols-2 gap-2 text-center`}>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square`}>
                    <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    <span className={`text-[10px] font-bold uppercase ${activeTheme.classes.text}`}>{(s.labelA as string) || 'Opção A'}</span>
                </div>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square`}>
                    <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    <span className={`text-[10px] font-bold uppercase ${activeTheme.classes.text}`}>{(s.labelB as string) || 'Opção B'}</span>
                </div>
            </div>
        </div>
    );
};

export const ThermometerEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Configuração do Termômetro</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <input value={(s.minTemp as string) || 'Gelo'} onChange={e => onChange({ minTemp: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Ex: Gelo" />
                <input value={(s.maxTemp as string) || 'Fogo'} onChange={e => onChange({ maxTemp: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Ex: Fogo" />
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex items-center gap-4`}>
                <div className="flex-1 text-right text-xs font-bold opacity-60">{(s.minTemp as string) || 'Gelo'}</div>
                <div className="w-full max-w-[150px] h-3 bg-black/5 rounded-full relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 ${activeTheme.classes.accent}`} style={{ width: '70%' }}></div>
                </div>
                <div className="flex-1 text-left text-xs font-bold opacity-60">{(s.maxTemp as string) || 'Fogo'}</div>
            </div>
        </div>
    );
};

export const FlipCardEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-xl border ${activeTheme.classes.secondary} bg-white/50`}>
                    <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Frente</label>
                    <textarea value={(s.frontText as string) || ''} onChange={e => onChange({ frontText: e.target.value })} placeholder="Texto Frente" className={`w-full border-none rounded px-2 py-1 text-xs h-20 mb-2 bg-white ${activeTheme.classes.text}`} />
                    <input value={(s.frontImage as string) || ''} onChange={e => onChange({ frontImage: e.target.value })} placeholder="URL Imagem" className={`w-full border-none rounded px-2 py-1 text-[10px] bg-white ${activeTheme.classes.text}`} />
                </div>
                <div className={`p-3 rounded-xl border-2 border-stone-800 bg-stone-900`}>
                    <label className="block text-[9px] font-black uppercase text-yellow-400 mb-2 opacity-80">Verso</label>
                    <textarea value={(s.backText as string) || ''} onChange={e => onChange({ backText: e.target.value })} placeholder="Texto Verso" className="w-full bg-stone-800 text-white border-none rounded px-2 py-1 text-xs h-20 mb-2" />
                    <input value={(s.backImage as string) || ''} onChange={e => onChange({ backImage: e.target.value })} placeholder="URL Imagem" className="w-full bg-stone-800 text-white border-none rounded px-2 py-1 text-[10px]" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center perspective-1000`}>
                <div className={`w-32 h-20 rounded-xl ${activeTheme.classes.accent} shadow-xl flex items-center justify-center text-white font-bold p-2 text-center text-xs transform hover:rotate-y-180 transition-transform duration-500 cursor-pointer`}>
                    {(s.frontText as string) || 'Frente'}
                </div>
            </div>
        </div>
    );
};
