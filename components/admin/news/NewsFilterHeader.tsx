
import React from 'react';

interface NewsFilterHeaderProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    categories: string[];
    darkMode: boolean;
    onCreate: () => void;
}

const NewsFilterHeader: React.FC<NewsFilterHeaderProps> = ({
    searchTerm, setSearchTerm, filterCategory, setFilterCategory, categories, darkMode, onCreate
}) => {
    return (
        <div className={`flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-2xl border ${darkMode ? 'bg-black border-white/5' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <i className={`fas fa-search absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}></i>
                    <input
                        type="text"
                        placeholder="Buscar notícias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full border rounded-xl py-2 pl-10 pr-4 text-sm focus:border-red-600 focus:outline-none transition-colors ${darkMode ? 'bg-black/40 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                    />
                </div>

                {/* Quick Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterCategory('Minhas Publicações')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Minhas Publicações'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : (darkMode ? 'bg-black/40 text-gray-400 border border-white/10 hover:border-purple-600/50' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-purple-300 hover:bg-white')
                            }`}
                    >
                        <i className="fas fa-user-edit mr-1.5"></i>
                        Minhas
                    </button>
                    <button
                        onClick={() => setFilterCategory('Postagens do Site')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Postagens do Site'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : (darkMode ? 'bg-black/40 text-gray-400 border border-white/10 hover:border-red-600/50' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-red-300 hover:bg-white')
                            }`}
                    >
                        <i className="fas fa-home mr-1.5"></i>
                        Lagoa Formosa
                    </button>
                    <button
                        onClick={() => setFilterCategory('Brasil')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Brasil'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                            : (darkMode ? 'bg-black/40 text-gray-400 border border-white/10 hover:border-green-600/50' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-green-300 hover:bg-white')
                            }`}
                    >
                        <i className="fas fa-flag mr-1.5"></i>
                        Brasil
                    </button>
                    <button
                        onClick={() => setFilterCategory('Mundo')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Mundo'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : (darkMode ? 'bg-black/40 text-gray-400 border border-white/10 hover:border-blue-600/50' : 'bg-gray-100 text-gray-500 border border-gray-200 hover:border-blue-300 hover:bg-white')
                            }`}
                    >
                        <i className="fas fa-globe mr-1.5"></i>
                        Mundo
                    </button>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={`border rounded-xl py-2 px-3 text-xs focus:border-red-600 focus:outline-none ${darkMode ? 'bg-black/40 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
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
