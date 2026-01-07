import React from 'react';
import { User } from '../../../../types';

interface UserStatsPanelProps {
    user: User;
    totalPosts?: number;
    totalClicks?: number;
    totalSpent?: number;
    darkMode?: boolean;
}

const UserStatsPanel: React.FC<UserStatsPanelProps> = ({ user, totalPosts = 0, totalClicks = 0, totalSpent = 0, darkMode = false }) => {
    // Calcula dias restantes do plano
    const getDaysRemaining = () => {
        if (!user.subscriptionEnd) { return 0; }
        const end = new Date(user.subscriptionEnd);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysRemaining = getDaysRemaining();
    const isExpired = daysRemaining === 0 && user.subscriptionEnd;

    return (
        <div className="space-y-4 mb-6">
            <h3 className={`text-[10px] font-black uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-50'}`}>
                <i className="fas fa-chart-line"></i> Estatísticas
            </h3>

            {/* Grid de Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
                {/* Total Gasto */}
                <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                            <i className="fas fa-dollar-sign text-sm"></i>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Total Gasto</span>
                    </div>
                    <p className={`text-2xl font-black ${darkMode ? 'text-green-100' : 'text-green-900'}`}>
                        R$ {totalSpent.toFixed(2)}
                    </p>
                </div>

                {/* Total de Postagens */}
                <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                            <i className="fas fa-newspaper text-sm"></i>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Postagens</span>
                    </div>
                    <p className={`text-2xl font-black ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>{totalPosts}</p>
                </div>

                {/* Cliques Totais */}
                <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                            <i className="fas fa-mouse-pointer text-sm"></i>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>Cliques</span>
                    </div>
                    <p className={`text-2xl font-black ${darkMode ? 'text-purple-100' : 'text-purple-900'}`}>{totalClicks}</p>
                </div>

                {/* Dias Restantes */}
                <div className={`bg-gradient-to-br rounded-2xl p-4 border ${isExpired
                    ? (darkMode ? 'from-red-900/20 to-rose-900/20 border-red-500/20' : 'from-red-50 to-rose-50 border-red-100')
                    : daysRemaining < 7
                        ? (darkMode ? 'from-amber-900/20 to-orange-900/20 border-amber-500/20' : 'from-amber-50 to-orange-50 border-amber-100')
                        : (darkMode ? 'from-gray-800 to-slate-800 border-white/5' : 'from-gray-50 to-slate-50 border-gray-100')
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${isExpired ? 'bg-red-500' : daysRemaining < 7 ? 'bg-amber-500' : 'bg-gray-500'
                            }`}>
                            <i className="fas fa-calendar-alt text-sm"></i>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isExpired ? (darkMode ? 'text-red-400' : 'text-red-700') : daysRemaining < 7 ? (darkMode ? 'text-amber-400' : 'text-amber-700') : (darkMode ? 'text-gray-400' : 'text-gray-700')
                            }`}>
                            {isExpired ? 'Expirado' : 'Dias Restantes'}
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${isExpired ? (darkMode ? 'text-red-100' : 'text-red-900') : daysRemaining < 7 ? (darkMode ? 'text-amber-100' : 'text-amber-900') : (darkMode ? 'text-white' : 'text-gray-900')
                        }`}>
                        {isExpired ? '0' : daysRemaining}
                    </p>
                </div>
            </div>

            {/* Informações do Plano */}
            {user.advertiserPlan && (
                <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Plano Atual</span>
                        <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${darkMode ? 'bg-black text-white' : 'bg-black text-white'}`}>
                            {user.advertiserPlan}
                        </span>
                    </div>
                    {user.subscriptionEnd && (
                        <div className="text-xs text-gray-600">
                            <p className={`font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Válido até: <span className={darkMode ? 'text-white' : 'text-gray-900'}>{new Date(user.subscriptionEnd).toLocaleDateString('pt-BR')}</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserStatsPanel;
