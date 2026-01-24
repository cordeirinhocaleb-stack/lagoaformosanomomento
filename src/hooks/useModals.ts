import { useState, useCallback, useMemo } from 'react';

/**
 * Hook para gerenciar todos os estados de modais da aplicação
 * Centraliza a lógica de abertura/fechamento e configuração de modais
 */

interface AccessDeniedConfig {
    title: string;
    message: string;
}

interface ErrorModalState {
    visible: boolean;
    error: unknown;
    context?: string;
}

interface ModalsState {
    showLoginModal: boolean;
    showProfileModal: boolean;
    showRoleSelector: boolean;
    showAccessDenied: boolean;
    showSuccessModal: boolean;
    showChangelog: boolean;
    showPricingModal: boolean;
    showTermsModal: boolean;
    showComingSoonModal: boolean;
    errorModal: ErrorModalState;
    accessDeniedConfig: AccessDeniedConfig | null;
    successMessage: string;
    pendingGoogleUser: unknown;
    pendingManualEmail: string | null;
}

export const useModals = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [showAccessDenied, setShowAccessDenied] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showComingSoonModal, setShowComingSoonModal] = useState(false);

    const [errorModal, setErrorModal] = useState<ErrorModalState>({
        visible: false,
        error: null
    });

    const [accessDeniedConfig, setAccessDeniedConfig] = useState<AccessDeniedConfig | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [pendingGoogleUser, setPendingGoogleUser] = useState<unknown>(null);
    const [pendingManualEmail, setPendingManualEmail] = useState<string | null>(null);

    // Confirmation State
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
        type?: 'danger' | 'warning' | 'info';
        confirmText?: string;
        cancelText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    // Funções helper para mostrar modais com configuração
    const showError = useCallback((error: unknown, context: string = 'System Error') => {
        console.error(`🛡️ Capturado:`, error);
        setErrorModal({ visible: true, error, context });
    }, []);

    const hideError = useCallback(() => {
        setErrorModal(prev => ({ ...prev, visible: false }));
    }, []);

    const showConfirm = useCallback((
        title: string,
        message: string,
        onConfirm: () => void,
        type: 'danger' | 'warning' | 'info' = 'warning',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar'
    ) => {
        setConfirmationState({
            isOpen: true,
            title,
            message,
            onConfirm,
            type,
            confirmText,
            cancelText
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const showAccessDeniedModal = useCallback((title: string, message: string) => {
        setAccessDeniedConfig({ title, message });
        setShowAccessDenied(true);
    }, []);

    const hideAccessDenied = useCallback(() => {
        setShowAccessDenied(false);
    }, []);

    const showSuccess = useCallback((message: string) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    }, []);

    const hideSuccess = useCallback(() => {
        setShowSuccessModal(false);
    }, []);

    const openLoginModal = useCallback(() => setShowLoginModal(true), []);
    const closeLoginModal = useCallback(() => setShowLoginModal(false), []);

    const openProfileModal = useCallback(() => setShowProfileModal(true), []);
    const closeProfileModal = useCallback(() => setShowProfileModal(false), []);

    const openRoleSelector = useCallback(() => setShowRoleSelector(true), []);
    const closeRoleSelector = useCallback(() => setShowRoleSelector(false), []);

    const openChangelog = useCallback(() => setShowChangelog(true), []);
    const closeChangelog = useCallback(() => setShowChangelog(false), []);

    const openPricingModal = useCallback(() => setShowPricingModal(true), []);
    const closePricingModal = useCallback(() => setShowPricingModal(false), []);

    const openTermsModal = useCallback(() => setShowTermsModal(true), []);
    const closeTermsModal = useCallback(() => setShowTermsModal(false), []);

    const openComingSoonModal = useCallback(() => setShowComingSoonModal(true), []);
    const closeComingSoonModal = useCallback(() => setShowComingSoonModal(false), []);

    return useMemo(() => ({
        // Estados
        showLoginModal,
        showProfileModal,
        showRoleSelector,
        showAccessDenied,
        showSuccessModal,
        showChangelog,
        showPricingModal,
        showTermsModal,
        showComingSoonModal,
        errorModal,
        accessDeniedConfig,
        successMessage,
        pendingGoogleUser,
        pendingManualEmail,
        confirmationState, // New

        // Setters diretos (para compatibilidade)
        setShowLoginModal,
        setShowProfileModal,
        setShowRoleSelector,
        setShowAccessDenied,
        setShowSuccessModal,
        setShowChangelog,
        setShowPricingModal,
        setShowComingSoonModal,
        setErrorModal,
        setAccessDeniedConfig,
        setSuccessMessage,
        setPendingGoogleUser,
        setPendingManualEmail,
        setConfirmationState, // New

        // Helper functions
        showError,
        hideError,
        showConfirm, // New
        closeConfirm, // New
        showAccessDeniedModal,
        hideAccessDenied,
        showSuccess,
        hideSuccess,
        openLoginModal,
        closeLoginModal,
        openProfileModal,
        closeProfileModal,
        openRoleSelector,
        closeRoleSelector,
        openChangelog,
        closeChangelog,
        openPricingModal,
        closePricingModal,
        openTermsModal,
        closeTermsModal,
        openComingSoonModal,
        closeComingSoonModal
    }), [
        showLoginModal, showProfileModal, showRoleSelector, showAccessDenied,
        showSuccessModal, showChangelog, showPricingModal, showTermsModal, showComingSoonModal,
        errorModal, accessDeniedConfig, successMessage, pendingGoogleUser,
        pendingManualEmail, confirmationState, // New
        showError, hideError, showConfirm, closeConfirm, showAccessDeniedModal,
        hideAccessDenied, showSuccess, hideSuccess, openLoginModal,
        closeLoginModal, openProfileModal, closeProfileModal, openRoleSelector,
        closeRoleSelector, openChangelog, closeChangelog, openPricingModal,
        closePricingModal, openTermsModal, closeTermsModal, openComingSoonModal,
        closeComingSoonModal
    ]);
};

export type UseModalsReturn = ReturnType<typeof useModals>;
