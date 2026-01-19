'use client';

import React from 'react';
import AuthModalsContainer from './AuthModalsContainer';
import { WelcomeToast } from './WelcomeToast';
import ChangelogModal from './ChangelogModal';
import SessionExpiredModal from './SessionExpiredModal';
import ConfirmationModal from './ConfirmationModal';
import { ErrorModal } from './ErrorModal';
import PricingModal from './PricingModal';
import MyAccountModal from './MyAccountModal';
import ActivityToastHost from './ActivityToastHost';

interface GlobalModalsProps {
    modals: any;
    user: any;
    users: any;
    systemSettings: any;
    setUser: (user: any) => void;
    setUsers: (users: any) => void;
    setView: (view: string) => void;
    updateHash: (hash: string) => void;
    handleBackToHome: () => void;
    triggerErrorModal: (error: any, context?: string) => void;
    handleCloseChangelog: () => void;
    handleProfileUpdate: (updatedUser: any) => Promise<void>;
    handleLogout: () => void;
    adConfig: any;
    showSessionExpiredModal: boolean;
    setShowSessionExpiredModal: (show: boolean) => void;
    confirmationState: any;
    handleConfirm: () => void;
    handleCancel: () => void;
    errorModal: any;
    setErrorModal: React.Dispatch<React.SetStateAction<any>>;
}

export default function GlobalModals({
    modals,
    user,
    users,
    systemSettings,
    setUser,
    setUsers,
    setView,
    updateHash,
    handleBackToHome,
    triggerErrorModal,
    handleCloseChangelog,
    handleProfileUpdate,
    handleLogout,
    adConfig,
    showSessionExpiredModal,
    setShowSessionExpiredModal,
    confirmationState,
    handleConfirm,
    handleCancel,
    errorModal,
    setErrorModal
}: GlobalModalsProps) {
    return (
        <>
            {/* Global Modals Container */}
            <AuthModalsContainer
                modals={modals}
                user={user}
                users={users}
                systemSettings={systemSettings}
                setUser={setUser}
                setUsers={setUsers}
                setView={setView}
                updateHash={updateHash}
                handleBackToHome={handleBackToHome}
                triggerErrorModal={triggerErrorModal}
                onCheckEmail={async () => true}
            />
            <WelcomeToast />

            {/* Specific Modals */}
            {modals.showChangelog && (
                <ChangelogModal
                    isOpen={modals.showChangelog}
                    onClose={handleCloseChangelog}
                />
            )}

            {modals.showProfileModal && user && (
                <MyAccountModal
                    user={user}
                    onClose={() => modals.setShowProfileModal(false)}
                    onUpdateUser={handleProfileUpdate}
                    onLogout={handleLogout}
                    onOpenPricing={() => modals.setShowPricingModal(true)}
                    adConfig={adConfig}
                    onOpenTerms={() => { /* Implement Terms Modal if needed */ }}
                />
            )}

            {modals.showPricingModal && adConfig && (
                <PricingModal
                    config={adConfig}
                    user={user}
                    onClose={() => modals.setShowPricingModal(false)}
                    onSelectPlan={(planId) => {
                        console.log('Selected plan:', planId);
                        modals.setShowPricingModal(false);
                        modals.setShowLoginModal(true);
                    }}
                    onUpdateUser={setUser}
                />
            )}

            {showSessionExpiredModal && (
                <SessionExpiredModal
                    onClose={() => setShowSessionExpiredModal(false)}
                />
            )}

            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                variant={confirmationState.variant}
                type={confirmationState.type}
                confirmText={confirmationState.confirmText}
                cancelText={confirmationState.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />

            <ErrorModal
                isOpen={errorModal.open}
                title={errorModal.context}
                message={errorModal.error instanceof Error ? errorModal.error.message : String(errorModal.error)}
                severity={errorModal.severity}
                onClose={() => setErrorModal((prev: any) => ({ ...prev, open: false }))}
            />

            <ActivityToastHost />
        </>
    );
}
