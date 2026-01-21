
import React from 'react';
import { NewsItem } from '../../../types';

interface NewsListProps {
    currentNews: NewsItem[];
    filteredNewsLength: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    darkMode: boolean;
    onPageChange: (page: number) => void;
    onEdit: (news: NewsItem) => void;
    onDelete: (id: string) => void;
}

const NewsList: React.FC<NewsListProps> = ({
    currentNews, filteredNewsLength, currentPage, itemsPerPage, totalPages, darkMode, onPageChange, onEdit, onDelete
}) => {
    return (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-black border-white/5' : 'bg-white border-gray-200'}`}>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500 border-b border-gray-100'}`}>
                        <tr>
                            <th className="p-4">Título / Resumo</th>
                            <th className="p-4">Categoria</th>
                            <th className="p-4 text-center">Views</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                        {currentNews.map(item => (
                            <tr key={item.id} className={`transition-colors group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                <td className="p-4 max-w-md">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    <i className="fas fa-image"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-sm line-clamp-1 group-hover:text-red-500 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
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
                                    <span className={`px-2 py-1 rounded border text-[9px] font-bold uppercase ${darkMode ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
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
                                            onClick={() => onEdit(item)}
                                            className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                                            title="Editar"
                                        >
                                            <i className="fas fa-pen text-xs"></i>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
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
                    <div key={item.id} className={`rounded-xl p-4 border active:bg-opacity-80 transition-colors ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <div className="flex gap-3 mb-3">
                            <div className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 ${darkMode ? 'bg-black/40' : 'bg-gray-200'}`}>
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
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
                                <h4 className={`font-bold text-sm line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                                <p className="text-[10px] text-gray-500 uppercase font-black mt-1">{item.category}</p>
                            </div>
                        </div>

                        <div className={`flex items-center justify-between pt-3 border-t ${darkMode ? 'border-white/5' : 'border-gray-200/50'}`}>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <i className="fas fa-eye"></i> {item.views || 0}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(item)}
                                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-bold uppercase"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold uppercase"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredNewsLength === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">
                    Nenhuma notícia encontrada.
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={`p-4 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest order-2 md:order-1">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredNewsLength)} de {filteredNewsLength}
                    </span>

                    <div className="flex items-center gap-2 order-1 md:order-2">
                        {/* Previous */}
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === 1
                                ? (darkMode ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed')
                                : (darkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900')
                                }`}
                        >
                            <i className="fas fa-chevron-left text-xs"></i>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                            : (darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900')
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Next */}
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages
                                ? (darkMode ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed')
                                : (darkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900')
                                }`}
                        >
                            <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsList;
