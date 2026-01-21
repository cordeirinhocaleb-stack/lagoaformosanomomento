
import React from 'react';
import { ContentBlock } from '../../../../types';

interface RelatedBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (content: any) => void;
  onSelect: () => void;
}

const RelatedBlock: React.FC<RelatedBlockProps> = ({ block, isSelected, onUpdate, onSelect }) => {
  const content = block.content || { title: 'TÍTULO DA MATÉRIA RELACIONADA' };

  return (
    <div 
      onClick={onSelect}
      className={`p-6 transition-all ${isSelected ? 'ring-4 ring-blue-500/20 bg-blue-50/10 rounded-3xl' : ''}`}
    >
      <div className="p-10 border-l-[12px] border-red-600 bg-zinc-50 rounded-r-[2rem] group cursor-pointer hover:bg-zinc-100 transition-colors shadow-sm">
          <span className="text-[10px] font-black uppercase text-red-600 mb-2 block tracking-widest animate-pulse">VEJA TAMBÉM:</span>
          <h4 className="text-2xl font-[1000] text-zinc-900 uppercase italic tracking-tighter leading-tight group-hover:text-red-600 transition-colors">
            {content.title}
          </h4>
      </div>
    </div>
  );
};

export default RelatedBlock;
