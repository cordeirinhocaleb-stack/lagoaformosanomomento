
import React, { useState, useMemo } from 'react';
import { NewsItem } from '../../types';

interface WorkflowTabProps {
  newsHistory: NewsItem[];
  isAdmin: boolean;
  onEdit: (post: NewsItem) => void;
  onStatusUpdate: (updatedPost: NewsItem) => void;
  onDelete: (id: string) => void; // New Prop
}

const CATEGORIES = ['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'];

const WorkflowTab: React.FC<WorkflowTabProps> = ({ newsHistory, isAdmin, onEdit, onStatusUpdate, onDelete }) => {
  const [subTab, setSubTab] = useState<'queue' | 'analytics'>('queue');
  const [postSearch, setPostSearch] = useState('');
  const [postFilterCategory, setPostFilterCategory] = useState('all');

  const filteredPosts = useMemo(() => {
    return newsHistory.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(postSearch.toLowerCase()) || post.author.toLowerCase().includes(postSearch.toLowerCase());
      const matchesCategory = postFilterCategory === 'all' || post.category === postFilterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [newsHistory, postSearch, postFilterCategory]);

  const contentMetrics = useMemo(() => {
    const totalViews = newsHistory.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const publishedCount = newsHistory.filter(n => n.status === 'published').length;
    const avgViews = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;
    const topPost = [...newsHistory].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
    return { totalViews, avgViews, topPost };
  }, [newsHistory]);

  const getInitials = (name: string) => {
     return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja excluir esta notícia permanentemente?")) {
          onDelete(id);
      }
  };

  return (
    <div className="animate-fadeIn w-full">
      <header className="mb-8">
        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">Gestor de <span className="text-red-600">Conteúdo</span></h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Controle editorial, métricas e aprovações</p>
      </header>
      
      <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl w-full md:w-fit shadow-sm border border-gray-100 overflow-x-auto">
        <button 
          onClick={() => setSubTab('queue')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            subTab === 'queue' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          Fila de Aprovação
          {newsHistory.filter(n => n.status === 'in_review').length > 0 && (
             <span className="ml-2 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px]">{newsHistory.filter(n => n.status === 'in_review').length}</span>
          )}
        </button>
        <button 
          onClick={() => setSubTab('analytics')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            subTab === 'analytics' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
          }`}
        >
          Acervo & Métricas
        </button>
      </div>

      {subTab === 'queue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsHistory.filter(n => n.status !== 'published').length > 0 ? (
            newsHistory.filter(n => n.status !== 'published').map(n => (
              <div key={n.id} className="bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-xl transition-all border-l-8 border-amber-500 group relative">
                <button 
                    onClick={(e) => handleDeleteClick(e, n.id)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                >
                    <i className="fas fa-trash text-xs"></i>
                </button>
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{n.status.replace('_', ' ')}</span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(n.updatedAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-black uppercase italic text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">{n.title}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mb-6 font-medium">{n.lead || "Sem resumo definido..."}</p>
                
                <div className="flex gap-2">
                  <button onClick={() => onEdit(n)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[9px] font-black uppercase hover:bg-black transition-colors">Abrir Editor</button>
                  {isAdmin && <button onClick={() => onStatusUpdate({...n, status: 'published'})} className="bg-green-600 text-white px-4 py-3 rounded-2xl text-[9px] font-black uppercase hover:scale-105 transition-transform"><i className="fas fa-check"></i></button>}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center opacity-40">
              <i className="fas fa-check-circle text-6xl text-green-200 mb-4"></i>
              <p className="text-gray-400 font-bold uppercase tracking-widest">Tudo limpo! Nenhuma pendência.</p>
            </div>
          )}
        </div>
      )}

      {subTab === 'analytics' && (
         <div className="space-y-8 animate-fadeIn w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fas fa-eye text-6xl"></i></div>
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Alcance Total</span>
                  <p className="text-4xl font-black text-gray-900 mt-2">{contentMetrics.totalViews.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-green-500 mt-2 uppercase">+ Leituras em tempo real</p>
               </div>
               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fas fa-trophy text-6xl"></i></div>
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Matéria Mais Lida</span>
                  <p className="text-xl font-black text-gray-900 mt-2 line-clamp-2 leading-tight min-h-[3.5rem]">
                     {contentMetrics.topPost ? contentMetrics.topPost.title : "Nenhum dado"}
                  </p>
                  <p className="text-[9px] font-bold text-red-500 mt-2 uppercase">
                     {contentMetrics.topPost ? `${contentMetrics.topPost.views} Visualizações` : "-"}
                  </p>
               </div>
               <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fas fa-chart-line text-6xl"></i></div>
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Média por Post</span>
                  <p className="text-4xl font-black text-blue-600 mt-2">{contentMetrics.avgViews.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase">Engajamento estimado</p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <div className="flex-1 relative">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                  <input 
                     type="text" 
                     placeholder="Buscar por título ou autor..." 
                     value={postSearch}
                     onChange={(e) => setPostSearch(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 outline-none focus:border-black font-bold text-sm transition-colors"
                  />
               </div>
               <select 
                  value={postFilterCategory} 
                  onChange={(e) => setPostFilterCategory(e.target.value)}
                  className="px-6 py-3 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm uppercase text-gray-600 focus:border-black min-w-[200px]"
               >
                  <option value="all">Todas as Categorias</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full max-w-full">
               <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest w-1/2">Publicação</th>
                           <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                           <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Performance</th>
                           <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {filteredPosts.map(post => {
                           const viewPercentage = contentMetrics.topPost && contentMetrics.topPost.views 
                              ? ((post.views || 0) / contentMetrics.topPost.views) * 100 
                              : 0;

                           return (
                              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => onEdit(post)}>
                                 <td className="p-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                          <img src={post.imageUrl} className="w-full h-full object-cover" />
                                          {post.mediaType === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><i className="fas fa-play text-white text-[8px]"></i></div>}
                                       </div>
                                       <div>
                                          <h4 className="font-black text-gray-900 text-sm leading-tight mb-1 line-clamp-1 group-hover:text-red-600 transition-colors">{post.title}</h4>
                                          <div className="flex items-center gap-2">
                                             <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-black">{getInitials(post.author)}</div>
                                             <span className="text-[10px] text-gray-500 font-bold uppercase">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                       {post.category}
                                    </span>
                                 </td>
                                 <td className="p-6">
                                    <div className="flex flex-col gap-1 w-32">
                                       <div className="flex justify-between items-end">
                                          <span className="text-xs font-black text-gray-900">{post.views || 0}</span>
                                          <span className="text-[8px] font-bold text-gray-400 uppercase">Cliques</span>
                                       </div>
                                       <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${viewPercentage}%` }}></div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-6 text-right flex justify-end gap-2 items-center">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-block ${
                                       post.status === 'published' ? 'bg-green-100 text-green-700' :
                                       post.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                                       'bg-amber-100 text-amber-600'
                                    }`}>
                                       {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Rascunho' : 'Em Revisão'}
                                    </span>
                                    <button 
                                        onClick={(e) => handleDeleteClick(e, post.id)} 
                                        className="w-6 h-6 rounded-full bg-gray-50 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        title="Excluir"
                                    >
                                        <i className="fas fa-trash text-[10px]"></i>
                                    </button>
                                 </td>
                              </tr>
                           );
                        })}
                        {filteredPosts.length === 0 && (
                           <tr>
                              <td colSpan={4} className="p-10 text-center text-gray-400 text-xs font-bold uppercase">Nenhuma publicação encontrada para os filtros atuais.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default WorkflowTab;
