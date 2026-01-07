
import React, { useRef, useState, useEffect } from 'react';

interface ExtraMenuProps {
    onJobsClick?: () => void;
    onComingSoon?: () => void;
}

const ExtraMenu: React.FC<ExtraMenuProps> = ({ onJobsClick, onComingSoon }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScroll, setCanScroll] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Lista atualizada conforme solicitado - Vagas agora mostra aviso de manutenção
    const menuItems = [
        { id: 'jobs', label: 'Vagas de Emprego', shortLabel: 'Vagas', icon: 'fa-briefcase', action: onComingSoon || (() => alert("Em breve")) },
        { id: 'gigs', label: 'Bico', shortLabel: 'Bico', icon: 'fa-hammer', action: onComingSoon || (() => alert("Em breve")) },
        { id: 'classifieds', label: 'Classificados', shortLabel: 'Vendas', icon: 'fa-store', action: onComingSoon || (() => alert("Em breve")) },
        { id: 'podcast', label: 'Podcast', shortLabel: 'Cast', icon: 'fa-podcast', action: onComingSoon || (() => alert("Em breve")) },
        { id: 'groups', label: 'Grupos', shortLabel: 'Grupos', icon: 'fa-users', action: onComingSoon || (() => alert("Em breve")) },
    ];

    const menuDiagonalText = "data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' fill='%23000' font-family='Arial' font-weight='900' font-size='10' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 100 100)' opacity='0.03'%3ELAGOA FORMOSA NO MOMENTO%3C/text%3E%3C/svg%3E";

    useEffect(() => {
        const checkOverflow = () => {
            if (scrollRef.current) {
                setCanScroll(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
            }
        };
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, []);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !canScroll) {return;}
        
        let interval: any;
        if (!isPaused) {
            interval = setInterval(() => {
                if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
                    container.scrollTo({ left: 0, behavior: 'auto' });
                } else {
                    container.scrollBy({ left: 0.5, behavior: 'auto' });
                }
            }, 30);
        }
        return () => clearInterval(interval);
    }, [canScroll, isPaused]);

    const scrollManual = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            setIsPaused(true);
            const amount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(() => setIsPaused(false), 3000);
        }
    };

    return (
        <div className="w-full bg-[#f4f4f7] relative z-40">
            <div className="w-full md:w-[94%] md:max-w-[1550px] mx-auto py-2 md:py-3 shadow-sm relative overflow-hidden border-x border-b border-black/5 group/extramenu">
                
                {/* Textura Zebrada */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(
                        -45deg,
                        #ffffff,
                        #ffffff 30px,
                        rgba(250, 204, 21, 0.15) 30px,
                        rgba(250, 204, 21, 0.15) 60px
                    )`
                }}></div>

                {/* Texto Diagonal */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: `url("${menuDiagonalText}")`, backgroundSize: '150px' }}></div>
                
                {/* SETAS DE NAVEGAÇÃO - POSICIONAMENTO ABSOLUTO NAS LATERAIS */}
                {canScroll && (
                    <>
                        <div className="absolute left-0 top-0 z-30 h-full w-10 bg-gradient-to-r from-[#f4f4f7] via-[#f4f4f7]/90 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/extramenu:opacity-100 transition-all pointer-events-none group-hover/extramenu:pointer-events-auto">
                            <button 
                                onClick={() => scrollManual('left')}
                                className="bg-white shadow-md border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors active:scale-90"
                            >
                                <i className="fas fa-chevron-left text-[10px]"></i>
                            </button>
                        </div>
                        <div className="absolute right-0 top-0 z-30 h-full w-10 bg-gradient-to-l from-[#f4f4f7] via-[#f4f4f7]/90 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/extramenu:opacity-100 transition-all pointer-events-none group-hover/extramenu:pointer-events-auto">
                            <button 
                                onClick={() => scrollManual('right')}
                                className="bg-white shadow-md border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors active:scale-90"
                            >
                                <i className="fas fa-chevron-right text-[10px]"></i>
                            </button>
                        </div>
                    </>
                )}

                <div 
                    ref={scrollRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setTimeout(() => setIsPaused(false), 2000)}
                    className={`container mx-auto flex flex-nowrap md:flex-wrap items-center gap-2 md:gap-3 relative z-10 overflow-x-auto scrollbar-hide px-8 md:px-4 ${!canScroll ? 'justify-center' : 'justify-start'}`}
                >
                    {menuItems.map((item) => (
                        <button key={item.id} onClick={item.action} className="whitespace-nowrap px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl bg-black text-white hover:bg-white hover:text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 border-black shadow-sm active:translate-y-1 flex items-center gap-2 group shrink-0">
                            <i className={`fas ${item.icon} text-[10px] md:text-xs text-yellow-400 group-hover:text-red-600 group-hover:scale-110 transition-transform`}></i>
                            <span className="md:hidden">{item.shortLabel}</span>
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExtraMenu;
