
import React, { useMemo, useState } from 'react';
import { User, NewsItem, Advertiser, checkPermission } from '../../types';

interface DashboardTabProps {
  user: User;
  newsHistory: NewsItem[];
  advertisers: Advertiser[];
  onEditPost: (post: NewsItem) => void;
  onNewPost: () => void;
  onManageAds: () => void;
  onDeletePost: (id: string) => void; 
}

type ActivityFilter = 'all' | 'site' | 'rss';

const DashboardTab: React.FC<DashboardTabProps> = ({ user, newsHistory, advertisers, onEditPost, onNewPost, onManageAds, onDeletePost }) => {
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [liveStatusMessage, setLiveStatusMessage] = useState('Acompanhe a cobertura completa em tempo real.');

  const adMetrics = useMemo(() => {
    const totalViews = advertisers.reduce((acc, ad) => acc + ad.views, 0);
    const totalClicks = advertisers.reduce((acc, ad) => acc + ad.clicks, 0);
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';
    return { totalViews, totalClicks, ctr };
  }, [advertisers]);

  const recentActivity = useMemo(() => {
      let filtered = [...newsHistory];

      if (activityFilter === 'site') {
          filtered = filtered.filter(n => n.source === 'site' || !n.source);
      } else if (activityFilter === 'rss') {
          filtered = filtered.filter(n => n.source === 'rss_automation');
      }

      return filtered.sort((a, b) => {
          if (activityFilter === 'all') {
              const isASite = a.source === 'site' || !a.source;
              const isBSite = b.source === 'site' || !b.source;
              if (isASite && !isBSite) return -1;
              if (!isASite && isBSite) return 1;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }).slice(0, 40);
  }, [newsHistory, activityFilter]);

  const handleDeleteClick = (id: string) => {
      if (window.confirm("Tem certeza que deseja excluir esta notícia permanentemente?")) {
          onDeletePost(id);
      }
  };

  const handleUpdateLiveStatus = () => {
      alert(`Status atualizado para: "${liveStatusMessage}"`);
  };

  const canEdit = checkPermission(user, 'editorial_edit');
  const canDelete = checkPermission(user, 'editorial_delete');

  return (
    <div className="animate-fadeIn w-full max-w-[1600px] mx-auto">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 md:px-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
            Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Comando</span>
          </h1>
          <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sistema Operacional • {user.role}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {checkPermission(user, 'financial_view') && (
                <button onClick={onManageAds} className="flex-1 md:flex-none bg-white text-gray-800 border border-gray-200 px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:shadow-xl items-center justify-center gap-3 hover:bg-gray-50 transition-all group">
                <i className="fas fa-users-cog text-gray-400 group-hover:text-black"></i> Gestão de Anunciantes
                </button>
            )}
            {canEdit && (
                <button onClick={onNewPost} className="flex-1 md:flex-none bg-gray-900 text-white px-5 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl items-center justify-center gap-3 hover:bg-red-600 transition-all">
                <i className="fas fa-plus"></i> Nova Matéria
                </button>
            )}
        </div>
      </header>

      {/* PAINEL DE CONTROLE RÁPIDO AO VIVO */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-red-100 shadow-sm mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
          
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-inner">
                  <i className="fas fa-broadcast-tower text-lg md:text-xl animate-pulse"></i>
              </div>
              <div>
                  <h3 className="text-[10px] md:text-xs font-black uppercase text-gray-900 tracking-widest">Controle Ao Vivo</h3>
                  <p className="text-[8px] font-bold text-gray-400 uppercase">Mensagem do Ticker / Plantão</p>
              </div>
          </div>
          
          <div className="flex-1 w-full relative group">
              <input 
                  type="text" 
                  value={liveStatusMessage}
                  onChange={(e) => setLiveStatusMessage(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-gray-800 focus:border-red-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                  placeholder="Mensagem de urgência..."
              />
              <button 
                onClick={handleUpdateLiveStatus}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg active:scale-95"
              >
                  <i className="fas fa-save text-xs"></i>
              </button>
          </div>
      </div>

      {/* Metrics Cards */}
      {checkPermission(user, 'financial_view') && (
        <div className="mb-8 md:mb-12 w-full px-1 md:px-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white shadow-md relative overflow-hidden group">
                    <div className="relative z-10">
                        <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Alcance Total</span>
                        <p className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{adMetrics.totalViews.toLocaleString()}</p>
                        <div className="mt-2 md:mt-4 flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">+12% essa semana</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-purple-50/50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-white shadow-md relative overflow-hidden group">
                    <div className="relative z-10">
                        <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">CTR Médio</span>
                        <p className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">{adMetrics.ctr}<span className="text-xl md:text-2xl text-gray-400">%</span></p>
                        <div className="mt-2 text-gray-400 text-[8px] md:text-[10px] font-bold uppercase">Taxa de cliques</div>
                    </div>
                </div>

                <div 
                    onClick={onManageAds}
                    className="bg-gradient-to-br from-gray-900 to-black p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl relative overflow-hidden group cursor-pointer"
                >
                    <div className="relative z-10 text-white">
                        <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Parceiros Ativos</span>
                        <p className="text-3xl md:text-5xl font-black text-white tracking-tight">{advertisers.filter(a => a.isActive).length}</p>
                        <div className="mt-4 md:mt-6 flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                            Gerenciar <i className="fas fa-arrow-right ml-1"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl md:rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden w-full">
        <div className="p-4 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></div>
                <div>
                    <h3 className="text-xs md:text-sm font-black uppercase text-gray-900 tracking-widest">Atividade Recente</h3>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">Ordenado por prioridade</p>
                </div>
            </div>

            <div className="flex bg-gray-200 p-1 rounded-xl w-full md:w-auto">
                {[
                    { id: 'all', label: 'Tudo', icon: 'fa-list' },
                    { id: 'site', label: 'Local', icon: 'fa-pen-nib' },
                    { id: 'rss', label: 'Externo', icon: 'fa-globe' }
                ].map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setActivityFilter(opt.id as ActivityFilter)}
                        className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${
                            activityFilter === opt.id 
                            ? 'bg-white text-black shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <i className={`fas ${opt.icon}`}></i> {opt.label}
                    </button>
                ))}
            </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-white">
              <tr>
                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] pl-6 md:pl-8">Publicação</th>
                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Fonte</th>
                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Status</th>
                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] text-right pr-6 md:pr-8">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.map(n => (
                <tr key={n.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4 md:p-6 pl-6 md:pl-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shadow-sm border border-gray-200 shrink-0">
                            <img src={n.imageUrl} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = "https://placehold.co/100x100?text=News"}} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-xs md:text-sm leading-tight truncate max-w-[200px] md:max-w-[400px] group-hover:text-red-600 transition-colors">{n.title}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{n.category}</p>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 md:p-6">
                    {n.source === 'rss_automation' ? (
                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit">
                            <i className="fas fa-globe"></i> Mundo
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 w-fit">
                            <i className="fas fa-pen-nib"></i> Local
                        </span>
                    )}
                  </td>
                  <td className="p-4 md:p-6">
                    <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                        n.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        n.status === 'draft' ? 'bg-gray-50 text-gray-500 border-gray-100' : 
                        'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {n.status === 'published' ? 'No Ar' : n.status === 'draft' ? 'Rascunho' : 'Revisão'}
                    </span>
                  </td>
                  <td className="p-4 md:p-6 text-right pr-6 md:pr-8">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => onEditPost(n)} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all flex items-center justify-center">
                            <i className="fas fa-pen text-[10px]"></i>
                        </button>
                        {canDelete && (
                            <button onClick={() => handleDeleteClick(n.id)} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                                <i className="fas fa-trash text-[10px]"></i>
                            </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
