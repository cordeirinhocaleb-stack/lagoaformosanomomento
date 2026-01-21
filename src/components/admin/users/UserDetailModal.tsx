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
    onDeleteUser?: () => void;
    systemSettings?: SystemSettings;
    darkMode?: boolean;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
    user, currentUser, onClose, onUpdateUserLocal, onSaveUser, onToggleStatus, onUpdatePassword,
    newUserPassword, isCreating, adConfig, onSavePermissions, onDeleteUser, systemSettings, darkMode = false
}) => {
    const [panelTab, setPanelTab] = useState<'control' | 'commercial' | 'permissions' | 'audit'>('control');
    const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});
    const [localUser, setLocalUser] = useState<User>(user); // State local para dados frescos

    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isProcessingMail, setIsProcessingMail] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const canEditPlan = checkPermission(currentUser, 'user_plan_edit') || checkPermission(currentUser, 'financial_edit');
    const canManageSecurity =
        currentUser.role.toLowerCase().includes('admin') ||
        currentUser.role.toLowerCase().includes('chefe') ||
        currentUser.role.toLowerCase().includes('desenvolvedor');

    // Sync inicial e update quando prop muda
    useEffect(() => {
        setLocalUser(user);
        setPermissionsState(user.permissions || {});
    }, [user]);

    // Fetch fresco ao abrir o modal para garantir dados (ex: commercialData)
    useEffect(() => {
        const fetchFreshUser = async () => {
            const { getSupabase } = await import('../../../services/supabaseService');
            const { mapDbToUser } = await import('../../../services/users/userService');

            const supabase = getSupabase();
            if (!supabase) return;

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                const mapped = mapDbToUser(data);
                if (mapped) {
                    setLocalUser(prev => ({ ...prev, ...mapped }));
                    setPermissionsState(mapped.permissions || {});
                }
            }
        };
        fetchFreshUser();
    }, [user.id]);

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
        if (!confirm("Atenção: Você está forçando a ativação manual. O usuário terá acesso imediato. Continuar?")) { return; }

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
        if (!confirm("Enviar novo e-mail de confirmação?")) { return; }
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
        if (!confirm("Enviar link de redefinição de senha?")) { return; }
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

    const handleExtendSubscription = async (days: number) => {
        if (!canEditPlan) { return; }
        const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
        const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
        const newEnd = new Date(baseDate);
        newEnd.setDate(newEnd.getDate() + days);
        const isoDate = newEnd.toISOString().split('T')[0];

        try {
            const updatedUser = { ...user, subscriptionEnd: isoDate };
            await updateUser(updatedUser);
            onUpdateUserLocal({ subscriptionEnd: isoDate });
            await logAction(currentUser.id, currentUser.name, 'extend_subscription', user.id, `Estendeu assinatura de ${user.name} por ${days} dias (Nova data: ${isoDate})`);
            showNotification('success', `Assinatura estendida por ${days} dias!`);
        } catch (err: any) {
            console.error("Erro ao estender assinatura:", err);
            showNotification('error', "Erro ao salvar no banco.");
        }
    };

    // Estado para controle de tela cheia
    const [isFullScreen, setIsFullScreen] = useState(false);

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal Container */}
            <div className={`
                relative z-10 flex overflow-hidden shadow-2xl transition-all duration-300
                ${isFullScreen
                    ? 'w-screen h-screen rounded-none'
                    : 'w-full max-w-6xl max-h-[90vh] rounded-[2rem] animate-scaleIn'
                }
                ${darkMode ? 'bg-[#0F0F0F]' : 'bg-white'}
            `}>

                {/* Sidebar do Modal (Menu + Info Rápida) */}
                <div className={`w-1/4 min-w-[280px] border-r flex flex-col ${darkMode ? 'bg-[#050505] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`p-8 flex flex-col items-center border-b ${darkMode ? 'bg-[#050505] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`w-24 h-24 rounded-3xl p-1 shadow-inner mb-4 group cursor-pointer transition-colors ${darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100'}`}>
                            {localUser.avatar ? (
                                <img src={localUser.avatar} className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform" />
                            ) : (
                                <div className={`w-full h-full rounded-2xl flex items-center justify-center text-3xl font-black text-gray-600 group-hover:text-red-500 transition-colors ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <i className="fas fa-user group-hover:animate-almost-fall"></i>
                                </div>
                            )}
                        </div>
                        <h2 className={`text-xl font-black text-center leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>{localUser.name || 'Novo Usuário'}</h2>
                        <span className={`text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2 px-3 py-1 rounded-full ${darkMode ? 'bg-white/5' : 'bg-gray-200/50'}`}>{localUser.role}</span>

                        {/* Status Badges */}
                        <div className="flex gap-2 mt-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${localUser.isVerified ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                {localUser.isVerified ? 'Verificado' : 'Pendente'}
                            </span>
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${localUser.status === 'active' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                {localUser.status === 'active' ? 'Ativo' : 'Suspenso'}
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <button onClick={() => setPanelTab('control')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'control' ? (darkMode ? 'bg-white/10 text-white font-bold' : 'bg-white border border-gray-200 shadow-sm text-gray-900 font-bold') : 'text-gray-500 hover:bg-white/5 hover:text-gray-600'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'control' ? 'bg-red-600 text-white' : (darkMode ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400')}`}><i className="fas fa-id-card"></i></div>
                            <span className="text-xs uppercase tracking-wide">Perfil & Dados</span>
                        </button>
                        <button onClick={() => setPanelTab('commercial')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'commercial' ? (darkMode ? 'bg-white/10 text-white font-bold' : 'bg-white border border-gray-200 shadow-sm text-gray-900 font-bold') : 'text-gray-500 hover:bg-white/5 hover:text-gray-600'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'commercial' ? 'bg-green-600 text-white' : (darkMode ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400')}`}><i className="fas fa-store"></i></div>
                            <span className="text-xs uppercase tracking-wide">Comercial</span>
                        </button>
                        <button onClick={() => setPanelTab('permissions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'permissions' ? (darkMode ? 'bg-white/10 text-white font-bold' : 'bg-white border border-gray-200 shadow-sm text-gray-900 font-bold') : 'text-gray-500 hover:bg-white/5 hover:text-gray-600'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'permissions' ? 'bg-purple-600 text-white' : (darkMode ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400')}`}><i className="fas fa-shield-alt"></i></div>
                            <span className="text-xs uppercase tracking-wide">Permissões</span>
                        </button>
                        <button onClick={() => setPanelTab('audit')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${panelTab === 'audit' ? (darkMode ? 'bg-white/10 text-white font-bold' : 'bg-white border border-gray-200 shadow-sm text-gray-900 font-bold') : 'text-gray-500 hover:bg-white/5 hover:text-gray-600'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${panelTab === 'audit' ? 'bg-amber-600 text-white' : (darkMode ? 'bg-white/5 text-gray-600' : 'bg-gray-100 text-gray-400')}`}><i className="fas fa-history"></i></div>
                            <span className="text-xs uppercase tracking-wide">Auditoria</span>
                        </button>
                    </nav>

                    <div className={`p-4 border-t ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
                        {canManageSecurity && (
                            <div className="space-y-2">
                                {!localUser.isVerified && (
                                    <button onClick={handleManualActivate} className="w-full py-2 bg-green-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-green-700 transition-colors">Ativar Manualmente</button>
                                )}
                                <button onClick={handleTriggerReset} className={`w-full py-2 border rounded-lg text-[9px] font-black uppercase transition-colors ${darkMode ? 'border-white/10 text-gray-500 hover:bg-red-600 hover:text-white hover:border-red-600' : 'border-gray-200 text-gray-500 hover:bg-red-100 hover:text-red-600'}`}>Resetar Senha</button>
                            </div>
                        )}
                        <button onClick={onClose} className={`w-full mt-2 py-3 rounded-xl text-[10px] font-black uppercase transition-colors ${darkMode ? 'bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-red-600 hover:text-white'}`}>Fechar Painel</button>
                    </div>
                </div>

                {/* Conteúdo Principal do Modal */}
                <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar relative ${darkMode ? 'bg-[#0F0F0F]' : 'bg-white'}`}>

                    {/* Botão de Tela Cheia (Mais Visível e Destacado) */}
                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className={`
                            absolute top-4 right-6 z-50 p-3 rounded-xl shadow-lg transition-all transform hover:scale-105
                            ${darkMode
                                ? 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                                : 'bg-black text-white hover:bg-gray-800 shadow-black/20'
                            }
                        `}
                        title={isFullScreen ? "Sair da Tela Cheia" : "Expandir Tela Cheia"}
                    >
                        <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'} text-xl`}></i>
                    </button>

                    {/* Notification Toast */}
                    {notification && (
                        <div className={`absolute top-4 right-24 z-50 p-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce-in ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-lg`}></i>
                            <p className="text-xs font-bold leading-tight">{notification.message}</p>
                        </div>
                    )}

                    <h1 className={`text-2xl font-black uppercase italic tracking-tighter mb-8 border-b pb-4 ${darkMode ? 'text-white border-white/5' : 'text-gray-900 border-gray-100'}`}>
                        {panelTab === 'control' ? (isCreating ? 'Novo Cadastro' : 'Editar Perfil') : panelTab === 'commercial' ? 'Dados Comerciais' : panelTab === 'permissions' ? 'Controle de Acessos' : 'Histórico de Atividades'}
                    </h1>

                    <div className="pb-20">
                        {panelTab === 'control' && (
                            <>
                                {/* Stats (Opcional, pode remover se poluir) */}
                                {!isCreating && <UserStatsPanel user={localUser} totalPosts={0} totalClicks={0} totalSpent={0} darkMode={darkMode} />}

                                <UserProfilePanel user={localUser} isCreating={isCreating} newUserPassword={newUserPassword} onUpdateUser={onUpdateUserLocal} onUpdatePassword={onUpdatePassword} onSave={onSaveUser} onToggleStatus={onToggleStatus} onDelete={onDeleteUser} darkMode={darkMode} />

                                {!isCreating && <div className="mt-8"><UserPostsPanel userId={localUser.id} posts={[]} darkMode={darkMode} /></div>}
                            </>
                        )}

                        {panelTab === 'commercial' && (
                            <>
                                <UserSubscriptionPanel
                                    user={localUser}
                                    currentUser={currentUser}
                                    adConfig={adConfig}
                                    onUpdateUser={onUpdateUserLocal}
                                    onExtendSubscription={handleExtendSubscription}
                                    canEdit={canEditPlan}
                                    systemSettings={systemSettings}
                                    darkMode={darkMode}
                                />
                                {user.role === 'Anunciante' && <UserFinancialPanel userId={user.id} payments={[]} darkMode={darkMode} />}
                            </>
                        )}

                        {panelTab === 'permissions' && (
                            <UserPermissionsPanel
                                permissions={permissionsState}
                                userRole={user.role}
                                onTogglePermission={togglePermission}
                                onSetPermissions={setPermissionsState}
                                onSave={() => onSavePermissions(permissionsState)}
                                darkMode={darkMode}
                            />
                        )}

                        {panelTab === 'audit' && (
                            <UserAuditPanel logs={auditLogs} isLoading={isLoadingLogs} selectedUser={user} darkMode={darkMode} />
                        )}
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
};

export default UserDetailModal;
