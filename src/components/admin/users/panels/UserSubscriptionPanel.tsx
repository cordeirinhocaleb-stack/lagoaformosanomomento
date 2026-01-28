import React, { useState, useEffect } from 'react';
import { User, AdPricingConfig, SystemSettings, Advertiser } from '@/types';
import UserPOSPanel from './UserPOSPanel';
import { updateUser } from '@/services/users/userService';
import { logAction } from '@/services/admin/auditService';
import { getUserAdvertisers } from '@/services/content/advertiserService';
import { PurchaseHistoryModal } from './PurchaseHistoryModal';
import { PlanDetailsModal } from './subscription/PlanDetailsModal';
import lfnmCoin from '@/assets/lfnm_coin.png';

// Restored Sub-Sections
import { ManualResourceManagement } from './subscription/ManualResourceManagement';
import { BoostsSection } from './subscription/BoostsSection';
import { UsedItemsSection } from './subscription/UsedItemsSection';
import PixRechargeModal from '@/components/common/MyAccountModal/components/PixRechargeModal';

interface UserSubscriptionPanelProps {
    user: User;
    currentUser: User;
    adConfig?: AdPricingConfig;
    onUpdateUser: (updates: Partial<User>) => void;
    onExtendSubscription: (days: number) => void;
    canEdit: boolean;
    systemSettings?: SystemSettings;
    darkMode?: boolean;
}

const UserSubscriptionPanel: React.FC<UserSubscriptionPanelProps> = ({ user, currentUser, adConfig, onUpdateUser, onExtendSubscription, canEdit: canEditProp, systemSettings, darkMode = false }) => {
    // Permissions
    const hasAdminPower = currentUser.role.toLowerCase().includes('admin') || currentUser.role.toLowerCase().includes('chefe') || currentUser.role.toLowerCase().includes('desenvolvedor');
    const canEdit = canEditProp || hasAdminPower;
    const purchasingEnabled = systemSettings?.purchasingEnabled !== false;

    // State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [userAds, setUserAds] = useState<Advertiser[]>([]);
    const [viewMode, setViewMode] = useState<'dashboard' | 'pos'>('dashboard');

    // Add Credit Modal State
    const [isAddCreditOpen, setIsAddCreditOpen] = useState(false);
    const [addCreditAmount, setAddCreditAmount] = useState('');
    const [addCreditReason, setAddCreditReason] = useState('');
    const [isAddingCredit, setIsAddingCredit] = useState(false);
    const [showPixModal, setShowPixModal] = useState(false);

    useEffect(() => {
        getUserAdvertisers(user.id).then(ads => setUserAds(ads || [])).catch(console.error);
    }, [user.id]);

    // Helpers
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const usage = user.usageCredits || {};

    // Quick Handler for history
    const openHistory = (label: string, query?: string) => {
        setHistoryModalOpen(true);
    };

    const handleAddCredit = async () => {
        if (!addCreditAmount || isNaN(Number(addCreditAmount)) || Number(addCreditAmount) <= 0) {
            alert("Digite um valor válido");
            return;
        }
        if (!addCreditReason.trim()) {
            alert("Digite um motivo para o registro (Ex: Pagamento PIX)");
            return;
        }

        setIsAddingCredit(true);
        try {
            const amount = Number(addCreditAmount);
            const current = user.siteCredits || 0;
            const newBalance = current + amount;

            await updateUser({ ...user, siteCredits: newBalance });
            onUpdateUser({ siteCredits: newBalance });

            await logAction(
                currentUser.id,
                currentUser.name,
                "add_credits",
                user.id,
                `Adicionou C$ ${amount.toFixed(2)} (${addCreditReason})`
            );

            alert("Saldo adicionado com sucesso!");
            setIsAddCreditOpen(false);
            setAddCreditAmount('');
            setAddCreditReason('');
        } catch (e) {
            console.error(e);
            alert("Erro ao adicionar saldo");
        } finally {
            setIsAddingCredit(false);
        }
    };

    const ResourceCard = ({ label, value, icon, color, subLabel }: any) => (
        <div className={`relative overflow-hidden rounded-2xl p-4 border group ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110 ${color}`}>
                <i className={`fas ${icon} text-5xl`}></i>
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${darkMode ? 'bg-white/5 text-white' : 'bg-white text-gray-600 shadow-sm'}`}>
                        <i className={`fas ${icon}`}></i>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{label}</span>
                </div>
                <div>
                    <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                    {subLabel && <p className="text-[10px] font-bold opacity-50">{subLabel}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn space-y-6">

            {/* HERO SECTION: WALLET & PLAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. CARTEIRA DIGITAL */}
                <div className={`col-span-1 md:col-span-2 rounded-[2rem] p-8 relative overflow-hidden border ${darkMode ? 'bg-gradient-to-br from-red-900/40 to-black border-red-500/20' : 'bg-gradient-to-br from-red-50 to-white border-red-100'}`}>
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <h3 className={`text-xs font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Saldo em Carteira</h3>
                            <div className="flex items-center gap-3">
                                <span className={`text-5xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-red-900'}`}>
                                    {formatCurrency(user.siteCredits || 0).replace('R$', '')}
                                </span>
                                {/* COIN ICON RESTORED */}
                                <div className="w-8 h-8 md:w-10 md:h-10 relative animate-pulse">
                                    <img src={lfnmCoin.src} alt="Coin" className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                            </div>
                            <p className={`text-[10px] font-bold mt-2 opacity-60 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                Créditos disponíveis para compra de destaques e renovações.
                            </p>
                        </div>
                        {/* Wallet Icon Background (Subtle) */}
                        <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none transform rotate-12 scale-150`}>
                            <img src={lfnmCoin.src} alt="Coin BG" className="w-64 h-64 object-contain grayscale" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex items-center gap-3 relative z-10">
                        {canEdit && (
                            <>
                                <button
                                    onClick={() => setIsAddCreditOpen(true)}
                                    className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                                >
                                    <i className="fas fa-plus mr-2"></i> Adicionar Saldo
                                </button>
                                <button
                                    onClick={() => setViewMode(viewMode === 'pos' ? 'dashboard' : 'pos')}
                                    className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${viewMode === 'pos'
                                        ? (darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-black')
                                        : (darkMode ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-red-600 text-white hover:bg-red-700')
                                        }`}
                                >
                                    <i className={`fas ${viewMode === 'pos' ? 'fa-arrow-left' : 'fa-shopping-cart'} mr-2`}></i>
                                    {viewMode === 'pos' ? 'Voltar' : 'Comprar Itens'}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setHistoryModalOpen(true)}
                            className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <i className="fas fa-history mr-2"></i> Histórico
                        </button>
                        <button
                            onClick={() => setShowPixModal(true)}
                            className={`px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                        >
                            <i className="fab fa-pix mr-2"></i> Ver Chave Pix
                        </button>
                    </div>
                </div>

                {/* 2. PLANO ATUAL */}
                < div className={`col-span-1 rounded-[2rem] p-8 border relative overflow-hidden flex flex-col justify-between ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Plano Ativo</h3>
                            {user.advertiserPlan === 'free' ? (
                                <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 text-[10px] font-black uppercase">Grátis</span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase animate-pulse">
                                    <i className="fas fa-crown text-[8px] mr-1"></i> Premium
                                </span>
                            )}
                        </div>
                        <h2 className={`text-3xl font-black uppercase italic mb-1 ${darkMode ? 'text-white' : 'text-black'}`}>
                            {user.advertiserPlan || 'GRATUITO'}
                        </h2>
                        {user.subscriptionEnd && (
                            <p className="text-[11px] font-bold text-gray-500">
                                Expira em: <span className={darkMode ? 'text-white' : 'text-black'}>{new Date(user.subscriptionEnd).toLocaleDateString('pt-BR')}</span>
                            </p>
                        )}
                    </div>
                    {
                        user.advertiserPlan !== 'free' && (
                            <div className="mt-4 pt-4 border-t border-dashed border-gray-500/20">
                                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Status</span>
                                    <span className="text-green-500">Ativo</span>
                                </div>
                                {canEdit && (
                                    <button
                                        onClick={() => onExtendSubscription(30)}
                                        className={`w-full mt-2 py-2 rounded-lg text-[10px] font-black uppercase border border-dashed hover:border-solid transition-all ${darkMode ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-amber-600/30 text-amber-600 hover:bg-amber-50'}`}
                                    >
                                        +30 Dias
                                    </button>
                                )}
                            </div>
                        )
                    }
                </div >
            </div >

            {/* VIEW TOGGLE: POS vs RESOURCES */}
            {
                viewMode === 'pos' && canEdit && purchasingEnabled ? (
                    <div className="animate-slideDown">
                        <UserPOSPanel user={user} adConfig={adConfig} onUpdateUser={onUpdateUser} darkMode={darkMode} onOpenPix={() => setShowPixModal(true)} />
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">

                        {/* SECTION: RESOURCE CONSUMPTION */}
                        <div>
                            <h3 className={`text-xs font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                <i className="fas fa-chart-pie text-gray-500"></i> Consumo & Limites
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ResourceCard
                                    label="Postagens"
                                    value={usage.postsRemaining ?? '∞'}
                                    subLabel="Restantes"
                                    icon="fa-newspaper"
                                    color="text-blue-500"
                                />
                                <ResourceCard
                                    label="Vídeos"
                                    value={usage.videosRemaining ?? '∞'}
                                    subLabel="Uploads"
                                    icon="fa-video"
                                    color="text-red-500"
                                />
                                <ResourceCard
                                    label="Destaques"
                                    value={usage.featuredDaysRemaining ?? 0}
                                    subLabel="Dias"
                                    icon="fa-star"
                                    color="text-amber-500"
                                />
                                <ResourceCard
                                    label="Anúncios"
                                    value={userAds.length}
                                    subLabel="Cadastrados"
                                    icon="fa-ad"
                                    color="text-purple-500"
                                />
                            </div>
                        </div>

                        {/* RESTORED: Manual Resource Management */}
                        <div className="border-t border-dashed pt-8 border-gray-500/20">
                            <ManualResourceManagement
                                user={user}
                                canEdit={canEdit}
                                onUpdateUser={onUpdateUser}
                                darkMode={darkMode}
                            />
                        </div>

                        {/* RESTORED: Boosts Section */}
                        {canEdit && (
                            <div className="border-t border-dashed pt-8 border-gray-500/20">
                                <BoostsSection
                                    user={user}
                                    darkMode={darkMode}
                                    openHistory={openHistory}
                                />
                            </div>
                        )}

                        {/* RESTORED: Used Items Section */}
                        <div className="border-t border-dashed pt-8 border-gray-500/20">
                            <UsedItemsSection
                                userAds={userAds}
                                darkMode={darkMode}
                            />
                        </div>


                        {/* SECTION: LINKED ADVERTISERS */}
                        <div className="border-t border-dashed pt-8 border-gray-500/20">
                            <h3 className={`text-xs font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-black'}`}>
                                <i className="fas fa-store text-gray-500"></i> Empresas Vinculadas
                            </h3>
                            {userAds.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {userAds.map(ad => (
                                        <div key={ad.id} className={`flex items-center gap-4 p-4 rounded-xl border ${darkMode ? 'bg-[#151515] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                                                {ad.logoUrl ? <img src={ad.logoUrl} className="w-full h-full object-cover" /> : null}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ad.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">{ad.category || 'Sem Categoria'}</p>
                                            </div>
                                            <button className={`ml-auto w-8 h-8 rounded-full flex items-center justify-center border ${darkMode ? 'border-white/10 text-white hover:bg-white/10' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                                <i className="fas fa-pencil-alt text-xs"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={`p-8 rounded-2xl border text-center border-dashed ${darkMode ? 'border-white/10 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                                    <p className="text-xs font-bold uppercase">Nenhuma empresa vinculada</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* ADD CREDIT MODAL */}
            {
                isAddCreditOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setIsAddCreditOpen(false)}></div>
                        <div className={`relative w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-scaleIn border ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border-2 border-red-500/20">
                                    <i className="fas fa-plus text-2xl text-red-500"></i>
                                </div>
                                <h3 className={`text-xl font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>Adicionar Saldo</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase">Adicione créditos manualmente</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Valor (BRL)</label>
                                    <input
                                        type="number"
                                        value={addCreditAmount}
                                        onChange={(e) => setAddCreditAmount(e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full px-4 py-3 rounded-xl border font-bold text-lg focus:ring-2 focus:ring-red-500 ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Motivo / Origem</label>
                                    <input
                                        type="text"
                                        value={addCreditReason}
                                        onChange={(e) => setAddCreditReason(e.target.value)}
                                        placeholder="Ex: Depósito PIX"
                                        className={`w-full px-4 py-3 rounded-xl border font-medium focus:ring-2 focus:ring-red-500 ${darkMode ? 'bg-black border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setIsAddCreditOpen(false)} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border ${darkMode ? 'border-white/10 text-white hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddCredit}
                                    disabled={isAddingCredit}
                                    className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                                >
                                    {isAddingCredit ? <i className="fas fa-spinner fa-spin"></i> : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


            {/* PURCHASE HISTORY MODAL */}
            <PurchaseHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} userId={user.id} itemLabel="" darkMode={darkMode} />

            {/* PLAN DETAILS MODAL */}
            {selectedPlanId && <PlanDetailsModal selectedPlanId={selectedPlanId} setSelectedPlanId={setSelectedPlanId} user={user} adConfig={adConfig} darkMode={darkMode} />}

            {/* Pix Recharge Modal (Shared) */}
            <PixRechargeModal isOpen={showPixModal} onClose={() => setShowPixModal(false)} />
        </div >
    );
};

export default UserSubscriptionPanel;
