'use client';

import React, { useState, useEffect } from 'react';
import AuthModalsContainer from './AuthModalsContainer';
import { WelcomeToast } from './WelcomeToast';
import ChangelogModal from './ChangelogModal';
import SessionExpiredModal from './SessionExpiredModal';
import ConfirmationModal from './ConfirmModal';
import ErrorModal from './ErrorAlertModal';
import PricingModal from './PricingModal';
import MyAccountModal from './MyAccountModal';
import ActivityToastHost from './ActivityToastHost';
import ComingSoonModal from './ComingSoonModal';
import AdvertiserInfoModal from '../home/popup/components/AdvertiserInfoModal';

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
    const [hasShownWelcome, setHasShownWelcome] = React.useState(false);

    // Reset welcome toast when user changes
    React.useEffect(() => {
        setHasShownWelcome(false);
    }, [user?.id]);

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
            {user && modals.showLoginModal === false && !hasShownWelcome && (
                <WelcomeToast
                    user={user}
                    onClose={() => setHasShownWelcome(true)}
                />
            )}

            {/* Specific Modals */}
            {modals.showChangelog && (
                <ChangelogModal
                    isOpen={modals.showChangelog}
                    onClose={handleCloseChangelog}
                    user={user}
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

            {(modals.confirmationState?.isOpen || confirmationState?.isOpen) && (
                <ConfirmationModal
                    isOpen={modals.confirmationState?.isOpen ?? confirmationState?.isOpen}
                    title={modals.confirmationState?.title ?? confirmationState?.title}
                    message={modals.confirmationState?.message ?? confirmationState?.message}
                    type={modals.confirmationState?.type ?? confirmationState?.type ?? 'warning'}
                    confirmText={modals.confirmationState?.confirmText ?? confirmationState?.confirmText}
                    cancelText={modals.confirmationState?.cancelText ?? confirmationState?.cancelText}
                    onConfirm={() => {
                        if (modals.confirmationState?.isOpen) {
                            modals.confirmationState.onConfirm();
                            modals.closeConfirm();
                        } else {
                            handleConfirm();
                        }
                    }}
                    onCancel={() => {
                        if (modals.confirmationState?.isOpen) {
                            modals.closeConfirm();
                        } else {
                            handleCancel();
                        }
                    }}
                />
            )}

            {errorModal.open && (
                <ErrorModal
                    error={errorModal.error}
                    context={errorModal.context}
                    severity={errorModal.severity}
                    onClose={() => setErrorModal((prev: any) => ({ ...prev, open: false }))}
                    onSendReport={async () => {
                        console.log('Report sent');
                        // Implementar envio real se houver endpoint
                    }}
                />
            )}

            {modals.showComingSoonModal && (
                <ComingSoonModal
                    isOpen={modals.showComingSoonModal}
                    onClose={() => modals.setShowComingSoonModal(false)}
                />
            )}

            {modals.showAdvertiserInfoModal && modals.selectedAdvertiserInfo && (
                <AdvertiserInfoModal
                    info={modals.selectedAdvertiserInfo}
                    onClose={modals.closeAdvertiserInfo}
                />
            )}

            <ActivityToastHost />
        </>
    );
}
