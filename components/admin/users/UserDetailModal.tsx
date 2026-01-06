import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, AdPricingConfig, AuditLog, checkPermission, SystemSettings } from '../../../types';
import UserProfilePanel from './panels/UserProfilePanel';
import UserSubscriptionPanel from './panels/UserSubscriptionPanel';
import UserPermissionsPanel from './panels/UserPermissionsPanel';
import UserAuditPanel from './panels/UserAuditPanel';
import UserStatsPanel from './panels/UserStatsPanel';
import UserFinancialPanel from './panels/UserFinancialPanel';
import UserPostsPanel from './panels/UserPostsPanel';
import {
    getAuditLogs,
    resendActivationEmail,
    triggerPasswordResetByAdmin,
    logAction,
    updateUser
} from '../../../services/supabaseService';

interface UserDetailModalProps {
    user: User;
    currentUser: User;
    onClose: () => void;
    onUpdateUserLocal: (updates: Partial<User>) => void;
    onSaveUser: () => void;
    onToggleStatus: () => void;
    onUpdatePassword: (pass: string) => void;
    newUserPassword?: string;
    isCreating: boolean;
    adConfig?: AdPricingConfig;
    onSavePermissions: (perms: Record<string, boolean>) => void;
    systemSettings?: SystemSettings;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
    user, currentUser, onClose, onUpdateUserLocal, onSaveUser, onToggleStatus, onUpdatePassword,
    newUserPassword, isCreating, adConfig, onSavePermissions, systemSettings
}) => {
    const [panelTab, setPanelTab] = useState<'control' | 'commercial' | 'permissions' | 'audit'>('control');
    const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isProcessingMail, setIsProcessingMail] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const canEditPlan = checkPermission(currentUser, 'user_plan_edit') || checkPermission(currentUser, 'financial_edit');
    const canManageSecurity = currentUser.role === 'Desenvolvedor' || currentUser.role === 'Editor-Chefe';

    useEffect(() => {
        setPermissionsState(user.permissions || {});
    }, [user]);

    useEffect(() => {
        if (panelTab === 'audit') {
            setIsLoadingLogs(true);
            getAuditLogs().then(logs => {
                setAuditLogs(logs);
                setIsLoadingLogs(false);
            });
        }
    }, [panelTab]);

    const handleManualActivate = async () => {
        if (!canManageSecurity) {
            alert("Erro: Você não tem permissão para esta ação.");
            return;
        }
        if (!confirm("Atenção: Você está forçando a ativação manual. O usuário terá acesso imediato. Continuar?")) return;

        try {
            onUpdateUserLocal({ isVerified: true });
            await updateUser({ ...user, isVerified: true });
            await logAction(currentUser.id, currentUser.name, 'manual_activation', user.id, `Ativou manualmente a conta de: ${user.name}`);
            showNotification('success', "Usuário ativado com sucesso!");
        } catch (error) {
            console.error("Erro na ativação manual:", error);
            showNotification('error', "Erro ao ativar: " + (error as any).message || 'Desconhecido');
        }
    };

    const handleResendActivation = async () => {
        if (!confirm("Enviar novo e-mail de confirmação?")) return;
        try {
            setIsProcessingMail(true);
            const res = await resendActivationEmail(user.email);
            setIsProcessingMail(false);
            if (res.success) {
                showNotification('success', "Sucesso: " + res.message);
                logAction(currentUser.id, currentUser.name, 'resend_activation', user.id, `Reenviou e-mail de ativação para: ${user.name}`);
            } else {
                showNotification('error', "Erro: " + res.message);
            }
        } catch (e) {
            console.error("Erro reenvio:", e);
            setIsProcessingMail(false);
            showNotification('error', "Erro inesperado.");
        }
    };

    const handleTriggerReset = async () => {
        if (!confirm("Enviar link de redefinição de senha?")) return;
        try {
            setIsProcessingMail(true);
            const res = await triggerPasswordResetByAdmin(user.email);
            setIsProcessingMail(false);
            if (res.success) {
                showNotification('success', "Sucesso: " + res.message);
                logAction(currentUser.id, currentUser.name, 'admin_trigger_reset', user.id, `Disparou recuperação de senha para: ${user.name}`);
            } else {
                showNotification('error', "Erro: " + res.message);
            }
        } catch (e) {
            console.error("Erro reset:", e);
            setIsProcessingMail(false);
            showNotification('error', "Erro inesperado.");
        }
    };

    const togglePermission = (key: string) => {
        setPermissionsState(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExtendSubscription = (days: number) => {
        if (!canEditPlan) return;
        const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
        const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
        const newEnd = new Date(baseDate);
        newEnd.setDate(newEnd.getDate() + days);
        onUpdateUserLocal({ subscriptionEnd: newEnd.toISOString().split('T')[0] });
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[2rem] shadow-2xl relative z-10 animate-scaleIn flex overflow-hidden">

                {/* Sidebar do Modal (Menu + Info Rápida) */}
                <div className="w-1/4 min-w-[280px] bg-gray-50 border-r border-gray-100 flex flex-col">
                    <div className="p-8 flex flex-col items-center border-b border-gray-100 bg-white">
                        <div className="w-24 h-24 rounded-3xl bg-gray-100 p-1 shadow-inner mb-4">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center text-3xl font-black text-gray-400">{user.name ? user.name.charAt(0) : '+'}</div>}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 text-center leading-none">{user.name || 'Novo Usuário'}</h2>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 bg-gray-100 px-3 py-1 rounded-full">{user.role}</span>

                        {/* Status Badges */}
                        <div className="flex gap-2 mt-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${user.isVerified ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                {user.isVerified ? 'Verificado' : 'Pendente'}
                            </span>
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${user.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                {user.status === 'active' ? 'Ativo' : 'Suspenso'}
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <button onClick={() => setPanelTab('control')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'control' ? 'bg-white shadow-md text-gray-900 font-bold' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'control' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-400'}`}><i className="fas fa-id-card"></i></div>
                            <span className="text-xs uppercase tracking-wide">Perfil & Dados</span>
                        </button>
                        <button onClick={() => setPanelTab('commercial')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'commercial' ? 'bg-white shadow-md text-gray-900 font-bold' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'commercial' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}><i className="fas fa-store"></i></div>
                            <span className="text-xs uppercase tracking-wide">Comercial</span>
                        </button>
                        <button onClick={() => setPanelTab('permissions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'permissions' ? 'bg-white shadow-md text-gray-900 font-bold' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'permissions' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-400'}`}><i className="fas fa-lock"></i></div>
                            <span className="text-xs uppercase tracking-wide">Permissões</span>
                        </button>
                        <button onClick={() => setPanelTab('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'audit' ? 'bg-white shadow-md text-gray-900 font-bold' : 'text-gray-500 hover:bg-white hover:shadow-sm'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'audit' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-400'}`}><i className="fas fa-history"></i></div>
                            <span className="text-xs uppercase tracking-wide">Auditoria</span>
                        </button>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        {canManageSecurity && (
                            <div className="space-y-2">
                                {!user.isVerified && (
                                    <button onClick={handleManualActivate} className="w-full py-2 bg-black text-white rounded-lg text-[9px] font-black uppercase hover:bg-green-600 transition-colors">Ativar Manualmente</button>
                                )}
                                <button onClick={handleTriggerReset} className="w-full py-2 border border-gray-200 text-gray-500 rounded-lg text-[9px] font-black uppercase hover:bg-red-50 hover:text-red-600 transition-colors">Resetar Senha</button>
                            </div>
                        )}
                        <button onClick={onClose} className="w-full mt-2 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-colors">Fechar Painel</button>
                    </div>
                </div>

                {/* Conteúdo Principal do Modal */}
                <div className="flex-1 overflow-y-auto bg-white p-8 custom-scrollbar relative">
                    {/* Notification Toast */}
                    {notification && (
                        <div className={`absolute top-4 right-4 z-50 p-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-in ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
                            <p className="text-xs font-bold leading-tight">{notification.message}</p>
                        </div>
                    )}

                    <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-gray-900 border-b border-gray-100 pb-4">
                        {panelTab === 'control' ? (isCreating ? 'Novo Cadastro' : 'Editar Perfil') : panelTab === 'commercial' ? 'Dados Comerciais' : panelTab === 'permissions' ? 'Controle de Acessos' : 'Histórico de Atividades'}
                    </h1>

                    <div className="pb-20">
                        {panelTab === 'control' && (
                            <>
                                {/* Stats (Opcional, pode remover se poluir) */}
                                {!isCreating && <UserStatsPanel user={user} totalPosts={0} totalClicks={0} totalSpent={0} />}

                                <UserProfilePanel user={user} isCreating={isCreating} newUserPassword={newUserPassword} onUpdateUser={onUpdateUserLocal} onUpdatePassword={onUpdatePassword} onSave={onSaveUser} onToggleStatus={onToggleStatus} />

                                {!isCreating && <div className="mt-8"><UserPostsPanel userId={user.id} posts={[]} /></div>}
                            </>
                        )}

                        {panelTab === 'commercial' && (
                            <>
                                <UserSubscriptionPanel user={user} adConfig={adConfig} onUpdateUser={onUpdateUserLocal} onExtendSubscription={handleExtendSubscription} canEdit={canEditPlan} systemSettings={systemSettings} />
                                {user.role === 'Anunciante' && <UserFinancialPanel userId={user.id} payments={[]} />}
                            </>
                        )}

                        {panelTab === 'permissions' && (
                            <UserPermissionsPanel permissions={permissionsState} onTogglePermission={togglePermission} onSave={() => onSavePermissions(permissionsState)} />
                        )}

                        {panelTab === 'audit' && (
                            <UserAuditPanel logs={auditLogs} isLoading={isLoadingLogs} selectedUser={user} />
                        )}
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default UserDetailModal;

