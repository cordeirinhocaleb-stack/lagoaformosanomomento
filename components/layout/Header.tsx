
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

interface WeatherData {
  day: string;
  temp: number;
  condition: string;
  icon: string;
  moonPhase?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onAdminClick, 
  onHomeClick, 
  latestNews = [],
  brazilNews = [],
  user,
  onLogout,
  onNewsClick,
  isSimplified = false,
  onOpenProfile
}) => {
  const [logoOffset, setLogoOffset] = useState(0); 
  const [showAnimation, setShowAnimation] = useState(false); 
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [weatherForecast, setWeatherForecast] = useState<WeatherData[]>([]);
  const [dollar, setDollar] = useState<string | null>(null);
  
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowAnimation(true);
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    getCurrentWeather().then(data => setWeatherForecast(data));
    getDollarRate().then(data => setDollar(data.rate));

    return () => {
      clearInterval(timeTimer);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Efeito Parallax do Logo
    if (logoContainerRef.current) {
        const rect = logoContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const mouseX = e.clientX;
        const delta = (mouseX - centerX) / (rect.width / 2);
        setLogoOffset(delta * 10);
    }

    // 2. Lanterna Interativa do Mouse
    if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        bannerRef.current.style.setProperty('--x', `${x}px`);
        bannerRef.current.style.setProperty('--y', `${y}px`);
    }
  };

  const handleMouseLeave = () => {
      setLogoOffset(0);
  };

  const brandIconUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"; 
  const fallbackBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const bannerImageUrl = "https://lh3.googleusercontent.com/d/1C1WhdivmBnt1z23xZGOJw0conC1jtq4i";
  const presenterVideoUrl = "https://vimeo.com/1149429293";
  const climatempoUrl = "https://www.climatempo.com.br/previsao-do-tempo/cidade/403/lagoaformosa-mg";

  if (isSimplified) {
    return (
      <header className="bg-black sticky top-0 z-[100] shadow-2xl w-full border-b-4 border-red-600">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onHomeClick}>
            <div className="w-10 h-10 relative">
               <img 
                 src={brandIconUrl} 
                 alt="Logo" 
                 className="w-full h-full object-contain animate-mic-shake" 
                 onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackBase64; }}
               />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-0.5 scale-y-[1.1] origin-left">
                <span className="text-white font-black text-sm tracking-tighter uppercase leading-none">LAGOA</span>
                <span className="text-red-600 font-black text-sm tracking-tighter uppercase leading-none">FORMOSA</span>
              </div>
              <span className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.2em] leading-none mt-1">NO MOMENTO • PAINEL</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
                <button onClick={onOpenProfile} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-all">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-white font-bold text-[10px] leading-tight">{user.name}</span>
                        <span className="text-red-500 font-black uppercase text-[8px] tracking-widest">{user.role}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-red-600 flex items-center justify-center overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <span className="font-black text-white text-xs">{user.name.charAt(0)}</span>}
                    </div>
                </button>
            )}
            <button onClick={onLogout} className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-red-600/20">
              Sair
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white sticky top-0 z-[100] shadow-md w-full">
      <div 
        ref={bannerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-44 sm:h-52 md:h-[220px] lg:h-[320px] bg-black flex items-center overflow-hidden md:overflow-visible transition-all duration-500 banner-interactive cursor-crosshair"
      >
        <div className="mouse-flashlight"></div>

        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-black">
          <img 
            src={bannerImageUrl} 
            alt="Fundo" 
            className="w-full h-full object-cover opacity-30 animate-kenburns" 
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackBase64; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black/80"></div>
        </div>

        <div className="sun-reflection-container">
             <div className="sun-reflection"></div>
        </div>

        <div className="relative w-full max-w-[1500px] mx-auto z-30 cursor-pointer px-0 h-full flex items-center" onClick={onHomeClick}>
          <div className="flex flex-row items-center justify-start md:justify-start w-full h-full relative">
            <div 
                onClick={(e) => { e.stopPropagation(); onHomeClick(); }}
                className="flex items-center absolute left-[-6%] sm:left-0 md:relative md:left-auto md:top-auto md:translate-x-0 md:translate-y-0 top-1/2 -translate-y-1/2 z-[50] group transition-all duration-700 cursor-pointer md:-ml-16 lg:ml-12 md:gap-4"
            >
                <div 
                  ref={logoContainerRef}
                  className="relative w-[160px] h-[160px] sm:w-[176px] sm:h-[176px] md:w-[320px] md:h-[320px] lg:w-[420px] lg:h-[420px] transition-transform duration-500 ease-out flex-shrink-0 z-40 mr-[-30px] sm:mr-[-50px] md:mr-0"
                  style={{ transform: `translateX(${logoOffset}px)` }}
                >
                   {showAnimation && <div className="logo-red-glow"></div>}
                   <img 
                     src={brandIconUrl} 
                     alt="Logo" 
                     className="relative w-full h-full object-contain z-30 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-mic-shake" 
                     onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallbackBase64; }}
                   />
                </div>

                <div className="flex flex-col items-center pl-4 pr-12 md:px-0 py-4 transition-all duration-700 relative -ml-6 md:-ml-24 lg:-ml-32">
                    <div className="relative z-10 flex flex-col items-center lg:items-end">
                      <div className="flex flex-col items-start transform origin-bottom mb-2 sm:mb-4 relative z-20">
                        <svg className="w-[300px] h-[60px] sm:w-[400px] sm:h-[80px] md:w-[600px] md:h-[120px] lg:w-[800px] lg:h-[160px]" viewBox="0 0 800 160" preserveAspectRatio="xMinYMid meet">
                            <defs>
                                <mask id="textMask">
                                    <text x="0" y="80" className="font-[900] uppercase tracking-tighter" style={{ fontSize: '100px', fontFamily: '"Inter", sans-serif', fill: 'white' }}>LAGOA</text>
                                    <text x="120" y="150" className="font-[900] uppercase tracking-tighter" style={{ fontSize: '100px', fontFamily: '"Inter", sans-serif', fill: 'white' }}>FORMOSA</text>
                                </mask>
                                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                    <stop offset="50%" stopColor="rgba(255,255,255,1)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>
                            <text x="0" y="80" className="font-[900] uppercase tracking-tighter" style={{ fontSize: '100px', fontFamily: '"Inter", sans-serif', fill: '#444' }}>LAGOA</text>
                            <text x="120" y="150" className="font-[900] uppercase tracking-tighter" style={{ fontSize: '100px', fontFamily: '"Inter", sans-serif', fill: '#500' }}>FORMOSA</text>
                            <g mask="url(#textMask)">
                                <rect x="0" y="0" width="100%" height="100%" fill="url(#beamGradient)" className="flashlight-beam" style={{ mixBlendMode: 'overlay' }} />
                                <text x="0" y="80" className="font-[900] uppercase tracking-tighter flashlight-beam" style={{ fontSize: '100px', fontFamily: '"Inter", sans-serif', fill: 'white', opacity: 0.9 }}>LAGOA</text>
                                <text x="120" y="150" className="font-[900] uppercase tracking-tighter flashlight-beam" style={{ fontSize: '100px', fontFamily: '"Inter", sans-serif', fill: '#FF0000', opacity: 1, filter: 'drop-shadow(0 0 15px red)' }}>FORMOSA</text>
                            </g>
                        </svg>
                      </div>
                    </div>
                </div>
            </div>

            <div 
              className="absolute right-[0%] lg:right-[5%] bottom-[-42%] sm:bottom-[-32%] md:bottom-[-50%] lg:bottom-[-57%] h-[145%] sm:h-[100%] md:h-[165%] lg:h-[178%] w-auto z-[70] flex items-end transition-all duration-700 pointer-events-auto cursor-default"
              onClick={(e) => { 
                  e.stopPropagation(); 
                  e.preventDefault();
              }}
            >
              <VideoPresenter src={presenterVideoUrl} autoPlay={true} className="h-full aspect-[9/16] drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]" />
            </div>

            <div className="absolute right-[10%] md:right-[15%] lg:right-[22%] bottom-[10%] z-[95] pointer-events-none flex flex-col items-end">
                <div className="flex items-stretch skew-x-[-15deg] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-x-4 border-white/30 overflow-hidden">
                  <div className="bg-red-600 px-4 sm:px-8 py-1.5 sm:py-3 flex items-center">
                    <span className="text-white font-black text-sm sm:text-2xl md:text-4xl italic skew-x-[15deg] tracking-tighter whitespace-nowrap block">NO MOMENTO</span>
                  </div>
                  <div className="bg-black px-4 sm:px-8 py-1.5 sm:py-3 border-l-2 border-red-600 flex items-center relative">
                    <div className="absolute inset-0 border-y-2 border-red-600 opacity-80"></div>
                    <span className="text-white font-mono text-sm sm:text-2xl md:text-4xl font-black skew-x-[15deg] tracking-widest block drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] z-10 animate-second-pulse">
                        {currentTime}
                    </span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-black py-1 sm:py-2 overflow-hidden border-t-2 sm:border-t-4 border-red-600 relative z-[35]">
        <div className="w-full flex items-center">
          <div className="bg-red-600 px-2 sm:px-4 py-0.5 sm:py-1 skew-x-[-15deg] ml-2 sm:ml-4 shrink-0 z-10 shadow-lg">
            <span className="text-[7px] sm:text-[9px] font-black text-white uppercase italic skew-x-[15deg] tracking-widest">PLANTÃO REGIONAL</span>
          </div>
          <div className="text-[9px] sm:text-[11px] md:text-sm text-white whitespace-nowrap animate-marquee font-black uppercase italic opacity-95 flex gap-8 sm:gap-24">
            {latestNews.length > 0 ? latestNews.map((n, idx) => (
              <button key={idx} onClick={(e) => { e.stopPropagation(); if(onNewsClick) onNewsClick(n); }} className="flex items-center gap-2 sm:gap-4 hover:text-red-500 transition-colors">
                <span className="text-red-600 text-sm sm:text-xl">✦</span> {n.title}
              </button>
            )) : (
              <span className="flex items-center gap-2 sm:gap-4"><span className="text-red-600 text-sm sm:text-xl animate-pulse">✦</span> AGUARDANDO ATUALIZAÇÕES REGIONAIS...</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-black/90 py-1 sm:py-2 overflow-hidden border-b-2 sm:border-b-4 border-green-600 relative z-[34]">
        <div className="w-full flex items-center">
          <div className="bg-green-600 px-2 sm:px-4 py-0.5 sm:py-1 skew-x-[-15deg] ml-2 sm:ml-4 shrink-0 z-10 shadow-lg flex items-center gap-2">
            <span className="text-[7px] sm:text-[9px] font-black text-white uppercase italic skew-x-[15deg] tracking-widest">PLANTÃO BRASIL</span>
          </div>
          <div className="text-[9px] sm:text-[11px] md:text-sm text-green-400 whitespace-nowrap animate-marquee font-black uppercase italic opacity-95 flex gap-8 sm:gap-24" style={{ animationDuration: '100s' }}>
            {brazilNews.length > 0 ? brazilNews.map((n, idx) => (
              <a key={idx} href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-4 hover:text-white transition-colors">
                <span className="text-green-600 text-sm sm:text-xl">✦</span> {n.title}
              </a>
            )) : (
              <span className="flex items-center gap-2 sm:gap-4"><span className="text-green-600 text-sm sm:text-xl animate-pulse">✦</span> SINCRONIZANDO MANCHETES POLÍTICAS...</span>
            )}
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-50/50 flex flex-row justify-between items-center px-4 py-2 border-b border-gray-100 min-h-[60px] relative z-[80]">
        <a href={climatempoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-6 overflow-x-auto scrollbar-hide hover:opacity-80 transition-all cursor-pointer group/weather flex-1">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
            <i className="fas fa-location-dot text-red-600 text-[10px]"></i>
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-700">Lagoa Formosa</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             {weatherForecast.length > 0 ? weatherForecast.map((w, idx) => (
               <div key={idx} className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all ${idx === 0 ? 'bg-white shadow-md border border-red-100' : 'opacity-40 sm:opacity-60'}`}>
                 <div className={`w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center ${idx === 0 ? 'text-red-600' : 'text-gray-400'}`}>
                   <i className={`fas ${w.icon} text-[10px] sm:text-xs`}></i>
                 </div>
                 <div className="flex flex-col">
                   <div className="flex items-center gap-1">
                      <span className="text-[9px] sm:text-[11px] font-black text-black leading-none">{w.temp}°C</span>
                      {idx === 0 && w.moonPhase && (
                        <span className="text-[8px] text-indigo-500 font-bold ml-1 bg-indigo-50 px-1 rounded border border-indigo-100 hidden sm:inline-block"><i className="fas fa-moon mr-1"></i>{w.moonPhase}</span>
                      )}
                   </div>
                   <span className="text-[7px] sm:text-[9px] font-bold uppercase text-gray-500 tracking-tighter leading-tight whitespace-nowrap">{w.day}</span>
                 </div>
               </div>
             )) : <div className="text-[8px] uppercase font-black text-gray-300">Carregando clima...</div>}
          </div>
        </a>

        <div className="flex items-center gap-3 sm:gap-8 ml-4">
            <div className="hidden sm:flex items-center gap-6 border-r border-gray-200 pr-6">
                {dollar && (
                  <div className="flex items-center gap-2.5 px-3 py-1 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex flex-col"><span className="text-[8px] font-black text-green-700 uppercase leading-none">Dólar</span><span className="text-[11px] font-black text-gray-900 leading-tight">R$ {dollar}</span></div>
                  </div>
                )}
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <button onClick={onOpenProfile} className="flex items-center gap-3 bg-white hover:bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm transition-all group">
                    <span className="text-[10px] font-black uppercase text-gray-700 hidden sm:inline">{user.name}</span>
                    <div className="w-8 h-8 rounded-full bg-black border-2 border-red-600 overflow-hidden relative">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">{user.name.charAt(0)}</div>}
                    </div>
                </button>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
