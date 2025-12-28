
import React, { useState, useEffect, useRef } from 'react';
import { User, NewsItem } from '../types';
import VideoPresenter from './ChromaKeyVideo';
import { getCurrentWeather, getDollarRate } from '../services/geminiService';

interface HeaderProps {
  onAdminClick: () => void;
  onHomeClick: () => void;
  latestNews?: NewsItem[];
  brazilNews?: any[];
  user?: User | null;
  onLogout?: () => void;
  onNewsClick?: (news: NewsItem) => void;
  isSimplified?: boolean;
}

interface WeatherData {
  day: string;
  temp: number;
  condition: string;
  icon: string;
  moonPhase?: string;
}

/**
 * [COMPONENTE ESTRUTURAL] Cabeçalho Principal (Header)
 * -----------------------------------------------------------
 * Responsável por:
 * 1. Exibir o Banner animado (Ken Burns).
 * 2. Apresentador Virtual (VideoPresenter).
 * 3. Logotipo dinâmico que segue o mouse.
 * 4. Faixas de Notícias (Marquee/Letreiro Digital).
 */
const Header: React.FC<HeaderProps> = ({ 
  onAdminClick, 
  onHomeClick, 
  latestNews = [],
  brazilNews = [],
  user,
  onLogout,
  onNewsClick,
  isSimplified = false
}) => {
  // [ESTADO] Variáveis para controlar animações e dados em tempo real
  const [logoOffset, setLogoOffset] = useState(0); // Movimento do logo
  const [showAnimation, setShowAnimation] = useState(false); // Gatilho de entrada
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [weatherForecast, setWeatherForecast] = useState<WeatherData[]>([]);
  const [dollar, setDollar] = useState<string | null>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  // [EFEITO] Inicialização (DidMount)
  useEffect(() => {
    setShowAnimation(true);
    // Atualiza o relógio a cada 10 segundos
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 10000);

    // Busca dados externos (Clima e Dólar)
    getCurrentWeather().then(data => setWeatherForecast(data));
    getDollarRate().then(data => setDollar(data.rate));

    return () => {
      clearInterval(timeTimer);
    };
  }, []);

  // [LÓGICA] Efeito de Parallax do Logo (segue o mouse suavemente)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!logoContainerRef.current) return;
    const rect = logoContainerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const mouseX = e.clientX;
    const delta = (mouseX - centerX) / (rect.width / 2);
    setLogoOffset(delta * 10);
  };

  // [RENDERIZAÇÃO] Gera as letras animadas uma a uma
  const renderAnimatedText = (text: string, baseDelay: number, isRed: boolean = false) => {
    return text.split('').map((char, index) => (
      <span 
        key={index} 
        className={`hover-letter ${isRed ? 'text-red-600' : 'text-white'} ${showAnimation ? 'animate-word-scramble' : ''}`}
        style={{ 
          animationDelay: `${baseDelay + (index * 0.1)}s`,
          display: char === ' ' ? 'inline' : 'inline-block'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  // [CONFIGURAÇÃO] URLs de Mídia (Imagens e Vídeos)
  // Atualizado para o novo ícone solicitado
  const brandIconUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"; 
  const bannerImageUrl = "https://lh3.googleusercontent.com/d/1C1WhdivmBnt1z23xZGOJw0conC1jtq4i";
  const presenterVideoUrl = "https://vimeo.com/1149429293";
  const climatempoUrl = "https://www.climatempo.com.br/previsao-do-tempo/cidade/403/lagoaformosa-mg";

  // [MODO SIMPLIFICADO] Cabeçalho menor para Admin e Páginas Internas
  if (isSimplified) {
    return (
      <header className="bg-black sticky top-0 z-[100] shadow-2xl w-full border-b-4 border-red-600">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onHomeClick}>
            <div className="w-10 h-10 relative">
               {/* Aplica animação de shake também no logo simplificado */}
               <img src={brandIconUrl} alt="Logo" className="w-full h-full object-contain animate-mic-shake" />
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
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white font-mono text-[10px] font-black tracking-widest">{currentTime}</span>
              <span className="text-[6px] text-gray-500 font-bold uppercase tracking-widest">Painel Operacional</span>
            </div>
            <button onClick={onLogout} className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border border-red-600/20">
              Sair
            </button>
          </div>
        </div>
      </header>
    );
  }

  // [MODO COMPLETO] Cabeçalho da Home com Vídeo e Efeitos
  return (
    <header className="bg-white sticky top-0 z-[100] shadow-md w-full">
      <div className="relative w-full h-44 sm:h-52 md:h-[220px] lg:h-[320px] bg-black flex items-center overflow-hidden md:overflow-visible transition-all duration-500">
        
        {/* Background Ken Burns */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <img src={bannerImageUrl} alt="Fundo" className="w-full h-full object-cover opacity-50 animate-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent md:hidden"></div>
        </div>

        <div className="relative w-full max-w-[1500px] mx-auto z-30 cursor-pointer px-0 h-full flex items-center" onClick={onHomeClick}>
          {/* CONTAINER PRINCIPAL DO CONTEÚDO DO HEADER */}
          <div className="flex flex-row items-center justify-start md:justify-center w-full h-full relative">
            
            {/* GRUPO CENTRAL (LOGO + TEXTO) */}
            <div 
                onClick={(e) => { e.stopPropagation(); onHomeClick(); }}
                className="flex items-center absolute left-[-6%] sm:left-0 md:relative md:left-auto md:top-auto md:translate-x-0 md:translate-y-0 top-1/2 -translate-y-1/2 z-[50] group transition-all duration-700 cursor-pointer md:justify-center md:w-full md:gap-4"
            >
                {/* 1. Logo (Microfone) */}
                <div 
                  ref={logoContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => { setLogoOffset(0); }}
                  className="relative w-[160px] h-[160px] sm:w-[176px] sm:h-[176px] md:w-[320px] md:h-[320px] lg:w-[420px] lg:h-[420px] transition-transform duration-500 ease-out flex-shrink-0 z-40 mr-[-30px] sm:mr-[-50px] md:mr-0"
                  style={{ transform: `translateX(${logoOffset}px)` }}
                >
                   {/* Efeito de brilho de fundo (apenas na animação inicial) */}
                   {showAnimation && <div className="logo-red-glow"></div>}
                   
                   {/* Imagem do Microfone com Animação de Shake/Vibração no Hover */}
                   <img 
                     src={brandIconUrl} 
                     alt="Logo" 
                     className="relative w-full h-full object-contain z-30 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-mic-shake" 
                   />
                </div>

                {/* 2. Texto (Lagoa Formosa) */}
                <div className="flex flex-col items-center pl-4 pr-12 md:px-0 py-4 transition-all duration-700 relative">
                    <div className="relative z-10 flex flex-col items-center lg:items-end">
                      <div className="flex flex-col items-start gap-y-1 transform scale-y-[1.3] sm:scale-y-[1.2] origin-bottom mb-2 sm:mb-4">
                        
                        {/* WRAPPER LAGOA */}
                        <div className="relative overflow-hidden z-20">
                           {showAnimation && <div className="police-mirror-effect"></div>}
                           <div className="text-[1.7rem] sm:text-3xl md:text-5xl lg:text-[4.5rem] xl:text-[6rem] font-[1000] uppercase tracking-tighter leading-[0.8] whitespace-nowrap flex drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                              {renderAnimatedText("LAGOA", 0.2)}
                           </div>
                        </div>

                        {/* WRAPPER FORMOSA */}
                        <div className="relative flex flex-col items-start mt-0 z-10 ml-[30%] overflow-hidden">
                             {showAnimation && <div className="police-mirror-effect police-delay"></div>}
                            <div className="text-[1.7rem] sm:text-3xl md:text-5xl lg:text-[4.5rem] xl:text-[6rem] font-[1000] uppercase tracking-tighter leading-[0.8] whitespace-nowrap flex drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                                {renderAnimatedText("FORMOSA", 0.5, true)}
                            </div>
                        </div>
                      </div>
                    </div>
                </div>
            </div>

            {/* Apresentador Chroma Key */}
            <div className="absolute right-[0%] lg:right-[5%] bottom-[-42%] sm:bottom-[-32%] md:bottom-[-50%] lg:bottom-[-57%] h-[145%] sm:h-[100%] md:h-[165%] lg:h-[178%] w-auto z-[70] flex items-end pointer-events-none transition-all duration-700">
              <VideoPresenter src={presenterVideoUrl} autoPlay={true} className="h-full aspect-[9/16] drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]" />
            </div>

            {/* Relógio Digital Estilizado */}
            <div className="absolute right-[10%] md:right-[15%] lg:right-[22%] bottom-[10%] z-[95] pointer-events-none flex flex-col items-end">
                <div className="flex items-stretch skew-x-[-15deg] shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-x-4 border-white/30 overflow-hidden">
                  <div className="bg-red-600 px-4 sm:px-8 py-1.5 sm:py-3 animate-pulse flex items-center">
                    <span className="text-white font-black text-sm sm:text-2xl md:text-4xl italic skew-x-[15deg] tracking-tighter whitespace-nowrap block">NO MOMENTO</span>
                  </div>
                  <div className="bg-black px-4 sm:px-8 py-1.5 sm:py-3 border-l-2 border-red-600 flex items-center relative">
                    <div className="absolute inset-0 border-y-2 border-red-600 opacity-80"></div>
                    <span className="text-white font-mono text-sm sm:text-2xl md:text-4xl font-black skew-x-[15deg] tracking-widest block drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] z-10">{new Date().toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* LINHAS DE PLANTÃO (MARQUEE 1 - LOCAL) */}
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

      {/* LINHAS DE PLANTÃO (MARQUEE 2 - NACIONAL) */}
      <div className="bg-black/90 py-1 sm:py-2 overflow-hidden border-b-2 sm:border-b-4 border-green-600 relative z-[34]">
        <div className="w-full flex items-center">
          <div className="bg-green-600 px-2 sm:px-4 py-0.5 sm:py-1 skew-x-[-15deg] ml-2 sm:ml-4 shrink-0 z-10 shadow-lg flex items-center gap-2">
            <span className="text-[7px] sm:text-[9px] font-black text-white uppercase italic skew-x-[15deg] tracking-widest">PLANTÃO BRASIL</span>
          </div>
          <div className="text-[9px] sm:text-[11px] md:text-sm text-green-400 whitespace-nowrap animate-marquee font-black uppercase italic opacity-95 flex gap-8 sm:gap-24" style={{ animationDuration: '35s' }}>
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

      {/* BARRA DE UTILITÁRIOS (CLIMA / DÓLAR / BOTÃO PAINEL) */}
      <div className="w-full bg-gray-50/50 flex flex-row justify-between items-center px-4 py-2 border-b border-gray-100 min-h-[60px]">
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
              <button onClick={onAdminClick} className="flex bg-black hover:bg-red-600 text-white px-4 sm:px-8 py-2 rounded-full transition-all items-center gap-2 sm:gap-3 shadow-lg group">
                <i className="fas fa-satellite-dish text-red-500 text-[9px] sm:text-[10px] group-hover:animate-pulse"></i>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em]">{user ? 'PAINEL' : 'ENTRAR'}</span>
              </button>
              {user && <button onClick={onLogout} className="hidden sm:block text-[10px] font-black uppercase text-gray-400 hover:text-red-600 tracking-widest">Sair</button>}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
