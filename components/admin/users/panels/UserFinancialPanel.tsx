import React from 'react';

interface Payment {
    id: string;
    amount: number;
    plan_name: string;
    payment_date: string;
    status: string;
}

interface UserFinancialPanelProps {
    userId: string;
    payments?: Payment[];
    darkMode?: boolean;
}

const UserFinancialPanel: React.FC<UserFinancialPanelProps> = ({ userId, payments = [], darkMode = false }) => {
    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="space-y-4 mb-6">
            <h3 className={`text-[10px] font-black uppercase tracking-widest border-b pb-2 flex items-center gap-2 ${darkMode ? 'text-gray-400 border-white/5' : 'text-gray-400 border-gray-50'}`}>
                <i className="fas fa-wallet"></i> Histórico Financeiro
            </h3>

            {/* Resumo */}
            <div className={`rounded-2xl p-5 border shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-[8px] font-black uppercase tracking-wider mb-1 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Total Investido</p>
                        <p className={`text-3xl font-black ${darkMode ? 'text-green-100' : 'text-green-900'}`}>R$ {totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center">
                        <i className="fas fa-coins text-2xl"></i>
                    </div>
                </div>
                <p className={`text-[8px] font-bold mt-2 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>{payments.length} transações realizadas</p>
            </div>

            {/* Lista de Pagamentos */}
            {payments.length > 0 ? (
                <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Últimas Transações</p>
                    {payments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className={`rounded-xl p-4 border transition-colors ${darkMode ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{payment.plan_name}</span>
                                <span className="text-sm font-black text-green-600">R$ {payment.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] text-gray-500 font-medium">
                                    {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${payment.status === 'completed'
                                    ? (darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700')
                                    : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                                    }`}>
                                    {payment.status === 'completed' ? 'Pago' : payment.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`rounded-2xl p-8 text-center border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <i className="fas fa-receipt text-4xl text-gray-300 mb-3"></i>
                    <p className="text-xs font-bold text-gray-400 uppercase">Nenhum pagamento registrado</p>
                </div>
            )}
        </div>
    );
};

export default UserFinancialPanel;
