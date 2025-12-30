
import React, { useState, useEffect } from 'react';
import { ContentBlock, EngagementType } from '../../types';
import { recordEngagementVote } from '../../services/supabaseService';

interface EngagementRendererProps {
  block: ContentBlock;
  newsId?: string;
}

const EngagementRenderer: React.FC<EngagementRendererProps> = ({ block, newsId }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localData, setLocalData] = useState(block);

  const type = block.settings.engagementType as EngagementType;
  const { 
    accentColor = '#dc2626', 
    backgroundColor = '#FFFFFF', 
    borderRadius = '3xl',
    customIcon = 'fa-bolt-lightning'
  } = localData.settings;

  useEffect(() => {
    const saved = localStorage.getItem(`lfnm_voted_${newsId}_${block.id}`);
    if (saved) { setHasVoted(true); setSelectedId(saved); }
  }, [block.id, newsId]);

  const handleVote = async (optionId: string) => {
    if (hasVoted || !newsId) return;
    setHasVoted(true);
    setSelectedId(optionId);
    localStorage.setItem(`lfnm_voted_${newsId}_${block.id}`, optionId);

    const updated = await recordEngagementVote(newsId, block.id, optionId, type);
    if (updated) {
        const newBlock = updated.blocks.find((b: any) => b.id === block.id);
        if (newBlock) setLocalData(newBlock);
    }
  };

  const getPercent = (votes: number = 0) => {
    const content = localData.content;
    let total = 0;
    if (['poll', 'quiz', 'reactions'].includes(type)) {
        total = content.options?.reduce((a: any, b: any) => a + (b.votes || b.count || 0), 0) || 0;
    } else if (['battle', 'visual_vote', 'impact_ask'].includes(type)) {
        total = (content.votesA || content.optionA?.votes || 0) + (content.votesB || content.optionB?.votes || 0);
    }
    return total === 0 ? 0 : Math.round((votes / total) * 100);
  };

  return (
    <div 
        className="my-16 md:my-24 p-8 md:p-14 relative overflow-hidden transition-all border border-zinc-100 shadow-2xl"
        style={{ 
            backgroundColor, 
            borderRadius: borderRadius === 'full' ? '9999px' : '3.5rem' 
        }}
    >
      <div className="relative z-10 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl animate-pulse" style={{ backgroundColor: accentColor }}>
                <i className={`fas ${customIcon} text-xl`}></i>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 italic">Interativo LFNM</span>
          </div>
          <h3 className="font-[1000] uppercase italic tracking-tighter leading-[0.85] text-4xl md:text-6xl text-zinc-900 max-w-2xl">
            {localData.content.question}
          </h3>
      </div>

      <div className="relative z-10 space-y-4">
        {/* 1. ENQUETE & 3. QUIZ */}
        {(type === 'poll' || type === 'quiz') && localData.content.options?.map((opt: any) => {
            const percent = getPercent(opt.votes);
            const isCorrect = type === 'quiz' && opt.isCorrect;
            return (
                <button 
                    key={opt.id} onClick={() => handleVote(opt.id)} disabled={hasVoted}
                    className={`w-full relative group flex items-center gap-6 p-8 rounded-[2rem] border-2 transition-all overflow-hidden ${hasVoted ? (selectedId === opt.id ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-100 opacity-60') : 'bg-white border-zinc-100 hover:border-red-600 shadow-sm'}`}
                >
                    {hasVoted && <div className="absolute inset-y-0 left-0 transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: `${accentColor}10` }}></div>}
                    <span className="flex-1 text-left font-black uppercase text-sm md:text-xl tracking-tighter italic relative z-10">{opt.label}</span>
                    {hasVoted && (
                        <div className="flex items-center gap-4 relative z-10">
                            {isCorrect && <i className="fas fa-check-circle text-emerald-500 text-2xl"></i>}
                            <span className="font-black text-2xl" style={{ color: accentColor }}>{percent}%</span>
                        </div>
                    )}
                </button>
            );
        })}

        {/* 2. BATALHA & 8. VOTO GALERIA */}
        {(type === 'battle' || type === 'visual_vote') && (
            <div className="grid grid-cols-2 gap-6">
                {['A', 'B'].map(side => {
                    const data = side === 'A' ? (localData.content.optionA || {label: 'Lado A', votes: localData.content.votesA}) : (localData.content.optionB || {label: 'Lado B', votes: localData.content.votesB});
                    const percent = getPercent(data.votes);
                    return (
                        <button key={side} onClick={() => handleVote(side)} disabled={hasVoted} className={`relative aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden border-4 transition-all ${hasVoted && selectedId === side ? 'border-zinc-900' : 'border-zinc-100 hover:border-red-600'}`}>
                            {data.imageUrl && <img src={data.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-left">
                                <p className="text-white font-black uppercase italic tracking-tighter text-lg md:text-3xl leading-none mb-2">{data.label}</p>
                                {hasVoted && <p className="text-white text-3xl font-[1000]">{percent}%</p>}
                            </div>
                        </button>
                    );
                })}
            </div>
        )}

        {/* 4. REAÇÕES EMOJIS */}
        {type === 'reactions' && (
            <div className="flex flex-wrap gap-4">
                {localData.content.options?.map((opt: any) => (
                    <button key={opt.emoji} onClick={() => handleVote(opt.emoji)} disabled={hasVoted} className={`flex-1 flex flex-col items-center gap-3 p-8 rounded-[2.5rem] border-2 transition-all ${hasVoted && selectedId === opt.emoji ? 'bg-zinc-900 text-white border-zinc-900 scale-105 shadow-xl' : 'bg-white border-zinc-100 hover:border-red-500 shadow-sm'}`}>
                        <span className="text-5xl">{opt.emoji}</span>
                        <span className="font-black text-xs md:text-sm">{opt.count || 0}</span>
                    </button>
                ))}
            </div>
        )}

        {/* 6. ESTRELAS */}
        {type === 'rating' && (
            <div className="flex justify-center gap-4 py-8">
                {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => handleVote(star.toString())} disabled={hasVoted} className={`text-6xl transition-all ${hasVoted ? (parseInt(selectedId || '0') >= star ? 'text-yellow-400' : 'text-zinc-100') : 'text-zinc-100 hover:text-yellow-400 hover:scale-125'}`}>
                        <i className="fas fa-star"></i>
                    </button>
                ))}
            </div>
        )}

        {/* 7. CONTADOR APOIO (CORAÇÃO) */}
        {type === 'counter' && (
            <div className="flex flex-col items-center py-10">
                <button onClick={() => handleVote('click')} disabled={hasVoted} className={`w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-2xl transition-all duration-500 ${hasVoted ? 'bg-red-600 text-white scale-110' : 'bg-white text-red-600 hover:scale-105 border-4 border-red-50'}`}>
                    <i className={`fas fa-heart ${hasVoted ? 'animate-ping' : ''}`}></i>
                </button>
                <p className="mt-10 text-5xl font-[1000] text-zinc-900 tracking-tighter italic">{localData.content.count || 0}</p>
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em] mt-2">Apoiadores desta matéria</p>
            </div>
        )}

        {/* 9. BOLÃO PLACAR */}
        {type === 'prediction' && (
            <div className="bg-zinc-900 p-10 rounded-[3rem] text-white flex flex-col items-center gap-8 shadow-2xl">
                <div className="flex items-center justify-center gap-8 md:gap-16">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-black mb-3">{localData.content.teamA?.charAt(0)}</div>
                        <p className="text-[10px] font-black uppercase">{localData.content.teamA}</p>
                    </div>
                    <span className="text-4xl font-[1000] italic text-red-600">VS</span>
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-black mb-3">{localData.content.teamB?.charAt(0)}</div>
                        <p className="text-[10px] font-black uppercase">{localData.content.teamB}</p>
                    </div>
                </div>
                <button onClick={() => handleVote('PREDICT')} disabled={hasVoted} className={`px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest transition-all ${hasVoted ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-white hover:text-black shadow-xl shadow-red-600/30'}`}>
                    {hasVoted ? 'Palpite Registrado' : 'Enviar Meu Palpite'}
                </button>
            </div>
        )}

        {/* 10. SIM OU NÃO GIGANTE */}
        {type === 'impact_ask' && (
            <div className="flex flex-col md:flex-row gap-4">
                <button onClick={() => handleVote('YES')} disabled={hasVoted} className={`flex-1 py-12 rounded-[2.5rem] font-[1000] italic text-4xl tracking-tighter uppercase transition-all shadow-xl ${hasVoted && selectedId === 'YES' ? 'bg-emerald-500 text-white' : 'bg-zinc-50 text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-50'}`}>
                    {localData.content.labelYes || 'SIM'}
                    {hasVoted && <span className="block text-sm font-black mt-2">{getPercent(localData.content.votesA)}% Concordam</span>}
                </button>
                <button onClick={() => handleVote('NO')} disabled={hasVoted} className={`flex-1 py-12 rounded-[2.5rem] font-[1000] italic text-4xl tracking-tighter uppercase transition-all shadow-xl ${hasVoted && selectedId === 'NO' ? 'bg-red-500 text-white' : 'bg-zinc-50 text-red-600 border-2 border-red-100 hover:bg-red-50'}`}>
                    {localData.content.labelNo || 'NÃO'}
                    {hasVoted && <span className="block text-sm font-black mt-2">{getPercent(localData.content.votesB)}% Discordam</span>}
                </button>
            </div>
        )}
      </div>

      <div className="mt-16 pt-10 border-t border-zinc-100 flex justify-between items-center opacity-40">
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">PLATAFORMA INTERATIVA • REDE WELIX DUARTE</span>
        <div className="flex items-center gap-2">
            <i className="fas fa-fingerprint text-xs"></i>
            <span className="text-[10px] font-bold">VOTO ÚNICO VALIDADO</span>
        </div>
      </div>
    </div>
  );
};

export default EngagementRenderer;
