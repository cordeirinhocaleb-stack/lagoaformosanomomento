import { useState, useCallback } from 'react';

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

    const [errorModal, setErrorModal] = useState<ErrorModalState>({
        visible: false,
        error: null
    });

    const [accessDeniedConfig, setAccessDeniedConfig] = useState<AccessDeniedConfig | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [pendingGoogleUser, setPendingGoogleUser] = useState<unknown>(null);
    const [pendingManualEmail, setPendingManualEmail] = useState<string | null>(null);

    // Funções helper para mostrar modais com configuração
    const showError = useCallback((error: unknown, context: string = 'System Error') => {
        console.error(`🛡️ Capturado:`, error);
        setErrorModal({ visible: true, error, context });
    }, []);

    const hideError = useCallback(() => {
        setErrorModal(prev => ({ ...prev, visible: false }));
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

    return {
        // Estados
        showLoginModal,
        showProfileModal,
        showRoleSelector,
        showAccessDenied,
        showSuccessModal,
        showChangelog,
        showPricingModal,
        showTermsModal,
        errorModal,
        accessDeniedConfig,
        successMessage,
        pendingGoogleUser,
        pendingManualEmail,

        // Setters diretos (para compatibilidade)
        setShowLoginModal,
        setShowProfileModal,
        setShowRoleSelector,
        setShowAccessDenied,
        setShowSuccessModal,
        setShowChangelog,
        setShowPricingModal,
        setErrorModal,
        setAccessDeniedConfig,
        setSuccessMessage,
        setPendingGoogleUser,
        setPendingManualEmail,

        // Helper functions
        showError,
        hideError,
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
    };
};

export type UseModalsReturn = ReturnType<typeof useModals>;
