'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAppController } from '@/hooks/useAppController';

// Criamos o contexto com um valor inicial indefinido
const AppControllerContext = createContext<ReturnType<typeof useAppController> | undefined>(undefined);

import GlobalModals from '@/components/common/GlobalModals';

export const AppControllerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const controller = useAppController();

    return (
        <AppControllerContext.Provider value={controller}>
            <GlobalModals
                modals={controller.modals}
                user={controller.user}
                users={controller.users}
                systemSettings={controller.systemSettings}
                setUser={controller.setUser}
                setUsers={controller.setUsers}
                setView={(v) => controller.setView(v as any)}
                updateHash={controller.updateHash}
                handleBackToHome={controller.handleBackToHome}
                triggerErrorModal={controller.triggerErrorModal}
                handleCloseChangelog={controller.handleCloseChangelog}
                handleProfileUpdate={controller.handleProfileUpdate}
                handleLogout={controller.handleLogout}
                adConfig={controller.adConfig}
                showSessionExpiredModal={controller.showSessionExpiredModal}
                setShowSessionExpiredModal={controller.setShowSessionExpiredModal}
                confirmationState={controller.modals.confirmationState}
                handleConfirm={() => { }}
                handleCancel={() => { }}
                errorModal={controller.errorModal}
                setErrorModal={controller.setErrorModal}
            />
            {children}
        </AppControllerContext.Provider>
    );
};

export const useAppControllerContext = () => {
    const context = useContext(AppControllerContext);
    if (context === undefined) {
        throw new Error('useAppControllerContext must be used within an AppControllerProvider');
    }
    return context;
};
