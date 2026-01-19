
import React from 'react';
import { SubEditorProps } from './EngagementTypes';

export const PollEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const options = s.options || ['Sim', 'Não'];

    const updateOption = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        onChange({ options: newOpts });
    };

    const addOption = () => onChange({ options: [...options, 'Nova Opção'] });
    const removeOption = (idx: number) => onChange({ options: options.filter((_val: string, i: number) => i !== idx) });

    const activeTheme = theme || {
        classes: {
            accent: 'bg-blue-500',
            text: 'text-zinc-600',
            wrapper: 'bg-white',
            secondary: 'border-zinc-200'
        }
    };

    return (
        <div>
            <label className="block text-[9px] font-black uppercase text-zinc-400 mb-2">Opções de Resposta</label>
            <div className="space-y-2">
                {options.map((opt: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                        <input
                            value={opt}
                            onChange={(e) => updateOption(idx, e.target.value)}
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <button onClick={() => removeOption(idx)} className="text-zinc-300 hover:text-red-500 px-2"><i className="fas fa-trash"></i></button>
                    </div>
                ))}
                <button onClick={addOption} className={`text-[10px] font-bold hover:underline ${activeTheme.classes.text.replace('text-', 'text-opacity-80 text-')}`}>+ Adicionar Opção</button>
            </div>

            {/* Visual Preview based on Style & Theme */}
            <div className={`mt-4 p-3 rounded-xl border ${activeTheme.classes.wrapper} transition-colors duration-300`}>
                <span className={`text-[9px] font-black uppercase block mb-2 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'bars'})</span>

                {(!style || style === 'bars') && (
                    <div className="space-y-2 select-none pointer-events-none opacity-90">
                        {options.slice(0, 3).map((opt: string, i: number) => (
                            <div key={i} className="relative h-8 bg-white/50 rounded-lg overflow-hidden flex items-center px-3 border border-black/5">
                                <div className={`absolute top-0 bottom-0 left-0 ${activeTheme.classes.accent} opacity-20`} style={{ width: `${60 - (i * 15)}%` }}></div>
                                <div className={`absolute top-0 bottom-0 left-0 ${activeTheme.classes.accent}`} style={{ width: '4px' }}></div>
                                <span className={`relative z-10 text-[10px] font-bold ${activeTheme.classes.text}`}>{opt || `Opção ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}

                {style === 'circles' && (
                    <div className="flex justify-center gap-4 py-2 select-none pointer-events-none opacity-90">
                        {options.slice(0, 3).map((opt: string, i: number) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-12 h-12 rounded-full border-4 ${activeTheme.classes.secondary} border-t-current flex items-center justify-center text-xs font-bold bg-white ${activeTheme.classes.text}`}>
                                    {60 - (i * 15)}%
                                </div>
                                <span className={`text-[9px] font-medium truncate max-w-[60px] ${activeTheme.classes.text}`}>{opt || `Opção ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}

                {style === 'cards' && (
                    <div className="grid grid-cols-2 gap-2 select-none pointer-events-none opacity-90">
                        {options.slice(0, 4).map((opt: string, i: number) => (
                            <div key={i} className={`aspect-video bg-white border ${activeTheme.classes.secondary} rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-sm`}>
                                <i className={`fas fa-check-circle mb-1 text-xs ${activeTheme.classes.text} opacity-50`}></i>
                                <span className={`text-[9px] font-bold leading-tight line-clamp-2 ${activeTheme.classes.text}`}>{opt || `Opção ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const QuizEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    return (
        <div>
            <PollEditor settings={settings} style={style} theme={theme} onChange={onChange} />
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <label className="block text-[9px] font-black uppercase text-green-600 mb-2">Resposta Correta (Índice 0-Based)</label>
                <input
                    type="number"
                    value={s.correctOptionIndex || 0}
                    onChange={(e) => onChange({ correctOptionIndex: parseInt(e.target.value) })}
                    className="w-20 bg-white border border-green-200 rounded-lg px-3 py-2"
                />
            </div>
        </div>
    );
};
