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
    const [localUser, setLocalUser] = useState<User>(user);

    // Stats State - Real Data
    const [userStats, setUserStats] = useState({ totalPosts: 0, totalClicks: 0, totalSpent: 0 });

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

    useEffect(() => {
        setLocalUser(user);
        setPermissionsState(user.permissions || {});
    }, [user]);

    useEffect(() => {
        const fetchFreshUser = async () => {
            const { getSupabase } = await import('../../../services/supabaseService');
            const { mapDbToUser } = await import('../../../services/users/userService');
            const supabase = getSupabase();
            if (!supabase) return;

            // Timeout safety for user fetch
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout user fetch')), 15000));

            try {
                const fetchPromise = supabase.from('users').select('*').eq('id', user.id).single();

                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

                if (!error && data) {
                    const mapped = mapDbToUser(data);
                    if (mapped) {
                        setLocalUser(prev => ({ ...prev, ...mapped }));
                        setPermissionsState(mapped.permissions || {});
                    }
                }
            } catch (err) {
                console.error("Erro ou timeout no fetch de usuario:", err);
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

    // FETCH REAL STATS
    useEffect(() => {
        const fetchStats = async () => {
            if (isCreating) return;
            const { getSupabase } = await import('../../../services/supabaseService');
            const supabase = getSupabase();
            if (!supabase) return;

            try {
                // 1. Posts Count (FIX: Table is 'news', not 'posts')
                const { count: newsCount } = await supabase
                    .from('news')
                    .select('id', { count: 'exact', head: true })
                    .eq('author_id', user.id);

                // 2. Financial Spent (FIX: 'financial_transactions' table missing. Using safe fallback or audit logs)
                // For now, calculating from Audit Logs 'purchase_item' or returning 0 to prevent 404
                const { data: purchaseLogs } = await supabase
                    .from('audit_logs')
                    .select('details')
                    .eq('user_id', user.id)
                    .eq('action', 'purchase_item');

                // Extract amounts from logs if possible, or just 0. Example log: "Comprou plan X por C$ 50.00"
                const totalSpent = purchaseLogs?.reduce((acc, log) => {
                    const match = log.details?.match(/C\$\s?(\d+(\.\d{1,2})?)/);
                    return acc + (match ? parseFloat(match[1]) : 0);
                }, 0) || 0;

                // 3. Clicks/Views (FIX: using 'news' views sum)
                const { data: newsData } = await supabase
                    .from('news')
                    .select('views')
                    .eq('author_id', user.id);

                const totalViews = newsData?.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0) || 0;

                setUserStats({
                    totalPosts: newsCount || 0,
                    totalClicks: totalViews || 0,
                    totalSpent: totalSpent
                });
            } catch (err) {
                console.error("Erro ao buscar stats:", err);
            }
        };
        fetchStats();
    }, [user.id, isCreating]);


    const handleManualActivate = async () => {
        if (!canManageSecurity) return alert("Sem permissão");
        if (!confirm("Ativar manualmente?")) return;
        try {
            onUpdateUserLocal({ isVerified: true });
            await updateUser({ ...user, isVerified: true });
            await logAction(currentUser.id, currentUser.name, 'manual_activation', user.id, `Ativação manual`);
            showNotification('success', "Ativado!");
        } catch (e) { showNotification('error', "Erro ao ativar"); }
    };

    const handleTriggerReset = async () => {
        if (!confirm("Enviar reset senha?")) return;
        try {
            const res = await triggerPasswordResetByAdmin(user.email);
            showNotification(res.success ? 'success' : 'error', res.message);
        } catch (e) { showNotification('error', "Erro no envio"); }
    };

    const handleExtendSubscription = async (days: number) => {
        if (!canEditPlan) return;
        const currentEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd) : new Date();
        const baseDate = currentEnd < new Date() ? new Date() : currentEnd;
        const newEnd = new Date(baseDate);
        newEnd.setDate(newEnd.getDate() + days);
        const isoDate = newEnd.toISOString().split('T')[0];

        try {
            await updateUser({ ...user, subscriptionEnd: isoDate });
            onUpdateUserLocal({ subscriptionEnd: isoDate });
            showNotification('success', `Estendido por ${days} dias`);
        } catch (e) { showNotification('error', "Erro ao salvar"); }
    };

    const renderTabButton = (id: typeof panelTab, label: string, icon: string) => (
        <button
            onClick={() => setPanelTab(id)}
            className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full
                ${panelTab === id
                    ? (darkMode ? 'bg-white/10 text-white font-bold' : 'bg-black text-white font-bold')
                    : (darkMode ? 'text-gray-500 hover:bg-white/5 hover:text-gray-300' : 'text-gray-500 hover:bg-gray-100 hover:text-black')
                }
            `}
        >
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                ${panelTab === id
                    ? (darkMode ? 'bg-white/20 text-white' : 'bg-white/20 text-white')
                    : 'bg-transparent text-current opacity-70 group-hover:opacity-100'
                }
            `}>
                <i className={`fas ${icon} text-sm`}></i>
            </div>
            <span className="text-sm font-medium tracking-wide">{label}</span>
            {panelTab === id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 hidden md:block animate-pulse"></div>
            )}
        </button>
    );

    const renderMobileTab = (id: typeof panelTab, label: string, icon: string) => (
        <button
            onClick={() => setPanelTab(id)}
            className={`
                min-w-fit px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all border
                ${panelTab === id
                    ? (darkMode ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                    : (darkMode ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-gray-50 text-gray-500 border-gray-200')
                }
            `}
        >
            <i className={`fas ${icon}`}></i>
            {label}
        </button>
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 lg:p-8">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity animate-fadeIn" onClick={onClose}></div>

            <div className={`
                relative z-10 w-full h-full md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-scaleIn
                ${darkMode ? 'bg-[#0F0F0F] ring-1 ring-white/10' : 'bg-white'}
                max-w-[1400px] max-h-[900px] md:h-[90vh]
            `}>

                {/* --- LEFT SIDEBAR (Desktop) --- */}
                <div className={`hidden md:flex w-[280px] flex-col border-r ${darkMode ? 'border-white/5 bg-[#0A0A0A]' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="p-8 pb-4">
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className={`w-28 h-28 rounded-full p-1 mb-4 ${darkMode ? 'bg-gradient-to-tr from-white/5 to-white/10 ring-1 ring-white/10' : 'bg-white shadow-sm'}`}>
                                    <img
                                        src={localUser.avatar || `https://ui-avatars.com/api/?name=${localUser.name}&background=random`}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div className={`absolute bottom-4 right-0 w-8 h-8 rounded-full flex items-center justify-center border-4 ${darkMode ? 'border-[#0A0A0A] bg-green-500' : 'border-gray-50 bg-green-500'}`}>
                                    <i className="fas fa-check text-white text-[10px]"></i>
                                </div>
                            </div>
                            <h2 className={`text-lg font-bold text-center leading-tight mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{localUser.name}</h2>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>{localUser.role}</span>
                        </div>
                    </div>

                    <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                        {renderTabButton('control', 'Perfil & Dados', 'fa-id-card')}
                        {renderTabButton('commercial', 'Comercial', 'fa-chart-line')}
                        {renderTabButton('permissions', 'Permissões', 'fa-shield-alt')}
                        {renderTabButton('audit', 'Auditoria', 'fa-history')}

                        {/* Stats Widget in Sidebar (Desktop) - WITH REAL DATA */}
                        {!isCreating && (
                            <div className="mt-8 pt-6 border-t border-dashed border-white/10">
                                <UserStatsPanel
                                    user={localUser}
                                    totalPosts={userStats.totalPosts}
                                    totalClicks={userStats.totalClicks}
                                    totalSpent={userStats.totalSpent}
                                    darkMode={darkMode}
                                />
                            </div>
                        )}
                    </div>

                    <div className={`p-4 mt-auto border-t ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
                        {canManageSecurity && (
                            <button
                                onClick={handleTriggerReset}
                                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'hover:bg-red-900/20 text-gray-500 hover:text-red-500' : 'hover:bg-red-50 text-gray-500 hover:text-red-500'}`}
                            >
                                <i className="fas fa-key"></i> Resetar Senha
                            </button>
                        )}
                    </div>
                </div>

                {/* --- MOBILE HEADER (Sticky) --- */}
                <div className={`md:hidden shrink-0 flex flex-col border-b sticky top-0 z-20 ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between p-4">
                        <h2 className={`text-lg font-black uppercase italic tracking-tighter ${darkMode ? 'text-white' : 'text-black'}`}>Editar <span className="text-red-600">Perfil</span></h2>
                        <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-black'}`}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <div className="px-4 pb-4 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
                        {renderMobileTab('control', 'Perfil', 'fa-id-card')}
                        {renderMobileTab('commercial', 'Comercial', 'fa-chart-line')}
                        {renderMobileTab('permissions', 'Perm.,', 'fa-shield-alt')}
                        {renderMobileTab('audit', 'Logs', 'fa-history')}
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className={`flex-1 flex flex-col relative overflow-hidden ${darkMode ? 'bg-[#0F0F0F]' : 'bg-white'}`}>
                    <button
                        onClick={onClose}
                        className={`hidden md:flex absolute top-6 right-6 z-50 w-10 h-10 rounded-full items-center justify-center transition-all hover:scale-110 ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-black'}`}
                    >
                        <i className="fas fa-times text-sm"></i>
                    </button>

                    {notification && (
                        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-slideDown ${notification.type === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                            <i className={`fas ${notification.type === 'success' ? 'fa-check' : 'fa-exclamation'} font-bold`}></i>
                            <span className="text-xs font-bold uppercase tracking-wide">{notification.message}</span>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12">
                        <div className="max-w-4xl mx-auto pb-20">
                            {panelTab === 'control' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Stats removido daqui para limpar a tela, agora fica no Sidebar no desktop ou na aba comercial se desejar */}
                                    <UserProfilePanel
                                        user={localUser}
                                        isCreating={isCreating}
                                        newUserPassword={newUserPassword}
                                        onUpdateUser={onUpdateUserLocal}
                                        onUpdatePassword={onUpdatePassword}
                                        onSave={onSaveUser}
                                        onToggleStatus={onToggleStatus}
                                        onDelete={onDeleteUser}
                                        darkMode={darkMode}
                                    />
                                </div>
                            )}

                            {panelTab === 'commercial' && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Mobile Only Stats Widget could go here */}
                                    <div className="md:hidden mb-6">
                                        <UserStatsPanel
                                            user={localUser}
                                            totalPosts={userStats.totalPosts}
                                            totalClicks={userStats.totalClicks}
                                            totalSpent={userStats.totalSpent}
                                            darkMode={darkMode}
                                        />
                                    </div>

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
                                </div>
                            )}

                            {panelTab === 'permissions' && (
                                <UserPermissionsPanel
                                    permissions={permissionsState}
                                    userRole={user.role}
                                    onTogglePermission={(key) => setPermissionsState(prev => ({ ...prev, [key]: !prev[key] }))}
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

            </div>
        </div>,
        document.body
    );
};

export default UserDetailModal;
