
import React from 'react';
import { ContentBlock } from '../../../../types';

interface CTABlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (content: any) => void;
  onSelect: () => void;
}

const CTABlock: React.FC<CTABlockProps> = ({ block, isSelected, onUpdate, onSelect }) => {
  const content = block.content || { text: 'CLIQUE AQUI PARA SABER MAIS', url: 'https://' };

  return (
    <div 
      onClick={onSelect}
      className={`p-8 transition-all ${isSelected ? 'ring-4 ring-blue-500/20 bg-blue-50/10 rounded-3xl' : ''}`}
    >
      <div className="bg-zinc-900 text-white rounded-[2rem] p-10 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-20 pointer-events-none"></div>
          <p className="text-[9px] font-black uppercase text-red-500 tracking-[0.4em] mb-4">Link de Conversão</p>
          <h4 className="text-2xl font-[1000] uppercase italic tracking-tighter mb-4 leading-none">{content.text}</h4>
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/10">
              <i className="fas fa-link text-zinc-500 text-xs"></i>
              <span className="text-[10px] font-mono text-zinc-400">{content.url}</span>
          </div>
      </div>
      <p className="text-[8px] font-black uppercase text-zinc-300 mt-4 tracking-widest text-center">Edite o link e o texto no painel lateral (Inspetor)</p>
    </div>
  );
};

export default CTABlock;
