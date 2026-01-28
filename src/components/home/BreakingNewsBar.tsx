
import React from 'react';
import { NewsItem } from '../../types';

interface BreakingNewsBarProps {
  item?: NewsItem;
  onClick: (item: NewsItem) => void;
}

const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({ item, onClick }) => {
  if (!item) { return null; }

  return (
    <div
      onClick={() => onClick(item)}
      className="bg-red-600 text-white cursor-pointer overflow-hidden relative z-50 animate-slideDown shadow-lg"
    >
      <div className="max-w-[1500px] mx-auto px-4 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2 animate-pulse shrink-0 z-10 bg-red-600 pr-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <span className="text-[11px] font-[1000] uppercase tracking-widest italic">Plantão</span>
        </div>

        <div className="flex-1 overflow-hidden relative h-5 flex items-center">
          <div className="absolute whitespace-nowrap animate-marquee flex items-center">
            <span className="text-[13px] md:text-[15px] font-black uppercase italic tracking-tight mr-16">
              {item.title}
            </span>
            <span className="text-[13px] md:text-[15px] font-black uppercase italic tracking-tight mr-16">
              {item.title}
            </span>
            <span className="text-[13px] md:text-[15px] font-black uppercase italic tracking-tight mr-16">
              {item.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10 bg-red-600 pl-2">
          <span className="hidden md:inline text-[8px] font-bold uppercase tracking-widest opacity-70">Ver agora</span>
          <i className="fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-1"></i>
        </div>
      </div>
      <style>{`
            @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-100%); }
            }
            .animate-marquee {
                animation: marquee 20s linear infinite;
            }
            .animate-marquee:hover {
                animation-play-state: paused;
            }
        `}</style>
    </div>
  );
};

export default BreakingNewsBar;