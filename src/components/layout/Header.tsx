
import React, { useState, useEffect } from 'react';
import { User, NewsItem } from '../../types';
import { getCurrentWeather, getDollarRate } from '../../services/geminiService';
import { CATEGORIES, RegionFilterType } from './CategoryMenu';

import VisualBanner from './header/VisualBanner';
import NewsTicker from './header/NewsTicker';
import DataBar from './header/DataBar';
import ExtraMenu from './header/ExtraMenu';
import UsefulNumbers from './header/UsefulNumbers';

interface HeaderProps {
    onAdminClick: () => void;
    onHomeClick: () => void;
    latestNews?: NewsItem[];
    externalNews?: any[];
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
    onComingSoon?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    onAdminClick, onHomeClick, latestNews = [], externalNews = [], user, onLogout, onNewsClick, isSimplified = false, onOpenProfile,
    selectedCategory, onSelectCategory, selectedRegion, onSelectRegion, onJobsClick, onComingSoon
}) => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    const [sirenState, setSirenState] = useState(false);

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
            const nowString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setCurrentTime(prev => {
                if (prev !== nowString) return nowString;
                return prev;
            });
            setSirenState(prev => !prev);
        }, 1000);

        getCurrentWeather().then(setWeatherForecast);
        getDollarRate().then(data => setDollar(data.rate));

        return () => clearInterval(timeTimer);
    }, []);

    const getStickyBtnClass = (isActive: boolean, isIcon: boolean = false) => {
        return `whitespace-nowrap px-4 py-2 md:px-6 md:py-1 rounded-full text-[10px] md:text-[9px] font-black uppercase tracking-widest transition-all border min-w-[60px] md:min-w-[80px] flex justify-center items-center ${isActive
            ? 'bg-red-600 text-white border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.6)]'
            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
            }`;
    };

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
            <header className="bg-black w-full relative z-[50] pb-0">
                <VisualBanner onHomeClick={onHomeClick} currentTime={currentTime} sirenState={sirenState} />
                <NewsTicker latestNews={latestNews} externalNews={externalNews} onNewsClick={onNewsClick} />
                <div className="w-full bg-black border-t-4 border-green-600">
                    <DataBar weatherForecast={weatherForecast} dollar={dollar} user={user} onAdminClick={onAdminClick} onOpenProfile={onOpenProfile} onLogout={onLogout} />
                    <UsefulNumbers />
                </div>
            </header>

            <ExtraMenu onJobsClick={onJobsClick} onComingSoon={onComingSoon} />

            <div
                className={`fixed top-0 left-0 w-full z-[10000] bg-black border-b-4 border-red-600 shadow-2xl transition-transform duration-300 ease-in-out transform ${isScrolled ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}
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
                                <span suppressHydrationWarning className="text-zinc-500 text-[7px] font-mono border-l border-zinc-800 pl-2">
                                    {currentTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 justify-center items-center overflow-hidden px-2">
                        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide py-1 mask-fade-sides w-full md:w-auto">
                            {['Lagoa Formosa e Região', 'Brasil', 'Mundo'].map((region) => {
                                return (
                                    <button
                                        key={region}
                                        onClick={() => onSelectRegion && onSelectRegion(region as RegionFilterType)}
                                        className={getStickyBtnClass(selectedRegion === region)}
                                    >
                                        {region === 'Lagoa Formosa e Região' ? (
                                            <span className="md:hidden">REGIÃO</span>
                                        ) : region === 'Brasil' ? (
                                            <span className="md:hidden">BR</span>
                                        ) : (
                                            <span className="md:hidden">MUNDO</span>
                                        )}
                                        <span className="hidden md:inline">{region === 'Lagoa Formosa e Região' ? 'REGIÃO' : region.toUpperCase()}</span>
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

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .mask-fade-sides {
                        -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    }
                ` }} />
            </div>
        </>
    );
};

export default Header;
