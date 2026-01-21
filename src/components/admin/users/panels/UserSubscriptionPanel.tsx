import React, { useState, useEffect } from 'react';
import { User, AdPricingConfig, SystemSettings, Advertiser } from '@/types';
import UserPOSPanel from './UserPOSPanel';
import lfnmCoin from '@/assets/lfnm_coin.png';
import { removeUserItem, updateUser } from '@/services/users/userService';
import { getUserAdvertisers } from '@/services/content/advertiserService';
import { PurchaseHistoryModal } from './PurchaseHistoryModal';

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

const CreditItemControl = ({ label, icon, field, currentValue, canEdit, onUpdateUser, currentUsage, user, darkMode }: {
    label: string,
    icon: string,
    field: string,
    currentValue: number,
    canEdit: boolean,
    onUpdateUser: (updates: any) => void,
    currentUsage: any,
    user: User,
    darkMode: boolean
}) => {
    const [amount, setAmount] = useState(0);
    const [mode, setMode] = useState<'dar' | 'retirar'>('dar');
    const [isSaving, setIsSaving] = useState(false);

    const handleApply = async () => {
        if (amount > 0 && canEdit) {
            setIsSaving(true);
            try {
                const current = currentUsage?.[field] || 0;
                const finalValue = mode === 'dar' ? current + amount : Math.max(0, current - amount);

                const updatedUsage = {
                    ...(currentUsage || {}),
                    [field]: finalValue
                };

                // Persistir no Banco de Dados IMEDIATAMENTE
                await updateUser({
                    ...user,
                    usageCredits: updatedUsage
                });

                // Sincronizar UI local
                onUpdateUser({
                    usageCredits: updatedUsage
                });

                setAmount(0);
                alert(`Sucesso! ${amount} item(s) ${mode === 'dar' ? 'adicionados' : 'removidos'} de "${label}". Salvo no banco.`);
            } catch (err: any) {
                console.error("Erro ao salvar item:", err);
                alert("Erro ao salvar no banco: " + (err.message || "Tente novamente"));
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div className={`border rounded-xl p-2 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between w-full mb-2 px-1">
                <div className="flex items-center gap-1.5" title={label}>
                    <i className={`${icon} text-lg text-yellow-600`}></i>
                    <span className="text-[10px] font-black text-gray-400">{currentValue}</span>
                </div>
                <div className="flex bg-gray-200/50 dark:bg-white/5 rounded-lg p-0.5">
                    <button
                        onClick={() => setMode('dar')}
                        className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase transition-all ${mode === 'dar' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400 opacity-60'}`}
                    >+</button>
                    <button
                        onClick={() => setMode('retirar')}
                        className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase transition-all ${mode === 'retirar' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 opacity-60'}`}
                    >-</button>
                </div>
            </div>

            <div className={`flex items-center border rounded-lg overflow-hidden w-full mb-2 ${darkMode ? 'bg-black/40 border-yellow-500/20' : 'bg-gray-50 border-yellow-200'}`}>
                <button
                    type="button"
                    onClick={() => setAmount(Math.max(0, amount - 1))}
                    disabled={!canEdit}
                    className={`px-2 py-1 transition-colors font-bold ${darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'}`}
                >-</button>
                <div className={`flex-1 text-center text-xs font-bold py-1 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>{amount}</div>
                <button
                    type="button"
                    onClick={() => setAmount(amount + 1)}
                    disabled={!canEdit}
                    className={`px-2 py-1 transition-colors font-bold ${darkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/40 text-yellow-500' : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'}`}
                >+</button>
            </div>

            <button
                type="button"
                onClick={handleApply}
                disabled={!canEdit || amount === 0 || isSaving}
                className={`
                    w-full py-2 text-[8px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-1
                    ${amount > 0
                        ? (mode === 'dar' ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg')
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    ${isSaving ? 'opacity-50' : ''}
                `}
            >
                {isSaving ? (
                    <i className="fas fa-spinner fa-spin"></i>
                ) : (
                    <i className={mode === 'dar' ? "fas fa-plus-circle" : "fas fa-minus-circle"}></i>
                )}
                {isSaving ? 'Salvando...' : (mode === 'dar' ? 'Dar Item' : 'Retirar Item')}
            </button>
        </div>
    );
};

const UserSubscriptionPanel: React.FC<UserSubscriptionPanelProps> = ({ user, currentUser, adConfig, onUpdateUser, onExtendSubscription, canEdit: canEditProp, systemSettings, darkMode = false }) => {
    // Garantia absoluta de permissão para Admin/Chefe dentro do componente
    const hasAdminPower =
        currentUser.role.toLowerCase().includes('admin') ||
        currentUser.role.toLowerCase().includes('chefe') ||
        currentUser.role.toLowerCase().includes('desenvolvedor');

    const canEdit = canEditProp || hasAdminPower;

    const purchasingEnabled = systemSettings?.purchasingEnabled !== false;

    // Purchase History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [historySearchQuery, setHistorySearchQuery] = useState('');

    const openHistory = (label: string, query?: string) => {
        setHistorySearchQuery(query || label);
        setHistoryModalOpen(true);
    };

    const [walletAddAmount, setWalletAddAmount] = useState<string>('');
    const [userAds, setUserAds] = useState<Advertiser[]>([]);
    const [isLoadingAds, setIsLoadingAds] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAds = async () => {
            setIsLoadingAds(true);
            try {
                const ads = await getUserAdvertisers(user.id);
                if (ads) setUserAds(ads);
            } catch (err) {
                console.error("Erro ao buscar anúncios:", err);
            } finally {
                setIsLoadingAds(false);
            }
        };
        fetchAds();
    }, [user.id]);

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
        <div className={`animate-fadeIn p-6 md:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>

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
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${darkMode ? 'bg-yellow-900/20 text-yellow-500 border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                        <i className="fas fa-crown"></i>
                    </div>
                    <div>
                        <h2 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>Assinatura & Créditos</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gerencie o plano e saldo do usuário</p>
                    </div>
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

                {/* 1.5 PLANOS ATIVOS (Gerenciamento) */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        <i className="fas fa-layer-group text-blue-500"></i> Planos Ativos
                    </h3>
                    {(!user.activePlans || user.activePlans.length === 0) ? (
                        <div className={`p-4 rounded-xl text-center border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhum plano vinculado.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                            {Object.entries((user.activePlans || []).reduce((acc: Record<string, number>, planId: string) => {
                                acc[planId] = (acc[planId] || 0) + 1;
                                return acc;
                            }, {})).map(([planId, count]) => {
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
                                                    e.stopPropagation(); // Prevent modal opening
                                                    const confirmMsg = count > 1
                                                        ? `Existem ${count} planos "${planName}". Deseja remover TODOS?`
                                                        : `Remover plano "${planName}" do usuário?`;

                                                    if (!confirm(confirmMsg)) return;

                                                    const res = await removeUserItem(user.id, 'plan', planId);
                                                    if (res.success) {
                                                        // Optimistic - clear all instances
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
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 1.6 RECURSOS DISPONÍVEIS (Tokens Consolidados) */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        <i className="fas fa-cubes text-purple-500"></i> Créditos Disponíveis
                    </h3>

                    {(() => {
                        // Calcula Recursos Totais (Commercial Data ou Inferido dos Planos)
                        // A preferência é usar o commercialData real do usuário. Se estiver vazio, tenta "adivinhar" pelos planos.

                        // 1. Recursos Base (Planos Ativos)
                        let resources: any = {
                            videoLimit: 0,
                            socialPublications: { instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 },
                            displayLocations: { homeBar: false, sidebar: false, footer: false, homeBanner: false, popup: false }
                        };

                        const PLAN_DEFAULTS: Record<string, any> = {
                            'master': { videoLimit: 1, socialPublications: { instagram: 5, facebook: 5, youtube: 1 }, displayLocations: { homeBanner: true, sidebar: true } },
                            'mensal': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3 }, displayLocations: { sidebar: true } },
                            'lancamento': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3, youtube: 1 }, displayLocations: { homeBanner: true } }
                        };

                        if (user.activePlans?.length) {
                            user.activePlans.forEach(pid => {
                                const key = Object.keys(PLAN_DEFAULTS).find(k => pid.toLowerCase().includes(k)) || 'mensal';
                                const def = PLAN_DEFAULTS[key];
                                resources.videoLimit += (def.videoLimit || 0);
                                if (def.socialPublications) {
                                    Object.keys(def.socialPublications).forEach(k => {
                                        resources.socialPublications[k] = (resources.socialPublications[k] || 0) + (def.socialPublications[k] || 0);
                                    });
                                }
                                if (def.displayLocations) {
                                    Object.keys(def.displayLocations).forEach(k => {
                                        if (def.displayLocations[k]) resources.displayLocations[k] = true;
                                    });
                                }
                            });
                        }

                        // 2. Somar/Mesclar dados comerciais reais (Boosts e Overrides manuais)
                        if (user.commercialData) {
                            const cd = user.commercialData;
                            resources.videoLimit += (cd.videoLimit || 0);

                            if (cd.socialPublications) {
                                Object.keys(cd.socialPublications).forEach(k => {
                                    resources.socialPublications[k] = (resources.socialPublications[k] || 0) + (cd.socialPublications[k] || 0);
                                });
                            }

                            if (cd.displayLocations) {
                                Object.keys(cd.displayLocations).forEach(k => {
                                    if (cd.displayLocations[k]) resources.displayLocations[k] = true;
                                });
                            }
                        }

                        // -------------------------------------------------
                        // CÁLCULO DE SALDO (Créditos Disponíveis)
                        // -------------------------------------------------
                        const usage = { video: 0, instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 };
                        userAds.forEach((ad: any) => {
                            if (ad.isActive === false) return; // Só conta o que está NO AR

                            const n = ad.name?.toLowerCase() || '';
                            const c = ad.category?.toLowerCase() || '';
                            const t = ad.type?.toLowerCase() || '';
                            if (c === 'video' || t === 'video') usage.video++;
                            else if (n.includes('insta')) usage.instagram++;
                            else if (n.includes('face')) usage.facebook++;
                            else if (n.includes('youtu')) usage.youtube++;
                            else if (n.includes('tiktok')) usage.tiktok++;
                            else if (n.includes('whats')) usage.whatsapp++;
                        });

                        // Deep copy para calcular saldo líquido
                        const netResources = JSON.parse(JSON.stringify(resources));

                        console.log("RESOURCES RENDERING DEBUG:", {
                            userName: user.name,
                            rawCommercialData: user.commercialData,
                            calculatedResources: resources,
                            usage,
                            net: netResources
                        });

                        if (netResources.videoLimit !== undefined) netResources.videoLimit = Math.max(0, netResources.videoLimit - usage.video);
                        if (netResources.socialPublications) {
                            const sp = netResources.socialPublications;
                            if (sp.instagram !== undefined) sp.instagram = Math.max(0, sp.instagram - usage.instagram);
                            if (sp.facebook !== undefined) sp.facebook = Math.max(0, sp.facebook - usage.facebook);
                            if (sp.youtube !== undefined) sp.youtube = Math.max(0, sp.youtube - usage.youtube);
                            if (sp.tiktok !== undefined) sp.tiktok = Math.max(0, sp.tiktok - usage.tiktok);
                            if (sp.whatsapp !== undefined) sp.whatsapp = Math.max(0, sp.whatsapp - usage.whatsapp);
                        }

                        // Constrói lista visual de TOKENS (SALDO LÍQUIDO)
                        const tokens: any[] = [];

                        // 1. Videos
                        if ((resources.videoLimit || 0) > 0) {
                            tokens.push({
                                icon: 'fas fa-clapperboard',
                                label: 'Vídeos',
                                count: netResources.videoLimit,
                                total: resources.videoLimit,
                                color: 'text-pink-500',
                                border: darkMode ? 'border-pink-500/20 bg-pink-900/20' : 'border-pink-500/20 bg-pink-50'
                            });
                        }

                        // 2. Social
                        if (resources.socialPublications) {
                            const sp = resources.socialPublications;
                            const nsp = netResources.socialPublications || {};

                            if (sp.instagram > 0) tokens.push({ icon: 'fab fa-instagram', label: 'Instagram', count: nsp.instagram || 0, total: sp.instagram, color: 'text-fuchsia-600', border: darkMode ? 'border-fuchsia-500/20 bg-fuchsia-900/20' : 'border-fuchsia-500/20 bg-fuchsia-50' });
                            if (sp.facebook > 0) tokens.push({ icon: 'fab fa-facebook-f', label: 'Facebook', count: nsp.facebook || 0, total: sp.facebook, color: 'text-blue-600', border: darkMode ? 'border-blue-500/20 bg-blue-900/20' : 'border-blue-500/20 bg-blue-50' });
                            if (sp.youtube > 0) tokens.push({ icon: 'fab fa-youtube', label: 'Youtube', count: nsp.youtube || 0, total: sp.youtube, color: 'text-red-600', border: darkMode ? 'border-red-500/20 bg-red-900/20' : 'border-red-500/20 bg-red-50' });
                            if (sp.tiktok > 0) tokens.push({ icon: 'fab fa-tiktok', label: 'TikTok', count: nsp.tiktok || 0, total: sp.tiktok, color: 'text-black dark:text-white', border: darkMode ? 'border-gray-500/20 bg-gray-900/20' : 'border-gray-500/20 bg-gray-50' });
                            if (sp.whatsapp > 0) tokens.push({ icon: 'fab fa-whatsapp', label: 'WhatsApp', count: nsp.whatsapp || 0, total: sp.whatsapp, color: 'text-green-600', border: darkMode ? 'border-green-500/20 bg-green-900/20' : 'border-green-500/20 bg-green-50' });
                        }

                        // 3. Locations
                        if (resources.displayLocations) {
                            const dl = resources.displayLocations;
                            if (dl.homeBanner) tokens.push({ icon: 'fas fa-window-maximize', label: 'Banner Home', color: 'text-indigo-600', border: darkMode ? 'border-indigo-500/20 bg-indigo-900/20' : 'border-indigo-500/20 bg-indigo-50' });
                            if (dl.sidebar) tokens.push({ icon: 'fas fa-table-columns', label: 'Sidebar', color: 'text-violet-600', border: darkMode ? 'border-violet-500/20 bg-violet-900/20' : 'border-violet-500/20 bg-violet-50' });
                            if (dl.footer) tokens.push({ icon: 'fas fa-shoe-prints', label: 'Rodapé', color: 'text-emerald-600', border: darkMode ? 'border-emerald-500/20 bg-emerald-900/20' : 'border-emerald-500/20 bg-emerald-50' });
                            if (dl.homeBar) tokens.push({ icon: 'fas fa-arrow-up', label: 'Barra Topo', color: 'text-amber-600', border: darkMode ? 'border-amber-500/20 bg-amber-900/20' : 'border-amber-500/20 bg-amber-50' });
                            if (dl.popup) tokens.push({ icon: 'fas fa-clone', label: 'Popup', color: 'text-orange-600', border: darkMode ? 'border-orange-500/20 bg-orange-900/20' : 'border-orange-500/20 bg-orange-50' });
                        }

                        if (tokens.length === 0) {
                            return (
                                <div className={`p-4 rounded-xl text-center border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhum recurso disponível.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {tokens.map((token, idx) => {
                                    // Mapeamento de query para histórico
                                    let query = token.label;
                                    if (token.label === 'Vídeos') query = 'Vídeo';
                                    if (token.label === 'Barra Topo') query = 'Scroll Topo';

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => openHistory(token.label, query)}
                                            className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all hover:scale-105 cursor-pointer hover:shadow-lg ${token.border}`}
                                            title={`Clique para ver histórico de ${token.label}`}
                                        >
                                            <i className={`${token.icon} ${token.color} text-2xl drop-shadow-lg`}></i>
                                            <div className="flex flex-col items-center leading-none mt-1">
                                                <span className={`text-[12px] font-black ${darkMode ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>{token.count}/{token.total}</span>
                                                <span className={`text-[8px] font-black uppercase text-center mt-0.5 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                    {token.label}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );

                    })()}

                </div>

                {/* 1.6.5 ITENS UTILIZADOS (Baseado em Anúncios Ativos) */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        <i className="fas fa-box-open text-orange-500"></i> Itens Utilizados
                    </h3>

                    {userAds.length === 0 ? (
                        <div className={`p-4 rounded-xl text-center border border-dashed ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhum item utilizado ainda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {userAds.map((ad: any, idx) => {
                                let icon = 'fas fa-ad';
                                let label = 'Anúncio';
                                let color = 'text-gray-500';

                                // Inferência de Tipo
                                if (ad.category === 'video' || ad.type === 'video') {
                                    icon = 'fas fa-clapperboard';
                                    label = 'Vídeo';
                                    color = 'text-pink-500';
                                } else if (ad.category?.includes('banner') || ad.name?.toLowerCase().includes('banner')) {
                                    icon = 'fas fa-window-maximize';
                                    label = 'Banner';
                                    color = 'text-indigo-500';
                                } else {
                                    // Tenta inferir pelo nome
                                    const n = ad.name?.toLowerCase() || '';
                                    if (n.includes('insta')) { icon = 'fab fa-instagram'; label = 'Instagram'; color = 'text-fuchsia-500'; }
                                    else if (n.includes('face')) { icon = 'fab fa-facebook-f'; label = 'Facebook'; color = 'text-blue-500'; }
                                }

                                return (
                                    <div key={idx} className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-2 border border-dashed ${darkMode ? 'border-white/10 bg-white/5' : 'border-gray-300 bg-gray-50'}`} title={`Utilizado em: ${ad.name}`}>
                                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500/50"></div>
                                        <i className={`${icon} ${color} text-xl opacity-80`}></i>
                                        <span className={`text-[8px] font-bold uppercase text-center leading-tight px-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* 1.7 ANÚNCIOS VINCULADOS (CONTRATOS) */}
                <div className={`rounded-xl p-6 ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <h3 className={`text-sm font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                        <i className="fas fa-file-contract text-red-500"></i> Anúncios Vinculados
                    </h3>

                    {isLoadingAds ? (
                        <div className="flex justify-center p-4"><i className="fas fa-circle-notch fa-spin text-gray-400"></i></div>
                    ) : userAds.length === 0 ? (
                        <p className="text-xs text-gray-400 font-bold uppercase">Nenhum anúncio vinculado.</p>
                    ) : (
                        <div className="space-y-3">
                            {userAds.map((ad) => (
                                <div key={ad.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                                {ad.logoUrl ? <img src={ad.logoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><i className="fas fa-image text-xs"></i></div>}
                                            </div>
                                            <div>
                                                <span className={`block text-[10px] font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ad.name}</span>
                                                <span className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{ad.category}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[8px] px-2 py-1 rounded-full font-black uppercase ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {ad.isActive ? 'No Ar' : 'Pausado'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3 mt-3">
                                        <div className="space-y-2">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-gray-400 uppercase">Período</span>
                                                <span className={`text-[9px] font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {ad.startDate ? new Date(ad.startDate).toLocaleDateString('pt-BR') : '?'} - {ad.endDate ? new Date(ad.endDate).toLocaleDateString('pt-BR') : '?'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-gray-400 uppercase">Visulizações</span>
                                                <span className="text-[10px] font-black text-blue-500 flex items-center gap-1">
                                                    <i className="fas fa-eye text-[7px]"></i> {ad.views.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[7px] font-black text-gray-400 uppercase">Cliques</span>
                                                <span className="text-[10px] font-black text-red-500 flex items-center gap-1">
                                                    <i className="fas fa-mouse-pointer text-[7px]"></i> {ad.clicks.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 1.8 EXTRATO DE BOOSTS (COMPRAS AVULSAS) */}
                {(() => {
                    // Recalcula o base dos planos para encontrar a diferença (Boosts)
                    let planResources = {
                        videoLimit: 0,
                        socialPublications: { instagram: 0, facebook: 0, youtube: 0, tiktok: 0, whatsapp: 0 },
                        displayLocations: { homeBar: false, sidebar: false, footer: false, homeBanner: false, popup: false }
                    };
                    const PLAN_DEFAULTS_CALC: Record<string, any> = {
                        'master': { videoLimit: 1, socialPublications: { instagram: 5, facebook: 5, youtube: 1 }, displayLocations: { homeBanner: true, sidebar: true } },
                        'mensal': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3 }, displayLocations: { sidebar: true } },
                        'lancamento': { videoLimit: 0, socialPublications: { instagram: 3, facebook: 3, youtube: 1 }, displayLocations: { homeBanner: true } }
                    };
                    if (user.activePlans?.length) {
                        user.activePlans.forEach(pid => {
                            const key = Object.keys(PLAN_DEFAULTS_CALC).find(k => pid.toLowerCase().includes(k)) || 'mensal';
                            const def = PLAN_DEFAULTS_CALC[key];
                            planResources.videoLimit += (def.videoLimit || 0);
                            if (def.socialPublications) {
                                Object.keys(def.socialPublications).forEach(k => {
                                    planResources.socialPublications[k as keyof typeof planResources.socialPublications] += (def.socialPublications[k] || 0);
                                });
                            }
                            if (def.displayLocations) {
                                Object.keys(def.displayLocations).forEach(k => {
                                    if (def.displayLocations[k]) planResources.displayLocations[k as keyof typeof planResources.displayLocations] = true;
                                });
                            }
                        });
                    }

                    // Calcula Diferença (Total Banco - Planos = Boosts)
                    const totalData = user.commercialData || {};
                    const totalSocial = totalData.socialPublications || {};
                    const totalLocs = totalData.displayLocations || {};

                    const boosts = {
                        videoLimit: Math.max(0, (totalData.videoLimit || 0) - planResources.videoLimit),
                        instagram: Math.max(0, (totalSocial.instagram || 0) - planResources.socialPublications.instagram),
                        facebook: Math.max(0, (totalSocial.facebook || 0) - planResources.socialPublications.facebook),
                        youtube: Math.max(0, (totalSocial.youtube || 0) - planResources.socialPublications.youtube),
                        tiktok: Math.max(0, (totalSocial.tiktok || 0) - planResources.socialPublications.tiktok),
                        whatsapp: Math.max(0, (totalSocial.whatsapp || 0) - planResources.socialPublications.whatsapp),
                        // Locations são booleanas. Se user tem E plano não tem = Boost
                        homeBar: !!totalLocs.homeBar && !planResources.displayLocations.homeBar,
                        popup: !!totalLocs.popup && !planResources.displayLocations.popup,
                        footer: !!totalLocs.footer && !planResources.displayLocations.footer,
                        sidebar: !!totalLocs.sidebar && !planResources.displayLocations.sidebar,
                        homeBanner: !!totalLocs.homeBanner && !planResources.displayLocations.homeBanner,
                    };

                    const hasBoosts = Object.values(boosts).some(v => v === true || (typeof v === 'number' && v > 0));

                    if (hasBoosts) {
                        return (
                            <div className={`rounded-xl p-6 border-2 border-dashed ${darkMode ? 'bg-yellow-900/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                                <h3 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-yellow-500' : 'text-yellow-700'}`}>
                                    <i className="fas fa-bolt"></i> Extrato de Itens Avulsos (Boosts)
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {/* VIDEO & SOCIAL */}
                                    {boosts.videoLimit > 0 && (
                                        <div onClick={() => openHistory('Vídeos', 'Vídeo')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-pink-200'}`}>
                                            <i className="fas fa-clapperboard text-pink-500 text-xl mb-1"></i>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.videoLimit}</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Vídeos</span>
                                        </div>
                                    )}
                                    {boosts.instagram > 0 && (
                                        <div onClick={() => openHistory('Instagram')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-fuchsia-200'}`}>
                                            <i className="fab fa-instagram text-fuchsia-600 text-xl mb-1"></i>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.instagram}</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Instagram</span>
                                        </div>
                                    )}
                                    {boosts.facebook > 0 && (
                                        <div onClick={() => openHistory('Facebook')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-blue-200'}`}>
                                            <i className="fab fa-facebook-f text-blue-600 text-xl mb-1"></i>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.facebook}</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Facebook</span>
                                        </div>
                                    )}
                                    {boosts.youtube > 0 && (
                                        <div onClick={() => openHistory('Youtube')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-red-200'}`}>
                                            <i className="fab fa-youtube text-red-600 text-xl mb-1"></i>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.youtube}</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Youtube</span>
                                        </div>
                                    )}
                                    {boosts.tiktok > 0 && (
                                        <div onClick={() => openHistory('TikTok')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-gray-200'}`}>
                                            <i className="fab fa-tiktok text-black dark:text-white text-xl mb-1"></i>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.tiktok}</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>TikTok</span>
                                        </div>
                                    )}
                                    {boosts.whatsapp > 0 && (
                                        <div onClick={() => openHistory('WhatsApp')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-green-200'}`}>
                                            <i className="fab fa-whatsapp text-green-600 text-xl mb-1"></i>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>+{boosts.whatsapp}</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>WhatsApp</span>
                                        </div>
                                    )}

                                    {/* LOCATIONS */}
                                    {boosts.homeBar && (
                                        <div onClick={() => openHistory('Barra Topo', 'Scroll Topo')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-amber-200'}`}>
                                            <div className="relative">
                                                <i className="fas fa-arrow-up text-amber-600 text-xl mb-1"></i>
                                                <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                                            </div>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Barra Topo</span>
                                        </div>
                                    )}
                                    {boosts.popup && (
                                        <div onClick={() => openHistory('Popup')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-orange-200'}`}>
                                            <div className="relative">
                                                <i className="fas fa-clone text-orange-600 text-xl mb-1"></i>
                                                <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                                            </div>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Popup</span>
                                        </div>
                                    )}
                                    {boosts.homeBanner && (
                                        <div onClick={() => openHistory('Banner')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-indigo-200'}`}>
                                            <div className="relative">
                                                <i className="fas fa-window-maximize text-indigo-600 text-xl mb-1"></i>
                                                <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                                            </div>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Banner</span>
                                        </div>
                                    )}
                                    {boosts.sidebar && (
                                        <div onClick={() => openHistory('Sidebar')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-violet-200'}`}>
                                            <div className="relative">
                                                <i className="fas fa-table-columns text-violet-600 text-xl mb-1"></i>
                                                <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                                            </div>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sidebar</span>
                                        </div>
                                    )}
                                    {boosts.footer && (
                                        <div onClick={() => openHistory('Rodapé')} className={`cursor-pointer hover:scale-105 transition-all flex flex-col items-center p-3 rounded-lg border shadow-sm ${darkMode ? 'bg-white/5 border-white/10' : 'bg-transparent border-emerald-200'}`}>
                                            <div className="relative">
                                                <i className="fas fa-shoe-prints text-emerald-600 text-xl mb-1"></i>
                                                <i className="fas fa-check-circle text-green-500 text-[8px] absolute -bottom-0 -right-1 bg-white dark:bg-black rounded-full p-0.5"></i>
                                            </div>
                                            <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>Ativo</span>
                                            <span className={`text-[8px] uppercase font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rodapé</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-3 text-center">
                                    * Estes itens já estão somados nos créditos disponíveis acima.
                                </p>
                            </div>
                        );
                    }
                    console.log("BOOST DEBUG RENDER:", { hasBoosts, boosts, planResources, userCommercialData: totalData });
                    return null;
                })()}

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

                {/* AÇÕES FINAIS - SALVAR TUDO */}
                <div className={`mt-8 pt-6 border-t flex justify-end items-center gap-4 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <p className="text-[10px] text-gray-400 font-bold uppercase hidden md:block">
                        <i className="fas fa-cloud-upload-alt mr-1"></i> As alterações são salvas automaticamente
                    </p>
                    <button
                        onClick={async () => {
                            // Força um update final para garantir consistência e dar feedback
                            try {
                                // Simula um delay de salvamento para feedback
                                const btn = document.getElementById('btn-finalizar-config');
                                if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';

                                // Re-salva o user atual para garantir
                                await updateUser(user);

                                if (btn) {
                                    btn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Salvo com Sucesso!';
                                    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                                    btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                                    setTimeout(() => {
                                        btn.innerHTML = '<i class="fas fa-check mr-2"></i> Finalizar Configurações';
                                        btn.classList.add('bg-green-600', 'hover:bg-green-700');
                                        btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                                    }, 2000);
                                }

                                // alert("Configurações salvas e sincronizadas com sucesso!");
                            } catch (e) {
                                alert("Erro ao sincronizar finalização.");
                            }
                        }}
                        id="btn-finalizar-config"
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center"
                    >
                        <i className="fas fa-check mr-2"></i> Finalizar Configurações
                    </button>
                </div>

            </div>

            {/* MODAL DE DETALHES DO PLANO */}
            {selectedPlanId && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPlanId(null)}></div>
                    <div className={`relative w-full max-w-lg rounded-[2rem] p-8 shadow-2xl animate-scaleIn border overflow-hidden flex flex-col max-h-[90vh] ${darkMode ? 'bg-[#0F0F0F] border-white/10' : 'bg-white border-gray-100'}`}>
                        {(() => {
                            const planConfig = adConfig?.plans.find(p => p.id === selectedPlanId);
                            const planName = planConfig?.name || selectedPlanId;
                            // Dados comerciais atuais (globais do usuário)
                            const commercial = user.commercialData || {};
                            const socials = commercial.socialPublications || {};
                            const locations = commercial.displayLocations || {};

                            return (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl border border-blue-500/20">
                                                <i className="fas fa-certificate"></i>
                                            </div>
                                            <div>
                                                <h3 className={`text-xl font-black uppercase italic ${darkMode ? 'text-white' : 'text-gray-900'}`}>{planName}</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Detalhes e Benefícios Ativos</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedPlanId(null)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">

                                        {(() => {
                                            const features: any = planConfig?.features || {};

                                            // ---------------------------------------------------------
                                            // GRUPO 1: VISIBILIDADE NO SITE (ON-SITE)
                                            // ---------------------------------------------------------
                                            // Locais de Exibição + Features de Site (Banners, Popups, Destaque)
                                            const onSiteFeatures = {
                                                highlightDays: 'Dias em Destaque na Home',
                                                banners: 'Banners Rotativos',
                                                popups: 'Popups Semanais',
                                                storePage: 'Página Exclusiva da Loja',
                                                maxProducts: 'Limite de Anúncios no Site'
                                            };

                                            const locNames: Record<string, string> = {
                                                homeBar: 'Barra da Home',
                                                sidebar: 'Lateral (Artigos)',
                                                footer: 'Rodapé (Artigos)',
                                                homeBanner: 'Banner Principal',
                                                popup: 'Popup de Entrada'
                                            };

                                            const hasOnSite = Object.keys(onSiteFeatures).some(k => features[k] > 0) || Object.values(locations).some(v => v);

                                            // ---------------------------------------------------------
                                            // GRUPO 2: PRODUÇÃO E REDES SOCIAIS (OFF-SITE)
                                            // ---------------------------------------------------------
                                            // Vídeos Ganhos + Cotas de Publicação Social
                                            const offSiteFeatures = {
                                                videoLimit: 'Produção de Vídeos (Ganho Mensal)',
                                                // posts: 'Artes/Posts Produzidos'
                                            };

                                            const hasOffSite = Object.keys(offSiteFeatures).some(k => features[k] > 0) || Object.values(socials).some(v => Number(v) > 0);


                                            return (
                                                <div className="space-y-6">

                                                    {/* SEÇÃO 1: PUBLICIDADE NO SITE */}
                                                    <div className={`p-5 rounded-2xl border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-blue-900/10 to-transparent border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-white border-blue-100'}`}>
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <i className="fas fa-globe text-6xl text-blue-500"></i>
                                                        </div>

                                                        <h4 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                                                            <i className="fas fa-desktop"></i> Publicidade no Portal
                                                        </h4>

                                                        <div className="space-y-4 relative z-10">
                                                            {/* Locais Ativos */}
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Locais de Exibição Ativos</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {(Object.entries(locations) as [string, any][]).map(([loc, enabled]) => (
                                                                        enabled ? (
                                                                            <span key={loc} className="px-2.5 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold uppercase shadow-sm flex items-center gap-1.5">
                                                                                <i className="fas fa-check-circle text-[8px]"></i> {locNames[loc] || loc}
                                                                            </span>
                                                                        ) : null
                                                                    ))}
                                                                    {Object.values(locations).every(v => !v) && <span className="text-xs text-gray-500 italic">Nenhum local de exibição incluído.</span>}
                                                                </div>
                                                            </div>

                                                            {/* Features de Site */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {Object.entries(onSiteFeatures).map(([key, label]) => {
                                                                    const val = features[key];
                                                                    if (!val || val === 0) return null;
                                                                    return (
                                                                        <div key={key} className={`p-2 rounded-lg border flex flex-col ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white/60 border-blue-100'}`}>
                                                                            <span className="text-[9px] uppercase text-gray-400 font-bold">{label}</span>
                                                                            <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-blue-900'}`}>{String(val)}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* SEÇÃO 2: PRODUÇÃO E REDES SOCIAIS */}
                                                    <div className={`p-5 rounded-2xl border relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-purple-900/10 to-transparent border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-white border-purple-100'}`}>
                                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                                            <i className="fas fa-video text-6xl text-purple-500"></i>
                                                        </div>

                                                        <h4 className={`text-sm font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                                                            <i className="fas fa-bullhorn"></i> Produção & Redes Sociais
                                                        </h4>

                                                        <div className="space-y-4 relative z-10">
                                                            {/* Produção Mensal */}
                                                            {features.videoLimit > 0 && (
                                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/20">
                                                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                                                                        <i className="fas fa-play"></i>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] uppercase font-bold opacity-80">Produção Mensal</p>
                                                                        <p className="text-lg font-black leading-none">{features.videoLimit} Vídeos Novos / Mês</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Cotas Sociais */}
                                                            <div>
                                                                <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Frequência de Postagem / Divulgação</p>
                                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                                    {Object.entries(socials)
                                                                        .filter(([_, qtd]) => Number(qtd) > 0)
                                                                        .map(([net, qtd]) => (
                                                                            <div key={net} className={`text-center p-2 rounded-lg border ${darkMode ? 'bg-black/20 border-white/5' : 'bg-white border-gray-200'}`}>
                                                                                <div className="text-[8px] uppercase text-gray-400 mb-1">{net}</div>
                                                                                <div className="font-black text-purple-500 text-lg">{String(qtd)}x</div>
                                                                            </div>
                                                                        ))}
                                                                    {Object.values(socials).every(q => Number(q) === 0) && <p className="text-[10px] text-gray-500 italic col-span-4">Sem divulgação em redes sociais.</p>}
                                                                </div>
                                                                <p className="text-[9px] text-purple-400 mt-2 italic">*Quantidade de posts semanais/diários conforme contrato.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })()}

                                        {/* Contract Info */}
                                        {commercial.contract && (
                                            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                                <h4 className="text-xs font-black uppercase text-gray-400 mb-2"><i className="fas fa-file-contract text-gray-500"></i> Observações do Contrato</h4>
                                                <p className={`text-xs italic ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{commercial.contract.notes || 'Sem observações.'}</p>
                                                {commercial.contract.hasContract && <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[9px] rounded uppercase font-bold">Contrato Assinado</span>}
                                            </div>
                                        )}

                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                                        <button onClick={() => setSelectedPlanId(null)} className="px-6 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-xs font-black uppercase hover:bg-gray-300 transition-colors">Fechar</button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

        </div >
    );
};

export default UserSubscriptionPanel;
