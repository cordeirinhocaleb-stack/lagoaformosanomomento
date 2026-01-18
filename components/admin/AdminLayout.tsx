import React, { useState } from 'react';
import { User } from '../../types';
import Logo from '../common/Logo';

interface AdminLayoutProps {
    children: React.ReactNode;
    user: User | null;
    currentView: string;
    onNavigate: (view: string) => void;
    onLogout: () => void;
    darkMode: boolean;
    onToggleTheme: () => void;
    forceMinimized?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, user, currentView, onNavigate, onLogout, darkMode, onToggleTheme, forceMinimized = false }) => {
    // Inicializa fechado em mobile (window.innerWidth < 768) e aberto em desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Quando forceMinimized mudar, força o estado
    React.useEffect(() => {
        if (!isMobile && forceMinimized) {
            setIsSidebarOpen(false);
        }
    }, [forceMinimized, isMobile]);

    React.useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // Se mudou para desktop e estava fechado, abre.
            // Se mudou para mobile, fecha sempre para garantir.
            setIsSidebarOpen(prev => {
                if (!mobile && !prev) { return true; } // Desktop auto-open
                if (mobile && prev) { return false; } // Mobile auto-close
                return prev;
            });
        };
        handleResize(); // Check on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: 'fa-chart-line' },
        { id: 'news', label: 'Gerenciar Notícias', icon: 'fa-newspaper' },
        { id: 'users', label: 'Usuários', icon: 'fa-users' },
        { id: 'jobs', label: 'Vagas de Emprego', icon: 'fa-briefcase' },
        { id: 'advertisers', label: 'Anunciantes', icon: 'fa-ad' },
        { id: 'settings', label: 'Configurações', icon: 'fa-cog' },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`min-h-screen flex font-['Inter'] selection:bg-red-900 selection:text-white overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#050505] text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Mobile Backdrop */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 backdrop-blur-xl border-r transition-all duration-300 flex flex-col 
                ${darkMode ? 'bg-black/90 border-white/5' : 'bg-white/90 border-gray-200'}
                ${isMobile
                        ? (isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
                        : (isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0')
                    }`}
            >
                {/* Logo Area & Local Toggle */}
                <div className="h-20 flex items-center border-b border-white/5 relative bg-black/20 group/sidebar">
                    <div
                        className={`flex-1 flex items-center justify-center cursor-pointer transition-all duration-300 ${isSidebarOpen ? 'px-4' : 'px-0'}`}
                        onClick={() => onNavigate('home')}
                    >
                        <div className={`${isSidebarOpen ? 'scale-75' : 'scale-50'} transition-transform duration-300`}>
                            <Logo />
                        </div>
                    </div>

                    {/* Dedicated Toggle Button (Desktop Only) */}
                    {!isMobile && (
                        <button
                            onClick={toggleSidebar}
                            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-zinc-950 shadow-lg transition-all duration-300 hover:scale-110 active:scale-90 z-[60] ${!isSidebarOpen && 'rotate-180'}`}
                            title={isSidebarOpen ? "Minimizar Menu" : "Expandir Menu"}
                        >
                            <i className="fas fa-chevron-left text-[10px]"></i>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onNavigate(item.id); if (isMobile) { setIsSidebarOpen(false); } }}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-red-600/20 to-transparent text-white'
                                    : (darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
                                    }`}
                                title={!isSidebarOpen && !isMobile ? item.label : ''}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                )}

                                <i className={`fas ${item.icon} w-6 text-center text-lg transition-transform duration-300 ${isActive ? 'text-red-500 scale-110' : 'group-hover:text-red-400'
                                    }`}></i>

                                <span className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute'
                                    }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer User Profile */}
                <div className={`p-4 border-t transition-colors ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50/50 border-gray-200'}`}>
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-black p-[1px] shrink-0">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-red-500">{user?.name?.charAt(0) || 'A'}</span>
                                )}
                            </div>
                        </div>

                        {isSidebarOpen && (
                            <div className="flex-1 min-w-0 animate-fadeIn">
                                <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Admin'}</p>
                                <p className="text-xs text-red-500 uppercase tracking-wider font-black truncate">{user?.role}</p>
                            </div>
                        )}

                        {isSidebarOpen && (
                            <button
                                onClick={onLogout}
                                className="w-8 h-8 rounded-lg hover:bg-red-500/20 hover:text-red-500 text-gray-500 transition-colors flex items-center justify-center shrink-0"
                                title="Sair"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 min-h-screen flex flex-col relative
                ${isMobile ? 'ml-0' : (isSidebarOpen ? 'ml-64' : 'ml-20')}
            `}>
                {/* Top Header */}
                <header className={`h-20 sticky top-0 z-30 backdrop-blur-md border-b flex items-center justify-between px-4 md:px-8 transition-colors duration-300 ${darkMode ? 'bg-[#050505]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1 className="text-base md:text-xl font-black uppercase tracking-widest text-white truncate max-w-[150px] md:max-w-none">
                            {menuItems.find(i => i.id === currentView)?.label || 'Painel'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleTheme}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                            title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                        >
                            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        <button
                            onClick={() => onNavigate('home')}
                            className="px-3 py-2 md:px-4 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white transition-all text-[10px] md:text-xs font-bold uppercase tracking-wider border border-red-600/20 hover:border-red-600 flex items-center gap-2"
                        >
                            <i className="fas fa-external-link-alt"></i>
                            <span className="hidden md:inline">Ver Site</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 md:p-8 animate-fade-in w-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
