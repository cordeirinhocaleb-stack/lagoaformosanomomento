
import React, { useState } from 'react';
import { ContentBlock } from '../../../../types';
import { EDITOR_WIDGETS } from '../../EditorWidgets';

interface EditorSidebarProps {
  onAddBlock: (type: ContentBlock['type'], content?: any, settings?: any) => void;
  isUploading: boolean;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onAddBlock }) => {
  const [activeCat, setActiveCat] = useState<string | null>('text');

  const CATEGORIES = [
    { 
        id: 'text', label: 'Escrita Editorial', icon: 'fa-pen-nib', color: 'bg-zinc-900',
        items: [
            { type: 'paragraph', icon: 'fa-paragraph', label: 'Texto Corrente', sets: { editorialStyle: 'newspaper_standard' } },
            { type: 'heading', icon: 'fa-heading', label: 'Manchete Bloco', sets: { editorialStyle: 'hero_headline' } },
            { type: 'quote', icon: 'fa-quote-left', label: 'Citação / Aspas', sets: { editorialStyle: 'impact_quote' } },
            { type: 'list', icon: 'fa-list-ul', label: 'Lista Check', sets: { editorialStyle: 'checklist_pro' } },
        ]
    },
    {
        id: 'layout', label: 'Layout & Dados', icon: 'fa-layer-group', color: 'bg-indigo-600',
        items: [
            { type: 'table', icon: 'fa-table', label: 'Tabela de Dados', content: { rows: [['Item', 'Valor'], ['-', '-']] } },
            { type: 'cta', icon: 'fa-external-link-alt', label: 'Botão de Link', content: { text: 'CLIQUE AQUI PARA SABER MAIS', url: 'https://' } },
            { type: 'related', icon: 'fa-link', label: 'Link Relacionado', content: { title: 'TÍTULO DA MATÉRIA' } },
            { type: 'separator', icon: 'fa-minus', label: 'Divisor Visual' },
        ]
    },
    {
        id: 'cloud', label: 'Mídia Cloud LFNM', icon: 'fa-cloud', color: 'bg-blue-600',
        items: [
            { type: 'gallery', icon: 'fa-images', label: 'Galeria Drive' },
            { type: 'video', icon: 'fa-play-circle', label: 'Vídeo YouTube' },
        ]
    },
    {
        id: 'interativo', label: 'Engajamento', icon: 'fa-bolt-lightning', color: 'bg-amber-500',
        items: [
            { type: 'engagement', icon: 'fa-square-poll-vertical', label: 'Enquete' },
            { type: 'engagement', icon: 'fa-brain', label: 'Quiz' },
        ]
    },
    {
        id: 'widgets', label: 'Biblioteca LFNM', icon: 'fa-boxes-stacked', color: 'bg-red-600',
        isWidgets: true
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-100 w-80">
        <div className="p-8 border-b border-zinc-50 bg-zinc-50/30">
            <h3 className="text-xl font-[1000] uppercase italic tracking-tighter text-zinc-900 leading-none">ESTÚDIO LFNM</h3>
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] mt-2">Escolha seu módulo</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {CATEGORIES.map(cat => (
                <div key={cat.id}>
                    <button 
                        onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)} 
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeCat === cat.id ? `${cat.color} text-white shadow-xl scale-[1.02]` : 'hover:bg-zinc-50 text-zinc-500'}`}
                    >
                        <div className="flex items-center gap-3">
                            <i className={`fas ${cat.icon} text-sm`}></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                        </div>
                        <i className={`fas fa-chevron-${activeCat === cat.id ? 'up' : 'down'} text-[8px] opacity-40`}></i>
                    </button>
                    
                    {activeCat === cat.id && (
                        <div className="mt-2 bg-zinc-50/50 rounded-3xl p-2 border border-zinc-100 animate-fadeIn grid grid-cols-2 gap-2">
                             {cat.isWidgets ? EDITOR_WIDGETS.map(w => (
                                <button key={w.id} onClick={() => onAddBlock('smart_block', w.html)} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-100 hover:border-black transition-all gap-2 aspect-square shadow-sm group">
                                    <i className={`fas ${w.icon} text-zinc-300 text-xl group-hover:text-red-600 transition-colors`}></i>
                                    <span className="text-[7px] font-black uppercase text-zinc-400 text-center leading-tight group-hover:text-zinc-900">{w.name}</span>
                                </button>
                             )) :
                             cat.items?.map(item => (
                                <button key={item.label} onClick={() => onAddBlock(item.type as any, item.content || '', item.sets)} className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-100 hover:border-zinc-900 transition-all gap-2 aspect-square shadow-sm group">
                                    <i className={`fas ${item.icon} text-zinc-300 text-xl group-hover:text-red-600 transition-colors`}></i>
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
