import { useState, useCallback } from 'react';

export const useAppConfirmation = () => {
    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'danger' | 'warning' | 'info' | 'success';
        type?: 'confirm' | 'alert';
        confirmText?: string;
        cancelText?: string;
        resolve?: (value: boolean) => void;
    }>({ isOpen: false, title: '', message: '', variant: 'warning', type: 'confirm' });

    const requestConfirmation = useCallback((options: {
        title: string;
        message: string;
        variant?: 'danger' | 'warning' | 'info' | 'success';
        confirmText?: string;
        cancelText?: string;
        type?: 'confirm' | 'alert';
    }): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmationState({
                isOpen: true,
                title: options.title,
                message: options.message,
                variant: options.variant || 'warning',
                type: options.type || 'confirm',
                confirmText: options.confirmText,
                cancelText: options.cancelText,
                resolve
            });
        });
    }, []);

    const requestAlert = useCallback((title: string, message: string, variant: 'danger' | 'warning' | 'info' | 'success' = 'info') => {
        return requestConfirmation({ title, message, variant, type: 'alert', confirmText: 'OK' });
    }, [requestConfirmation]);

    const handleConfirm = useCallback(() => {
        confirmationState.resolve?.(true);
        setConfirmationState(prev => ({ ...prev, isOpen: false, resolve: undefined }));
    }, [confirmationState]);

    const handleCancel = useCallback(() => {
        confirmationState.resolve?.(false);
        setConfirmationState(prev => ({ ...prev, isOpen: false, resolve: undefined }));
    }, [confirmationState]);

    return {
        confirmationState,
        requestConfirmation,
        requestAlert,
        handleConfirm,
        handleCancel
    };
};
