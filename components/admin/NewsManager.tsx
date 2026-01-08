import React, { useState, useMemo } from 'react';
import { NewsItem, User, SystemSettings } from '../../types';
import EditorTab from './EditorTab';

interface NewsManagerProps {
    news: NewsItem[];
    user: User;
    onAddNews: (news: NewsItem) => void;
    onUpdateNews: (news: NewsItem) => void;
    onDeleteNews: (id: string) => void;
    systemSettings: SystemSettings;
    initialNewsToEdit?: NewsItem | null;
    initialFilter?: string;
    darkMode?: boolean;
}

const NewsManager: React.FC<NewsManagerProps> = ({ news, user, onAddNews, onUpdateNews, onDeleteNews, systemSettings, initialNewsToEdit, initialFilter, darkMode = false }) => {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState(initialFilter || 'Todas');

    // Deep Linking Effect
    React.useEffect(() => {
        if (initialNewsToEdit) {
            setSelectedNews(initialNewsToEdit);
            setView('editor');
        }
    }, [initialNewsToEdit]);

    const categories = ['Todas', 'Postagens do Site', 'Brasil', 'Mundo', ...Array.from(new Set(news.filter(n => !['Brasil', 'Mundo'].includes(n.category)).map(n => n.category))).sort()];

    // Filter Logic
    const filteredNews = useMemo(() => {
        return news.filter(item => {
            const matchesSearch = (item.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            let matchesCategory = true;
            if (filterCategory === 'Postagens do Site') {
                matchesCategory = item.source === 'site' || (!item.source && item.category !== 'Brasil' && item.category !== 'Mundo'); // Fallback if source empty
            } else if (filterCategory === 'Minhas Publicações') {
                matchesCategory = item.author === user.name || item.authorId === user.id;
            } else if (filterCategory !== 'Todas') {
                matchesCategory = item.category === filterCategory;
            }

            return matchesSearch && matchesCategory;
        }).sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
            const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
            return dateB - dateA;
        });
    }, [news, searchTerm, filterCategory]);

    // Pagination
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
    const currentNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Reset page when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory]);

    const [editorKey, setEditorKey] = useState(0);

    const handleEdit = (item: NewsItem) => {
        setSelectedNews(item);
        setView('editor');
    };

    const handleCreate = () => {
        setSelectedNews(null);
        setEditorKey(prev => prev + 1);
        setView('editor');
    };

    const handleSave = (savedNews: NewsItem, isUpdate: boolean) => {
        if (isUpdate) {
            onUpdateNews(savedNews);
        } else {
            onAddNews(savedNews);
        }
        setSelectedNews(savedNews);
        // CRITICAL: Do NOT close editor automatically. 
        // We rely on PublishSuccessModal in EditorTab to give user options.
        // setView('list'); 
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
            onDeleteNews(id);
        }
    };

    if (view === 'editor') {
        return (
            <div className="h-[calc(100vh-5rem)] -m-4 md:-m-8 relative">
                <EditorTab
                    key={selectedNews?.id || `new_${editorKey}`}
                    user={user}
                    initialData={selectedNews}
                    onSave={handleSave}
                    onCreateNew={handleCreate}
                    onCancel={() => { setView('list'); setSelectedNews(null); }}
                    accessToken={null} // Handle tokens if needed
                    systemSettings={systemSettings}
                    darkMode={darkMode}
                />
            </div>
        );
    }

    return (
        <div className="text-white space-y-6 animate-fade-in">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0F0F0F] p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                        <input
                            type="text"
                            placeholder="Buscar notícias..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-red-600 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Quick Filter Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setFilterCategory('Minhas Publicações')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Minhas Publicações'
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:border-purple-600/50'
                                }`}
                        >
                            <i className="fas fa-user-edit mr-1.5"></i>
                            Minhas
                        </button>
                        <button
                            onClick={() => setFilterCategory('Postagens do Site')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Postagens do Site'
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:border-red-600/50'
                                }`}
                        >
                            <i className="fas fa-home mr-1.5"></i>
                            Lagoa Formosa
                        </button>
                        <button
                            onClick={() => setFilterCategory('Brasil')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Brasil'
                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:border-green-600/50'
                                }`}
                        >
                            <i className="fas fa-flag mr-1.5"></i>
                            Brasil
                        </button>
                        <button
                            onClick={() => setFilterCategory('Mundo')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filterCategory === 'Mundo'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                : 'bg-black/40 text-gray-400 border border-white/10 hover:border-blue-600/50'
                                }`}
                        >
                            <i className="fas fa-globe mr-1.5"></i>
                            Mundo
                        </button>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl py-2 px-3 text-xs text-gray-300 focus:border-red-600 focus:outline-none"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                </div>

                <button
                    onClick={handleCreate}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2"
                >
                    <i className="fas fa-plus"></i> Nova Notícia
                </button>
            </div>

            {/* News Grid/List */}
            <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <tr>
                                <th className="p-4">Título / Resumo</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4 text-center">Views</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentNews.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4 max-w-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden shrink-0">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        <i className="fas fa-image"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-red-500 transition-colors">{item.title}</h4>
                                                <p className="text-xs text-gray-500 line-clamp-1">{item.lead}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-gray-600 uppercase font-bold">{new Date(item.createdAt || item.created_at || Date.now()).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-gray-600">•</span>
                                                    <span className="text-[9px] text-gray-600 font-bold">{item.author}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold uppercase text-gray-300">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-xs font-bold text-gray-400">{item.views || 0}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${item.status === 'published' ? 'bg-green-500/10 text-green-500' :
                                            item.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {item.status === 'published' ? 'Publicado' : item.status === 'draft' ? 'Rascunho' : 'Revisão'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                                                title="Editar"
                                            >
                                                <i className="fas fa-pen text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all"
                                                title="Excluir"
                                            >
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-4">
                    {currentNews.map(item => (
                        <div key={item.id} className="bg-white/5 rounded-xl p-4 border border-white/5 active:bg-white/10 transition-colors">
                            <div className="flex gap-3 mb-3">
                                <div className="w-16 h-16 rounded-lg bg-black/40 overflow-hidden shrink-0">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest mb-1 inline-block ${item.status === 'published' ? 'bg-green-500/10 text-green-500' :
                                            item.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {item.status === 'published' ? 'Publicado' : item.status === 'draft' ? 'Rascunho' : 'Revisão'}
                                        </span>
                                        <span className="text-[10px] text-gray-500">{new Date(item.createdAt || item.created_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-white text-sm line-clamp-2">{item.title}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase font-black mt-1">{item.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                    <i className="fas fa-eye"></i> {item.views || 0}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold uppercase"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold uppercase"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredNews.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Nenhuma notícia encontrada.
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest order-2 md:order-1">
                            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredNews.length)} de {filteredNews.length}
                        </span>

                        <div className="flex items-center gap-2 order-1 md:order-2">
                            {/* Previous */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === 1
                                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <i className="fas fa-chevron-left text-xs"></i>
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Simple logic: Show window around current page or first 5 if pages are few
                                    // For generic robustness dealing with < 100 pages:
                                    // Let's implement a smarter window logic
                                    let pageNum = i + 1;
                                    if (totalPages > 5) {
                                        if (currentPage > 3 && currentPage < totalPages - 2) {
                                            pageNum = currentPage - 2 + i;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        }
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages
                                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <i className="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsManager;
