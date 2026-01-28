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

    // Mini Card Component
    const MiniStat = ({ label, value, icon, colorClass, borderClass, bgClass, textClass }: any) => (
        <div className={`rounded-xl p-3 border flex flex-col justify-between h-20 relative overflow-hidden group ${bgClass} ${borderClass}`}>
            <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <i className={`fas ${icon} text-4xl transform rotate-12`}></i>
            </div>
            <div className="flex items-center gap-1.5 relative z-10">
                <i className={`fas ${icon} text-[10px] ${textClass}`}></i>
                <span className={`text-[9px] font-black uppercase tracking-wider opacity-70 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
            </div>
            <p className={`text-lg font-black leading-none mt-1 relative z-10 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
    );

    return (
        <div className="space-y-4 mb-4">
            <h3 className={`text-[10px] font-black uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${darkMode ? 'text-gray-500 border-white/5' : 'text-gray-400 border-gray-100'}`}>
                <i className="fas fa-chart-pie text-[9px]"></i> Resumo
            </h3>

            {/* Grid Compacto (2 cols) */}
            <div className="grid grid-cols-2 gap-2">
                <MiniStat
                    label="Gasto"
                    value={`R$ ${totalSpent.toFixed(0)}`}
                    icon="fa-dollar-sign"
                    bgClass={darkMode ? 'bg-green-900/10' : 'bg-green-50'}
                    borderClass={darkMode ? 'border-green-500/20' : 'border-green-100'}
                    textClass="text-green-500"
                />
                <MiniStat
                    label="Posts"
                    value={totalPosts}
                    icon="fa-newspaper"
                    bgClass={darkMode ? 'bg-blue-900/10' : 'bg-blue-50'}
                    borderClass={darkMode ? 'border-blue-500/20' : 'border-blue-100'}
                    textClass="text-blue-500"
                />
                <MiniStat
                    label="Views"
                    value={totalClicks > 1000 ? (totalClicks / 1000).toFixed(1) + 'k' : totalClicks}
                    icon="fa-eye"
                    bgClass={darkMode ? 'bg-purple-900/10' : 'bg-purple-50'}
                    borderClass={darkMode ? 'border-purple-500/20' : 'border-purple-100'}
                    textClass="text-purple-500"
                />
                <MiniStat
                    label={isExpired ? 'Expirou' : 'Restam'}
                    value={!user.subscriptionEnd ? '-' : (isExpired ? '0d' : `${daysRemaining}d`)}
                    icon="fa-clock"
                    bgClass={isExpired
                        ? (darkMode ? 'bg-red-900/10' : 'bg-red-50')
                        : (daysRemaining < 7 ? (darkMode ? 'bg-amber-900/10' : 'bg-amber-50') : (darkMode ? 'bg-gray-800/30' : 'bg-gray-50'))
                    }
                    borderClass={isExpired
                        ? (darkMode ? 'border-red-500/20' : 'border-red-100')
                        : (daysRemaining < 7 ? (darkMode ? 'border-amber-500/20' : 'border-amber-100') : (darkMode ? 'border-white/5' : 'border-gray-200'))
                    }
                    textClass={isExpired ? 'text-red-500' : daysRemaining < 7 ? 'text-amber-500' : 'text-gray-400'}
                />
            </div>

            {user.advertiserPlan && (
                <div className={`px-3 py-2 rounded-lg border flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <span className="text-[9px] font-bold uppercase text-gray-500">Plano</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${darkMode ? 'bg-black text-white' : 'bg-white border text-black'}`}>
                        {user.advertiserPlan}
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserStatsPanel;
