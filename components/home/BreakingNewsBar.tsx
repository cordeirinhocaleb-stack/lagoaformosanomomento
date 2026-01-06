
import React from 'react';
import { NewsItem } from '../../types';

interface BreakingNewsBarProps {
  item?: NewsItem;
  onClick: (item: NewsItem) => void;
}

const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({ item, onClick }) => {
  if (!item) return null;

  return (
    <div 
        onClick={() => onClick(item)} 
        className="bg-red-600 text-white cursor-pointer overflow-hidden relative z-50 animate-slideDown shadow-lg"
    >
        <div className="max-w-[1500px] mx-auto px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 animate-pulse shrink-0">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                <span className="text-[9px] font-[1000] uppercase tracking-widest italic">Plantão</span>
            </div>
            <p className="flex-1 text-[11px] md:text-xs font-black uppercase italic tracking-tight truncate border-l border-white/20 pl-4">
                {item.title}
            </p>
            <div className="flex items-center gap-2 shrink-0">
                <span className="hidden md:inline text-[8px] font-bold uppercase tracking-widest opacity-70">Ver agora</span>
                <i className="fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-1"></i>
            </div>
        </div>
    </div>
  );
};

export default BreakingNewsBar;