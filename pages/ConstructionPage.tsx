import React, { useState, useEffect, useRef } from 'react';
import { APP_VERSION } from '../src/version';
import VideoPresenter from '../components/media/ChromaKeyVideo';
import Login from '../components/Login';
import { User } from '../types';

interface ConstructionPageProps {
    user?: User | null;
    onLogin?: (user: User) => void;
    onLogout?: () => void;
    onShowLogin?: () => void;
    disableSignup?: boolean;
}

const ConstructionPage: React.FC<ConstructionPageProps> = ({ user, onLogin, onLogout, onShowLogin, disableSignup }) => {
    // Assets & Consts
    const brandIconUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P";
    const bannerImageUrl = "https://lh3.googleusercontent.com/d/1C1WhdivmBnt1z23xZGOJw0conC1jtq4i";
    const presenterVideoUrl = "https://vimeo.com/1149429293";

    // Get current version from centralized config
    const CURRENT_VERSION = APP_VERSION;

    // Refs for Lantern Effect
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const [isHovering, setIsHovering] = useState(false);

    // States
    const [micTipping, setMicTipping] = useState(false);
    const [waveAnimation, setWaveAnimation] = useState(false);
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    // Animation Interaction States
    const [micPos, setMicPos] = useState({ x: 0, y: 0 });
    const [spinState, setSpinState] = useState({ rotation: 0, duration: 0.5 });
    const lastHoverRef = useRef(0);

    const handleMicClick = () => {
        // Jump to random position (max +/- 300px)
        const range = 300;
        const newX = (Math.random() - 0.5) * range * 2;
        const newY = (Math.random() - 0.5) * range * 2;
        setMicPos({ x: newX, y: newY });
    };

    const handleMicHover = () => {
        const now = Date.now();
        const diff = now - lastHoverRef.current;
        lastHoverRef.current = now;

        // "Coin Spin" logic: faster if hovered quickly repeatedly
        let newDuration = 0.6;
        if (diff < 500) {
            newDuration = Math.max(0.1, spinState.duration * 0.6); // Accelerate
        } else if (diff > 2000) {
            newDuration = 0.6; // Reset if pause
        }

        setSpinState(prev => ({
            rotation: prev.rotation + 360, // Always spin full circle
            duration: newDuration
        }));
    };

    // --- LANTERN EFFECT LOGIC (From VisualBanner) ---
    useEffect(() => {
        if (isHovering) {
            if (animationRef.current) {cancelAnimationFrame(animationRef.current);}
            return;
        }
        let startTimestamp = performance.now();
        const animate = (time: number) => {
            if (!containerRef.current) {return;}
            const elapsed = time - startTimestamp;
            const width = containerRef.current.offsetWidth;
            const height = containerRef.current.offsetHeight;

            // Movement Pattern
            const durationX = 10000;
            const durationY = 3000;
            const sineX = Math.sin((elapsed / durationX) * Math.PI * 2);
            const x = (width / 2) + (sineX * (width * 0.4)); // 40% movement width
            const sineY = Math.sin((elapsed / durationY) * Math.PI * 2);
            const y = (height / 2) + (sineY * (height * 0.2)); // 20% movement height

            containerRef.current.style.setProperty('--x', `${x}px`);
            containerRef.current.style.setProperty('--y', `${y}px`);
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => { if (animationRef.current) {cancelAnimationFrame(animationRef.current);} };
    }, [isHovering]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isHovering) {setIsHovering(true);}
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            containerRef.current.style.setProperty('--x', `${e.clientX - rect.left}px`);
            containerRef.current.style.setProperty('--y', `${e.clientY - rect.top}px`);
        }
    };

    // --- OTHER ANIMATIONS ---
    useEffect(() => {
        const micInterval = setInterval(() => {
            setMicTipping(true);
            setTimeout(() => setMicTipping(false), 2000);
        }, 8000);

        const waveInterval = setInterval(() => {
            setWaveAnimation(true);
            setTimeout(() => setWaveAnimation(false), 2500);
        }, 12000);

        const clockInterval = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => {
            clearInterval(micInterval);
            clearInterval(waveInterval);
            clearInterval(clockInterval);
        };
    }, []);

    // Componentes Auxiliares
    const InteractiveWord = ({ text, className }: { text: string, className: string }) => (
        <div className={`flex ${className}`}>
            {text.split('').map((char, i) => (
                <span key={i} className="inline-block transition-colors duration-300 hover:text-yellow-400 cursor-default hover-jump" style={{ transformStyle: 'preserve-3d' }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    );

    const WavingWord = ({ text }: { text: string }) => (
        <div className="flex">
            {text.split('').map((char, i) => (
                <span key={i} className={`inline-block ${waveAnimation ? 'animate-wave' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    );

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="fixed inset-0 w-full h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans select-none group"
            style={{ '--x': '50%', '--y': '50%', zIndex: 9999 } as React.CSSProperties}
        >
            {/* Styles Injection */}
            <style>{`
                @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes jump-once { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                @keyframes mic-tip { 0% { transform: rotate(0deg); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } 100% { transform: rotate(0deg); } }
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-wave { animation: wave 0.6s ease-in-out; }
                .animate-mic-tip { animation: mic-tip 2s ease-in-out; }
                .hover-jump:hover { animation: jump-once 0.5s ease-in-out; }
                .animate-kenburns { animation: kenburns 20s infinite alternate; }
                @keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.1); } }
            `}</style>

            {/* 1. LAYER DE FUNDO (DARK) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img src={bannerImageUrl} className="w-full h-full object-cover opacity-20 animate-kenburns grayscale" alt="Texture Dark" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/60"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>
            </div>

            {/* 2. LAYER DE LANTERNA (BRIGHT - REVEALED BY MASK) */}
            <div
                className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-100"
                style={{
                    opacity: 1,
                    WebkitMaskImage: 'radial-gradient(circle 300px at var(--x) var(--y), black 30%, transparent 70%)',
                    maskImage: 'radial-gradient(circle 300px at var(--x) var(--y), black 30%, transparent 70%)'
                }}
            >
                <img src={bannerImageUrl} className="w-full h-full object-cover opacity-100 animate-kenburns brightness-125" alt="Texture Light" />
            </div>

            {/* REC Dot & Time */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 z-50 flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 px-3 py-1 rounded-full">
                    <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                    <span className="text-[10px] md:text-xs font-black text-red-500 uppercase tracking-widest">REC</span>
                </div>
                <span className="text-white/40 font-mono text-xs md:text-sm tracking-widest">{time}</span>
            </div>

            {/* Login Button / User Status */}
            <div className="absolute top-8 right-8 md:top-12 md:right-12 z-50 flex flex-col items-end gap-2">
                {user ? (
                    <div className="flex flex-col items-end animate-fadeIn">
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-green-500/30 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.1em]">
                                {user.name?.split(' ')[0]}
                            </span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="text-[10px] text-red-500 font-bold uppercase tracking-widest hover:text-white transition-colors mt-2 mr-2"
                        >
                            Sair
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onShowLogin}
                        className="group relative flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 hover:border-red-500/50 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                    >
                        <span className="w-4 h-4 md:w-5 md:h-5 bg-white/30 rounded-full group-hover:bg-red-500 transition-colors shadow-[0_0_5px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
                        <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] group-hover:text-white transition-colors">Área Restrita</span>
                        <i className="fas fa-lock text-white/40 group-hover:text-red-500 text-xs transition-colors"></i>
                    </button>
                )}
            </div>

            {/* 3. CONTEÚDO CENTRALIZADO */}
            <div className="z-20 relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 scale-90 md:scale-110 translate-y-[-5%] ml-5 md:ml-0">
                {/* Logo Icon (BIGGER + JUMP + SPIN) */}
                <div
                    className="w-[45vw] md:w-[25vw] h-[45vw] md:h-[25vw] relative flex-shrink-0 animate-fadeInUp cursor-pointer transition-transform duration-500 ease-out"
                    onClick={handleMicClick}
                    style={{ transform: `translate(${micPos.x}px, ${micPos.y}px)` }}
                >
                    {/* WRAPPER FOR TIP ANIMATION */}
                    <div className={`w-full h-full ${micTipping ? 'animate-mic-tip' : ''}`}>
                        <img
                            src={brandIconUrl}
                            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            onMouseEnter={handleMicHover}
                            style={{
                                transform: `rotateY(${spinState.rotation}deg)`,
                                transition: `transform ${spinState.duration}s cubic-bezier(0.34, 1.56, 0.64, 1)` // Bouncy spin
                            }}
                            alt="Logo Icon"
                        />
                    </div>
                </div>

                {/* Typography Brand */}
                <div className="flex flex-col items-center md:items-start z-30">
                    <div className="flex flex-col font-[1000] uppercase tracking-tighter leading-[0.85] text-shadow-xl filter drop-shadow-lg text-center md:text-left">
                        <InteractiveWord text="LAGOA" className="text-[12vw] md:text-[6vw] text-white justify-center md:justify-start" />
                        <InteractiveWord text="FORMOSA" className="text-[12vw] md:text-[6vw] text-red-600 justify-center md:justify-start" />
                    </div>

                    {/* Ribbons / Status */}
                    <div className="flex items-center gap-4 mt-6 md:mt-4">
                        <div className="bg-red-600 px-6 py-2 skew-x-[-15deg] shadow-[0_0_20px_rgba(220,38,38,0.6)] border-t border-red-400 group cursor-default hover:bg-red-700 transition-colors">
                            <span className="text-white text-lg md:text-2xl font-[1000] uppercase italic skew-x-[15deg] block leading-none">
                                <WavingWord text="NO MOMENTO" />
                            </span>
                        </div>
                        <div className="bg-yellow-500/10 backdrop-blur-md px-4 py-2 border border-yellow-500/50 skew-x-[-15deg] shadow-lg animate-pulse">
                            <span className="text-yellow-400 text-sm md:text-lg font-bold uppercase skew-x-[15deg] tracking-widest block">
                                EM CONSTRUÇÃO
                            </span>
                        </div>
                    </div>
                </div>
            </div>



            {/* News Ticker */}
            <div className="absolute bottom-0 left-0 w-full bg-red-600/90 py-2 z-40 overflow-hidden whitespace-nowrap border-t border-red-500 backdrop-blur-sm">
                <div className="inline-block animate-[marquee_20s_linear_infinite] text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                    EM MANUTENÇÃO • ESTAMOS PREPARANDO UM NOVO PORTAL PARA VOCÊ • LAGOA FORMOSA NO MOMENTO • NOTÍCIAS COM CREDIBILIDADE • AGUARDE O LANÇAMENTO • COBERTURA COMPLETA DA REGIÃO •
                    EM MANUTENÇÃO • ESTAMOS PREPARANDO UM NOVO PORTAL PARA VOCÊ • LAGOA FORMOSA NO MOMENTO • NOTÍCIAS COM CREDIBILIDADE • AGUARDE O LANÇAMENTO • COBERTURA COMPLETA DA REGIÃO •
                </div>
            </div>

            <div className="absolute bottom-8 right-8 z-50 pointer-events-none">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">LFNM V. {CURRENT_VERSION}</span>
            </div>

            {/* Light Leaks (Global Overlay for Lantern Feel) */}
            <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay" style={{ background: 'radial-gradient(circle 300px at var(--x) var(--y), rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)' }}></div>
        </div>
    );
};

export default ConstructionPage;
