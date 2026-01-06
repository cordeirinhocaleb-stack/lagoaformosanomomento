import React from 'react';
import { ContentBlock } from '../../types';
import { getEngagementStyles } from './editor/EngagementStyles';
import { getEngagementColors, ColorTheme } from './editor/EngagementColors';

// Tipos de Engajamento
type EngagementType =
    | 'poll' | 'quiz' | 'slider' | 'comparison'
    | 'reaction' | 'counter' | 'thermometer' | 'ranking'
    | 'countdown' | 'timeline' | 'flipcard' | 'accordion' | 'cta' | 'testimonial';

// Estilos Visuais
type EngagementStyle = 'default' | 'modern' | 'retro' | 'neon' | 'bars' | 'circles' | 'cards' | 'school' | 'gameshow' | 'minimal' | 'digital' | 'flip' | 'list' | 'podium' | 'grid' | 'carousel' | 'versus';

const ENGAGEMENT_TYPES: { id: EngagementType; label: string; icon: string; description: string }[] = [
    { id: 'poll', label: 'Enquete', icon: 'fa-poll', description: 'Votação simples com barras de progresso.' },
    { id: 'quiz', label: 'Quiz', icon: 'fa-question-circle', description: 'Pergunta com resposta correta e feedback.' },
    { id: 'slider', label: 'Termômetro', icon: 'fa-sliders-h', description: 'Usuário desliza para dar nota de 0 a 100.' },
    { id: 'comparison', label: 'Comparação', icon: 'fa-balance-scale', description: 'Escolha entre duas opções com imagens.' },
    { id: 'reaction', label: 'Reações', icon: 'fa-smile', description: 'Barra de emojis para reagir ao conteúdo.' },
    { id: 'counter', label: 'Apoio', icon: 'fa-hand-holding-heart', description: 'Contador de cliques.' },
    { id: 'thermometer', label: 'Medidor', icon: 'fa-temperature-high', description: 'Barra vertical para medir intensidade.' },
    { id: 'ranking', label: 'Ranking', icon: 'fa-list-ol', description: 'Lista onde o usuário ordena itens.' },
    { id: 'countdown', label: 'Cronômetro', icon: 'fa-stopwatch', description: 'Contagem regressiva para um evento.' },
    { id: 'timeline', label: 'Linha do Tempo', icon: 'fa-stream', description: 'Sequência cronológica de eventos.' },
    { id: 'flipcard', label: 'Flip Card', icon: 'fa-exchange-alt', description: 'Cartão que gira ao clicar (Frente/Verso).' },
    { id: 'accordion', label: 'Acordeão', icon: 'fa-chevron-down', description: 'Conteúdo expansível para FAQs.' },
    { id: 'cta', label: 'Chamada (CTA)', icon: 'fa-bullhorn', description: 'Botão de ação destacado com link.' },
    { id: 'testimonial', label: 'Depoimento', icon: 'fa-quote-right', description: 'Citação com foto e nome.' }, // Novo
];

// --- Sub-Editors ---

interface SubEditorProps {
    settings: any;
    style?: string;
    theme?: ColorTheme; // Make optional to avoid initial break, but logic assumes it's there
    onChange: (s: any) => void;
}

const PollEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const options = settings.options || ['Sim', 'Não'];

    const updateOption = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        onChange({ options: newOpts });
    };

    const addOption = () => onChange({ options: [...options, 'Nova Opção'] });
    const removeOption = (idx: number) => onChange({ options: options.filter((_: any, i: number) => i !== idx) });

    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white' } } as any;

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

const QuizEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    return (
        <div>
            <PollEditor settings={settings} style={style} theme={theme} onChange={onChange} />
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                <label className="block text-[9px] font-black uppercase text-green-600 mb-2">Resposta Correta (Índice 0-Based)</label>
                <input
                    type="number"
                    value={settings.correctOptionIndex || 0}
                    onChange={(e) => onChange({ correctOptionIndex: parseInt(e.target.value) })}
                    className="w-20 bg-white border border-green-200 rounded-lg px-3 py-2"
                />
            </div>
        </div>
    );
};

const SliderEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;
    // Mock for preview
    const previewVal = 50;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji Esquerda</label>
                    <input value={settings.leftLabel || '👎'} onChange={e => onChange({ leftLabel: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji Direita</label>
                    <input value={settings.rightLabel || '👍'} onChange={e => onChange({ rightLabel: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors`}>
                <span className={`text-[9px] font-black uppercase block mb-3 opacity-60 ${activeTheme.classes.text}`}>Preview ({style || 'default'})</span>
                <div className="flex items-center gap-3">
                    <span className="text-xl filter grayscale opacity-80">{settings.leftLabel || '👎'}</span>
                    <div className="flex-1 h-2 bg-black/5 rounded-full relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 ${activeTheme.classes.accent} rounded-full`} style={{ width: `${previewVal}%` }}></div>
                        <div className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md top-1/2 -translate-y-1/2 ${activeTheme.classes.accent}`} style={{ left: `${previewVal}%` }}></div>
                    </div>
                    <span className="text-xl filter grayscale opacity-80">{settings.rightLabel || '👍'}</span>
                </div>
            </div>
        </div>
    );
};

const ReactionEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;
    const emojis = (settings.reactionEmojis || '👍,❤️,😂,😮,😢,😡').split(',');

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

const CounterEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Texto do Botão</label>
                    <input value={settings.buttonText || 'Apoiar'} onChange={e => onChange({ buttonText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Emoji ao Clicar</label>
                    <input value={settings.clickEmoji || '💖'} onChange={e => onChange({ clickEmoji: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center`}>
                <button className={`px-6 py-2 rounded-full font-bold text-white shadow-lg transform hover:scale-105 transition-all flex items-center gap-2 ${activeTheme.classes.accent}`}>
                    <span>{settings.clickEmoji || '💖'}</span>
                    <span>{settings.buttonText || 'Apoiar'}</span>
                    <span className="bg-white/20 px-1.5 rounded text-[10px] ml-1">128</span>
                </button>
            </div>
        </div>
    );
};

const ComparisonEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção A (URL Imagem)</label>
                    <input value={settings.imageA || ''} onChange={e => onChange({ imageA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 text-xs mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} type="url" placeholder="https://..." />
                    <input value={settings.labelA || 'Opção A'} onChange={e => onChange({ labelA: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome A" />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Opção B (URL Imagem)</label>
                    <input value={settings.imageB || ''} onChange={e => onChange({ imageB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 text-xs mb-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} type="url" placeholder="https://..." />
                    <input value={settings.labelB || 'Opção B'} onChange={e => onChange({ labelB: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Nome B" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors grid grid-cols-2 gap-2 text-center`}>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square`}>
                    <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    <span className={`text-[10px] font-bold uppercase ${activeTheme.classes.text}`}>{settings.labelA || 'Opção A'}</span>
                </div>
                <div className={`p-3 rounded-lg border-2 ${activeTheme.classes.secondary} border-dashed flex flex-col items-center justify-center aspect-square`}>
                    <i className={`fas fa-image text-2xl mb-2 opacity-30 ${activeTheme.classes.text}`}></i>
                    <span className={`text-[10px] font-bold uppercase ${activeTheme.classes.text}`}>{settings.labelB || 'Opção B'}</span>
                </div>
            </div>
        </div>
    );
};

const ThermometerEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Configuração do Termômetro</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <input value={settings.minTemp || 'Gelo'} onChange={e => onChange({ minTemp: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Ex: Gelo" />
                <input value={settings.maxTemp || 'Fogo'} onChange={e => onChange({ maxTemp: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="Ex: Fogo" />
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex items-center gap-4`}>
                <div className="flex-1 text-right text-xs font-bold opacity-60">{settings.minTemp || 'Gelo'}</div>
                <div className="w-full max-w-[150px] h-3 bg-black/5 rounded-full relative overflow-hidden">
                    <div className={`absolute left-0 top-0 bottom-0 ${activeTheme.classes.accent}`} style={{ width: '70%' }}></div>
                </div>
                <div className="flex-1 text-left text-xs font-bold opacity-60">{settings.maxTemp || 'Fogo'}</div>
            </div>
        </div>
    );
};

const RankingEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;
    const items = (settings.rankingItems || 'Item 1, Item 2, Item 3').split(',');

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Itens para Ranquear (separados por vírgula)</label>
            <textarea
                value={settings.rankingItems || 'Item 1, Item 2, Item 3'}
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

const CountdownEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Data e Hora Alvo</label>
            <input
                type="datetime-local"
                value={settings.targetDate || ''}
                onChange={e => onChange({ targetDate: e.target.value })}
                className={`w-full border-none rounded-lg px-3 py-2 mb-3 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`}
            />
            <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Mensagem Final (Opcional)</label>
            <input
                value={settings.endMessage || 'O evento começou!'}
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

const TimelineEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;
    const events = settings.timelineEvents || [{ date: '2024', title: 'Início', description: 'Descrição aqui' }];
    const updateEvent = (idx: number, field: string, val: string) => {
        const newEvents = [...events];
        newEvents[idx] = { ...newEvents[idx], [field]: val };
        onChange({ timelineEvents: newEvents });
    };
    const addEvent = () => onChange({ timelineEvents: [...events, { date: '', title: '', description: '' }] });
    const removeEvent = (idx: number) => onChange({ timelineEvents: events.filter((_: any, i: number) => i !== idx) });

    return (
        <div className="space-y-3">
            <label className={`block text-[9px] font-black uppercase opacity-60 ${activeTheme.classes.text}`}>Eventos da Linha do Tempo</label>
            {events.map((ev: any, idx: number) => (
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

const FlipCardEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-xl border ${activeTheme.classes.secondary} bg-white/50`}>
                    <label className={`block text-[9px] font-black uppercase mb-2 opacity-60 ${activeTheme.classes.text}`}>Frente</label>
                    <textarea value={settings.frontText || ''} onChange={e => onChange({ frontText: e.target.value })} placeholder="Texto Frente" className={`w-full border-none rounded px-2 py-1 text-xs h-20 mb-2 bg-white ${activeTheme.classes.text}`} />
                    <input value={settings.frontImage || ''} onChange={e => onChange({ frontImage: e.target.value })} placeholder="URL Imagem" className={`w-full border-none rounded px-2 py-1 text-[10px] bg-white ${activeTheme.classes.text}`} />
                </div>
                <div className={`p-3 rounded-xl border-2 border-stone-800 bg-stone-900`}>
                    <label className="block text-[9px] font-black uppercase text-yellow-400 mb-2 opacity-80">Verso</label>
                    <textarea value={settings.backText || ''} onChange={e => onChange({ backText: e.target.value })} placeholder="Texto Verso" className="w-full bg-stone-800 text-white border-none rounded px-2 py-1 text-xs h-20 mb-2" />
                    <input value={settings.backImage || ''} onChange={e => onChange({ backImage: e.target.value })} placeholder="URL Imagem" className="w-full bg-stone-800 text-white border-none rounded px-2 py-1 text-[10px]" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center perspective-1000`}>
                <div className={`w-32 h-20 rounded-xl ${activeTheme.classes.accent} shadow-xl flex items-center justify-center text-white font-bold p-2 text-center text-xs transform hover:rotate-y-180 transition-transform duration-500 cursor-pointer`}>
                    {settings.frontText || 'Frente'}
                </div>
            </div>
        </div>
    );
};

const AccordionEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;
    const items = settings.accordionItems || [{ title: 'Pergunta 1', content: 'Resposta 1' }];
    const updateItem = (idx: number, field: string, val: string) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: val };
        onChange({ accordionItems: newItems });
    };
    const addItem = () => onChange({ accordionItems: [...items, { title: '', content: '' }] });
    const removeItem = (idx: number) => onChange({ accordionItems: items.filter((_: any, i: number) => i !== idx) });

    return (
        <div className="space-y-3">
            <label className={`block text-[9px] font-black uppercase opacity-60 ${activeTheme.classes.text}`}>Itens do Acordeão</label>
            {items.map((item: any, idx: number) => (
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

const CTAEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Texto do Botão</label>
                    <input value={settings.ctaText || 'Clique Aqui'} onChange={e => onChange({ ctaText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Link de Destino</label>
                    <input value={settings.ctaLink || ''} onChange={e => onChange({ ctaLink: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="https://" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors flex justify-center`}>
                <button className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transform hover:scale-105 transition-all text-sm ${activeTheme.classes.accent}`}>
                    {settings.ctaText || 'Clique Aqui'} <i className="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
        </div>
    );
};

const TestimonialEditor = ({ settings, style, theme, onChange }: SubEditorProps) => {
    const activeTheme = theme || { classes: { accent: 'bg-blue-500', text: 'text-zinc-600', wrapper: 'bg-white', secondary: 'border-zinc-200' } } as any;

    return (
        <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Depoimento</label>
                    <textarea value={settings.testimonialText || '"Incrível!"'} onChange={e => onChange({ testimonialText: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 h-20 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Autor</label>
                    <input value={settings.authorName || 'Maria S.'} onChange={e => onChange({ authorName: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} />
                </div>
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${activeTheme.classes.text}`}>Foto (URL)</label>
                    <input value={settings.authorImage || ''} onChange={e => onChange({ authorImage: e.target.value })} className={`w-full border-none rounded-lg px-3 py-2 ${activeTheme.classes.secondary.replace('border-', 'bg-').replace('200', '50')} ${activeTheme.classes.text}`} placeholder="https://" />
                </div>
            </div>

            {/* Preview */}
            <div className={`p-6 rounded-xl border ${activeTheme.classes.wrapper} transition-colors text-center italic`}>
                <p className={`text-lg mb-4 opacity-80 ${activeTheme.classes.text}`}>"{settings.testimonialText || 'Incrível!'}"</p>
                <div className="flex items-center justify-center gap-2 not-italic">
                    <div className={`w-8 h-8 rounded-full ${activeTheme.classes.accent} flex items-center justify-center text-white text-xs font-bold`}>
                        {settings.authorName ? settings.authorName[0] : 'M'}
                    </div>
                    <span className={`text-xs font-bold ${activeTheme.classes.text}`}>{settings.authorName || 'Maria S.'}</span>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

interface EngagementEditorProps {
    block: ContentBlock;
    onUpdate: (updatedBlock: ContentBlock) => void;
}

const EngagementEditorBlock: React.FC<EngagementEditorProps> = ({ block, onUpdate }) => {
    // 1. Setup Defaults on Init
    React.useEffect(() => {
        if (!block.settings.engagementType) {
            onUpdate({ ...block, settings: { ...block.settings, engagementType: 'poll' } });
        }
    }, []);

    const currentType = block.settings.engagementType || 'poll';
    const currentStyle = block.settings.engagementStyle || 'default';

    const updateSetting = (key: string, value: any) => {
        onUpdate({
            ...block,
            settings: {
                ...block.settings,
                [key]: value
            }
        });
    };

    const handleTypeSelect = (type: string) => {
        onUpdate({
            ...block,
            settings: {
                ...block.settings,
                engagementType: type,
                engagementStyle: 'default' // Reset style on type change
            }
        });
    };

    if (!block.settings.engagementType) {
        return (
            <div className="p-6">
                <h3 className="text-xs font-black uppercase text-zinc-400 mb-4">Escolha o Tipo de Interação</h3>
                <div className="grid grid-cols-2 gap-3">
                    {ENGAGEMENT_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className="flex flex-col items-center p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:border-red-200 hover:shadow-lg transition-all group text-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-3 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                <i className={`fas ${type.icon} text-lg text-zinc-400 group-hover:text-red-500`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-700 group-hover:text-red-700">{type.label}</h4>
                                <p className="text-[8px] text-zinc-400 mt-1 leading-tight">{type.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Dynamic Style Resolution
    const styleOptions = getEngagementStyles(currentType);
    const currentStyleConfig = styleOptions.find(s => s.id === currentStyle) || styleOptions[0];

    // Dynamic Color Resolution
    const colorOptions = getEngagementColors(currentType);
    const currentColor = block.settings.engagementColor || colorOptions[0].id;
    const currentTheme = colorOptions.find(c => c.id === currentColor) || colorOptions[0];

    return (
        <div className={`p-6 transition-all duration-300 rounded-xl ${currentTheme.classes.wrapper}`}>
            {/* Header: Tipo de Interativo */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100/10">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentTheme.classes.accent} text-white`}>
                        <i className={`fas ${ENGAGEMENT_TYPES.find(t => t.id === currentType)?.icon}`}></i>
                    </div>
                    <span className={`font-black text-xs uppercase tracking-widest ${currentTheme.classes.text}`}>
                        {ENGAGEMENT_TYPES.find(t => t.id === currentType)?.label}
                    </span>
                </div>

                <button
                    onClick={() => onUpdate({ ...block, settings: { ...block.settings, engagementType: undefined } })}
                    className={`text-[9px] font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity ${currentTheme.classes.text}`}
                >
                    Trocar Tipo
                </button>
            </div>

            {/* Configurações Comuns */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className={`block text-[9px] font-black uppercase mb-1 opacity-60 ${currentTheme.classes.text}`}>Pergunta / Título</label>
                    <input
                        type="text"
                        value={block.settings.question || ''}
                        onChange={(e) => updateSetting('question', e.target.value)}
                        placeholder="Ex: Título da Interação..."
                        className={`w-full border-none rounded-xl px-4 py-3 font-bold focus:ring-2 outline-none bg-white/50 focus:bg-white transition-all ${currentTheme.classes.text} ${currentTheme.classes.secondary.replace('border-', 'focus:ring-')}`}
                    />
                </div>

                {/* Campos Específicos por Tipo - Passando Style e Theme */}
                {currentType === 'poll' && <PollEditor settings={block.settings} style={block.settings.engagementStyle || 'bars'} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'quiz' && <QuizEditor settings={block.settings} style={block.settings.engagementStyle || 'school'} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'slider' && <SliderEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'reaction' && <ReactionEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'counter' && <CounterEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'comparison' && <ComparisonEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'thermometer' && <ThermometerEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'ranking' && <RankingEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}

                {currentType === 'countdown' && <CountdownEditor settings={block.settings} style={block.settings.engagementStyle || 'digital'} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'timeline' && <TimelineEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'flipcard' && <FlipCardEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'accordion' && <AccordionEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'cta' && <CTAEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'testimonial' && <TestimonialEditor settings={block.settings} style={block.settings.engagementStyle} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
            </div>

            <div className="rounded-xl p-3 flex items-start gap-2 text-[10px] bg-zinc-50 text-zinc-500">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>Configure as opções acima. O estilo visual selecionado é exibido nos leitores.</p>
            </div>
        </div>
    );
};

export default EngagementEditorBlock;
