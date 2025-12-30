
import React, { useState } from 'react';
import { ContentBlock } from '../../../types';
import { EDITOR_WIDGETS } from '../EditorWidgets';

interface EditorSidebarProps {
  onAddBlock: (type: ContentBlock['type'], content?: any, settings?: any) => void;
  onCloudUpload?: (file: File, type: 'image' | 'video') => void;
  isUploading: boolean;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onAddBlock, isUploading }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>('escrita');

  const categories = [
    { 
        id: 'escrita', 
        label: 'Escrita Editorial', 
        icon: 'fa-pen-nib', 
        color: 'bg-zinc-900',
        items: [
            { type: 'paragraph', icon: 'fa-paragraph', label: 'Texto Corrente' },
            { type: 'heading', icon: 'fa-heading', label: 'Manchete Bloco' },
            { type: 'quote', icon: 'fa-quote-left', label: 'Citação / Aspas' },
            { type: 'list', icon: 'fa-list-ul', label: 'Lista de Itens' },
            { type: 'separator', icon: 'fa-minus', label: 'Divisor Visual' }
        ]
    },
    {
        id: 'cloud',
        label: 'Mídia Cloud LFNM',
        icon: 'fa-cloud',
        color: 'bg-blue-600',
        customContent: (
            <div className="space-y-3 p-3">
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => onAddBlock('gallery', { items: [] }, { style: 'hero_slider' })}
                        className="bg-white border-2 border-zinc-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:border-blue-500 transition-all group"
                    >
                        <i className="fab fa-google-drive text-blue-600 text-sm group-hover:scale-110 transition-transform"></i>
                        <span className="text-[7px] font-black uppercase text-zinc-400">Add Galeria</span>
                    </button>
                    <button 
                        onClick={() => onAddBlock('video', '', { style: 'clean' })}
                        className="bg-white border-2 border-zinc-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:border-red-500 transition-all group"
                    >
                        <i className="fab fa-youtube text-red-600 text-sm group-hover:scale-110 transition-transform"></i>
                        <span className="text-[7px] font-black uppercase text-zinc-400">Add Vídeo</span>
                    </button>
                </div>
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <p className="text-[7px] text-blue-800 font-bold uppercase leading-tight text-center">Os arquivos são enviados pelo menu "Inspetor" (Direita) ao clicar no bloco.</p>
                </div>
            </div>
        )
    },
    {
        id: 'interativo',
        label: 'Engajamento & Viral',
        icon: 'fa-bolt-lightning',
        color: 'bg-amber-500',
        items: [
            { type: 'engagement', icon: 'fa-square-poll-vertical', label: 'Enquete', settings: { engagementType: 'poll' }, content: { question: 'Sua opinião?', options: [{id: '1', label: 'Sim', votes: 0}, {id: '2', label: 'Não', votes: 0}] } },
            { type: 'engagement', icon: 'fa-shield-halved', label: 'Batalha A/B', settings: { engagementType: 'battle' }, content: { question: 'Quem ganha?', optionA: { label: 'Lado A', votes: 0 }, optionB: { label: 'Lado B', votes: 0 } } },
            { type: 'engagement', icon: 'fa-brain', label: 'Quiz Teste', settings: { engagementType: 'quiz' }, content: { question: 'Pergunta do Teste', options: [{id: '1', label: 'Certo', isCorrect: true, votes: 0}, {id: '2', label: 'Errado', isCorrect: false, votes: 0}] } },
            { type: 'engagement', icon: 'fa-face-smile', label: 'Reações Emojis', settings: { engagementType: 'reactions' }, content: { question: 'Como avalia?', options: [{emoji: '🔥', count: 0}, {emoji: '👏', count: 0}, {emoji: '😢', count: 0}] } },
            { type: 'engagement', icon: 'fa-temperature-high', label: 'Termômetro', settings: { engagementType: 'thermometer' }, content: { question: 'Qual o nível?', totalVotes: 0, totalSum: 0 } },
            { type: 'engagement', icon: 'fa-star', label: 'Estrelas', settings: { engagementType: 'rating' }, content: { question: 'Dê sua nota:', totalVotes: 0, totalSum: 0 } },
            { type: 'engagement', icon: 'fa-heart', label: 'Apoio Vital', settings: { engagementType: 'counter' }, content: { question: 'Clique no coração!', count: 0 } },
            { type: 'engagement', icon: 'fa-images', label: 'Voto Galeria', settings: { engagementType: 'visual_vote' }, content: { question: 'A melhor foto?', votesA: 0, votesB: 0 } },
            { type: 'engagement', icon: 'fa-trophy', label: 'Bolão Placar', settings: { engagementType: 'prediction' }, content: { question: 'Palpite do Placar:', teamA: 'Time A', teamB: 'Time B' } },
            { type: 'engagement', icon: 'fa-circle-exclamation', label: 'Sim ou Não', settings: { engagementType: 'impact_ask' }, content: { question: 'Você concorda?', labelYes: 'SIM', labelNo: 'NÃO' } }
        ]
    },
    {
        id: 'widgets',
        label: 'Biblioteca LFNM',
        icon: 'fa-layer-group',
        color: 'bg-red-600',
        isWidgets: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-100">
        <div className="p-8 border-b border-zinc-50 bg-zinc-50/30">
            <h3 className="text-xl font-[1000] uppercase italic tracking-tighter text-zinc-900 leading-none">ESTÚDIO LFNM</h3>
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] mt-2">Arraste para o palco</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {categories.map(cat => (
                <div key={cat.id}>
                    <button 
                        onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)} 
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeCategory === cat.id ? `${cat.color} text-white shadow-xl scale-[1.02]` : 'hover:bg-zinc-50 text-zinc-500'}`}
                    >
                        <div className="flex items-center gap-3">
                            <i className={`fas ${cat.icon} text-sm`}></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                        </div>
                        <i className={`fas fa-chevron-${activeCategory === cat.id ? 'up' : 'down'} text-[8px] opacity-40`}></i>
                    </button>
                    
                    {activeCategory === cat.id && (
                        <div className="mt-2 bg-zinc-50/50 rounded-3xl p-2 border border-zinc-100 animate-fadeIn grid grid-cols-2 gap-2">
                             {cat.customContent && <div className="col-span-2">{cat.customContent}</div>}
                             {cat.isWidgets ? EDITOR_WIDGETS.map(w => (
                                <button 
                                    key={w.id} onClick={() => onAddBlock('smart_block', w.html)} 
                                    className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-100 hover:border-black transition-all gap-2 aspect-square shadow-sm group"
                                >
                                    <i className={`fas ${w.icon} text-zinc-300 text-xl group-hover:text-red-600 transition-colors`}></i>
                                    <span className="text-[7px] font-black uppercase text-zinc-400 text-center leading-tight group-hover:text-zinc-900">{w.name}</span>
                                </button>
                             )) :
                             cat.items?.map(item => (
                                <button 
                                    key={item.label} onClick={() => onAddBlock(item.type as any, item.content, item.settings)} 
                                    className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-100 hover:border-zinc-900 transition-all gap-2 aspect-square shadow-sm group"
                                >
                                    <i className={`fas ${item.icon} text-zinc-300 text-xl hover:text-amber-500 transition-colors`}></i>
                                    <span className="text-[7px] font-black uppercase text-zinc-400 text-center leading-tight group-hover:text-zinc-900">{item.label}</span>
                                </button>
                             ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default EditorSidebar;
