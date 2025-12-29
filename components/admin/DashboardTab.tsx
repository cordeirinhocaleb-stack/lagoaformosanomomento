
import React, { useMemo } from 'react';
import { User, NewsItem, Advertiser } from '../../types';

interface DashboardTabProps {
  user: User;
  newsHistory: NewsItem[];
  advertisers: Advertiser[];
  onEditPost: (post: NewsItem) => void;
  onNewPost: () => void;
  onManageAds: () => void;
  onDeletePost: (id: string) => void; // New Prop
}

const DashboardTab: React.FC<DashboardTabProps> = ({ user, newsHistory, advertisers, onEditPost, onNewPost, onManageAds, onDeletePost }) => {
  const adMetrics = useMemo(() => {
    const totalViews = advertisers.reduce((acc, ad) => acc + ad.views, 0);
    const totalClicks = advertisers.reduce((acc, ad) => acc + ad.clicks, 0);
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';
    return { totalViews, totalClicks, ctr };
  }, [advertisers]);

  // Filtra e ordena as 40 últimas notícias (incluindo RSS/Mundo)
  const recentActivity = useMemo(() => {
      return [...newsHistory]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 40);
  }, [newsHistory]);

  const handleDeleteClick = (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir esta notícia permanentemente?")) {
          onDeletePost(id);
      }
  };

  return (
    <div className="animate-fadeIn w-full max-w-[1600px] mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
            Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Comando</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sistema Operacional • {user.role}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button onClick={onManageAds} className="flex-1 md:flex-none bg-white text-gray-800 border border-gray-200 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:shadow-xl items-center justify-center gap-3 hover:bg-gray-50 transition-all group transform hover:-translate-y-1">
              <i className="fas fa-users-cog text-gray-400 group-hover:text-black transition-colors"></i> Gestão de Anunciantes
            </button>
            <button onClick={onNewPost} className="flex-1 md:flex-none bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-gray-900/20 items-center justify-center gap-3 hover:bg-red-600 hover:shadow-red-600/30 hover:-translate-y-1 transition-all">
              <i className="fas fa-plus"></i> Nova Matéria
            </button>
        </div>
      </header>

      {/* Metrics Cards - Visual Refined */}
      <div className="mb-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-white to-blue-50/50 p-8 rounded-[2.5rem] border border-white/60 shadow-xl relative overflow-hidden group hover:border-blue-100 transition-colors">
                <div className="absolute top-[-20%] right-[-10%] text-[150px] text-blue-50 opacity-50 rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <i className="fas fa-eye"></i>
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-4 text-xl shadow-sm border border-blue-50">
                        <i className="fas fa-chart-bar"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Alcance Total</span>
                    <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{adMetrics.totalViews.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase">+12% essa semana</span>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-white to-purple-50/50 p-8 rounded-[2.5rem] border border-white/60 shadow-xl relative overflow-hidden group hover:border-purple-100 transition-colors">
                <div className="absolute top-[-20%] right-[-10%] text-[150px] text-purple-50 opacity-50 rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <i className="fas fa-mouse-pointer"></i>
                </div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 mb-4 text-xl shadow-sm border border-purple-50">
                        <i className="fas fa-bullseye"></i>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">CTR Médio</span>
                    <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{adMetrics.ctr}<span className="text-2xl text-gray-400">%</span></p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-gray-400 text-[10px] font-bold">Taxa de conversão de cliques</span>
                    </div>
                </div>
            </div>

            <div 
                onClick={onManageAds}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative z-10 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md border border-white/10">
                            <i className="fas fa-store"></i>
                        </div>
                        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-[9px] font-black uppercase animate-pulse">
                            Sistema Online
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Parceiros Ativos</span>
                    <p className="text-4xl md:text-5xl font-black text-white tracking-tight">{advertisers.filter(a => a.isActive).length}</p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        Gerenciar Campanhas <i className="fas fa-arrow-right ml-1"></i>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Recent Activity Table - Updated for 40 items and source display */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden w-full max-w-full">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                <div>
                    <h3 className="text-sm font-black uppercase text-gray-900 tracking-widest">Atividade Recente (Brasil & Mundo)</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">Últimas 40 publicações do sistema</p>
                </div>
            </div>
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors"><i className="fas fa-arrow-up mr-1"></i> Topo</button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-white">
              <tr>
                <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] pl-8">Publicação</th>
                <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Fonte</th>
                <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Status</th>
                <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Data</th>
                <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] text-right pr-8">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.map(n => (
                <tr key={n.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6 pl-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shadow-sm border border-gray-200">
                            <img src={n.imageUrl} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = "https://placehold.co/100x100?text=News"}} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight truncate max-w-[250px] group-hover:text-red-600 transition-colors">{n.title}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{n.category}</p>
                        </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {n.source === 'rss_automation' ? (
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                            <i className="fas fa-globe"></i> Mundo (RSS)
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                            <i className="fas fa-pen-nib"></i> Local
                        </span>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                        n.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        n.status === 'draft' ? 'bg-gray-50 text-gray-500 border-gray-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {n.status === 'published' ? 'Publicado' : n.status === 'draft' ? 'Rascunho' : 'Em Revisão'}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-gray-600">{new Date(n.createdAt).toLocaleDateString()}</p>
                    <p className="text-[9px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </td>
                  <td className="p-6 text-right pr-8">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => onEditPost(n)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm flex items-center justify-center" title="Editar">
                            <i className="fas fa-pen text-xs"></i>
                        </button>
                        <button onClick={() => handleDeleteClick(n.id)} className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-sm flex items-center justify-center" title="Apagar">
                            <i className="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 text-xs font-bold uppercase">Nenhuma atividade recente registrada.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
