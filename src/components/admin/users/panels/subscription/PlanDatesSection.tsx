import React from 'react';
import { User } from '@/types';

interface PlanDatesSectionProps {
    user: User;
    darkMode: boolean;
    canEdit: boolean;
    onUpdateUser: (updates: Partial<User>) => void;
}

export const PlanDatesSection: React.FC<PlanDatesSectionProps> = ({ user, darkMode, canEdit, onUpdateUser }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className={`border rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-sm group ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase block mb-0.5">Início do Plano</span>
                    <div className={`flex items-center gap-2 font-bold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <i className="fas fa-calendar-alt text-gray-300"></i>
                        {user.subscriptionStart ? new Date(user.subscriptionStart).toLocaleDateString('pt-BR') : '-'}
                    </div>
                </div>
                {canEdit && user.subscriptionStart && (
                    <button
                        onClick={() => {
                            if (confirm("Limpar data de início? Isso reverterá para a data de criação (Grátis).")) {
                                onUpdateUser({ subscriptionStart: undefined });
                            }
                        }}
                        className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Limpar Início (Voltar para Grátis)"
                    >
                        <i className="fas fa-times-circle"></i>
                    </button>
                )}
            </div>
            <div className={`border rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                <div>
                    <span className="text-[8px] font-black text-gray-400 uppercase block mb-0.5">Vencimento</span>
                    <div className={`flex items-center gap-2 font-bold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <i className="fas fa-hourglass-end text-gray-300"></i>
                        {user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString('pt-BR') : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
};
