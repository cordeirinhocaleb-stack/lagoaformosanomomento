/**
 * UserDetailSidebar - Painel de detalhes de usuário para administração
 * Versão: 1.101
 * Última Atualização: 04/01/2026
 * Changelog: Corrigido z-index e visibilidade dos botões de controle
 */

import React, { useState, useEffect } from 'react';
import { User, AdPricingConfig, AuditLog, checkPermission } from '../../../types';
import UserProfilePanel from './panels/UserProfilePanel';
import UserSubscriptionPanel from './panels/UserSubscriptionPanel';
import UserPermissionsPanel from './panels/UserPermissionsPanel';
import UserAuditPanel from './panels/UserAuditPanel';
import UserStatsPanel from './panels/UserStatsPanel';
import UserFinancialPanel from './panels/UserFinancialPanel';
import UserSupportPanel from './panels/UserSupportPanel';
import UserPostsPanel from './panels/UserPostsPanel';
import {
    getAuditLogs,
    resendActivationEmail,
    triggerPasswordResetByAdmin,
    logAction,
    updateUser
} from '../../../services/supabaseService';

interface UserDetailSidebarProps {
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
}

const UserDetailSidebar: React.FC<UserDetailSidebarProps> = ({
    user, currentUser, onClose, onUpdateUserLocal, onSaveUser, onToggleStatus, onUpdatePassword,
    newUserPassword, isCreating, adConfig, onSavePermissions
}) => {
    const [panelTab, setPanelTab] = useState<'control' | 'commercial' | 'permissions' | 'audit'>('control');
    const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isProcessingMail, setIsProcessingMail] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isMaximized, setIsMaximized] = useState(false);

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
        console.log("Tentando ativação manual...");
        if (!canManageSecurity) {
            alert("Erro: Você não tem permissão para esta ação.");
            return;
        }
        if (!confirm("Atenção: Você está forçando a ativação manual. O usuário terá acesso imediato sem validar o e-mail. Continuar?")) {return;}

        try {
            // Atualiza localmente
            onUpdateUserLocal({ isVerified: true });

            // Salva no banco imediatamente para garantir
            await updateUser({ ...user, isVerified: true });


            await logAction(currentUser.id, currentUser.name, 'manual_activation', user.id, `Ativou manualmente a conta de: ${user.name}`);
            showNotification('success', "Usuário ativado com sucesso!");
        } catch (error) {
            console.error("Erro na ativação manual:", error);
            showNotification('error', "Erro ao ativar: " + (error as any).message || 'Desconhecido');
        }
    };

    const handleResendActivation = async () => {
        console.log("Tentando reenviar email...");
        if (!confirm("Enviar novo e-mail de confirmação para este usuário?")) {return;}

        try {
            setIsProcessingMail(true);
            const res = await resendActivationEmail(user.email);
            console.log("Resposta reenvio:", res);
            setIsProcessingMail(false);

            if (res.success) {
                showNotification('success', "Sucesso: " + res.message);
                logAction(currentUser.id, currentUser.name, 'resend_activation', user.id, `Reenviou e-mail de ativação para: ${user.name}`);
            } else {
                showNotification('error', "Erro ao enviar: " + res.message);
            }
        } catch (e) {
            console.error("Erro reenvio:", e);
            setIsProcessingMail(false);
            showNotification('error', "Erro inesperado ao reenviar email.");
        }
    };

    const handleTriggerReset = async () => {
        console.log("Tentando reset senha...");
        if (!confirm("Deseja enviar um link de redefinição de senha para o e-mail do usuário?")) {return;}

        try {
            setIsProcessingMail(true);
            const res = await triggerPasswordResetByAdmin(user.email);
            console.log("Resposta reset:", res);
            setIsProcessingMail(false);

            if (res.success) {
                showNotification('success', "Sucesso: " + res.message);
                logAction(currentUser.id, currentUser.name, 'admin_trigger_reset', user.id, `Disparou recuperação de senha para: ${user.name}`);
            } else {
                showNotification('error', "Erro ao enviar reset: " + res.message);
            }
        } catch (e) {
            console.error("Erro reset:", e);
            setIsProcessingMail(false);
            showNotification('error', "Erro inesperado ao resetar senha.");
        }
    };

    const togglePermission = (key: string) => {
        setPermissionsState(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExtendSubscription = (days: number) => {
        if (!canEditPlan) {return;}
        const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
        const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
        const newEnd = new Date(baseDate);
        newEnd.setDate(newEnd.getDate() + days);
        onUpdateUserLocal({ subscriptionEnd: newEnd.toISOString().split('T')[0] });
    };

    return (
        <div className="fixed inset-0 z-[5000] flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`bg-white h-full shadow-2xl relative z-10 animate-slideInRight flex flex-col border-l border-gray-100 transition-all duration-300 ${isMaximized ? 'w-full max-w-full' : 'w-full max-w-[500px]'}`}>

                {/* Botões de Controle - v1.101: Z-index e visibilidade aprimorados */}
                <div className="absolute top-8 right-8 flex items-center gap-3 z-[10000] pointer-events-none">
                    <button
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="w-12 h-12 rounded-2xl bg-white border-2 border-gray-300 text-gray-900 flex items-center justify-center transition-all shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.4)] hover:scale-110 hover:border-blue-500 active:scale-95 pointer-events-auto"
                        title={isMaximized ? "Restaurar" : "Maximizar"}
                        aria-label={isMaximized ? "Restaurar tamanho" : "Maximizar"}
                    >
                        <i className={`fas ${isMaximized ? 'fa-compress' : 'fa-expand'} text-xl`}></i>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center transition-all shadow-[0_8px_30px_rgb(220,38,38,0.5)] hover:shadow-[0_8px_40px_rgb(220,38,38,0.7)] hover:bg-black hover:scale-110 active:scale-90 border-2 border-white/30 pointer-events-auto"
                        aria-label="Fechar painel"
                    >
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                {/* Notification Toast */}
                {notification && (
                    <div className={`absolute top-4 left-4 right-16 z-50 p-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-in ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
                        <p className="text-xs font-bold leading-tight flex-1">{notification.message}</p>
                        <button onClick={() => setNotification(null)}><i className="fas fa-times"></i></button>
                    </div>
                )}
                <div className="h-48 bg-gray-900 relative flex items-end p-8 flex-shrink-0">


                    <div className="flex items-end gap-6 relative z-10 translate-y-12 w-full">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-xl">
                            {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-gray-200 rounded-2xl flex items-center justify-center text-3xl font-black text-gray-400">{user.name ? user.name.charAt(0) : '+'}</div>}
                        </div>
                        <div className="mb-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-black text-white leading-none mb-1">{user.name || 'Novo Usuário'}</h2>
                                {user.isVerified && <i className="fas fa-check-circle text-blue-400 text-sm"></i>}
                            </div>
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{user.role}</span>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                </div>

                <div className="pt-16 px-8 border-b border-gray-100 flex gap-6 flex-shrink-0 overflow-x-auto custom-scrollbar">
                    {['control', 'commercial', 'permissions', 'audit'].map(tab => (
                        <button key={tab} onClick={() => setPanelTab(tab as any)} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${panelTab === tab ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-black'}`}>
                            {tab === 'control' ? (isCreating ? 'Cadastro' : 'Perfil') : tab === 'commercial' ? 'Comercial & PDV' : tab === 'permissions' ? 'Permissões' : 'Auditoria'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-24">
                    {panelTab === 'control' && !isCreating && (
                        <div className="mb-8 space-y-6">
                            <div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2 mb-4 flex items-center gap-2">
                                    <i className="fas fa-user-shield"></i> Saúde da Conta
                                </h3>

                                <div className={`p-5 rounded-2xl border flex flex-col gap-4 ${user.isVerified ? 'bg-green-50/30 border-green-100' : 'bg-amber-50/30 border-amber-100'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${user.isVerified ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-200'}`}>
                                                <i className={`fas ${user.isVerified ? 'fa-check-double' : 'fa-envelope-open-text'}`}></i>
                                            </div>
                                            <div>
                                                <p className={`text-[11px] font-black uppercase tracking-tight ${user.isVerified ? 'text-green-700' : 'text-amber-700'}`}>
                                                    {user.isVerified ? 'E-mail Verificado' : 'Aguardando Ativação'}
                                                </p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase">Status do Perfil</p>
                                            </div>
                                        </div>

                                        {!user.isVerified && canManageSecurity && (
                                            <button
                                                onClick={handleManualActivate}
                                                className="bg-black text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase hover:bg-red-600 transition-all shadow-sm"
                                            >
                                                Ativar Manual
                                            </button>
                                        )}
                                    </div>

                                    {!user.isVerified && (
                                        <button
                                            onClick={handleResendActivation}
                                            disabled={isProcessingMail}
                                            className="w-full bg-white border border-amber-200 text-amber-700 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-amber-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isProcessingMail ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                            Reenviar E-mail de Ativação
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50 pb-2 mb-4 flex items-center gap-2">
                                    <i className="fas fa-key"></i> Segurança
                                </h3>
                                {canManageSecurity && (
                                    <button
                                        onClick={handleTriggerReset}
                                        disabled={isProcessingMail}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 hover:border-black transition-all group bg-white shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-red-600 group-hover:text-white transition-colors">
                                                <i className="fas fa-unlock-alt text-sm"></i>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-black">Resetar Senha</span>
                                                <p className="text-[7px] font-bold text-gray-400 uppercase mt-0.5">Envia link de recuperação</p>
                                            </div>
                                        </div>
                                        <i className="fas fa-chevron-right text-[10px] text-zinc-300"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {panelTab === 'control' && (
                        <>
                            <UserStatsPanel user={user} totalPosts={0} totalClicks={0} totalSpent={0} />
                            <UserPostsPanel userId={user.id} posts={[]} />
                            <UserSupportPanel userId={user.id} tickets={[]} onCreateTicket={(s, m) => alert('Ticket: ' + s)} />
                            <UserProfilePanel user={user} isCreating={isCreating} newUserPassword={newUserPassword} onUpdateUser={onUpdateUserLocal} onUpdatePassword={onUpdatePassword} onSave={onSaveUser} onToggleStatus={onToggleStatus} />
                        </>
                    )}

                    {panelTab === 'commercial' && (
                        <>
                            <UserSubscriptionPanel user={user} adConfig={adConfig} onUpdateUser={onUpdateUserLocal} onExtendSubscription={handleExtendSubscription} canEdit={canEditPlan} />
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
    );
};

export default UserDetailSidebar;
