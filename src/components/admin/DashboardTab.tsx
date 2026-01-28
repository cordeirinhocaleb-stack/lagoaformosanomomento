import React, { useMemo, useState } from 'react';
import { User, NewsItem, Advertiser, checkPermission, SystemSettings } from '../../types';
import Toast from '../common/Toast';

interface DashboardTabProps {
    user: User;
    newsHistory: NewsItem[];
    advertisers: Advertiser[];
    systemSettings: SystemSettings;
    onEditPost: (post: NewsItem) => void;
    onNewPost: () => void;
    onManageAds: () => void;
    onDeletePost: (id: string) => void;
    onUpdateSystemSettings: (settings: SystemSettings) => Promise<void> | void;
    darkMode?: boolean;
}

type ActivityFilter = 'all' | 'site' | 'rss' | 'instagram';

const DashboardTab: React.FC<DashboardTabProps> = ({ user, newsHistory, advertisers, systemSettings, onEditPost, onNewPost, onManageAds, onDeletePost, onUpdateSystemSettings, darkMode = true }) => {
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
    // Inicializa com o valor das configurações do sistema ou fallback
    const [liveStatusMessage, setLiveStatusMessage] = useState(
        (systemSettings?.tickerMessage || 'Acompanhe a cobertura completa em tempo real.')
    );
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

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
        } else if (activityFilter === 'instagram') {
            filtered = filtered.filter(n => n.source === 'instagram' || n.category === 'Instagram');
        }

        return filtered.sort((a, b) => {
            if (activityFilter === 'all') {
                const isALocal = a.source === 'site' || !a.source || a.source === 'instagram';
                const isBLocal = b.source === 'site' || !b.source || b.source === 'instagram';
                if (isALocal && !isBLocal) { return -1; }
                if (!isALocal && isBLocal) { return 1; }
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 40);
    }, [newsHistory, activityFilter]);

    const handleDeleteClick = (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta notícia permanentemente?")) {
            onDeletePost(id);
        }
    };

    const handleUpdateLiveStatus = async () => {
        if (!liveStatusMessage.trim()) return;

        try {
            await onUpdateSystemSettings({
                ...systemSettings,
                tickerMessage: liveStatusMessage
            } as SystemSettings);

            setToast({ message: "Status ao vivo atualizado!", type: 'success' });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            setToast({ message: "Erro ao salvar status.", type: 'error' });
        }
    };

    const canEdit = checkPermission(user, 'editorial_edit');
    const canDelete = checkPermission(user, 'editorial_delete');

    return (
        <div className="animate-fadeIn w-full max-w-[1600px] mx-auto pb-20">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className={`text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">Comando</span>
                    </h1>
                    <p className="text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Sistema Operacional • {user.role}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {checkPermission(user, 'financial_view') && (
                        <button onClick={onManageAds} className={`flex-1 md:flex-none border px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:shadow-xl items-center justify-center gap-3 transition-all group ${darkMode ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}>
                            <i className="fas fa-users-cog text-gray-400 group-hover:text-red-500 transition-colors"></i> Gestão de Anunciantes
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
            <div className={`p-4 md:p-6 rounded-2xl md:rounded-[2rem] border shadow-sm mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 relative overflow-hidden ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-red-100'}`}>
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>

                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 border shadow-inner ${darkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-100'}`}>
                        <i className="fas fa-broadcast-tower text-lg md:text-xl animate-pulse"></i>
                    </div>
                    <div>
                        <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>Controle Ao Vivo</h3>
                        <p className="text-[8px] font-bold text-gray-400 uppercase">Mensagem do Ticker / Plantão</p>
                    </div>
                </div>

                <div className="flex-1 w-full relative group">
                    <input
                        type="text"
                        value={liveStatusMessage}
                        onChange={(e) => setLiveStatusMessage(e.target.value)}
                        className={`w-full border-2 rounded-xl pl-4 pr-12 py-3 text-sm font-bold outline-none transition-all placeholder:text-gray-600 ${darkMode ? 'bg-black/40 border-white/5 text-white focus:border-red-600' : 'bg-gray-50 border-gray-100 text-gray-800 focus:border-red-500 focus:bg-white'}`}
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
                <div className="mb-8 md:mb-12 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                        <div className={`p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border shadow-md relative overflow-hidden group ${darkMode ? 'bg-gradient-to-br from-white/5 to-blue-900/10 border-white/5' : 'bg-gradient-to-br from-white to-blue-50/50 border-white'}`}>
                            <div className="relative z-10">
                                <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Alcance Total</span>
                                <p className={`text-3xl md:text-5xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{adMetrics.totalViews.toLocaleString()}</p>
                                <div className="mt-2 md:mt-4 flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>+12% essa semana</span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border shadow-md relative overflow-hidden group ${darkMode ? 'bg-gradient-to-br from-white/5 to-purple-900/10 border-white/5' : 'bg-gradient-to-br from-white to-purple-50/50 border-white'}`}>
                            <div className="relative z-10">
                                <span className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">CTR Médio</span>
                                <p className={`text-3xl md:text-5xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{adMetrics.ctr}<span className="text-xl md:text-2xl text-gray-400">%</span></p>
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
            <div className={`rounded-2xl md:rounded-[3rem] border shadow-xl overflow-hidden w-full ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
                <div className={`p-4 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 md:h-8 bg-red-600 rounded-full"></div>
                        <div>
                            <h3 className={`text-xs md:text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>Atividade Recente</h3>
                            <p className="text-[8px] font-bold text-gray-400 uppercase">Ordenado por prioridade</p>
                        </div>
                    </div>

                    <div className={`flex p-1 rounded-xl w-full md:w-auto ${darkMode ? 'bg-white/5' : 'bg-gray-200'}`}>
                        {[
                            { id: 'all', label: 'Tudo', icon: 'fa-list' },
                            { id: 'site', label: 'Local', icon: 'fa-pen-nib' },
                            { id: 'rss', label: 'Externo', icon: 'fa-globe' },
                            { id: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setActivityFilter(opt.id as ActivityFilter)}
                                className={`flex-1 md:flex-none px-3 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activityFilter === opt.id
                                    ? (darkMode ? 'bg-white text-black shadow-sm' : 'bg-white text-black shadow-sm')
                                    : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700')
                                    }`}
                            >
                                <i className={`fas ${opt.icon}`}></i> {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto w-full">
                    <table className="w-full text-left">
                        <thead className={darkMode ? 'bg-white/5' : 'bg-gray-50'}>
                            <tr>
                                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] pl-6 md:pl-8">Publicação</th>
                                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Fonte</th>
                                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em]">Status</th>
                                <th className="p-4 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] text-right pr-6 md:pr-8">Ação</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                            {recentActivity.map(n => (
                                <tr key={n.id} className={`transition-colors group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50/80'}`}>
                                    <td className="p-4 md:p-6 pl-6 md:pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg overflow-hidden relative shadow-sm border shrink-0 ${darkMode ? 'bg-zinc-800 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                                <img src={n.imageUrl} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=News" }} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-bold text-xs md:text-sm leading-tight truncate max-w-[200px] md:max-w-[400px] group-hover:text-red-600 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{n.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {n.source === 'rss_automation' ? (
                                            <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase px-2 py-1 rounded border w-fit ${darkMode ? 'text-blue-400 bg-blue-900/20 border-blue-900/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                                <i className="fas fa-globe"></i> Mundo
                                            </span>
                                        ) : n.source === 'instagram' ? (
                                            <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase px-2 py-1 rounded border w-fit ${darkMode ? 'text-pink-400 bg-pink-900/20 border-pink-900/50' : 'text-pink-600 bg-pink-50 border-pink-100'}`}>
                                                <i className="fab fa-instagram"></i> Insta
                                            </span>
                                        ) : (
                                            <span className={`flex items-center gap-1.5 text-[8px] font-black uppercase px-2 py-1 rounded border w-fit ${darkMode ? 'text-red-400 bg-red-950/20 border-red-900/50' : 'text-red-600 bg-red-50 border-red-100'}`}>
                                                <i className="fas fa-pen-nib"></i> Local
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${n.status === 'published' ? (darkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100') :
                                            n.status === 'draft' ? (darkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-100') :
                                                (darkMode ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' : 'bg-amber-50 text-amber-600 border-amber-100')
                                            }`}>
                                            {n.status === 'published' ? 'No Ar' : n.status === 'draft' ? 'Rascunho' : 'Revisão'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right pr-6 md:pr-8">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    if (n.source === 'instagram') {
                                                        alert("Posts do Instagram não podem ser editados no portal. Edite diretamente no Instagram.");
                                                        return;
                                                    }
                                                    onEditPost(n);
                                                }}
                                                className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${n.source === 'instagram' ? 'opacity-20 cursor-not-allowed' : ''} ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white hover:text-black' : 'bg-gray-50 text-gray-400 hover:bg-black hover:text-white'}`}
                                                title={n.source === 'instagram' ? "Post do Instagram (Somente Leitura)" : "Editar"}
                                            >
                                                <i className="fas fa-pen text-[10px]"></i>
                                            </button>
                                            {canDelete && (
                                                <button
                                                    onClick={() => {
                                                        if (n.source === 'instagram') {
                                                            alert("Posts do Instagram não podem ser excluídos pelo painel. Remova no Instagram.");
                                                            return;
                                                        }
                                                        handleDeleteClick(n.id);
                                                    }}
                                                    className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${n.source === 'instagram' ? 'opacity-20 cursor-not-allowed' : ''} ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white' : 'bg-gray-50 text-gray-400 hover:bg-red-600 hover:text-white'}`}
                                                    title={n.source === 'instagram' ? "Post do Instagram (Somente Leitura)" : "Excluir"}
                                                >
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

                {/* Mobile Card View */}
                <div className="md:hidden flex flex-col divide-y divide-white/5">
                    {recentActivity.map(n => (
                        <div key={n.id} className={`p-4 flex flex-col gap-3 ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-12 h-12 rounded-lg overflow-hidden relative shadow-sm border shrink-0 ${darkMode ? 'bg-zinc-800 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                        <img src={n.imageUrl} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=News" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`font-bold text-sm leading-tight line-clamp-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{n.category}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button onClick={() => onEditPost(n)} className={`w-8 h-8 rounded-full transition-all flex items-center justify-center ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                                        <i className="fas fa-pen text-xs"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                    {n.source === 'rss_automation' ? (
                                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded border w-fit ${darkMode ? 'text-blue-400 bg-blue-900/20 border-blue-900/50' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                            <i className="fas fa-globe"></i> Mundo
                                        </span>
                                    ) : n.source === 'instagram' ? (
                                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded border w-fit ${darkMode ? 'text-pink-400 bg-pink-900/20 border-pink-900/50' : 'text-pink-600 bg-pink-50 border-pink-100'}`}>
                                            <i className="fab fa-instagram"></i> Insta
                                        </span>
                                    ) : (
                                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded border w-fit ${darkMode ? 'text-red-400 bg-red-950/20 border-red-900/50' : 'text-red-600 bg-red-50 border-red-100'}`}>
                                            <i className="fas fa-pen-nib"></i> Local
                                        </span>
                                    )}
                                </div>

                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${n.status === 'published' ? (darkMode ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-600 border-emerald-100') :
                                    n.status === 'draft' ? (darkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-100') :
                                        (darkMode ? 'bg-amber-900/20 text-amber-400 border-amber-900/50' : 'bg-amber-50 text-amber-600 border-amber-100')
                                    }`}>
                                    {n.status === 'published' ? 'No Ar' : n.status === 'draft' ? 'Rascunho' : 'Revisão'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
