
import React from 'react';

interface NewsFilterHeaderProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    categories: string[];
    darkMode: boolean;
    showHidden: boolean;
    setShowHidden: (show: boolean) => void;
    onCreate: () => void;
}

const NewsFilterHeader: React.FC<NewsFilterHeaderProps> = ({
    searchTerm, setSearchTerm, filterCategory, setFilterCategory, categories, darkMode, showHidden, setShowHidden, onCreate
}) => {
    return (
        <div className={`flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-2xl border ${darkMode ? 'bg-black border-white/5' : 'bg-white border-gray-200'}`}>
            {/* Main Content Wrapper */}
            <div className="flex flex-col w-full gap-4 md:flex-row md:items-center md:gap-4 md:w-auto">
                {/* Search Bar - Full Width on Mobile */}
                <div className="relative w-full md:w-64">
                    <i className={`fas fa-search absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
                    <input
                        type="text"
                        placeholder="Buscar notícias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-10 pr-4 text-sm focus:border-red-600 focus:outline-none transition-colors ${darkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                    />
                </div>

                {/* Quick Filter Buttons - Single Line Compact */}
                <div className="flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar w-full md:w-auto">
                    {/* Main Filter: My Posts */}
                    <button
                        onClick={() => setFilterCategory(filterCategory === 'Minhas Publicações' ? 'Todas' : 'Minhas Publicações')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${filterCategory === 'Minhas Publicações'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                            : (darkMode ? 'bg-black/40 text-gray-400 border border-white/10 hover:border-purple-600/50' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-white')
                            }`}
                    >
                        <i className="fas fa-user-edit mr-1"></i>
                        Minhas
                    </button>

                    {/* Category Dropdown (All others) */}
                    <select
                        value={(filterCategory === 'Minhas Publicações') ? '' : filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={`border rounded-lg py-1.5 px-2 text-[10px] font-medium focus:border-red-600 focus:outline-none min-w-[120px] flex-shrink-0 ${darkMode ? 'bg-black/40 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                    >
                        <option value="Todas">Todas as Categorias</option>
                        {categories.filter(c => c !== 'Todas').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Hidden Toggle - Icon Only on Mobile */}
                    <button
                        onClick={() => setShowHidden(!showHidden)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${showHidden
                            ? 'bg-gray-600 text-white shadow-md'
                            : (darkMode ? 'bg-black/40 text-gray-400 border border-white/10 hover:bg-white/5' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-white')
                            }`}
                        title={showHidden ? "Ocultar notícias escondidas" : "Mostrar notícias escondidas"}
                    >
                        <i className={`fas ${showHidden ? 'fa-eye-slash' : 'fa-eye'} md:mr-1`}></i>
                        <span className="hidden md:inline">{showHidden ? 'Ocultar' : 'Ver Ocultas'}</span>
                    </button>
                </div>

            </div>

            <button
                onClick={onCreate}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2"
            >
                <i className="fas fa-plus"></i> Nova Notícia
            </button>
        </div>
    );
};

export default NewsFilterHeader;
