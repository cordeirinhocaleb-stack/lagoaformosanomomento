import React, { useRef, useState, useEffect } from 'react';
import VideoPresenter from '../../media/ChromaKeyVideo';

interface VisualBannerProps {
  onHomeClick: () => void;
  currentTime: string;
  sirenState: boolean;
}

const VisualBanner: React.FC<VisualBannerProps> = ({ onHomeClick, currentTime, sirenState }) => {
  const [waveAnimation, setWaveAnimation] = useState(false);
  const [micTipping, setMicTipping] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [clicked, setClicked] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const brandIconUrl = "https://res.cloudinary.com/dqrxppg5b/image/upload/v1768817794/lfnm_cms/geral/gustavo/gustavo_2026-01-19_geral_4187.png";
  const bannerImageUrl = "https://res.cloudinary.com/dqrxppg5b/image/upload/v1768776131/lfnm_cms/geral/gustavo/gustavo_2026-01-18_geral_2570.jpg";
  const presenterVideoUrl = "https://res.cloudinary.com/dlleqjxd7/video/upload/v1768522256/lfnm_cms/geral/gustavo/kkvtkwlkkdgsnjhafmzr.mp4";

  // Lógica de Animação do Background (Mouse Move)
  useEffect(() => {
    if (isHovering) {
      if (animationRef.current) { cancelAnimationFrame(animationRef.current); }
      return;
    }
    const startTimestamp = performance.now();
    const animate = (time: number) => {
      if (!bannerRef.current) { return; }
      const elapsed = time - startTimestamp;
      const width = bannerRef.current.offsetWidth;
      const height = bannerRef.current.offsetHeight;
      const durationX = 10000;
      const durationY = 3000;
      const sineX = Math.sin((elapsed / durationX) * Math.PI * 2);
      const x = (width / 2) + (sineX * (width * 0.6));
      const sineY = Math.sin((elapsed / durationY) * Math.PI * 2);
      const y = (height / 2) + (sineY * (height * 0.2));
      bannerRef.current.style.setProperty('--x', `${x}px`);
      bannerRef.current.style.setProperty('--y', `${y}px`);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) { cancelAnimationFrame(animationRef.current); } };
  }, [isHovering]);

  useEffect(() => {
    const waveTimer = setInterval(() => {
      if (!waveAnimation) {
        setWaveAnimation(true);
        setTimeout(() => setWaveAnimation(false), 2500);
      }
    }, 30000);
    return () => clearInterval(waveTimer);
  }, [waveAnimation]);

  const triggerMicAnimation = () => {
    setMicTipping(false);
    setTimeout(() => {
      setMicTipping(true);
      setTimeout(() => setMicTipping(false), 4000);
    }, 10);
  };

  useEffect(() => {
    triggerMicAnimation();
    const tipTimer = setInterval(() => {
      triggerMicAnimation();
    }, 30000);
    return () => clearInterval(tipTimer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHovering) { setIsHovering(true); }
    if (bannerRef.current) {
      const rect = bannerRef.current.getBoundingClientRect();
      bannerRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
      bannerRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }
  };

  const InteractiveWord = ({ text, className }: { text: string, className: string }) => (
    <div className={`flex ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="inline-block transition-colors duration-300 hover:text-yellow-400 cursor-default hover-jump" style={{ transformStyle: 'preserve-3d' }}>{char === ' ' ? '\u00A0' : char}</span>
      ))}
    </div>
  );

  const WavingWord = ({ text }: { text: string }) => (
    <div className="flex">
      {text.split('').map((char, i) => (
        <span key={i} className={`inline-block ${waveAnimation ? 'animate-wave' : ''}`} style={{ animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }}>{char === ' ' ? '\u00A0' : char}</span>
      ))}
    </div>
  );

  return (
    <div
      ref={bannerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative w-full aspect-[28/12] md:aspect-[28/9] bg-black flex items-center overflow-hidden group"
      style={{ '--x': '50%', '--y': '50%', transition: 'opacity 0.2s' } as React.CSSProperties}
    >
      <style>{`
            @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            @keyframes jump-once { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
            @keyframes spin-coin { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
            @keyframes mic-live { 
              0%, 100% { transform: scale(1) rotateY(0deg); filter: drop-shadow(0 2vw 4vw rgba(0,0,0,0.8)); }
              25% { transform: scale(1.05) rotateY(10deg); filter: drop-shadow(0 0 2vw rgba(220,38,38,0.8)); }
              50% { transform: scale(1.1) rotateY(0deg); filter: drop-shadow(0 0 3vw rgba(220,38,38,1)); }
              75% { transform: scale(1.05) rotateY(-10deg); filter: drop-shadow(0 0 2vw rgba(220,38,38,0.8)); }
            }
            @keyframes pulse-ring { 
              0% { transform: scale(0.5); opacity: 0.9; }
              50% { transform: scale(1.5); opacity: 0.5; }
              100% { transform: scale(2.5); opacity: 0; }
            }
            @keyframes click-burst { 
              0% { transform: scale(1) rotate(0deg); opacity: 1; }
              50% { transform: scale(0.9) rotate(-5deg); opacity: 0.8; }
              100% { transform: scale(1.2) rotate(5deg); opacity: 0; }
            }
            .animate-wave { animation-name: wave; animation-timing-function: ease-in-out; }
            .animate-coin-spin { animation: spin-coin 3s linear infinite; }
            .animate-mic-live { animation: mic-live 1.5s ease-in-out infinite; }
            .animate-click-burst { animation: click-burst 0.6s ease-out; }
            .hover-jump:hover { animation: jump-once 0.5s ease-in-out 1; }
        `}</style>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={bannerImageUrl} className="w-full h-full object-cover opacity-20 animate-kenburns grayscale" alt="Background Texture" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-100" style={{ opacity: 1, WebkitMaskImage: 'radial-gradient(circle 200px at var(--x) var(--y), black 30%, transparent 70%)', maskImage: 'radial-gradient(circle 200px at var(--x) var(--y), black 30%, transparent 70%)' }}>
        <img src={bannerImageUrl} className="w-full h-full object-cover opacity-100 animate-kenburns brightness-125" alt="Background Highlight" />
      </div>

      <div className="relative w-full h-full z-30 flex items-center px-4 pointer-events-auto">
        <div className="w-full h-full relative group cursor-pointer" onClick={onHomeClick}>
          {/* Microfone com Animação "AO VIVO" */}
          <div
            className="absolute left-[-6%] top-1/2 -translate-y-1/2 w-[45vw] h-[45vw] md:left-[0%] md:w-[35vw] md:h-[35vw] z-40 shrink-0 perspective-1000 group/mic cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setClicked(true);
              setTimeout(() => setClicked(false), 600);
              onHomeClick();
            }}
          >
            <img
              src={brandIconUrl}
              className="w-full h-full object-contain drop-shadow-[0_2vw_4vw_rgba(0,0,0,0.8)] group-hover/mic:animate-mic-live transition-all duration-300 relative z-10"
              alt="Brand Icon"
              style={{ transformStyle: 'preserve-3d' }}
            />
            {/* Anéis de pulso "ON AIR" - centralizados - NA FRENTE */}
            <div className="absolute inset-0 opacity-0 group-hover/mic:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
              <div className="absolute w-[40%] h-[40%] rounded-full border-4 border-red-600 animate-[pulse-ring_1.5s_ease-out_infinite]"></div>
              <div className="absolute w-[40%] h-[40%] rounded-full border-4 border-red-600 animate-[pulse-ring_1.5s_ease-out_infinite_0.5s]"></div>
            </div>
            {/* Explosão ao clicar - NA FRENTE */}
            {clicked && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="absolute w-[40%] h-[40%] rounded-full border-8 border-yellow-400 animate-click-burst"></div>
                <div className="absolute w-[40%] h-[40%] rounded-full border-8 border-red-600 animate-click-burst" style={{ animationDelay: '0.1s' }}></div>
                <div className="absolute w-[40%] h-[40%] rounded-full border-8 border-white animate-click-burst" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>

          <div className="absolute left-[50%] md:left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-start justify-center z-30 pl-4 md:pl-0">
            <div className="flex flex-col font-[1000] uppercase tracking-tighter leading-[0.8] text-shadow-xl filter drop-shadow-lg text-left">
              {/* Tamanhos ajustados: Mobile reduzido para 9vw, Desktop mantido */}
              <InteractiveWord text="LAGOA" className="text-[9vw] md:text-[7vw] text-white justify-start" />
              <InteractiveWord text="FORMOSA" className="text-[9vw] md:text-[7vw] text-red-600 justify-start" />
            </div>

            <div className="flex items-center gap-[1.2vw] mt-2 md:mt-[0.8vw] ml-0">
              <div className="bg-red-600 px-3 md:px-[1.5vw] py-[0.4vw] skew-x-[-15deg] shadow-lg cursor-default transition-colors hover:bg-red-700 border-t border-red-400" onMouseEnter={() => { if (!waveAnimation) { setWaveAnimation(true); setTimeout(() => setWaveAnimation(false), 2000); } }}>
                <span className="text-white text-[10px] md:text-[2.2vw] font-[1000] uppercase italic skew-x-[15deg] block leading-none whitespace-nowrap">
                  <WavingWord text="NO MOMENTO" />
                </span>
              </div>
              <div className="bg-black/90 backdrop-blur-md px-3 md:px-[1.5vw] py-[0.4vw] border-l-2 border-white/20 skew-x-[-15deg] shadow-lg">
                <span suppressHydrationWarning className={`font-mono text-[10px] md:text-[2.2vw] font-black skew-x-[15deg] tracking-widest block transition-colors duration-200 ${sirenState ? 'text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]'}`}>
                  {currentTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-[-5%] bottom-[-30%] w-[35vw] md:right-[5%] md:bottom-[-45%] md:w-[28vw] aspect-[9/16] z-[10] flex items-end pointer-events-none opacity-100 mix-blend-normal">
          <VideoPresenter src={presenterVideoUrl} className="h-full w-full drop-shadow-2xl" />
        </div>
      </div>

      <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay" style={{ background: 'radial-gradient(circle 200px at var(--x) var(--y), rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 50%, transparent 80%)' }}></div>
    </div>
  );
};

export default VisualBanner;