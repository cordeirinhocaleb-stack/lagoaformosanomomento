import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/services/core/debugLogger';
import { User, SystemSettings, AppView } from '@/types';

interface UseAppErrorHandlerParams {
    setView: (view: AppView) => void;
    user: User | null;
    setUser: (user: User | null) => void;
}

export const useAppErrorHandler = ({ setView, user, setUser }: UseAppErrorHandlerParams) => {
    const [errorModal, setErrorModal] = useState<{
        open: boolean;
        error: unknown;
        context: string;
        severity: 'info' | 'warning' | 'critical'
    }>({ open: false, error: null, context: '', severity: 'critical' });

    const [fatalError, setFatalError] = useState<{ error: unknown; stack: string } | null>(null);

    const triggerErrorModal = useCallback((error: unknown, context: string = 'System Error', severity: 'info' | 'warning' | 'critical' = 'critical') => {
        if (severity === 'critical') {
            logger.error(`🛡️ CRITICAL ERROR[${context}]: `, error);
            if (context === 'Inicialização' || context === 'Window Error') {
                setFatalError({ error, stack: (error as Error)?.stack || 'No stack available' });
                setView('error');
                return;
            }
        } else {
            logger.warn(`🛡️ Warning[${context}]: `, error);
        }

        const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname.includes('webgho.com');
        if (isProduction && severity !== 'critical') {
            return;
        }

        setErrorModal({ open: true, error, context, severity });
    }, [setView]);

    useEffect(() => {
        const globalErrorHandler = (e: ErrorEvent) => triggerErrorModal(e.error, 'Window Error');
        const globalRejectionHandler = (e: PromiseRejectionEvent) => {
            const reason = e.reason?.toString() || '';
            if (reason.includes('AuthSessionMissingError') || reason.includes('AuthApiError: invalid_grant')) {
                logger.warn("⚠️ Sessão inválida. Assumindo estado deslogado.");
                if (user) { setUser(null); }
                return;
            }
            triggerErrorModal(e.reason, 'Promise Rejection');
        };

        window.addEventListener('error', globalErrorHandler);
        window.addEventListener('unhandledrejection', globalRejectionHandler);

        return () => {
            window.removeEventListener('error', globalErrorHandler);
            window.removeEventListener('unhandledrejection', globalRejectionHandler);
        };
    }, [triggerErrorModal, user, setUser]);

    return {
        errorModal,
        setErrorModal,
        fatalError,
        setFatalError,
        triggerErrorModal
    };
};
