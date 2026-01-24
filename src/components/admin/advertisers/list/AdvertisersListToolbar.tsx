
import React from 'react';

interface AdvertisersListToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: 'all' | 'active' | 'inactive' | 'expiring';
  onFilterChange: (status: 'all' | 'active' | 'inactive' | 'expiring') => void;
  onConfigClick: () => void;
  onCreateClick: () => void;
  darkMode?: boolean;
}

const AdvertisersListToolbar: React.FC<AdvertisersListToolbarProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onConfigClick,
  onCreateClick,
  darkMode = false
}) => {
  return (
    <div className={`flex flex-col xl:flex-row flex-wrap gap-6 mb-8 justify-between items-start xl:items-center p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border shadow-sm transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>

      <div className="flex flex-col">
        <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Carteira de <span className="text-red-600">Parceiros</span>
        </h2>
        <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
          Gerenciamento comercial e contratos
        </p>
      </div>

      <div className="flex flex-col md:flex-row flex-wrap gap-4 w-full xl:w-auto">

        {/* Busca */}
        <div className="relative flex-1 md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar empresa ou categoria..."
            className={`w-full pl-12 pr-6 py-4 md:py-3.5 rounded-2xl border text-xs md:text-sm font-bold uppercase outline-none focus:border-red-200 focus:bg-white transition-all shadow-inner ${darkMode ? 'bg-black/30 border-white/10 text-white placeholder:text-gray-600 focus:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-700 placeholder:text-gray-300'}`}
          />
        </div>

        {/* Filtro de Status */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value as any)}
            className={`w-full md:w-auto pl-6 pr-12 py-4 md:py-3.5 rounded-2xl border text-[10px] md:text-xs font-black uppercase outline-none focus:border-red-200 appearance-none cursor-pointer transition-colors shadow-inner ${darkMode ? 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/5' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="expiring">Vencendo</option>
            <option value="inactive">Inativos</option>
          </select>
          <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
        </div>

        <div className={`w-px h-10 hidden md:block mx-1 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}></div>

        {/* Ações Principais */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfigClick}
            title="Configurar planos e preços"
            className={`flex-1 sm:flex-none px-6 py-4 md:py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-3 border shadow-sm active:scale-95 ${darkMode ? 'bg-blue-900/20 text-blue-400 border-blue-900/30 hover:bg-blue-900/30' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'}`}
          >
            <i className="fas fa-cog"></i> Planos
          </button>

          <button
            onClick={onCreateClick}
            title="Criar novo contrato de anunciante"
            className={`flex-1 sm:flex-none px-10 py-5 md:py-3.5 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 border-2 ${darkMode ? 'bg-green-600 text-white border-green-700 hover:bg-green-700' : 'bg-green-600 text-white border-green-700 hover:bg-green-700'}`}
          >
            <i className="fas fa-plus"></i> <span className="whitespace-nowrap">Novo Contrato</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvertisersListToolbar;
