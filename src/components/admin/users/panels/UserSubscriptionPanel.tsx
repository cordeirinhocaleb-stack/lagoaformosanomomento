import React, { useState, useEffect } from 'react';
import { User, AdPricingConfig, SystemSettings, Advertiser } from '@/types';
import UserPOSPanel from './UserPOSPanel';
import lfnmCoin from '@/assets/lfnm_coin.png';
import { updateUser } from '@/services/users/userService';
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

import { WalletSection } from './subscription/WalletSection';
import { ManualResourceManagement } from './subscription/ManualResourceManagement';
import { ActivePlansSection } from './subscription/ActivePlansSection';
import { ResourcesSection } from './subscription/ResourcesSection';
import { UsedItemsSection } from './subscription/UsedItemsSection';
import { LinkedAdsSection } from './subscription/LinkedAdsSection';
import { BoostsSection } from './subscription/BoostsSection';
import { PlanDatesSection } from './subscription/PlanDatesSection';
import { PlanDetailsModal } from './subscription/PlanDetailsModal';

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


    return (
        <div className={`animate-fadeIn p-6 md:p-8 rounded-[2rem] border shadow-sm relative overflow-hidden ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>

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
                <WalletSection
                    user={user}
                    canEdit={canEdit}
                    darkMode={darkMode}
                    onUpdateUser={onUpdateUser}
                />

                <ActivePlansSection
                    user={user}
                    adConfig={adConfig}
                    canEdit={canEdit}
                    darkMode={darkMode}
                    onUpdateUser={onUpdateUser}
                    setSelectedPlanId={setSelectedPlanId}
                />

                <ResourcesSection
                    user={user}
                    userAds={userAds}
                    darkMode={darkMode}
                    openHistory={openHistory}
                />

                <ManualResourceManagement
                    user={user}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser}
                    darkMode={darkMode}
                />

                <UsedItemsSection
                    userAds={userAds}
                    darkMode={darkMode}
                />

                <LinkedAdsSection
                    userAds={userAds}
                    isLoadingAds={isLoadingAds}
                    darkMode={darkMode}
                />

                <BoostsSection
                    user={user}
                    darkMode={darkMode}
                    openHistory={openHistory}
                />

                <PlanDatesSection
                    user={user}
                    darkMode={darkMode}
                    canEdit={canEdit}
                    onUpdateUser={onUpdateUser}
                />

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
                <PlanDetailsModal
                    selectedPlanId={selectedPlanId}
                    setSelectedPlanId={setSelectedPlanId}
                    user={user}
                    adConfig={adConfig}
                    darkMode={darkMode}
                />
            )}

            {/* MODAL DE HISTÓRICO DE COMPRAS */}
            <PurchaseHistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                userId={user.id}
                itemLabel={historySearchQuery}
            />
        </div>
    );
};

export default UserSubscriptionPanel;
