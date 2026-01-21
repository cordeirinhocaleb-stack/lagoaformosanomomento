import React from 'react';
import { ContentBlock } from '../../types';
import { getEngagementStyles } from './editor/EngagementStyles';
import { getEngagementColors, ColorTheme } from './editor/EngagementColors';

// Sub-Editors
import { PollEditor } from './editor/engagement/PollEditor';
import { QuizEditor } from './editor/engagement/QuizEditor';
import { SliderEditor } from './editor/engagement/SliderEditor';
import { ReactionEditor } from './editor/engagement/ReactionEditor';
import { CounterEditor } from './editor/engagement/CounterEditor';
import { ComparisonEditor } from './editor/engagement/ComparisonEditor';
import { ThermometerEditor } from './editor/engagement/ThermometerEditor';
import { RankingEditor } from './editor/engagement/RankingEditor';
import { CountdownEditor } from './editor/engagement/CountdownEditor';
import { TimelineEditor } from './editor/engagement/TimelineEditor';
import { FlipCardEditor } from './editor/engagement/FlipCardEditor';
import { AccordionEditor } from './editor/engagement/AccordionEditor';
import { CTAEditor } from './editor/engagement/CTAEditor';
import { TestimonialEditor } from './editor/engagement/TestimonialEditor';

// Tipos de Engajamento
type EngagementType =
    | 'poll' | 'quiz' | 'slider' | 'comparison'
    | 'reaction' | 'counter' | 'thermometer' | 'ranking'
    | 'countdown' | 'timeline' | 'flipcard' | 'accordion' | 'cta' | 'testimonial';

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
    { id: 'testimonial', label: 'Depoimento', icon: 'fa-quote-right', description: 'Citação com foto e nome.' },
];

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

    const updateSetting = (key: string, value: unknown) => {
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
                            aria-label={`Selecionar tipo: ${type.label}`}
                            title={type.description}
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
    const styleOptions = getEngagementStyles(currentType as string);
    // const _currentStyleConfig = styleOptions.find(s => s.id === currentStyle) || styleOptions[0]; // Not used currently but kept for logic

    // Dynamic Color Resolution
    const colorOptions = getEngagementColors(currentType as string);
    // Prioriza editorialVariant sobre engagementColor
    const currentColor = block.settings.editorialVariant || block.settings.engagementColor || colorOptions[0].id;
    const currentTheme = colorOptions.find(c => c.id === currentColor) || colorOptions[0];

    return (
        <div className={`p-4 md:p-6 transition-all duration-300 rounded-xl ${currentTheme.classes.wrapper}`}>
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
                        value={block.settings.question as string || ''}
                        onChange={(e) => updateSetting('question', e.target.value)}
                        placeholder="Ex: Título da Interação..."
                        className={`w-full border-none rounded-xl px-4 py-3 font-bold focus:ring-2 outline-none bg-white/50 focus:bg-white transition-all ${currentTheme.classes.text} ${currentTheme.classes.secondary.replace('border-', 'focus:ring-')}`}
                    />
                </div>

                {/* Campos Específicos por Tipo - Passando Style e Theme */}
                {currentType === 'poll' && <PollEditor settings={block.settings} style={block.settings.engagementStyle as string || 'bars'} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'quiz' && <QuizEditor settings={block.settings} style={block.settings.engagementStyle as string || 'school'} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'slider' && <SliderEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'reaction' && <ReactionEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'counter' && <CounterEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'comparison' && <ComparisonEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'thermometer' && <ThermometerEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'ranking' && <RankingEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}

                {currentType === 'countdown' && <CountdownEditor settings={block.settings} style={block.settings.engagementStyle as string || 'digital'} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'timeline' && <TimelineEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'flipcard' && <FlipCardEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'accordion' && <AccordionEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'cta' && <CTAEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
                {currentType === 'testimonial' && <TestimonialEditor settings={block.settings} style={block.settings.engagementStyle as string} theme={currentTheme} onChange={s => onUpdate({ ...block, settings: { ...block.settings, ...s } })} />}
            </div>

            <div className="rounded-xl p-3 flex items-start gap-2 text-[10px] bg-zinc-50 text-zinc-500">
                <i className="fas fa-info-circle mt-0.5"></i>
                <p>Configure as opções acima. O estilo visual selecionado é exibido nos leitores.</p>
            </div>
        </div>
    );
};

export default EngagementEditorBlock;
