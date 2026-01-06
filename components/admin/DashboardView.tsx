import React, { useMemo } from 'react';
import { User, NewsItem, Advertiser, Job } from '../../types';

interface DashboardViewProps {
    users: User[];
    news: NewsItem[];
    advertisers: Advertiser[];
    jobs: Job[];
    auditLogs: any[];
    onNavigate: (view: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ users, news, advertisers, jobs, auditLogs, onNavigate }) => {

    const stats = useMemo(() => [
        {
            label: 'Usuários Totais',
            value: users.length,
            icon: 'fa-users',
            color: 'from-blue-600 to-blue-400',
            trend: '+12% este mês'
        },
        {
            label: 'Notícias Publicadas',
            value: news.length,
            icon: 'fa-newspaper',
            color: 'from-red-600 to-red-400',
            trend: '+5 hoje'
        },
        {
            label: 'Anunciantes Ativos',
            value: advertisers.filter(a => a.isActive).length,
            icon: 'fa-ad',
            color: 'from-green-600 to-green-400',
            trend: 'Estável'
        },
        {
            label: 'Vagas Abertas',
            value: jobs.filter(j => (j as any).status === 'open').length,
            icon: 'fa-briefcase',
            color: 'from-yellow-600 to-yellow-400',
            trend: '+2 novas'
        },
    ], [users, news, advertisers, jobs]);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-2xl bg-[#0F0F0F] border border-white/5 p-5 md:p-6 hover:border-red-600/30 transition-all duration-300">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <i className={`fas ${stat.icon} text-4xl text-white`}></i>
                        </div>

                        <div className="relative z-10">
                            <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-4">{stat.value}</h3>

                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></span>
                                <span className="text-[10px] text-gray-400">{stat.trend}</span>
                            </div>
                        </div>

                        {/* Hover Glow */}
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-r from-red-600/20 to-transparent blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                ))}
            </div>

            {/* Recentes Section Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 p-5 md:p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <i className="fas fa-history text-red-500"></i>
                        Atividade Recente
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {auditLogs.length > 0 ? (
                            auditLogs.slice(0, 10).map((log, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-black/40 hover:bg-white/5 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-red-600/20 group-hover:text-red-500 transition-colors">
                                        <i className={`fas ${log.action === 'INSERT' ? 'fa-plus' : log.action === 'DELETE' ? 'fa-trash' : 'fa-edit'}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-300 truncate">
                                            {log.details.includes('Notícia') ? 'Notícia' :
                                                log.details.includes('User') || log.details.includes('Usuário') ? 'Usuário' :
                                                    log.details.includes('Ad') || log.details.includes('Anuncio') ? 'Anúncio' : 'Atividade'}
                                            <span className="text-white font-bold ml-1">"{log.userName}"</span> {log.action === 'INSERT' ? 'criado(a)' : log.action === 'DELETE' ? 'excluído(a)' : 'editado(a)'}.
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-gray-500 text-sm italic">Nenhuma atividade recente registrada.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#0F0F0F] rounded-2xl border border-white/5 p-5 md:p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-600/20 to-black flex items-center justify-center mb-4">
                        <i className="fas fa-rocket text-xl md:text-2xl text-red-500"></i>
                    </div>
                    <h3 className="text-lg md:text-xl font-black text-white mb-2">Acesso Rápido</h3>
                    <p className="text-gray-500 text-xs md:text-sm mb-6 max-w-xs">Use os atalhos abaixo para gerenciar o sistema rapidamente.</p>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <button
                            onClick={() => onNavigate('news')}
                            className="p-4 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white transition-all group"
                        >
                            <i className="fas fa-plus mb-2 text-xl text-red-500 group-hover:text-white"></i>
                            <div className="text-[10px] md:text-xs font-bold uppercase">Nova Notícia</div>
                        </button>
                        <button
                            onClick={() => onNavigate('users')}
                            className="p-4 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white transition-all group"
                        >
                            <i className="fas fa-user-plus mb-2 text-xl text-blue-500 group-hover:text-white"></i>
                            <div className="text-[10px] md:text-xs font-bold uppercase">Novo Usuário</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
