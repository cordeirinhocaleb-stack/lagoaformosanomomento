import React, { useState } from 'react';
import { User, AdPricingConfig, SystemSettings } from '../../../../types';
import UserPOSPanel from './UserPOSPanel';
import lfnmCoin from '../../../../src/assets/lfnm_coin.png'; // Adjusting path based on file location

interface UserSubscriptionPanelProps {
    user: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (updates: Partial<User>) => void;
    onExtendSubscription: (days: number) => void;
    canEdit: boolean;
    systemSettings?: SystemSettings;
    darkMode?: boolean;
}

const UserSubscriptionPanel: React.FC<UserSubscriptionPanelProps> = ({ user, adConfig, onUpdateUser, onExtendSubscription, canEdit, systemSettings, darkMode = false }) => {
    const purchasingEnabled = systemSettings?.purchasingEnabled !== false; // Default to true if undefined, strictly false only if set to false


    // Estado local para adição de créditos na carteira
    const [walletAddAmount, setWalletAddAmount] = useState<string>('');

    // Componente auxiliar para controle de créditos de itens
    const CreditItemControl = ({ label, icon, field, currentValue }: { label: string, icon: string, field: string, currentValue: number }) => {
        const [addAmount, setAddAmount] = useState(0);

        const handleGive = () => {
            if (addAmount > 0 && canEdit) {
                const currentUsage = user.usageCredits || {};
                const currentVal = (currentUsage as any)[field] || 0;

                onUpdateUser({
                    usageCredits: {
                        ...currentUsage,
                        [field]: currentVal + addAmount
                    }
                });
                setAddAmount(0);
            }
        };

        return (
            <div className={`border rounded-xl p-2 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                {/* Header: Icon + Current Value */}
                <div className="flex items-center justify-between w-full mb-2 px-1">
                    <div className="flex items-center gap-1.5" title={label}>
                        <i className={`${icon} text-lg text-yellow-600`}></i>
                        <span className="text-[8px] font-black text-gray-500">{currentValue}</span>
                    </div>
                    <span className="text-[7px] font-black text-gray-400 uppercase truncate max-w-[60px]">{label}</span>
                </div>

                {/* Stepper: Amount to Give */}
                <div className={`flex items-center border rounded-lg overflow-hidden w-full mb-2 ${darkMode ? 'bg-black/40 border-yellow-500/20' : 'bg-gray-50 border-yellow-200'}`}>
                    <button
                        onClick={() => setAddAmount(Math.max(0, addAmount - 1))}
                        disabled={!canEdit}
                        className={`px-2 py-1 transition-colors font-bold ${darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'}`}
                    >-</button>
                    <div className={`flex-1 text-center text-xs font-bold py-1 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{addAmount}</div>
                    <button
                        onClick={() => setAddAmount(addAmount + 1)}
                        disabled={!canEdit}
                        className={`px-2 py-1 transition-colors font-bold ${darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'}`}
                    >+</button>
                </div>

                {/* Give Button */}
                <button
                    onClick={handleGive}
                    disabled={!canEdit || addAmount === 0}
                    className={`
                        w-full py-1.5 text-[8px] font-black uppercase rounded-lg transition-colors flex items-center justify-center gap-1
                        ${addAmount > 0 ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    <i className="fas fa-gift"></i> Dar Item
                </button>
            </div>
        );
    };

    return (
        <div className={`animate-fadeIn p-6 md:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${darkMode ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                    <i className="fas fa-crown"></i>
                </div>
                <div>
                    <h2 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assinatura & Créditos</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gerencie o plano e saldo do usuário</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* 1. Carteira LFNM Coin (Transacional) */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
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
                                        src={lfnmCoin}
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
                                        type="number"
                                        value={walletAddAmount}
                                        onChange={(e) => setWalletAddAmount(e.target.value)}
                                        placeholder="0.00"
                                        disabled={!canEdit}
                                        className={`w-28 pl-8 pr-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-yellow-100 transition-all ${darkMode ? 'bg-black/40 border-white/10 text-white focus:border-yellow-500' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-yellow-500'}`}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const amount = parseFloat(walletAddAmount);
                                        if (amount > 0 && confirm(`Adicionar C$ ${amount.toFixed(2)} para este usuário?`)) {
                                            onUpdateUser({ siteCredits: (user.siteCredits || 0) + amount });
                                            setWalletAddAmount('');
                                        }
                                    }}
                                    disabled={!canEdit || !walletAddAmount || parseFloat(walletAddAmount) <= 0 || !purchasingEnabled}
                                    className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-black uppercase shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${!purchasingEnabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                    title={!purchasingEnabled ? "Sistema de compras desativado" : "Adicionar Créditos"}
                                >
                                    <i className="fas fa-plus-circle"></i> Dar Créditos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Datas do Plano */}
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

                {/* 3. Gerenciamento de Itens (Categorias) */}
                <div className={`border rounded-xl p-5 shadow-sm ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <i className="fas fa-boxes"></i> Inventário de Itens
                    </h4>

                    {/* Grid de Categorias */}
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Coluna 1: Conteúdo */}
                        <div>
                            <span className={`block text-[9px] font-black uppercase mb-3 text-center py-1 rounded-lg ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>Conteúdo</span>
                            <div className="grid grid-cols-2 gap-3">
                                <CreditItemControl
                                    label="Posts"
                                    icon="fas fa-newspaper"
                                    field="postsRemaining"
                                    currentValue={user.usageCredits?.postsRemaining ?? 0}
                                />
                                <CreditItemControl
                                    label="Vídeos"
                                    icon="fab fa-instagram"
                                    field="videosRemaining"
                                    currentValue={user.usageCredits?.videosRemaining ?? 0}
                                />
                            </div>
                        </div>

                        {/* Coluna 2: Publicidade */}
                        <div>
                            <span className={`block text-[9px] font-black uppercase mb-3 text-center py-1 rounded-lg ${darkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>Publicidade</span>
                            <div className="grid grid-cols-2 gap-3">
                                <CreditItemControl
                                    label="Banners"
                                    icon="fas fa-ad"
                                    field="bannersRemaining"
                                    currentValue={user.usageCredits?.bannersRemaining ?? 0}
                                />
                                <CreditItemControl
                                    label="Pop-ups"
                                    icon="fas fa-window-maximize"
                                    field="popupsRemaining"
                                    currentValue={user.usageCredits?.popupsRemaining ?? 0}
                                />
                                <CreditItemControl
                                    label="Destaques"
                                    icon="fas fa-star"
                                    field="featuredDaysRemaining"
                                    currentValue={user.usageCredits?.featuredDaysRemaining ?? 0}
                                />
                            </div>
                        </div>

                        {/* Coluna 3: Oportunidades & Extras */}
                        <div>
                            <span className={`block text-[9px] font-black uppercase mb-3 text-center py-1 rounded-lg ${darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'}`}>Oportunidades</span>
                            <div className="grid grid-cols-2 gap-3">
                                <CreditItemControl
                                    label="Vagas"
                                    icon="fas fa-briefcase"
                                    field="jobsRemaining"
                                    currentValue={user.usageCredits?.jobsRemaining ?? 0}
                                />
                                <CreditItemControl
                                    label="Bicos"
                                    icon="fas fa-tools"
                                    field="gigsRemaining"
                                    currentValue={user.usageCredits?.gigsRemaining ?? 0}
                                />
                                <CreditItemControl
                                    label="Cliques"
                                    icon="fas fa-mouse-pointer"
                                    field="clicksBalance"
                                    currentValue={user.usageCredits?.clicksBalance ?? 0}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- POS / VENDA RÁPIDA (Drag & Drop) --- */}
                {canEdit && purchasingEnabled && (
                    <UserPOSPanel user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} darkMode={darkMode} />
                )}
                {!purchasingEnabled && (
                    <div className={`border rounded-xl p-6 text-center text-gray-400 mt-6 ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <i className="fas fa-store-slash text-2xl mb-2"></i>
                        <p className="text-xs font-bold uppercase">Módulo de Compras Desativado nas Configurações</p>
                    </div>
                )}

            </div>
        </div >
    );
};

export default UserSubscriptionPanel;
