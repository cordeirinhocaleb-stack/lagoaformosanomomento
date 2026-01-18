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

export const PollEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    // Normaliza opções antigas (string) para objetos
    const rawOptions = (settings.options as any[]) || ['Sim', 'Não'];
    const options = rawOptions.map(opt => typeof opt === 'string' ? { label: opt } : opt);

    const updateOption = (idx: number, field: string, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = { ...newOpts[idx], [field]: val };
        onChange({ options: newOpts });
    };

    const addOption = () => onChange({ options: [...options, { label: 'Nova Opção' }] });
    const removeOption = (idx: number) => onChange({ options: options.filter((_, i) => i !== idx) });

    const activeTheme = theme || DEFAULT_THEME;

    return (
        <div>
            <label className="block text-[9px] font-black uppercase text-zinc-400 mb-2">Opções de Resposta</label>
            <div className="space-y-2">
                {options.map((opt: any, idx: number) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <QuickUploader
                            onUpload={(url) => updateOption(idx, 'image', url)}
                            currentUrl={opt.image}
                            compact
                        />
                        <input
                            value={opt.label}
                            onChange={(e) => updateOption(idx, 'label', e.target.value)}
                            className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                            placeholder={`Opção ${idx + 1}`}
                        />
                        <button
                            onClick={() => removeOption(idx)}
                            className="text-zinc-300 hover:text-red-500 px-2"
                            title="Remover Opção"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                ))}
                <button onClick={addOption} className={`text-[10px] font-bold hover:underline ${activeTheme.classes.text.replace('text-', 'text-opacity-80 text-')}`}>+ Adicionar Opção</button>
            </div>


            {/* Visual Preview based on Style & Theme */}
            <div className={`mt-4 transition-all duration-300 overflow-hidden ${activeTheme.classes.wrapper}`}>
                {/* Background Pattern */}
                {activeTheme.classes.backgroundPattern && (
                    <div className={activeTheme.classes.backgroundPattern}></div>
                )}

                <div className={`relative z-10 ${activeTheme.classes.container || 'flex flex-col'}`}>
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={activeTheme.classes.badge || `text-[9px] px-2 py-0.5 rounded ${activeTheme.classes.accent} text-white font-bold`}>
                                ENQUETE
                            </span>
                        </div>
                        {activeTheme.id !== 'poll_economy' && (
                            <h3 className={`text-sm md:text-base font-bold leading-tight ${activeTheme.classes.header || activeTheme.classes.text}`}>
                                {(settings.question as string) || 'Exemplo de Pergunta?'}
                            </h3>
                        )}
                        {activeTheme.id === 'poll_economy' && (
                            <h3 className={`text-sm md:text-base font-bold leading-tight ${activeTheme.classes.header || activeTheme.classes.text}`}>
                                {(settings.question as string) || 'Exemplo de Pergunta?'}
                            </h3>
                        )}
                    </div>

                    <div className="p-4 pt-0">
                        {(!style || style === 'bars') && (
                            <div className="space-y-2 select-none pointer-events-none">
                                {options.slice(0, 3).map((opt: any, i: number) => (
                                    <div key={i} className={`relative h-12 rounded-lg overflow-hidden flex items-center px-4 ${activeTheme.classes.option || 'bg-white border border-zinc-200'}`}>
                                        <div
                                            className={activeTheme.classes.barStyle || `bg-zinc-200 h-full absolute left-0 top-0 opacity-20`}
                                            style={{
                                                width: `${60 - (i * 15)}%`,
                                                position: activeTheme.classes.barStyle ? 'absolute' : 'absolute',
                                                left: 0, top: 0, bottom: 0
                                            }}
                                        ></div>
                                        {opt.image && (
                                            <div className="w-8 h-8 rounded-full bg-cover bg-center mr-3 relative z-10 border border-white/50" style={{ backgroundImage: `url(${opt.image})` }}></div>
                                        )}
                                        <span className={`relative z-10 text-xs font-bold ${activeTheme.classes.text}`}>{opt.label || `Opção ${i + 1}`}</span>
                                        <span className={`relative z-10 ml-auto text-[10px] font-bold ${activeTheme.classes.text} opacity-60`}>{60 - (i * 15)}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {style === 'circles' && (
                    <div className="flex justify-center gap-4 py-2 select-none pointer-events-none opacity-90">
                        {options.slice(0, 3).map((opt: any, i: number) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <div className={`w-12 h-12 rounded-full border-4 ${activeTheme.classes.secondary} border-t-current flex items-center justify-center text-xs font-bold bg-white ${activeTheme.classes.text} overflow-hidden relative`}>
                                    {opt.image ? (
                                        <img src={opt.image} className="w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <span>{60 - (i * 15)}%</span>
                                    )}
                                </div>
                                <span className={`text-[9px] font-medium truncate max-w-[60px] ${activeTheme.classes.text}`}>{opt.label || `Opção ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}

                {style === 'cards' && (
                    <div className="grid grid-cols-2 gap-2 select-none pointer-events-none opacity-90">
                        {options.slice(0, 4).map((opt: any, i: number) => (
                            <div key={i} className={`aspect-video bg-white border ${activeTheme.classes.secondary} rounded-lg flex flex-col items-center justify-center p-2 text-center shadow-sm`}>
                                <i className={`fas fa-check-circle mb-1 text-xs ${activeTheme.classes.text} opacity-50`}></i>
                                <span className={`text-[9px] font-bold leading-tight line-clamp-2 ${activeTheme.classes.text}`}>{opt.label || `Opção ${i + 1}`}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
