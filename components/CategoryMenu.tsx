
import React from 'react';
import { User } from '../types';

const CATEGORIES = [
  { id: 'all', name: 'Tudo', icon: 'fa-layer-group' },
  { id: 'Polícia', name: 'Polícia', icon: 'fa-shield-halved' },
  { id: 'Agro', name: 'Agro', icon: 'fa-wheat-awn' },
  { id: 'Política', name: 'Política', icon: 'fa-building-columns' },
  { id: 'Esporte', name: 'Esporte', icon: 'fa-trophy' },
  { id: 'Cultura', name: 'Cultura', icon: 'fa-masks-theater' },
  { id: 'Cotidiano', name: 'Cotidiano', icon: 'fa-house-user' },
];

interface CategoryMenuProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onAdminClick: () => void;
  user?: User | null;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ 
  selectedCategory, 
  onSelectCategory, 
  onAdminClick,
  user 
}) => {
  return (
    <nav className="bg-white pt-4 pb-2 border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Linha de Cabeçalho com Título */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-bolt text-red-600 text-[10px] animate-pulse"></i>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">Explorar Estilos</h3>
          </div>
          
          <div className="flex items-center gap-4 flex-grow">
            <div className="h-[1px] flex-grow bg-gray-100"></div>
            
            {/* Botão de Vagas - Atalho Rápido */}
            <button 
               onClick={() => onSelectCategory('jobs_view_trigger')}
               className="bg-black text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg flex items-center gap-2"
            >
               <i className="fas fa-briefcase"></i> Vagas
            </button>
          </div>
        </div>
        
        {/* Lista de Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x items-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 snap-start border ${
                selectedCategory === cat.id
                  ? 'bg-red-50 text-red-600 border-red-600 shadow-md scale-105'
                  : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-red-200 hover:bg-white'
              }`}
            >
              <i className={`fas ${cat.icon} text-xs ${selectedCategory === cat.id ? 'text-red-600' : 'text-gray-400'}`}></i>
              <span className="text-xs font-black uppercase tracking-tighter">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategoryMenu;
