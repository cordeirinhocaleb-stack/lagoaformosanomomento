
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { User } from '../../../types';

interface DataBarProps {
  weatherForecast: any[];
  dollar: string | null;
  user?: User | null;
  onAdminClick?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

const DataBar: React.FC<DataBarProps> = ({ weatherForecast, dollar, user, onAdminClick, onOpenProfile, onLogout }) => {
  const weatherScrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [manualInteraction, setManualInteraction] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const duplicatedForecast = useMemo(() => {
    if (weatherForecast.length === 0) return [];
    return [...weatherForecast, ...weatherForecast];
  }, [weatherForecast]);

  const itemsToRender = canScroll ? duplicatedForecast : weatherForecast;

  useEffect(() => {
    const checkOverflow = () => {
      if (weatherScrollRef.current) {
        const { scrollWidth, clientWidth } = weatherScrollRef.current;
        if (canScroll) setCanScroll((scrollWidth / 2) > clientWidth);
        else setCanScroll(scrollWidth > clientWidth);
      }
    };
    const timer = setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => { window.removeEventListener('resize', checkOverflow); clearTimeout(timer); };
  }, [weatherForecast, canScroll]);

  useEffect(() => {
    const container = weatherScrollRef.current;
    if (!container || weatherForecast.length === 0 || !canScroll) return;
    let interval: any;
    if (!isPaused && !manualInteraction) {
      interval = setInterval(() => {
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) container.scrollTo({ left: 0, behavior: 'auto' });
        else container.scrollBy({ left: 1, behavior: 'auto' });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPaused, manualInteraction, weatherForecast, canScroll]);

  const scrollWeather = (direction: 'left' | 'right') => {
    const container = weatherScrollRef.current;
    if (container && canScroll) {
      setManualInteraction(true);
      const jump = 240;
      const target = direction === 'right' ? container.scrollLeft + jump : container.scrollLeft - jump;
      container.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(() => {
          if(container.scrollLeft >= container.scrollWidth / 2) container.scrollTo({ left: 0, behavior: 'auto' });
          setManualInteraction(false);
      }, 5000);
    }
  };

  return (
    <div className="w-full bg-gray-50 flex justify-between items-center px-4 md:px-8 py-2 border-b border-gray-100 overflow-hidden relative">
        <div className="relative flex-1 flex items-center group/weather-nav overflow-hidden">
            {canScroll && (
              <div className="absolute left-0 z-30 h-full px-1 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent flex items-center justify-start opacity-0 group-hover/weather-nav:opacity-100 transition-all">
                  <button onClick={(e) => { e.stopPropagation(); scrollWeather('left'); }} className="bg-white shadow-md border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors active:scale-90" title="Anterior"><i className="fas fa-chevron-left text-xs"></i></button>
              </div>
            )}
            <div ref={weatherScrollRef} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} className={`flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1 ${canScroll ? 'px-10' : 'justify-start'}`}>
                {itemsToRender.map((w, idx) => {
                  const isFirstSet = idx < weatherForecast.length;
                  return (
                    <div key={idx} className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all flex-shrink-0 ${isFirstSet && idx === 0 ? 'bg-white shadow-sm border border-red-100 pr-8' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'}`}>
                      <div className="flex flex-col items-center justify-center w-8 text-center"><i className={`fas ${w.icon} text-xl text-red-600 mb-0.5`}></i>{w.rainChance > 0 ? (<span className="text-[8px] font-black text-blue-500 flex items-center justify-center w-full"><i className="fas fa-droplet text-[6px] mr-0.5"></i> {w.rainChance}%</span>) : (<span className="text-[8px] font-bold text-gray-300">-</span>)}</div>
                      <div className="flex flex-col"><div className="flex items-center gap-2"><span className="text-sm font-black leading-none text-gray-900">{w.temp}°C</span></div><span className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">{w.day}</span></div>
                    </div>
                  );
                })}
            </div>
            {canScroll && (
              <div className="absolute right-0 z-30 h-full px-1 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent flex items-center justify-end opacity-0 group-hover/weather-nav:opacity-100 transition-all">
                  <button onClick={(e) => { e.stopPropagation(); scrollWeather('right'); }} className="bg-white shadow-md border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors active:scale-90" title="Próximo"><i className="fas fa-chevron-right text-xs"></i></button>
              </div>
            )}
        </div>
        <div className="flex items-center gap-2 md:gap-4 ml-2 relative z-40 bg-gray-50 pl-2 md:pl-4 border-l border-gray-200/50 shrink-0">
            {dollar && (<div className="flex items-center gap-2 bg-green-50 px-2 md:px-4 py-1.5 rounded-xl border border-green-100 shrink-0"><span className="text-[8px] md:text-[9px] font-black text-green-700 uppercase hidden sm:inline">Dólar</span><span className="text-[10px] md:text-xs font-black text-green-800">R$ {dollar}</span></div>)}
            {user ? (
               <div className="flex items-center gap-2 md:gap-3">
                  {user.role !== 'Leitor' && (
                    <button 
                        onClick={onAdminClick} 
                        className="bg-red-600 text-white w-12 h-12 md:w-auto md:px-6 md:py-2.5 rounded-xl md:rounded-2xl text-[11px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl flex items-center justify-center gap-2 group border-2 border-white/20 active:scale-90"
                    >
                        <i className="fas fa-satellite-dish text-xl md:hidden group-hover:animate-spin"></i>
                        <span className="hidden md:inline">Painel</span>
                    </button>
                  )}
                  <button onClick={onOpenProfile} className="flex items-center gap-2 bg-white px-2.5 md:px-4 py-2 md:py-2.5 rounded-xl border border-gray-200 shadow-lg hover:border-red-200 transition-all group">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-100 overflow-hidden border border-gray-100 shadow-sm">
                          {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-gray-400 flex items-center justify-center h-full">{user.name.charAt(0)}</span>}
                      </div>
                      <span className="text-[10px] font-black uppercase text-gray-600 group-hover:text-red-600 truncate max-w-[80px] hidden md:inline">{user.name.split(' ')[0]}</span>
                  </button>
               </div>
            ) : (
               <button onClick={onAdminClick} className="bg-black text-white px-5 md:px-7 py-3 md:py-3.5 rounded-xl md:rounded-full text-[11px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg flex items-center justify-center gap-3 whitespace-nowrap group active:scale-95 border-2 border-white/10">
                   <i className="fas fa-user-circle text-2xl md:hidden"></i> 
                   <span className="hidden md:inline">Painel</span>
                   <span className="md:hidden">Login</span>
               </button>
            )}
        </div>
    </div>
  );
};

export default DataBar;
