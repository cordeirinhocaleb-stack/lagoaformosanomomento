
import React from 'react';
import { User } from '../types';
import Logo from './Logo';

interface BottomNavProps {
  activeView: 'home' | 'admin';
  onViewChange: (view: 'home' | 'admin') => void;
  onCitiesClick: () => void;
  user?: User | null;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange, onCitiesClick, user }) => {
  return (
    <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex justify-center items-center pointer-events-none w-full px-6">
      <div className="relative pointer-events-auto">
        {/* Glow Effect Background */}
        <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${activeView === 'admin' ? 'bg-red-600/40 scale-150' : 'bg-red-600/20 scale-125'}`}></div>
        
        <button 
          onClick={() => onViewChange('admin')}
          className={`w-20 h-20 rounded-full shadow-[0_15px_45px_rgba(220,38,38,0.6)] flex items-center justify-center transition-all active:scale-90 border-4 border-white overflow-hidden relative z-10 ${activeView === 'admin' ? 'bg-black' : 'bg-red-600 animate-pulse-slow'}`}
        >
          <div className="w-14 h-14 flex items-center justify-center">
            <Logo className="scale-125 brightness-0 invert" />
          </div>
        </button>

        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black px-4 py-1.5 rounded-full border border-white/30 whitespace-nowrap z-20 shadow-xl">
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            {user ? 'SISTEMA OPERACIONAL' : 'ACESSAR AGORA'}
          </span>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 40px rgba(220,38,38,0.5); }
          50% { transform: scale(1.05); box-shadow: 0 15px 50px rgba(220,38,38,0.8); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
