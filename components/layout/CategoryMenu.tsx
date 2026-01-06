
import React, { useRef, useEffect, useState } from 'react';
import { User } from '../../types';

export const CATEGORIES = [
  { id: 'all', name: 'Tudo', icon: 'fa-layer-group' },
  { id: 'Polícia', name: 'Polícia', icon: 'fa-shield-halved' },
  { id: 'Esporte', name: 'Esporte', icon: 'fa-trophy' },
  { id: 'Cultura', name: 'Cultura', icon: 'fa-masks-theater' },
  { id: 'Cotidiano', name: 'Cotidiano', icon: 'fa-house-user' },
  { id: 'Política', name: 'Política', icon: 'fa-building-columns' },
  { id: 'Agro', name: 'Agro', icon: 'fa-wheat-awn' },
  { id: 'Tecnologia', name: 'Tecnologia', icon: 'fa-microchip' },
  { id: 'Economia', name: 'Economia', icon: 'fa-chart-line' },
];

export type RegionFilterType = 'Lagoa Formosa' | 'Patos e Região' | 'Brasil' | 'Mundo';

interface CategoryMenuProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onAdminClick: () => void;
  user?: User | null;
  selectedRegion: RegionFilterType;
  onSelectRegion: (region: RegionFilterType) => void;
  onOpenProfile?: () => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ 
  selectedCategory, 
  onSelectCategory, 
  onAdminClick,
  user,
  selectedRegion,
  onSelectRegion,
  onOpenProfile
}) => {
  const regions: RegionFilterType[] = ['Lagoa Formosa', 'Patos e Região', 'Brasil', 'Mundo'];
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [isCategoryPaused, setIsCategoryPaused] = useState(false);
  const [manualInteractCategory, setManualInteractCategory] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const getRegionStyle = (region: RegionFilterType, isSelected: boolean) => {
      if (!isSelected) return 'bg-white text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-600';
      switch (region) {
          case 'Lagoa Formosa': return 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200';
          case 'Patos e Região': return 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-200';
          case 'Brasil': return 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200';
          case 'Mundo': return 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200';
          default: return 'bg-black text-white border-black';
      }
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (categoryScrollRef.current) {
        const { scrollWidth, clientWidth } = categoryScrollRef.current;
        setCanScroll(scrollWidth > clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  useEffect(() => {
    const container = categoryScrollRef.current;
    if (!container || !canScroll) return;

    let interval: any;
    if (!isCategoryPaused && !manualInteractCategory) {
      interval = setInterval(() => {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 1) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 0.8, behavior: 'auto' });
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isCategoryPaused, manualInteractCategory, canScroll]);

  const scrollManual = (direction: 'left' | 'right') => {
    const container = categoryScrollRef.current;
    if (container && canScroll) {
      setManualInteractCategory(true);
      const jump = 250; 
      const target = direction === 'right' ? container.scrollLeft + jump : container.scrollLeft - jump;
      container.scrollTo({ left: target, behavior: 'smooth' });
      setTimeout(() => setManualInteractCategory(false), 5000);
    }
  };

  const handleAction = () => {
      if (!user) return onAdminClick();
      if (user.role === 'Leitor') {
          if (onOpenProfile) onOpenProfile();
      } else {
          onAdminClick();
      }
  };

  const getActionLabel = () => {
      if (!user) return 'Login';
      if (user.role === 'Leitor') return 'Minha Conta';
      return 'Central';
  };

  const getActionIcon = () => {
      if (!user) return 'fa-lock';
      if (user.role === 'Leitor') return 'fa-user-circle';
      return 'fa-satellite-dish';
  };

  return (
    <nav className="bg-white pt-1 pb-1 border-b border-gray-100 relative z-[40] overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-2 gap-1">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <i className="fas fa-bolt text-red-600 text-[9px] animate-pulse"></i>
              <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em] whitespace-nowrap hidden md:block">Filtro Regional</h3>
            </div>
            <div className="h-3 w-[1px] bg-gray-200 hidden md:block shrink-0"></div>
            <div className="flex items-center gap-1 flex-wrap">
                {regions.map((region) => (
                    <button
                        key={region}
                        onClick={() => onSelectRegion(region)}
                        className={`shrink-0 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-tight transition-all whitespace-nowrap border ${getRegionStyle(region, selectedRegion === region)}`}
                    >
                        <span className="relative z-10">{region}</span>
                    </button>
                ))}
            </div>
          </div>
          
          <div className="hidden lg:flex justify-end">
            <button 
                onClick={handleAction}
                className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all shadow-sm active:scale-95 shrink-0 border group ${
                user 
                    ? 'bg-white border-red-100 text-red-600 hover:bg-red-50' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
            >
                <i className={`fas ${getActionIcon()} text-[10px] relative z-10 group-hover:animate-almost-fall`}></i>
                <span className="text-[7px] font-black uppercase tracking-widest whitespace-nowrap relative z-10">
                    {getActionLabel()}
                </span>
            </button>
          </div>
        </div>
        
        <div className="w-full overflow-hidden mask-fade-sides py-1 group/categories relative bg-gray-50/20 rounded-xl px-2">
            
            {canScroll && (
              <div className="absolute left-0 top-0 bottom-0 z-20 w-8 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/categories:opacity-100 transition-all pointer-events-none group-hover/categories:pointer-events-auto">
                  <button 
                      onClick={(e) => { e.stopPropagation(); scrollManual('left'); }}
                      className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-red-600 border border-gray-100 hover:bg-red-600 hover:text-white transition-colors active:scale-90"
                  >
                      <i className="fas fa-chevron-left text-[8px]"></i>
                  </button>
              </div>
            )}

            <div 
                ref={categoryScrollRef}
                onMouseEnter={() => setIsCategoryPaused(true)}
                onMouseLeave={() => setIsCategoryPaused(false)}
                className={`flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-4 md:px-8 ${!canScroll ? 'justify-center' : ''}`}
            >
                {CATEGORIES.map((cat, idx) => (
                    <button
                        key={`${cat.id}-${idx}`}
                        onClick={() => onSelectCategory(cat.id)}
                        className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 border ${
                            selectedCategory === cat.id
                            ? 'bg-red-50 text-red-600 border-red-200 shadow-sm font-bold scale-105'
                            : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <i className={`fas ${cat.icon} text-[12px] relative z-10 ${selectedCategory === cat.id ? 'text-red-600' : 'text-gray-400'}`}></i>
                        <span className="text-[9px] font-bold uppercase tracking-tight relative z-10">{cat.name}</span>
                    </button>
                ))}
            </div>

            {canScroll && (
              <div className="absolute right-0 top-0 bottom-0 z-20 w-8 bg-gradient-l from-gray-50 via-gray-50/90 to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/categories:opacity-100 transition-all pointer-events-none group-hover/categories:pointer-events-auto">
                  <button 
                      onClick={(e) => { e.stopPropagation(); scrollManual('right'); }}
                      className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-red-600 border border-gray-100 hover:bg-red-600 hover:text-white transition-colors active:scale-90"
                  >
                      <i className="fas fa-chevron-right text-[8px]"></i>
                  </button>
              </div>
            )}
        </div>
      </div>
    </nav>
  );
};

export default CategoryMenu;
