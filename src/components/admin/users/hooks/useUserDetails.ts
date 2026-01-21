import { useState, useEffect, useCallback } from 'react';
import { User, AuditLog, checkPermission } from '@/types';
import {
    getAuditLogs,
    resendActivationEmail,
    triggerPasswordResetByAdmin,
    logAction,
    updateUser
} from '@/services/supabaseService';

interface UseUserDetailsProps {
    user: User;
    currentUser: User;
    onUpdateUserLocal: (updates: Partial<User>) => void;
}

export const useUserDetails = ({
    user,
    currentUser,
    onUpdateUserLocal
}: UseUserDetailsProps) => {
    const [panelTab, setPanelTab] = useState<'control' | 'commercial' | 'permissions' | 'audit'>('control');
    const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});
    const [localUser, setLocalUser] = useState<User>(user);

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
            const { getSupabase } = await import('@/services/supabaseService');
            const { mapDbToUser } = await import('@/services/users/userService');


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
            showNotification('error', "Erro ao ativar: " + (error instanceof Error ? error.message : String(error)) || 'Desconhecido');
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
        } catch (err: unknown) {
            console.error("Erro ao estender assinatura:", err);
            showNotification('error', "Erro ao salvar no banco.");
        }
    };

    const togglePermission = (key: string) => {
        setPermissionsState(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return {
        states: {
            panelTab,
            setPanelTab,
            permissionsState,
            setPermissionsState,
            localUser,
            auditLogs,
            isLoadingLogs,
            isProcessingMail,
            notification,
            canEditPlan,
            canManageSecurity
        },
        actions: {
            handleManualActivate,
            handleResendActivation,
            handleTriggerReset,
            handleExtendSubscription,
            togglePermission,
            showNotification
        }
    };
};
