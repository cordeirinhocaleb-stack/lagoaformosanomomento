import React, { useState, useEffect } from 'react';
import { ContentBlock } from '../../types';
import { recordInteraction, getInteractionStats, hasUserInteracted, EngagementType, InteractionStats } from '../../services/engagement/engagementService';

interface EngagementBlockProps {
    block: ContentBlock;
    newsId: string;
}

const EngagementBlock: React.FC<EngagementBlockProps> = ({ block, newsId }) => {
    const [hasInteracted, setHasInteracted] = useState(false);
    const [stats, setStats] = useState<InteractionStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState<any>(null);

    const { engagementType, question, options, correctOptionIndex, reactionEmojis, leftLabel, rightLabel, buttonText, clickEmoji } = block.settings || {};

    useEffect(() => {
        if (!newsId || !block.id) {return;}

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
        if (hasInteracted && engagementType !== 'counter' && engagementType !== 'slider') {return;}

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
        if (!options) {return null;}

        return (
            <div className="space-y-3">
                {options.map((opt: string, idx: number) => {
                    const count = stats?.distribution[opt] || 0;
                    const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                    const isSelected = selectedOption === opt;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleInteraction({ selectedOption: opt })}
                            disabled={hasInteracted}
                            className={`relative w-full text-left p-4 rounded-xl border-2 transition-all overflow-hidden ${hasInteracted
                                    ? isSelected ? 'border-blue-500 bg-blue-50' : 'border-zinc-100 bg-zinc-50 opacity-60'
                                    : 'border-zinc-200 hover:border-blue-400 hover:bg-white hover:shadow-md'
                                }`}
                        >
                            {hasInteracted && (
                                <div
                                    className={`absolute top-0 bottom-0 left-0 transition-all duration-1000 ease-out ${isSelected ? 'bg-blue-100' : 'bg-zinc-200'}`}
                                    style={{ width: `${percent}%` }}
                                />
                            )}

                            <div className="relative z-10 flex justify-between items-center">
                                <span className="font-bold text-zinc-800">{opt}</span>
                                {hasInteracted && (
                                    <span className="font-black text-xs text-zinc-500">{percent}% ({count})</span>
                                )}
                            </div>
                        </button>
                    );
                })}
                {hasInteracted && (
                    <p className="text-center text-xs text-zinc-400 mt-2 font-medium">{stats?.total || 0} votos computados</p>
                )}
            </div>
        );
    };

    const renderQuiz = () => {
        if (!options) {return null;}

        return (
            <div className="space-y-3">
                {options.map((opt: string, idx: number) => {
                    const isCorrect = idx === correctOptionIndex;
                    const isSelected = selectedOption === opt;

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
                            onClick={() => handleInteraction({ selectedOption: opt })}
                            disabled={hasInteracted}
                            className={`relative w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${borderClass} ${bgClass} ${!hasInteracted && 'hover:shadow-md hover:scale-[1.01]'}`}
                        >
                            <span className="font-bold text-zinc-800">{opt}</span>
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
                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">{count}</span>
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
                    className="group relative bg-red-600 text-white w-24 h-24 rounded-full shadow-xl flex items-center justify-center text-3xl transition-transform active:scale-95 hover:bg-black overflow-hidden"
                >
                    <span className="relative z-10 group-active:scale-150 transition-transform block">{clickEmoji || '❤️'}</span>
                    <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-active:scale-100 transition-transform duration-300"></div>
                </button>
                <div className="mt-4 text-center">
                    <span className="block text-2xl font-black text-zinc-900">{total}</span>
                    <span className="text-xs font-bold uppercase text-zinc-400 tracking-widest">{buttonText || 'Apoios'}</span>
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
                className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                onMouseUp={(e: any) => handleInteraction({ value: e.target.value })}
                onTouchEnd={(e: any) => handleInteraction({ value: e.target.value })}
            />
            {hasInteracted && (
                <p className="text-center text-xs text-blue-500 font-bold mt-2">Voto registrado!</p>
            )}
        </div>
    );

    return (
        <div className="my-10 bg-white rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden max-w-2xl mx-auto">
            <div className={`p-6 md:p-8 ${engagementType === 'quiz' ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-900'}`}>
                {question && (
                    <h3 className={`text-xl md:text-2xl font-black leading-tight ${engagementType === 'quiz' ? 'text-white' : 'text-zinc-900'}`}>
                        {question}
                    </h3>
                )}
                <div className="mt-2 flex items-center gap-2 opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest border border-current px-2 py-0.5 rounded-full">
                        {engagementType === 'poll' && 'Enquete'}
                        {engagementType === 'quiz' && 'Quiz'}
                        {engagementType === 'reaction' && 'Reações'}
                        {engagementType === 'counter' && 'Interação'}
                    </span>
                    {stats && stats.total > 0 && (
                        <span className="text-[10px] font-bold">• {stats.total} Participações</span>
                    )}
                </div>
            </div>

            <div className="p-6 md:p-8 pt-0">
                {engagementType === 'poll' && renderPoll()}
                {engagementType === 'quiz' && renderQuiz()}
                {engagementType === 'reaction' && renderReaction()}
                {engagementType === 'counter' && renderCounter()}
                {engagementType === 'slider' && renderSlider()}

                {!['poll', 'quiz', 'reaction', 'counter', 'slider'].includes(engagementType || '') && (
                    <p className="text-center text-zinc-400 text-sm">Tipo de interação não suportado: {engagementType}</p>
                )}
            </div>
        </div>
    );
};

export default EngagementBlock;
