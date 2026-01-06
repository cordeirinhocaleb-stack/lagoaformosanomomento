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
}

const UserSubscriptionPanel: React.FC<UserSubscriptionPanelProps> = ({ user, adConfig, onUpdateUser, onExtendSubscription, canEdit, systemSettings }) => {
    const purchasingEnabled = systemSettings?.purchasingEnabled !== false; // Default to true if undefined, strictly false only if set to false


    // Estado local para adição de créditos na carteira
    const [walletAddAmount, setWalletAddAmount] = useState<string>('');

    // Componente auxiliar para controle de créditos de itens
    const CreditItemControl = ({ label, icon, field, currentValue }: { label: string, icon: string, field: keyof typeof user.usageCredits, currentValue: number }) => {
        const [addAmount, setAddAmount] = useState(0);

        const handleGive = () => {
            if (addAmount > 0 && canEdit) {
                const currentUsage = user.usageCredits || {};
                const currentVal = currentUsage[field] || 0;

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
            <div className="bg-white border border-gray-100 rounded-xl p-2 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                {/* Header: Icon + Current Value */}
                <div className="flex items-center justify-between w-full mb-2 px-1">
                    <div className="flex items-center gap-1.5" title={label}>
                        <i className={`${icon} text-lg text-yellow-600`}></i>
                        <span className="text-[8px] font-black text-gray-500">{currentValue}</span>
                    </div>
                    <span className="text-[7px] font-black text-gray-400 uppercase truncate max-w-[60px]">{label}</span>
                </div>

                {/* Stepper: Amount to Give */}
                <div className="flex items-center bg-gray-50 border border-yellow-200 rounded-lg overflow-hidden w-full mb-2">
                    <button
                        onClick={() => setAddAmount(Math.max(0, addAmount - 1))}
                        disabled={!canEdit}
                        className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition-colors font-bold text-yellow-700"
                    >-</button>
                    <div className="flex-1 text-center text-xs font-bold text-gray-800 py-1">{addAmount}</div>
                    <button
                        onClick={() => setAddAmount(addAmount + 1)}
                        disabled={!canEdit}
                        className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 transition-colors font-bold text-yellow-700"
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
        <div className="animate-fadeIn bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 text-2xl border border-yellow-100">
                    <i className="fas fa-crown"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase italic">Assinatura & Créditos</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gerencie o plano e saldo do usuário</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* 1. Carteira LFNM Coin (Transacional) */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-wallet text-yellow-600"></i> Carteira LFNM
                    </h3>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
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
                                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 p-0 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={lfnmCoin}
                                        alt="LFNM Coin"
                                        className="w-full h-full object-cover grayscale contrast-125 animate-coin scale-110"
                                    />
                                </div>
                                <div>
                                    <span className="block text-[9px] font-black uppercase text-gray-400 tracking-wider">Saldo Atual</span>
                                    <div className="text-2xl font-black text-gray-800 leading-none">
                                        <span className="text-sm mr-1.5 opacity-60">$LFNM</span>
                                        {user.siteCredits?.toFixed(2) ?? '0.00'}
                                    </div>
                                </div>
                            </div>

                            {/* Adicionar Créditos (Action) */}
                            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">$</span>
                                    <input
                                        type="number"
                                        value={walletAddAmount}
                                        onChange={(e) => setWalletAddAmount(e.target.value)}
                                        placeholder="0.00"
                                        disabled={!canEdit}
                                        className="w-28 pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition-all"
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
                    <div className={`bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-sm group`}>
                        <div>
                            <span className="text-[8px] font-black text-gray-400 uppercase block mb-0.5">Início do Plano</span>
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
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
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2 shadow-sm">
                        <div>
                            <span className="text-[8px] font-black text-gray-400 uppercase block mb-0.5">Vencimento</span>
                            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                                <i className="fas fa-hourglass-end text-gray-300"></i>
                                {user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString('pt-BR') : '-'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Gerenciamento de Itens (Categorias) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                        <i className="fas fa-boxes"></i> Inventário de Itens
                    </h4>

                    {/* Grid de Categorias */}
                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Coluna 1: Conteúdo */}
                        <div>
                            <span className="block text-[9px] font-black text-blue-600 uppercase mb-3 text-center bg-blue-50 py-1 rounded-lg">Conteúdo</span>
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
                            <span className="block text-[9px] font-black text-purple-600 uppercase mb-3 text-center bg-purple-50 py-1 rounded-lg">Publicidade</span>
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
                            <span className="block text-[9px] font-black text-green-600 uppercase mb-3 text-center bg-green-50 py-1 rounded-lg">Oportunidades</span>
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
                    <UserPOSPanel user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} />
                )}
                {!purchasingEnabled && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-400 mt-6">
                        <i className="fas fa-store-slash text-2xl mb-2"></i>
                        <p className="text-xs font-bold uppercase">Módulo de Compras Desativado nas Configurações</p>
                    </div>
                )}

            </div>
        </div >
    );
};

export default UserSubscriptionPanel;
