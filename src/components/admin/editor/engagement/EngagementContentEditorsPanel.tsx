
import React from 'react';
import { SubEditorProps } from './EngagementTypes';

export const RankingEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };
    const items = (s.rankingItems as string || 'Item 1, Item 2, Item 3').split(',');

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Itens para Ranquear (separados por vírgula)</label>
            <textarea
                value={(s.rankingItems as string) || 'Item 1, Item 2, Item 3'}
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

export const CountdownEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Data e Hora Alvo</label>
            <input
                type="datetime-local"
                value={(s.targetDate as string) || ''}
                onChange={e => onChange({ targetDate: e.target.value })}
                className={`w-full border-none rounded-lg px-3 py-2 mb-3 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`}
            />
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Mensagem Final (Opcional)</label>
            <input
                value={(s.endMessage as string) || 'O evento começou!'}
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

export const TimelineEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    interface TimelineEvent { date: string; title: string; description: string; }
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };
    const events = (s.timelineEvents as TimelineEvent[]) || [{ date: '2024', title: 'Início', description: 'Descrição aqui' }];
    const updateEvent = (idx: number, field: string, val: string) => {
        const newEvents = [...events];
        newEvents[idx] = { ...newEvents[idx], [field]: val };
        onChange({ timelineEvents: newEvents });
    };
    const addEvent = () => onChange({ timelineEvents: [...events, { date: '', title: '', description: '' }] });
    const removeEvent = (idx: number) => onChange({ timelineEvents: events.filter((_val, i) => i !== idx) });

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

export const AccordionEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    interface AccordionItem { title: string; content: string; }
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };
    const items = (s.accordionItems as AccordionItem[]) || [{ title: 'Pergunta 1', content: 'Resposta 1' }];
    const updateItem = (idx: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: val } as AccordionItem;
        onChange({ accordionItems: newItems });
    };
    const addItem = () => onChange({ accordionItems: [...items, { title: '', content: '' }] });
    const removeItem = (idx: number) => onChange({ accordionItems: items.filter((_val, i) => i !== idx) });

    return (
        <div className="space-y-3">
            <label className={`block text-[9px] font-black uppercase opacity-60 ${activeTheme.classes.text}`}>Itens do Acordeão</label>
            {items.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-xl border relative mb-2 ${activeTheme.classes.secondary} bg-white/50`}>
                    <button onClick={() => removeItem(idx)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-500"><i className="fas fa-times"></i></button>
                    <input value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} placeholder="Título/Pergunta" className={`w-full border-none rounded px-2 py-1 text-xs font-bold mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                    <textarea value={item.content} onChange={e => updateItem(idx, 'content', e.target.value)} placeholder="Conteúdo/Resposta" className={`w-full border-none rounded px-2 py-1 text-xs h-16 resize-none ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            ))}
            <button onClick={addItem} className={`w-full py-2 border-2 border-dashed rounded-xl text-xs font-bold hover:border-current hover:opacity-100 opacity-60 transition-colors ${activeTheme.classes.secondary} ${activeTheme.classes.text}`}>+ Adicionar Item</button>

            {/* Preview */}
            <div className={`mt-4 p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <div className={`p-2 rounded-lg bg-black/5 flex justify-between items-center mb-1`}>
                    <span className={`text-xs font-bold ${activeTheme.classes.text}`}>{items[0]?.title || 'Pergunta 1'}</span>
                    <i className={`fas fa-chevron-down opacity-50 ${activeTheme.classes.text}`}></i>
                </div>
                <div className={`p-2 text-[10px] opacity-70 ${activeTheme.classes.text}`}>
                    {items[0]?.content || 'Resposta 1...'}
                </div>
            </div>
        </div>
    );
};

export const CTAEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Texto do Botão</label>
                    <input value={(s.ctaText as string) || 'Clique Aqui'} onChange={e => onChange({ ctaText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Link de Destino</label>
                    <input value={(s.ctaLink as string) || ''} onChange={e => onChange({ ctaLink: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="https://" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center`}>
                <button className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all text-sm ${activeTheme.classes.accent}`}>
                    {(s.ctaText as string) || 'Clique Aqui'} <i className="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
    );
};

export const TestimonialEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Depoimento</label>
                    <textarea value={(s.testimonialText as string) || '"Incrível!"'} onChange={e => onChange({ testimonialText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 h-20 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Autor</label>
                    <input value={(s.authorName as string) || 'Maria S.'} onChange={e => onChange({ authorName: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Foto (URL)</label>
                    <input value={(s.authorImage as string) || ''} onChange={e => onChange({ authorImage: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="https://" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors text-center italic`}>
                <p className={`text-lg mb-4 opacity-80 ${activeTheme.classes.text}`}>"{(s.testimonialText as string) || 'Incrível!'}"</p>
                <div className="flex items-center justify-center gap-2 not-italic">
                    <div className={`w-8 h-8 rounded-full ${activeTheme.classes.accent} flex items-center justify-center text-white text-xs font-bold`}>
                        {(s.authorName as string) ? (s.authorName as string)[0] : 'M'}
                    </div>
                    <span className={`text-xs font-bold ${activeTheme.classes.text}`}>{(s.authorName as string) || 'Maria S.'}</span>
                </div>
            </div>
        </div>
    );
};

export const CounterEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const s = settings as Record<string, unknown>;
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } };

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Texto do Botão</label>
                    <input value={(s.buttonText as string) || 'Apoiar'} onChange={e => onChange({ buttonText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji ao Clicar</label>
                    <input value={(s.clickEmoji as string) || '💖'} onChange={e => onChange({ clickEmoji: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center`}>
                <button className={`px-6 py-2 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${activeTheme.classes.accent}`}>
                    <span>{(s.clickEmoji as string) || '💖'}</span>
                    <span>{(s.buttonText as string) || 'Apoiar'}</span>
                    <span className="bg-white/20 px-1.5 rounded text-[10px] ml-1">128</span>
                </button>
            </div>
        </div>
    );
};
