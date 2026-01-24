
import React, { useRef, useEffect, useState } from 'react';
import { NewsItem } from '../../../types';

interface NewsTickerProps {
  latestNews: NewsItem[];
  externalNews: any[];
  onNewsClick?: (news: NewsItem) => void;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ latestNews, externalNews, onNewsClick }) => {
  const localScrollRef = useRef<HTMLDivElement>(null);
  const brazilScrollRef = useRef<HTMLDivElement>(null);
  const worldScrollRef = useRef<HTMLDivElement>(null);

  const [isLocalPaused, setIsLocalPaused] = useState(false);
  const [isBrazilPaused, setIsBrazilPaused] = useState(false);
  const [isWorldPaused, setIsWorldPaused] = useState(false);

  const [localCanScroll, setLocalCanScroll] = useState(false);
  const [brazilCanScroll, setBrazilCanScroll] = useState(false);
  const [worldCanScroll, setWorldCanScroll] = useState(false);

  // Check overflow
  useEffect(() => {
    const check = () => {
      if (localScrollRef.current) { setLocalCanScroll(localScrollRef.current.scrollWidth > localScrollRef.current.clientWidth); }
      if (brazilScrollRef.current) { setBrazilCanScroll(brazilScrollRef.current.scrollWidth > brazilScrollRef.current.clientWidth); }
      if (worldScrollRef.current) { setWorldCanScroll(worldScrollRef.current.scrollWidth > worldScrollRef.current.clientWidth); }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [latestNews, externalNews]);

  return (
    <div className="flex flex-col">
      {/* 1. PLANTÃO LAGOA (RED) */}
      <div className="bg-black py-1.5 overflow-hidden border-t-4 border-red-600 relative z-40">
        <style>{`
          @keyframes scroll-red { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker-red { animation: scroll-red 40s linear infinite; }
          .ticker-red:hover { animation-play-state: paused; }
        `}</style>
        <div className="flex ticker-red">
          <div className="flex items-center gap-12 md:gap-24 whitespace-nowrap px-12 shrink-0">
            <span className="text-red-600 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50 font-black uppercase italic text-[10px] md:text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0">PLANTÃO LAGOA</span>
            {latestNews.length > 0 ? latestNews.map((n, idx) => (
              <button key={`local-${idx}`} onClick={() => onNewsClick?.(n)} className="text-white text-[10px] md:text-xs font-black uppercase italic hover:text-red-500 transition-colors flex items-center gap-2 shrink-0">
                <i className="fas fa-circle text-[4px] text-red-600"></i>
                {n.title}
              </button>
            )) : <span className="text-white/40 text-[10px] uppercase font-bold shrink-0">ACOMPANHE O PORTAL LFNM</span>}
          </div>
          <div className="flex items-center gap-12 md:gap-24 whitespace-nowrap px-12 shrink-0">
            <span className="text-red-600 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50 font-black uppercase italic text-[10px] md:text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0">PLANTÃO LAGOA</span>
            {latestNews.length > 0 ? latestNews.map((n, idx) => (
              <button key={`local-dup-${idx}`} onClick={() => onNewsClick?.(n)} className="text-white text-[10px] md:text-xs font-black uppercase italic hover:text-red-500 transition-colors flex items-center gap-2 shrink-0">
                <i className="fas fa-circle text-[4px] text-red-600"></i>
                {n.title}
              </button>
            )) : <span className="text-white/40 text-[10px] uppercase font-bold shrink-0">ACOMPANHE O PORTAL LFNM</span>}
          </div>
        </div>
      </div>

      {/* 2. GIRO BRASIL & MUNDO (Mixed Stream) */}
      <div className="bg-black py-1.5 overflow-hidden border-t border-white/10 relative z-30 border-b-4 border-blue-600">
        <style>{`
          @keyframes scroll-mixed { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .ticker-mixed { animation: scroll-mixed 60s linear infinite; }
          .ticker-mixed:hover { animation-play-state: paused; }
        `}</style>
        <div className="flex ticker-mixed">
          <div className="flex items-center gap-12 md:gap-24 whitespace-nowrap px-12 shrink-0">
            <span className="text-white bg-blue-900/40 px-2 py-0.5 rounded border border-blue-500/30 font-black uppercase italic text-[10px] md:text-xs shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">GIRO BRASIL & MUNDO</span>
            {externalNews.length > 0 ? externalNews.map((n, idx) => {
              const isWorld = n.region === 'Global' || n.city === 'Mundo' || n.category === 'Mundo';
              const colorClass = isWorld ? 'text-blue-400' : 'text-green-500';
              const iconClass = isWorld ? 'fa-globe-americas' : 'fa-flag';
              return (
                <a key={`mixed-${idx}`} href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${colorClass} text-[10px] md:text-xs font-black uppercase hover:brightness-125 transition-all flex items-center gap-2 shrink-0`}>
                  <i className={`fas ${iconClass} text-[9px] opacity-70`}></i>
                  {n.title}
                  <span className="text-[7px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded ml-1 font-mono">{n.sourceName}</span>
                </a>
              );
            }) : <span className="text-white/40 text-[10px] uppercase font-bold shrink-0">CONFERINDO NOTÍCIAS GLOBAIS</span>}
          </div>
          {/* Duplicate for Loop */}
          <div className="flex items-center gap-12 md:gap-24 whitespace-nowrap px-12 shrink-0">
            <span className="text-white bg-blue-900/40 px-2 py-0.5 rounded border border-blue-500/30 font-black uppercase italic text-[10px] md:text-xs shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">GIRO BRASIL & MUNDO</span>
            {externalNews.length > 0 ? externalNews.map((n, idx) => {
              const isWorld = n.region === 'Global' || n.city === 'Mundo' || n.category === 'Mundo';
              const colorClass = isWorld ? 'text-blue-400' : 'text-green-500';
              const iconClass = isWorld ? 'fa-globe-americas' : 'fa-flag';
              return (
                <a key={`mixed-dup-${idx}`} href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${colorClass} text-[10px] md:text-xs font-black uppercase hover:brightness-125 transition-all flex items-center gap-2 shrink-0`}>
                  <i className={`fas ${iconClass} text-[9px] opacity-70`}></i>
                  {n.title}
                  <span className="text-[7px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded ml-1 font-mono">{n.sourceName}</span>
                </a>
              );
            }) : <span className="text-white/40 text-[10px] uppercase font-bold shrink-0">CONFERINDO NOTÍCIAS GLOBAIS</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
