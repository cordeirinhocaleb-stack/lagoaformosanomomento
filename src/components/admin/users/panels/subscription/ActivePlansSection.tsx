import React from 'react';
import { User, AdPricingConfig } from '@/types';
import { removeUserItem } from '@/services/users/userService';

interface ActivePlansSectionProps {
    user: User;
    adConfig?: AdPricingConfig;
    canEdit: boolean;
    darkMode: boolean;
    onUpdateUser: (updates: Partial<User>) => void;
    setSelectedPlanId: (id: string | null) => void;
}

export const ActivePlansSection: React.FC<ActivePlansSectionProps> = ({
    user,
    adConfig,
    canEdit,
    darkMode,
    onUpdateUser,
    setSelectedPlanId
}) => {
    if (!user.activePlans || user.activePlans.length === 0) {
        return (
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <i className="fas fa-layer-group text-blue-500"></i> Planos Ativos
                </h3>
                <div className={`p-4 rounded-xl text-center border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhum plano vinculado.</p>
                </div>
            </div>
        );
    }

    const planCounts = (user.activePlans || []).reduce((acc: Record<string, number>, planId: string) => {
        acc[planId] = (acc[planId] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <i className="fas fa-layer-group text-blue-500"></i> Planos Ativos
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(planCounts).map(([planId, count]) => {
                    const planName = adConfig?.plans.find(p => p.id === planId)?.name || planId;
                    return (
                        <div
                            key={planId}
                            onClick={() => setSelectedPlanId(planId)}
                            className={`flex items-center justify-between p-3 rounded-xl border shadow-sm cursor-pointer transition-transform hover:scale-[1.02] ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                        <i className="fas fa-certificate"></i>
                                    </div>
                                    {count > 1 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border border-white dark:border-gray-900">
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className={`block text-[10px] font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>{planName}</span>
                                    <span className="text-[8px] text-green-500 font-bold uppercase flex items-center gap-1 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Ativo {count > 1 ? `(${count}x)` : ''}
                                    </span>
                                </div>
                            </div>
                            {canEdit && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const confirmMsg = count > 1
                                            ? `Existem ${count} planos "${planName}". Deseja remover TODOS?`
                                            : `Remover plano "${planName}" do usuário?`;

                                        if (!confirm(confirmMsg)) return;

                                        const res = await removeUserItem(user.id, 'plan', planId);
                                        if (res.success) {
                                            onUpdateUser({ activePlans: (user.activePlans || []).filter(p => p !== planId) });
                                            alert("Plano(s) removido(s) com sucesso.");
                                        } else {
                                            alert(res.message);
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-500 text-[9px] font-black uppercase border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                                    title="Remover Plano"
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
