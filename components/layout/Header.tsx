
import React, { useState, useEffect, useRef } from 'react';
import { User, NewsItem } from '../../types';
import VideoPresenter from '../media/ChromaKeyVideo';
import { getCurrentWeather, getDollarRate } from '../../services/geminiService';

interface HeaderProps {
  onAdminClick: () => void;
  onHomeClick: () => void;
  latestNews?: NewsItem[];
  brazilNews?: any[];
  user?: User | null;
  onLogout?: () => void;
  onNewsClick?: (news: NewsItem) => void;
  isSimplified?: boolean;
  onOpenProfile?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onAdminClick, onHomeClick, latestNews = [], brazilNews = [], user, onLogout, onNewsClick, isSimplified = false, onOpenProfile
}) => {
  const [logoOffset, setLogoOffset] = useState(0); 
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [dollar, setDollar] = useState<string | null>(null);
  
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeTimer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    getCurrentWeather().then(setWeatherForecast);
    getDollarRate().then(data => setDollar(data.rate));
    return () => clearInterval(timeTimer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (logoContainerRef.current) {
        const rect = logoContainerRef.current.getBoundingClientRect();
        const delta = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        setLogoOffset(delta * 10);
    }
    if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        bannerRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
        bannerRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }
  };

  const brandIconUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"; 
  const bannerImageUrl = "https://lh3.googleusercontent.com/d/1C1WhdivmBnt1z23xZGOJw0conC1jtq4i";
  const presenterVideoUrl = "https://vimeo.com/1149429293";

  if (isSimplified) {
    return (
      <header className="bg-black sticky top-0 z-[100] shadow-2xl w-full border-b-4 border-red-600">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-3">
          {/* Navegação unificada para Home */}
          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-all" onClick={onHomeClick}>
            <img src={brandIconUrl} className="w-10 h-10 object-contain animate-mic-shake" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-white leading-none tracking-tight">PAINEL OPERACIONAL</span>
              <span className="text-[7px] font-bold text-red-600 uppercase tracking-widest mt-1">SISTEMA INTEGRADO LFNM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
                <button onClick={onOpenProfile} className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-red-600 overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="text-white text-xs font-black">{user.name.charAt(0)}</span>}
                    </div>
                </button>
            )}
            <button onClick={onLogout} className="bg-red-600/10 text-red-600 px-4 py-2 rounded-lg text-[8px] font-black uppercase border border-red-600/20">Sair</button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white sticky top-0 z-[100] shadow-md w-full">
      <div 
        ref={bannerRef} onMouseMove={handleMouseMove} onMouseLeave={() => setLogoOffset(0)}
        className="relative w-full h-[32vh] sm:h-[40vh] md:h-[300px] lg:h-[350px] bg-black flex items-center overflow-hidden transition-all duration-500"
      >
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src={bannerImageUrl} className="w-full h-full object-cover opacity-20 animate-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        </div>

        <div className="relative w-full max-w-[1500px] mx-auto z-30 flex items-center px-4 md:px-8 h-full">
            <div className="flex items-center relative z-50 group cursor-pointer" onClick={onHomeClick}>
                <div 
                  ref={logoContainerRef}
                  className="relative w-[140px] h-[140px] md:w-[280px] md:h-[280px] lg:w-[350px] lg:h-[350px] transition-transform duration-500 ease-out z-40"
                  style={{ transform: `translateX(${logoOffset}px)` }}
                >
                   <img src={brandIconUrl} className="w-full h-full object-contain animate-mic-shake drop-shadow-2xl" />
                </div>

                <div className="flex flex-col -ml-8 md:-ml-16 lg:-ml-24">
                   <h1 className="text-white text-[10vw] md:text-[60px] lg:text-[90px] font-[1000] uppercase tracking-tighter leading-none whitespace-nowrap">
                      LAGOA <span className="text-red-600">FORMOSA</span>
                   </h1>
                   <div className="bg-red-600 px-4 md:px-10 py-1 md:py-3 skew-x-[-15deg] shadow-2xl w-fit">
                      <span className="text-white text-[5vw] md:text-[30px] lg:text-[45px] font-[1000] uppercase italic skew-x-[15deg] block leading-none">NO MOMENTO</span>
                   </div>
                </div>
            </div>

            <div className="absolute right-0 bottom-[-20%] md:bottom-[-25%] lg:bottom-[-35%] h-[120%] md:h-[140%] lg:h-[160%] w-auto z-[60] flex items-end pointer-events-none">
              <VideoPresenter src={presenterVideoUrl} className="h-full aspect-[9/16] drop-shadow-2xl opacity-90 lg:opacity-100" />
            </div>

            <div className="absolute right-4 md:right-32 bottom-6 md:bottom-10 z-[70] flex flex-col items-end">
                <div className="flex items-stretch skew-x-[-15deg] shadow-2xl border-x-4 border-white/20 overflow-hidden">
                  <div className="bg-black/90 backdrop-blur-md px-4 py-2 md:px-8 md:py-3 border-r-2 border-red-600">
                    <span className="text-white font-mono text-sm md:text-3xl font-black skew-x-[15deg] tracking-widest block">{currentTime}</span>
                  </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-black py-2 overflow-hidden border-y-4 border-red-600 relative z-40">
        <div className="text-xs md:text-sm text-white whitespace-nowrap animate-marquee font-black uppercase italic flex gap-12 md:gap-32">
          {latestNews.length > 0 ? latestNews.map((n, idx) => (
            <button key={idx} onClick={() => onNewsClick?.(n)} className="hover:text-red-500 transition-colors">✦ {n.title}</button>
          )) : <span>Sincronizando manchetes regionais...</span>}
        </div>
      </div>

      <div className="w-full bg-gray-50 flex justify-between items-center px-4 md:px-8 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide flex-1">
             {weatherForecast.map((w, idx) => (
               <div key={idx} className={`flex items-center gap-2 px-3 py-1 rounded-xl ${idx === 0 ? 'bg-white shadow-sm border border-red-100' : 'opacity-40'}`}>
                 <i className={`fas ${w.icon} text-[10px] md:text-sm text-red-600`}></i>
                 <div className="flex flex-col">
                   <span className="text-[10px] md:text-xs font-black leading-none">{w.temp}°C</span>
                   <span className="text-[8px] font-bold uppercase text-gray-500">{w.day}</span>
                 </div>
               </div>
             ))}
        </div>
        {dollar && (
          <div className="hidden md:flex items-center gap-2 ml-4 bg-green-50 px-4 py-1.5 rounded-xl border border-green-100">
            <span className="text-[9px] font-black text-green-700 uppercase">Dólar</span>
            <span className="text-xs font-black">R$ {dollar}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
