import React from 'react';
import { MarketItem } from '@/components/admin/users/panels/pos/types';
import { User } from '@/types';
import lfnmCoin from '@/assets/lfnm_coin.png';

interface POSModalsProps {
    user: User;
    showConfirmModal: boolean;
    setShowConfirmModal: (show: boolean) => void;
    showSuccessModal: boolean;
    setShowSuccessModal: (show: boolean) => void;
    purchasedItems: MarketItem[];
    cartItems: MarketItem[];
    cartTotal: number;
    currentBalance: number;
    finalBalance: number;
    isLoading: boolean;
    executePurchase: () => void;
    darkMode: boolean;
}

export const POSModals: React.FC<POSModalsProps> = ({
    user,
    showConfirmModal,
    setShowConfirmModal,
    showSuccessModal,
    setShowSuccessModal,
    purchasedItems,
    cartItems,
    cartTotal,
    currentBalance,
    finalBalance,
    isLoading,
    executePurchase,
    darkMode
}) => {
    return (
        <>
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowSuccessModal(false)}></div>
                    <div className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-scaleIn border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 border-2 border-green-500/20 shadow-lg shadow-green-500/10">
                                <i className="fas fa-check text-4xl text-green-500"></i>
                            </div>
                            <h3 className={`text-xl font-black uppercase mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compra Realizada!</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase mb-6">
                                Os seguintes itens foram adicionados aos <br /> <strong className="text-green-500">Créditos Disponíveis</strong>:
                            </p>

                            <div className={`rounded-xl p-4 mb-6 max-h-40 overflow-y-auto ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                {purchasedItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 mb-2 last:mb-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${item.color}`}>
                                            <i className={item.icon}></i>
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.name}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-green-600 text-white font-black uppercase rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setShowConfirmModal(false)}></div>
                    <div className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-scaleIn border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6 overflow-hidden border-2 border-green-500/20 shadow-lg shadow-green-500/10">
                                <i className="fas fa-shopping-cart text-3xl text-green-500"></i>
                            </div>
                            <h3 className={`text-xl font-black uppercase italic mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Confirmar Compra</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-6">
                                Você está prestes a debitar <span className="text-red-500 font-black">C$ {cartTotal.toFixed(2)}</span> da conta de <br />
                                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{user.name}</span>
                            </p>

                            <div className="w-full bg-gray-50/50 dark:bg-black/20 rounded-xl p-4 mb-6 border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-center mb-2 text-[10px] uppercase font-bold text-gray-400">
                                    <span>Saldo Atual</span>
                                    <span>{currentBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2 text-[10px] uppercase font-bold text-red-500">
                                    <span>Total Itens ({cartItems.length})</span>
                                    <span>- {cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 dark:border-white/10 my-2"></div>
                                <div className={`flex justify-between items-center text-xs uppercase font-black ${finalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <span>Saldo Final</span>
                                    <span>C$ {finalBalance.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className={`py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executePurchase}
                                    className="py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Confirmar
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
