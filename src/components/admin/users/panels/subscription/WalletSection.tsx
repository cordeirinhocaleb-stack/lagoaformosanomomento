import React, { useState } from 'react';
import { User } from '@/types';
import lfnmCoin from '@/assets/lfnm_coin.png';
import { updateUser } from '@/services/users/userService';

interface WalletSectionProps {
    user: User;
    canEdit: boolean;
    darkMode: boolean;
    onUpdateUser: (updates: Partial<User>) => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({
    user,
    canEdit,
    darkMode,
    onUpdateUser
}) => {
    const [walletAddAmount, setWalletAddAmount] = useState<string>('');
    const [isSavingCredits, setIsSavingCredits] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [tempAmount, setTempAmount] = useState(0);

    const handleGiveCredits = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const cleanVal = (walletAddAmount || "").toString().replace(',', '.').trim();
        const amount = parseFloat(cleanVal);

        if (isNaN(amount) || amount <= 0) {
            alert("Por favor, insira um valor válido maior que zero.");
            return;
        }

        setTempAmount(amount);
        setShowConfirmModal(true);
    };

    const processCredits = async () => {
        setIsSavingCredits(true);
        setShowConfirmModal(false);
        const currentCredits = user.siteCredits || 0;
        const newBalance = currentCredits + tempAmount;

        try {
            const updatedUser = { ...user, siteCredits: newBalance };
            await updateUser(updatedUser);

            // Update local state
            onUpdateUser({ siteCredits: newBalance });
            setWalletAddAmount('');
            alert(`Sucesso! ${tempAmount.toFixed(2)} LFNM adicionados à carteira.`);
        } catch (err: any) {
            console.error("Erro ao salvar créditos:", err);
            alert("ERRO AO SALVAR: " + (err.message || "Tente novamente."));
        } finally {
            setIsSavingCredits(false);
        }
    };

    return (
        <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
            {/* Custom Admin Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}></div>
                    <div className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-scaleIn border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 overflow-hidden border-2 border-yellow-500/20 shadow-lg shadow-yellow-500/10">
                                <img src={lfnmCoin.src} alt="LFNM" className="w-20 h-20 object-contain grayscale brightness-125 animate-coin" />
                            </div>
                            <h3 className={`text-xl font-black uppercase italic mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Confirmar LFNM</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">
                                Adicionar {tempAmount.toFixed(2)} <span className="text-yellow-500 font-black">LFNM</span> para <br />
                                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{user.name || user.email}</span>?
                            </p>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className={`py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={processCredits}
                                    className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                <i className="fas fa-wallet text-yellow-600"></i> Carteira LFNM
            </h3>
            <div className={`border p-6 rounded-xl shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Saldo Atual (Read-only) */}
                    <div className="flex items-center gap-3">
                        {/* Custom Style for Coin Spin */}
                        <style>{`
                        @keyframes coin-flip {
                            0% { transform: rotateY(0deg); }
                            100% { transform: rotateY(360deg); }
                        }
                        .animate-coin {
                            animation: coin-flip 3s linear infinite;
                        }
                    `}</style>
                        <div className={`w-12 h-12 rounded-full border-2 p-0 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden ${darkMode ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
                            <img
                                src={lfnmCoin.src}
                                alt="LFNM Coin"
                                className="w-full h-full object-cover grayscale contrast-125 animate-coin scale-110"
                            />
                        </div>
                        <div>
                            <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Saldo Atual</span>
                            <div className={`text-2xl font-black leading-none ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                <span className="text-sm mr-1.5 opacity-60">$LFNM</span>
                                {user.siteCredits?.toFixed(2) ?? '0.00'}
                            </div>
                        </div>
                    </div>

                    {/* Adicionar Créditos (Action) */}
                    <div className={`flex items-center gap-2 p-2 rounded-xl border shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                            <input
                                type="text"
                                value={walletAddAmount}
                                onChange={(e) => setWalletAddAmount(e.target.value)}
                                placeholder="0,00"
                                disabled={!canEdit}
                                className={`w-28 pl-8 pr-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-yellow-100 transition-all ${darkMode ? 'bg-black/40 border-white/10 text-white focus:border-yellow-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-yellow-500'}`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleGiveCredits}
                            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${(isSavingCredits || !canEdit) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            disabled={isSavingCredits || !canEdit}
                            title={!canEdit ? "Você não tem permissão" : "Adicionar Créditos"}
                        >
                            {isSavingCredits ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus-circle"></i>}
                            {isSavingCredits ? 'Salvando...' : 'Dar Créditos'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
