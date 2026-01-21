import React, { useState, useEffect } from 'react';
import { ContentBlock } from '../../types';
import { recordInteraction, getInteractionStats, hasUserInteracted, EngagementType, InteractionStats } from '../../services/engagement/engagementService';
import { getEngagementColors, ColorTheme } from '../../utils/engagementThemeHelper';

interface EngagementBlockProps {
    block: ContentBlock;
    newsId: string;
}

const EngagementBlock: React.FC<EngagementBlockProps> = ({ block, newsId }) => {
    const [hasInteracted, setHasInteracted] = useState(false);
    const [stats, setStats] = useState<InteractionStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<any>(null);

    const { engagementType, question, options, correctOptionIndex, reactionEmojis, leftLabel, rightLabel, buttonText, clickEmoji, editorialVariant } = block.settings || {};

    const colorOptions = getEngagementColors(engagementType || 'poll');
    const currentColorId = editorialVariant || block.settings.engagementColor || colorOptions[0].id;
    const currentTheme = colorOptions.find(c => c.id === currentColorId) || colorOptions[0];

    const accentColor = currentTheme.id === editorialVariant ? null : block.settings.accentColor;
    const finalAccentColor = accentColor || '#dc2626';

    useEffect(() => {
        if (!newsId || !block.id) { return; }

        const checkInteraction = async () => {
            const interacted = await hasUserInteracted(newsId, block.id);
            setHasInteracted(interacted);
        };

        const loadStats = async () => {
            const currentStats = await getInteractionStats(newsId, block.id);
            setStats(currentStats);
        };

        checkInteraction();
        loadStats();

        // Polling para atualizar stats em tempo real (a cada 10s)
        const interval = setInterval(loadStats, 10000);
        return () => clearInterval(interval);
    }, [newsId, block.id]);

    const handleInteraction = async (data: any) => {
        if (hasInteracted && engagementType !== 'counter' && engagementType !== 'slider') { return; }

        setIsLoading(true);
        setSelectedOption(data.value || data.selectedOption);

        // Otimistic UI update
        setHasInteracted(true);
        if (stats) {
            const key = data.value || data.selectedOption;
            setStats({
                total: stats.total + 1,
                distribution: {
                    ...stats.distribution,
                    [key]: (stats.distribution[key] || 0) + 1
                }
            });
        }

        const result = await recordInteraction({
            newsId,
            blockId: block.id,
            type: engagementType as EngagementType,
            data
        });

        if (!result.success && result.error !== 'already_voted') {
            console.error("Erro ao registrar voto");
        }

        setIsLoading(false);
    };

    // Renderizadores simplificados
    const renderPoll = () => {
        if (!options) { return null; }

        return (
            <div className="space-y-3">
                {options.map((opt: string | { label: string, image?: string }, idx: number) => {
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    const count = stats?.distribution[optLabel] || 0;
                    const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    const isSelected = selectedOption === opt;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleInteraction({ selectedOption: typeof opt === 'string' ? opt : opt.label })}
                            disabled={hasInteracted}
                            className={`relative w-full text-left p-4 transition-all overflow-hidden ${currentTheme.classes.option || 'rounded-xl border-2 border-zinc-200 hover:bg-white hover:shadow-md'
                                } ${hasInteracted && !isSelected ? 'opacity-60' : ''}`}
                            style={{
                                borderColor: hasInteracted && isSelected ? finalAccentColor : undefined,
                                backgroundColor: hasInteracted && isSelected ? `${finalAccentColor}10` : undefined,
                            }}
                        >
                            {hasInteracted && (
                                <div
                                    className={currentTheme.classes.barStyle || 'absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out opacity-20'}
                                    style={{
                                        width: `${percent}%`,
                                        backgroundColor: currentTheme.classes.barStyle ? undefined : (isSelected ? finalAccentColor : '#e4e4e7'),
                                        position: currentTheme.classes.barStyle ? 'absolute' : undefined,
                                        left: currentTheme.classes.barStyle ? 0 : undefined,
                                        top: currentTheme.classes.barStyle ? 0 : undefined,
                                        bottom: currentTheme.classes.barStyle ? 0 : undefined
                                    }}
                                />
                            )}

                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    {typeof opt === 'object' && opt.image && (
                                        <div className="w-8 h-8 rounded-full bg-cover bg-center border border-white/40 shadow-sm" style={{ backgroundImage: `url(${opt.image})` }}></div>
                                    )}
                                    <span className={`font-bold ${isSelected ? currentTheme.classes.text : 'text-zinc-800'}`}>{typeof opt === 'string' ? opt : opt.label}</span>
                                </div>
                                {hasInteracted && (
                                    <span className="font-black text-xs" style={{ color: finalAccentColor }}>{percent}% ({count})</span>
                                )}
                            </div>
                        </button>
                    );
                })
                }
                {
                    hasInteracted && (
                        <p className="text-center text-xs text-zinc-400 mt-2 font-medium">{stats?.total || 0} votos computados</p>
                    )
                }
            </div >
        );
    };

    const renderQuiz = () => {
        if (!options) { return null; }

        return (
            <div className="space-y-3">
                {options.map((opt: string | { label: string, image?: string }, idx: number) => {
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    const isCorrect = idx === correctOptionIndex;
                    const isSelected = selectedOption === optLabel; // Compara com label

                    let borderClass = 'border-zinc-200';
                    let bgClass = 'bg-white';
                    let icon = null;

                    if (hasInteracted) {
                        if (isCorrect) {
                            borderClass = 'border-green-500';
                            bgClass = 'bg-green-50';
                            icon = <i className="fas fa-check text-green-600"></i>;
                        } else if (isSelected) {
                            borderClass = 'border-red-500';
                            bgClass = 'bg-red-50';
                            icon = <i className="fas fa-times text-red-600"></i>;
                        } else {
                            bgClass = 'bg-zinc-50 opacity-50';
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleInteraction({ selectedOption: optLabel })}
                            disabled={hasInteracted}
                            className={`relative w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between overflow-hidden ${borderClass} ${bgClass} ${!hasInteracted && 'hover:shadow-md hover:scale-[1.01]'}`}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                {typeof opt === 'object' && opt.image && (
                                    <div className="w-10 h-10 rounded-full bg-cover bg-center border border-black/10 shrink-0" style={{ backgroundImage: `url(${opt.image})` }}></div>
                                )}
                                <span className={`font-bold text-zinc-800 ${typeof opt === 'object' && opt.image ? 'text-sm' : ''}`}>{optLabel}</span>
                            </div>
                            {icon}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderReaction = () => {
        const emojis = (reactionEmojis || '👍,❤️,😂,😮,😢,😡').split(',');
        return (
            <div className="flex flex-wrap gap-4 justify-center py-4">
                {emojis.map((emoji: string, idx: number) => {
                    const count = stats?.distribution[emoji.trim()] || 0;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleInteraction({ value: emoji.trim() })}
                            className="flex flex-col items-center gap-1 group transition-transform active:scale-125"
                        >
                            <span className="text-4xl group-hover:scale-110 transition-transform filter drop-shadow-sm">{emoji.trim()}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>{count}</span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderCounter = () => {
        const total = stats?.total || 0;
        return (
            <div className="flex flex-col items-center justify-center py-6">
                <button
                    onClick={() => handleInteraction({ value: 'click' })}
                    className="group relative text-white w-24 h-24 rounded-full shadow-xl flex items-center justify-center text-3xl transition-transform active:scale-95 hover:brightness-110 overflow-hidden"
                    style={{ backgroundColor: accentColor }}
                >
                    <span className="relative z-10 group-active:scale-150 transition-transform block">{clickEmoji || '❤️'}</span>
                    <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-300"></div>
                </button>
                <div className="mt-4 text-center">
                    <span className="block text-2xl font-black text-zinc-900">{total}</span>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>{buttonText || 'Apoios'}</span>
                </div>
            </div>
        );
    };

    const renderSlider = () => (
        <div className="py-6 px-2">
            <div className="flex justify-between text-2xl mb-4 text-zinc-400">
                <span>{leftLabel || '👎'}</span>
                <span>{rightLabel || '👍'}</span>
            </div>
            <input
                type="range"
                min="0" max="100"
                defaultValue="50"
                className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: accentColor }}
                onMouseUp={(e: any) => handleInteraction({ value: e.target.value })}
                onTouchEnd={(e: any) => handleInteraction({ value: e.target.value })}
            />
            {hasInteracted && (
                <p className="text-center text-xs font-bold mt-2" style={{ color: accentColor }}>Voto registrado!</p>
            )}
        </div>
    );

    const renderThermometer = () => {
        const temperature = stats?.average || 50; // Assumindo que o back retorna média

        return (
            <div className="py-8 px-4 flex flex-col items-center">
                <div className="relative w-8 h-64 bg-zinc-200 rounded-full border-4 border-zinc-300 overflow-hidden shadow-inner">
                    <div
                        className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out"
                        style={{
                            height: hasInteracted ? `${stats?.average || 50}%` : '50%',
                            backgroundColor: finalAccentColor
                        }}
                    ></div>
                    {/* Marcas de graduação */}
                    <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-[1px] bg-zinc-400/50"></div>
                        ))}
                    </div>
                </div>

                <input
                    type="range"
                    min="0" max="100"
                    defaultValue="50"
                    disabled={hasInteracted}
                    className={`mt-8 w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer ${hasInteracted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ accentColor: finalAccentColor }}
                    onMouseUp={(e: any) => handleInteraction({ value: e.target.value })}
                    onTouchEnd={(e: any) => handleInteraction({ value: e.target.value })}
                />

                <div className="flex justify-between w-full text-xs font-bold uppercase mt-2 text-zinc-400">
                    <span>{leftLabel || 'Frio'}</span>
                    <span>{rightLabel || 'Quente'}</span>
                </div>

                {hasInteracted && (
                    <div className="mt-4 text-center">
                        <span className="text-3xl font-black" style={{ color: finalAccentColor }}>{Math.round(stats?.average || 0)}°</span>
                        <p className="text-xs text-zinc-400 uppercase tracking-widest">Temperatura Média</p>
                    </div>
                )}
            </div>
        );
    };

    const renderComparison = () => {
        // block.settings deve ter leftOption/rightOption ou options[0]/options[1]
        // Se usar ImageA/ImageB e LabelA/LabelB das settings do editor:
        const labelA = (block.settings.labelA as string) || options?.[0]?.label || options?.[0] || 'Opção A';
        const labelB = (block.settings.labelB as string) || options?.[1]?.label || options?.[1] || 'Opção B';
        const imgA = (block.settings.imageA as string) || (typeof options?.[0] === 'object' ? options[0].image : null);
        const imgB = (block.settings.imageB as string) || (typeof options?.[1] === 'object' ? options[1].image : null);

        const countA = stats?.distribution[labelA] || 0;
        const countB = stats?.distribution[labelB] || 0;
        const total = (stats?.total || 0);
        const percentA = total ? Math.round((countA / total) * 100) : 50;
        const percentB = total ? 100 - percentA : 50;

        return (
            <div className="flex flex-col gap-4">
                <div className="flex w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg relative">
                    {/* Lado A */}
                    <button
                        onClick={() => handleInteraction({ selectedOption: labelA })}
                        disabled={hasInteracted}
                        className={`relative h-full flex flex-col items-center justify-center transition-all overflow-hidden group ${hasInteracted ? '' : 'hover:brightness-110'}`}
                        style={{
                            width: hasInteracted ? `${percentA}%` : '50%',
                            backgroundColor: finalAccentColor, // Cor primária
                        }}
                    >
                        {imgA && <img src={imgA} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                        <div className="relative z-10 p-2 text-center">
                            <span className="font-black text-xl md:text-3xl uppercase tracking-tighter text-white drop-shadow-md">{labelA}</span>
                            {hasInteracted && <span className="block text-2xl font-black text-white mt-2">{percentA}%</span>}
                        </div>
                    </button>

                    {/* Divisor VS */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white text-zinc-900 font-black rounded-full w-12 h-12 flex items-center justify-center border-4 border-zinc-100 shadow-xl">
                        VS
                    </div>

                    {/* Lado B */}
                    <button
                        onClick={() => handleInteraction({ selectedOption: labelB })}
                        disabled={hasInteracted}
                        className={`relative h-full flex flex-col items-center justify-center transition-all overflow-hidden group ${hasInteracted ? '' : 'hover:brightness-110'}`}
                        style={{
                            width: hasInteracted ? `${percentB}%` : '50%',
                            backgroundColor: '#3b82f6', // Azul fixo ou secundária
                        }}
                    >
                        {imgB && <img src={imgB} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />}
                        <div className="relative z-10 p-2 text-center">
                            <span className="font-black text-xl md:text-3xl uppercase tracking-tighter text-white drop-shadow-md">{labelB}</span>
                            {hasInteracted && <span className="block text-2xl font-black text-white mt-2">{percentB}%</span>}
                        </div>
                    </button>
                </div>
                {hasInteracted && (
                    <p className="text-center text-xs text-zinc-400 font-medium">{total} votos computados</p>
                )}
            </div>
        )
    }

    const renderRanking = () => {
        // Suporte para rankingItems (string ou array de objetos do novo editor)
        let items: any[] = [];
        if (block.settings.rankingItems) {
            if (Array.isArray(block.settings.rankingItems)) {
                items = block.settings.rankingItems.map((i: any) => typeof i === 'string' ? { label: i } : i);
            } else if (typeof block.settings.rankingItems === 'string') {
                items = block.settings.rankingItems.split(',').map((s: string) => ({ label: s.trim() }));
            }
        } else if (options) { // Fallback para options padrão
            items = options.map((i: any) => typeof i === 'string' ? { label: i } : i);
        } else {
            return null;
        }

        // Ordena opções baseado nos votos se o usuário já interagiu
        const sortedOptions = hasInteracted
            ? [...items].sort((a, b) => (stats?.distribution[b.label] || 0) - (stats?.distribution[a.label] || 0))
            : items;

        return (
            <div className="space-y-2">
                {sortedOptions.map((opt: any, idx: number) => {
                    const label = opt.label;
                    const count = stats?.distribution[label] || 0;
                    const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    const rank = idx + 1;

                    // Cores do pódio
                    let rankColor = 'bg-zinc-100 text-zinc-600';
                    let rankIcon = <span className="font-mono font-bold text-xs">#{rank}</span>

                    if (hasInteracted) {
                        if (rank === 1) { rankColor = 'bg-yellow-100 text-yellow-700 border-yellow-300'; rankIcon = <i className="fas fa-trophy text-yellow-500"></i> }
                        if (rank === 2) { rankColor = 'bg-zinc-200 text-zinc-700 border-zinc-300'; rankIcon = <span className="font-black text-xs text-zinc-500">2º</span> }
                        if (rank === 3) { rankColor = 'bg-orange-100 text-orange-800 border-orange-200'; rankIcon = <span className="font-black text-xs text-orange-700">3º</span> }
                    }

                    return (
                        <button
                            key={label} // Key deve ser a opção para manter animação correta
                            onClick={() => handleInteraction({ selectedOption: label })}
                            disabled={hasInteracted}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all overflow-hidden ${hasInteracted ? rankColor : 'bg-white border-zinc-100 hover:border-zinc-300 hover:shadow-sm'}`}
                        >
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden border border-black/5 ${hasInteracted ? 'bg-white/50' : 'bg-zinc-100'} ${hasInteracted ? '' : 'text-zinc-400'}`}>
                                {opt.image ? (
                                    <img src={opt.image} className="w-full h-full object-cover" />
                                ) : (
                                    hasInteracted ? rankIcon : <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                            </div>

                            <div className="flex-1 text-left">
                                <span className={`font-bold block leading-tight ${hasInteracted && rank === 1 ? 'text-lg' : 'text-sm'}`}>{label}</span>
                            </div>

                            {hasInteracted && (
                                <div className="text-right">
                                    <span className="block font-black text-sm">{percent}%</span>
                                    <span className="text-[10px] opacity-70">{count} votos</span>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        )
    };

    return (
        <div className={`my-10 shadow-sm border overflow-hidden max-w-2xl mx-auto transition-all duration-500 ${currentTheme.classes.wrapper}`}>
            {/* Background Pattern (marca d'água) */}
            {currentTheme.classes.backgroundPattern && (
                <div className={currentTheme.classes.backgroundPattern}></div>
            )}

            <div className={`relative z-10 ${currentTheme.classes.container || 'flex flex-col'}`}>
                <div className="p-6 md:p-8">
                    <div className="mt-3 flex items-center gap-2 mb-2">
                        <span className={currentTheme.classes.badge || `text-[10px] font-black uppercase tracking-widest border border-current px-2 py-0.5 rounded-full ${currentTheme.classes.text} opacity-60`}>
                            {engagementType === 'poll' && 'Enquete'}
                            {engagementType === 'quiz' && 'Quiz'}
                            {engagementType === 'reaction' && 'Reações'}
                            {engagementType === 'counter' && 'Interação'}
                        </span>
                        {stats && stats.total > 0 && (
                            <span className={`text-[10px] font-bold ${currentTheme.classes.text}`}>• {stats.total} Participações</span>
                        )}
                    </div>
                    {question && (
                        <h3 className={`text-xl md:text-2xl font-bold leading-tight tracking-tight ${currentTheme.classes.header || 'italic uppercase tracking-tighter'} ${currentTheme.classes.text}`}>
                            {question}
                        </h3>
                    )}
                </div>

                <div className="p-6 md:p-8 pt-0">
                    {engagementType === 'poll' && renderPoll()}
                    {engagementType === 'quiz' && renderQuiz()}
                    {engagementType === 'reaction' && renderReaction()}
                    {engagementType === 'counter' && renderCounter()}
                    {engagementType === 'slider' && renderSlider()}
                    {engagementType === 'thermometer' && renderThermometer()}
                    {engagementType === 'comparison' && renderComparison()}
                    {engagementType === 'ranking' && renderRanking()}

                    {!['poll', 'quiz', 'reaction', 'counter', 'slider', 'thermometer', 'comparison', 'ranking'].includes(engagementType || '') && (
                        <p className="text-center text-zinc-400 text-sm">Tipo de interação não suportado: {engagementType}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EngagementBlock;
