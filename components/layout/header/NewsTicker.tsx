
import React, { useRef, useEffect, useState } from 'react';
import { NewsItem } from '../../../types';

interface NewsTickerProps {
  latestNews: NewsItem[];
  brazilNews: any[];
  onNewsClick?: (news: NewsItem) => void;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ latestNews, brazilNews, onNewsClick }) => {
  const localScrollRef = useRef<HTMLDivElement>(null);
  const worldScrollRef = useRef<HTMLDivElement>(null);
  
  const [isLocalPaused, setIsLocalPaused] = useState(false);
  const [isWorldPaused, setIsWorldPaused] = useState(false);
  const [manualLocal, setManualLocal] = useState(false);
  const [manualWorld, setManualWorld] = useState(false);
  
  const [localCanScroll, setLocalCanScroll] = useState(false);
  const [worldCanScroll, setWorldCanScroll] = useState(false);

  // Check overflow
  useEffect(() => {
    const check = () => {
      if (localScrollRef.current) {setLocalCanScroll(localScrollRef.current.scrollWidth > localScrollRef.current.clientWidth);}
      if (worldScrollRef.current) {setWorldCanScroll(worldScrollRef.current.scrollWidth > worldScrollRef.current.clientWidth);}
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [latestNews, brazilNews]);

  // JS Ticker scroll logic
  const useTickerAutoScroll = (ref: React.RefObject<HTMLDivElement>, isPaused: boolean, manualBlock: boolean, canMove: boolean, speed: number = 1) => {
    useEffect(() => {
      const container = ref.current;
      if (!container || !canMove) {return;}

      let interval: any;
      if (!isPaused && !manualBlock) {
        interval = setInterval(() => {
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 2) {
            container.scrollTo({ left: 0, behavior: 'auto' });
          } else {
            container.scrollBy({ left: speed, behavior: 'auto' });
          }
        }, 30);
      }
      return () => clearInterval(interval);
    }, [isPaused, manualBlock, ref, canMove, speed]);
  };

  useTickerAutoScroll(localScrollRef, isLocalPaused, manualLocal, localCanScroll, 1.2);
  useTickerAutoScroll(worldScrollRef, isWorldPaused, manualWorld, worldCanScroll, 1.0);

  const scrollManual = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right', setManual: (v: boolean) => void, canMove: boolean) => {
    const container = ref.current;
    if (container && canMove) {
      setManual(true);
      const jump = 350;
      const target = direction === 'right' ? container.scrollLeft + jump : container.scrollLeft - jump;
      container.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(() => setManual(false), 5000);
    }
  };

  return (
    <>
      {/* Faixa Local (Red) */}
      <div className="bg-black py-1.5 overflow-hidden border-t-4 border-red-600 relative z-40 group/local">
        {localCanScroll && (
          <button 
              onClick={(e) => { e.stopPropagation(); scrollManual(localScrollRef, 'left', setManualLocal, localCanScroll); }} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/local:opacity-100 transition-opacity shadow-lg hover:scale-110 ticker-btn"
          >
              <i className="fas fa-chevron-left text-[8px]"></i>
          </button>
        )}

        <div 
            ref={localScrollRef}
            onMouseEnter={() => setIsLocalPaused(true)}
            onMouseLeave={() => setIsLocalPaused(false)}
            className={`flex items-center gap-12 md:gap-24 overflow-x-auto scrollbar-hide whitespace-nowrap px-12 ${!localCanScroll ? 'justify-center' : ''}`}
        >
          <span className="text-red-600 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/50 font-black uppercase italic text-[10px] md:text-xs shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0">PLANTÃO LAGOA</span>
          {latestNews.length > 0 ? latestNews.map((n, idx) => {
            const isPatos = n.city === 'Patos de Minas';
            return (
              <button 
                key={`local-${idx}`} 
                onClick={() => onNewsClick?.(n)} 
                className={`${isPatos ? 'text-yellow-400' : 'text-white'} text-[10px] md:text-xs font-black uppercase italic hover:text-red-500 transition-colors flex items-center gap-2 shrink-0 ticker-btn`}
              >
                 <i className={`fas fa-circle text-[4px] ${isPatos ? 'text-yellow-500' : 'text-red-600'}`}></i>
                 {n.title}
                 {isPatos && <span className="text-[7px] bg-yellow-400 text-black px-1 rounded-sm not-italic ml-1 font-black">PATOS</span>}
              </button>
            );
          }) : (
            <span className="text-white/40 text-[10px] uppercase font-bold shrink-0">ACOMPANHE O PORTAL LFNM</span>
          )}
        </div>

        {localCanScroll && (
          <button 
              onClick={(e) => { e.stopPropagation(); scrollManual(localScrollRef, 'right', setManualLocal, localCanScroll); }} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/local:opacity-100 transition-opacity shadow-lg hover:scale-110 ticker-btn"
          >
              <i className="fas fa-chevron-right text-[8px]"></i>
          </button>
        )}
      </div>

      {/* Faixa Mundo (Green) */}
      <div className="bg-black py-1.5 overflow-hidden border-b-4 border-green-600 relative z-40 border-t border-white/10 group/world">
        {worldCanScroll && (
          <button 
              onClick={(e) => { e.stopPropagation(); scrollManual(worldScrollRef, 'left', setManualWorld, worldCanScroll); }} 
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/world:opacity-100 transition-opacity shadow-lg hover:scale-110 ticker-btn"
          >
              <i className="fas fa-chevron-left text-[8px]"></i>
          </button>
        )}

        <div 
            ref={worldScrollRef}
            onMouseEnter={() => setIsWorldPaused(true)}
            onMouseLeave={() => setIsWorldPaused(false)}
            className={`flex items-center gap-12 md:gap-24 overflow-x-auto scrollbar-hide whitespace-nowrap px-12 ${!worldCanScroll ? 'justify-center' : ''}`}
        >
           <span className="text-green-500 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50 font-black uppercase italic text-[10px] md:text-xs shadow-[0_0_15px_rgba(34,197,94,0.5)] shrink-0">GIRO MUNDO</span>
           {brazilNews.length > 0 ? brazilNews.map((n, idx) => {
             const isTech = n.category === 'Tecnologia';
             let textColor = 'text-green-500';
             let icon = 'fa-globe-americas';
             if (isTech) { textColor = 'text-blue-400'; icon = 'fa-microchip'; }
             
             return (
               <a key={`world-${idx}`} href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className={`${textColor} text-[10px] md:text-xs font-black uppercase hover:brightness-125 transition-all flex items-center gap-2 shrink-0 ticker-btn`}>
                  <i className={`fas ${icon} text-[9px] opacity-70`}></i>
                  {n.title}
                  <span className={`text-[7px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded ml-1 font-mono tracking-tighter`}>{n.sourceName}</span>
               </a>
             );
           }) : (
             <span className="text-white/40 text-[10px] uppercase font-bold shrink-0">GIRO DE NOTÍCIAS</span>
           )}
        </div>

        {worldCanScroll && (
          <button 
              onClick={(e) => { e.stopPropagation(); scrollManual(worldScrollRef, 'right', setManualWorld, worldCanScroll); }} 
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/world:opacity-100 transition-opacity shadow-lg hover:scale-110 ticker-btn"
          >
              <i className="fas fa-chevron-right text-[8px]"></i>
          </button>
        )}
      </div>
    </>
  );
};

export default NewsTicker;
