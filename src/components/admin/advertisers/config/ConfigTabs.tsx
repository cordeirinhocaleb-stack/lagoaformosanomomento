
import React, { useRef, useState, useEffect } from 'react';

export type ConfigTabId = 'overview' | 'plans' | 'placements' | 'rules' | 'reports';

interface ConfigTabsProps {
  activeTab: ConfigTabId;
  onChange: (tab: ConfigTabId) => void;
  darkMode?: boolean;
}

const ConfigTabs: React.FC<ConfigTabsProps> = ({ activeTab, onChange, darkMode = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const tabs: { id: ConfigTabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Visão Geral', icon: 'fa-chart-pie' },
    { id: 'plans', label: 'Planos & Preços', icon: 'fa-tags' },
    { id: 'placements', label: 'Inventário', icon: 'fa-map-signs' },
    { id: 'rules', label: 'Regras', icon: 'fa-scale-balanced' },
    { id: 'reports', label: 'Relatórios', icon: 'fa-file-invoice-dollar' },
  ];

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollManual = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <div className={`relative mb-6 group/tabs p-2 rounded-3xl border shadow-sm overflow-hidden flex items-center transition-colors ${darkMode ? 'bg-black/40 border-white/5' : 'bg-white border-gray-100'}`}>

      {/* Container Esquerdo da Seta (Estilo Clima) */}
      {canScrollLeft && (
        <div className={`absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r flex items-center justify-start pl-2 pointer-events-none ${darkMode ? 'from-black via-black/90 to-transparent' : 'from-white via-white/90 to-transparent'}`}>
          <button
            onClick={() => scrollManual('left')}
            className={`pointer-events-auto w-8 h-8 border rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-white hover:bg-red-600' : 'bg-white border-gray-200 text-red-600 hover:bg-red-600 hover:text-white'}`}
          >
            <i className="fas fa-chevron-left text-[10px]"></i>
          </button>
        </div>
      )}

      {/* Área de Scroll de Abas */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide py-1 px-4 mask-fade-sides"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-3.5 rounded-2xl flex items-center gap-3 transition-all whitespace-nowrap border-2 shrink-0 ${activeTab === tab.id
              ? (darkMode ? 'bg-white border-white text-black shadow-lg scale-105 z-10' : 'bg-black border-black text-white shadow-lg scale-105 z-10')
              : (darkMode ? 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-white' : 'bg-white border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600')
              }`}
          >
            <i className={`fas ${tab.icon} text-sm ${activeTab === tab.id ? 'text-red-500' : ''}`}></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Container Direito da Seta (Estilo Clima) */}
      {canScrollRight && (
        <div className={`absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l flex items-center justify-end pr-2 pointer-events-none ${darkMode ? 'from-black via-black/90 to-transparent' : 'from-white via-white/90 to-transparent'}`}>
          <button
            onClick={() => scrollManual('right')}
            className={`pointer-events-auto w-8 h-8 border rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all ${darkMode ? 'bg-zinc-800 border-white/10 text-white hover:bg-red-600' : 'bg-white border-gray-200 text-red-600 hover:bg-red-600 hover:text-white'}`}
          >
            <i className="fas fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      )}

      <style>{`
        .mask-fade-sides {
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
};

export default ConfigTabs;
