import React from 'react';
import { User } from '../../../../types';

interface UserStatsPanel {
    user: User;
    totalPosts?: number;
    totalClicks?: number;
    totalSpent?: number;
}

const UserStatsPanel: React.FC<UserStatsPanel> = ({ user, totalPosts = 0, totalClicks = 0, totalSpent = 0 }) => {
    // Calcula dias restantes do plano
    const getDaysRemaining = () => {
        if (!user.subscriptionEnd) return 0;
        const end = new Date(user.subscriptionEnd);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysRemaining = getDaysRemaining();
    const isExpired = daysRemaining === 0 && user.subscriptionEnd;

    return (
        <div className="space-y-4 mb-6">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                <i className="fas fa-chart-line"></i> Estatísticas
            </h3>

            {/* Grid de Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
                {/* Total Gasto */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                            <i className="fas fa-dollar-sign text-sm"></i>
                        </div>
                        <span className="text-[8px] font-black uppercase text-green-700 tracking-wider">Total Gasto</span>
                    </div>
                    <p className="text-2xl font-black text-green-900">
                        R$ {totalSpent.toFixed(2)}
                    </p>
                </div>

                {/* Total de Postagens */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                            <i className="fas fa-newspaper text-sm"></i>
                        </div>
                        <span className="text-[8px] font-black uppercase text-blue-700 tracking-wider">Postagens</span>
                    </div>
                    <p className="text-2xl font-black text-blue-900">{totalPosts}</p>
                </div>

                {/* Cliques Totais */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                            <i className="fas fa-mouse-pointer text-sm"></i>
                        </div>
                        <span className="text-[8px] font-black uppercase text-purple-700 tracking-wider">Cliques</span>
                    </div>
                    <p className="text-2xl font-black text-purple-900">{totalClicks}</p>
                </div>

                {/* Dias Restantes */}
                <div className={`bg-gradient-to-br rounded-2xl p-4 border ${isExpired
                        ? 'from-red-50 to-rose-50 border-red-100'
                        : daysRemaining < 7
                            ? 'from-amber-50 to-orange-50 border-amber-100'
                            : 'from-gray-50 to-slate-50 border-gray-100'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${isExpired ? 'bg-red-500' : daysRemaining < 7 ? 'bg-amber-500' : 'bg-gray-500'
                            }`}>
                            <i className="fas fa-calendar-alt text-sm"></i>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isExpired ? 'text-red-700' : daysRemaining < 7 ? 'text-amber-700' : 'text-gray-700'
                            }`}>
                            {isExpired ? 'Expirado' : 'Dias Restantes'}
                        </span>
                    </div>
                    <p className={`text-2xl font-black ${isExpired ? 'text-red-900' : daysRemaining < 7 ? 'text-amber-900' : 'text-gray-900'
                        }`}>
                        {isExpired ? '0' : daysRemaining}
                    </p>
                </div>
            </div>

            {/* Informações do Plano */}
            {user.advertiserPlan && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Plano Atual</span>
                        <span className="px-3 py-1 bg-black text-white rounded-lg text-[8px] font-black uppercase">
                            {user.advertiserPlan}
                        </span>
                    </div>
                    {user.subscriptionEnd && (
                        <div className="text-xs text-gray-600">
                            <p className="font-bold">Válido até: <span className="text-gray-900">{new Date(user.subscriptionEnd).toLocaleDateString('pt-BR')}</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserStatsPanel;
