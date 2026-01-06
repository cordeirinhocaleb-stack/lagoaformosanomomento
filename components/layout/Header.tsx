
import React, { useState, useEffect } from 'react';
import { User, NewsItem } from '../../types';
import { getCurrentWeather, getDollarRate } from '../../services/geminiService';
import { CATEGORIES, RegionFilterType } from './CategoryMenu'; 

import VisualBanner from './header/VisualBanner';
import NewsTicker from './header/NewsTicker';
import DataBar from './header/DataBar';
import ExtraMenu from './header/ExtraMenu';

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
  
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
  selectedRegion?: RegionFilterType;
  onSelectRegion?: (region: RegionFilterType) => void;
  onJobsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onAdminClick, onHomeClick, latestNews = [], brazilNews = [], user, onLogout, onNewsClick, isSimplified = false, onOpenProfile,
  selectedCategory, onSelectCategory, selectedRegion, onSelectRegion, onJobsClick
}) => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [sirenState, setSirenState] = useState(false); 
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const [weatherForecast, setWeatherForecast] = useState<any[]>([]);
  const [dollar, setDollar] = useState<string | null>(null);
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timeTimer = setInterval(() => {
        currentTime !== new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) && setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setSirenState(prev => !prev); 
    }, 1000);
    
    getCurrentWeather().then(setWeatherForecast);
    getDollarRate().then(data => setDollar(data.rate));
    
    return () => clearInterval(timeTimer);
  }, []);

  const getStickyBtnClass = (isActive: boolean, isIcon: boolean = false) => {
      return `whitespace-nowrap px-4 py-2 md:px-6 md:py-1 rounded-full text-[10px] md:text-[9px] font-black uppercase tracking-widest transition-all border min-w-[60px] md:min-w-[80px] flex justify-center items-center ${
          isActive 
          ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]' 
          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
      }`;
  };

  const constructionPattern = `data:image/svg+xml,%3Csvg width='300' height='300' viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' fill='%23f59e0b' font-family='Arial' font-weight='900' font-size='24' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 150 150)' opacity='0.15'%3EEM CONSTRUÇÃO %E2%80%A2 EM OBRAS%3C/text%3E%3C/svg%3E`;

  if (isSimplified) {
    return (
      <header className="bg-black sticky top-0 z-[100] shadow-2xl w-full border-b-4 border-red-600">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 cursor-pointer active:scale-95 transition-all" onClick={onHomeClick}>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-white leading-none tracking-tight">PAINEL OPERACIONAL</span>
              <span className="text-[7px] font-bold text-red-600 uppercase tracking-widest mt-1">SISTEMA INTEGRADO LFNM</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
                <button onClick={onOpenProfile} className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 group">
                    <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-red-600 overflow-hidden group-hover:animate-almost-fall group-active:animate-almost-fall">
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
    <>
      {showComingSoon && (
          <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn font-['Caveat']" onClick={() => setShowComingSoon(false)}>
              <div className="bg-zinc-900 rounded-[2.5rem] p-1 max-w-md w-full text-center shadow-2xl relative overflow-hidden group" onClick={e => e.stopPropagation()}>
                  <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url("${constructionPattern}")` }}></div>
                  <div className="relative bg-black/50 rounded-[2.0rem] overflow-hidden h-full m-3 shadow-inner border border-white/10 backdrop-blur-sm">
                      <div className="absolute inset-0 z-0 opacity-40">
                          <iframe 
                              src="https://player.vimeo.com/video/1150718999?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1&transparent=0" 
                              className="w-full h-full absolute inset-0 pointer-events-none scale-[1.5]"
                              frameBorder="0" 
                              loading="eager"
                              allow="autoplay; fullscreen; picture-in-picture" 
                              allowFullScreen
                              title="Background Video"
                          ></iframe>
                      </div>
                      <div className="relative z-10 p-8 md:p-12 flex flex-col items-center">
                          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)] animate-bounce text-black">
                              <i className="fas fa-hard-hat text-4xl"></i>
                          </div>
                          <h2 className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] leading-none">
                              Em Obras!
                          </h2>
                          <p className="text-white font-bold text-xl md:text-2xl leading-relaxed mb-8 drop-shadow-md">
                              "Calma ai soh, tamu ajeitanu essa parte!"
                          </p>
                          <button onClick={() => setShowComingSoon(false)} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-black text-lg hover:bg-white transition-colors shadow-lg uppercase tracking-widest transform hover:scale-105 font-sans">
                              Entendido
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <header className="bg-black w-full relative z-[50] pb-0">
          <VisualBanner onHomeClick={onHomeClick} currentTime={currentTime} sirenState={sirenState} />
          <NewsTicker latestNews={latestNews} brazilNews={brazilNews} onNewsClick={onNewsClick} />
          <div className="w-full bg-black border-t-4 border-green-600">
            <DataBar weatherForecast={weatherForecast} dollar={dollar} user={user} onAdminClick={onAdminClick} onOpenProfile={onOpenProfile} onLogout={onLogout} />
          </div>
      </header>
      
      <ExtraMenu onJobsClick={onJobsClick} onComingSoon={() => setShowComingSoon(true)} />

      <div 
        className={`fixed top-0 left-0 w-full z-[10000] bg-black border-b-4 border-red-600 shadow-2xl transition-transform duration-300 ease-in-out transform ${
            isScrolled ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
          <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between gap-4 overflow-hidden h-14 md:h-14">
              
              <div className="flex items-center gap-3 shrink-0 cursor-pointer group" onClick={onHomeClick}>
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] group-hover:scale-105 transition-transform">
                      <i className="fas fa-microphone-lines text-xs group-hover:animate-almost-fall group-active:animate-almost-fall"></i>
                  </div>
                  <div className="hidden md:flex flex-col justify-center">
                      <span className="text-white font-[1000] uppercase text-[10px] leading-none tracking-tight">LAGOA FORMOSA</span>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-red-600 text-[7px] font-black uppercase tracking-widest">NO MOMENTO</span>
                          <span className="text-zinc-500 text-[7px] font-mono border-l border-zinc-800 pl-2">
                              {currentTime}
                          </span>
                      </div>
                  </div>
              </div>

              <div className="flex flex-1 justify-center items-center overflow-hidden px-2">
                  <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide py-1 mask-fade-sides w-full md:w-auto">
                      {['Lagoa Formosa', 'Patos e Região', 'Brasil', 'Mundo'].map((region) => {
                          return (
                              <button
                                  key={region}
                                  onClick={() => onSelectRegion && onSelectRegion(region as RegionFilterType)}
                                  className={getStickyBtnClass(selectedRegion === region)}
                              >
                                  {region === 'Lagoa Formosa' ? (
                                      <span className="md:hidden">LAGOA</span>
                                  ) : region === 'Patos e Região' ? (
                                      <span className="md:hidden">PATOS</span>
                                  ) : region === 'Brasil' ? (
                                      <span className="md:hidden">BR</span>
                                  ) : (
                                      <span className="md:hidden">MUNDO</span>
                                  )}
                                  <span className="hidden md:inline">{region === 'Lagoa Formosa' ? 'LFNM' : region === 'Patos e Região' ? 'PATOS' : region.toUpperCase()}</span>
                              </button>
                          );
                      })}
                      
                      <div className="h-4 w-px bg-zinc-800 mx-1 hidden md:block"></div>

                      {CATEGORIES.slice(0, 6).map(cat => (
                          <button
                              key={cat.id}
                              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                              className={`${getStickyBtnClass(selectedCategory === cat.id)} hidden md:flex`}
                          >
                              {cat.id === 'all' ? 'TUDO' : cat.name.toUpperCase()}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 border-l border-zinc-800 pl-2 md:pl-4">
                  {user ? (
                      <div className="flex items-center gap-2">
                          {user.role !== 'Leitor' && (
                            <button onClick={onAdminClick} className="bg-red-600 text-white w-8 h-8 md:w-auto md:px-3 md:py-1 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all flex items-center justify-center gap-2 shadow-md">
                                    <i className="fas fa-satellite-dish"></i>
                                    <span className="hidden md:inline">Painel</span>
                            </button>
                          )}
                          {user.role === 'Leitor' && (
                            <button onClick={onOpenProfile} className="bg-white text-black w-8 h-8 md:w-auto md:px-3 md:py-1 rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-md">
                                <i className="fas fa-user-circle"></i>
                                <span className="hidden md:inline">Minha Conta</span>
                            </button>
                          )}
                      </div>
                  ) : (
                      <button onClick={onAdminClick} className="bg-white text-black px-3 md:px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors shadow-lg group">
                          <span className="group-hover:animate-almost-fall group-active:animate-almost-fall inline-block">ENTRAR</span>
                      </button>
                  )}
              </div>
          </div>
          
          <style>{`
            .mask-fade-sides {
              -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
              mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            }
          `}</style>
      </div>
    </>
  );
};

export default Header;
