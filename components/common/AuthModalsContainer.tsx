import React from 'react';
import Login from '../Login';
import RoleSelectionModal from '../RoleSelectionModal';
import AccessDeniedModal from './AccessDeniedModal';
import SuccessModal from './SuccessModal';
import { User, SystemSettings } from '../../types';
import { getSupabase, createUser } from '../../services/supabaseService';
import { UseModalsReturn } from '../../hooks/useModals';

/**
 * Container que agrupa todos os modais relacionados à autenticação
 * Isola lógica complexa de cadastro e login do App.tsx principal
 */

interface AuthModalsContainerProps {
    modals: UseModalsReturn;
    user: User | null;
    users: User[];
    systemSettings: SystemSettings;
    setUser: (user: User | null) => void;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setView: (view: string) => void;
    updateHash: (hash: string) => void;
    handleBackToHome: () => void;
    triggerErrorModal: (error: any, context?: string, severity?: 'info' | 'warning' | 'critical') => void;
    onCheckEmail: (email: string) => Promise<boolean>;
}

const AuthModalsContainer: React.FC<AuthModalsContainerProps> = ({
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
    onCheckEmail,
}) => {
    const {
        showLoginModal,
        showRoleSelector,
        showAccessDenied,
        showSuccessModal,
        pendingGoogleUser,
        pendingManualEmail,
        accessDeniedConfig,
        successMessage,
        setShowLoginModal,
        setShowRoleSelector,
        setShowAccessDenied,
        setShowSuccessModal,
        setPendingGoogleUser,
        setPendingManualEmail,
        setSuccessMessage,
    } = modals;

    /**
     * Handler para seleção de role no cadastro
     * Processa tanto cadastro manual quanto social (Google)
     */
    const handleRoleSelect = async (role: string, data: any) => {
        const sb = getSupabase();
        if (!sb) return;

        try {
            // CADASTRO MANUAL (Email/Senha)
            if (!pendingGoogleUser) {
                const { data: authData, error: authError } = await sb.auth.signUp({
                    email: pendingManualEmail!,
                    password: data.password,
                    options: { data: { full_name: data.username } },
                });

                if (authError) throw authError;

                if (authData.user) {
                    const newUser = {
                        id: authData.user.id,
                        name: data.username,
                        email: pendingManualEmail!,
                        role,
                        status: 'active',
                        phone: data.phone || null,
                        city: data.city || null,
                        state: data.state || null,
                        zipCode: data.zipCode || null,
                        street: data.street || null,
                        number: data.number || null,
                        birthDate: data.birthDate || null,
                        document: data.document || null,
                        profession: data.profession || null,
                        education: data.education || null,
                        availability: data.availability || null,
                        companyName: data.companyName || null,
                        businessType: data.businessType || null,
                        hasSocialMedia: data.hasSocialMedia || false,
                        socialMediaLink: data.socialMediaLink || null,
                    };

                    await createUser(newUser as any);

                    // Limpeza de cache de cadastro
                    localStorage.removeItem('lfnm_registration_backup');

                    alert('Cadastro pré-aprovado! Verifique seu e-mail.');
                    setShowRoleSelector(false);
                    setShowLoginModal(true);
                }
            }
            // CADASTRO SOCIAL (Google)
            else {
                const newUser = {
                    id: pendingGoogleUser.id,
                    name: data.username,
                    email: pendingGoogleUser.email,
                    role,
                    status: 'active',
                    phone: data.phone || null,
                    city: data.city || null,
                    state: data.state || null,
                    zipCode: data.zipCode || null,
                    street: data.street || null,
                    number: data.number || null,
                    birthDate: data.birthDate || null,
                    document: data.document || null,
                    profession: data.profession || null,
                    education: data.education || null,
                    availability: data.availability || null,
                    companyName: data.companyName || null,
                    businessType: data.businessType || null,
                    hasSocialMedia: data.hasSocialMedia || false,
                    socialMediaLink: data.socialMediaLink || null,
                };

                // CRITICAL: Await DB creation BEFORE setting local state
                await createUser(newUser as any);

                // If we get here, DB insert succeeded
                setUser(newUser as any);
                localStorage.setItem('lfnm_user', JSON.stringify(newUser));

                // Limpeza de cache de cadastro
                localStorage.removeItem('lfnm_registration_backup');

                setShowRoleSelector(false);
                setPendingGoogleUser(null);

                if (role !== 'Leitor') {
                    setView('admin');
                    updateHash('/admin');
                }
            }
        } catch (e: any) {
            // FALLBACK DE RESILIÊNCIA
            console.warn('⚠️ Falha ao salvar dados completos. Tentando salvamento básico...', e);

            try {
                const basicUser = {
                    id: pendingGoogleUser
                        ? pendingGoogleUser.id
                        : (await sb.auth.getUser()).data.user?.id,
                    name: data.username,
                    email: pendingGoogleUser ? pendingGoogleUser.email : pendingManualEmail,
                    role,
                    status: 'active',
                    phone: data.phone, // Alguns campos básicos podem já existir
                };

                if (!basicUser.id || !basicUser.email) {
                    throw new Error('ID ou Email não identificados para fallback.');
                }

                await createUser(basicUser as any);

                const successMsg =
                    'Cadastro realizado! Alguns dados complementares foram salvos localmente e serão sincronizados em breve.';

                // Se funcionou o básico, atualiza estado local e avisa
                if (pendingGoogleUser) {
                    setSuccessMessage(successMsg);
                    setShowSuccessModal(true);
                    setShowRoleSelector(false);
                } else {
                    setUser(basicUser as any);
                    localStorage.setItem('lfnm_user', JSON.stringify(basicUser));
                    setSuccessMessage(successMsg);
                    setShowSuccessModal(true);
                    setShowRoleSelector(false);
                    setPendingGoogleUser(null);

                    if (role !== 'Leitor') {
                        setView('admin');
                        updateHash('/admin');
                    }
                }
            } catch (retryError: any) {
                console.error('❌ Falha crítica no cadastro:', retryError);
                triggerErrorModal(
                    retryError,
                    'Cadastro de Usuário - Falha Crítica RLS/Schema',
                    'critical' // Explicitly mark as critical
                );
                alert(
                    'Erro crítico ao finalizar cadastro: ' +
                    (retryError.message || e.message) +
                    '. Um relatório foi gerado.'
                );
            }
        }
    };

    /**
     * Handler para login bem-sucedido
     */
    const handleLoginSuccess = (loggedUser: User, remember: boolean) => {
        console.log('✅ Login bem-sucedido:', loggedUser.name);

        // Close modal FIRST
        setShowLoginModal(false);

        // Set user
        setUser(loggedUser);

        // Store user based on remember preference
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('lfnm_user', JSON.stringify(loggedUser));

        // Navigate after a small delay to ensure modal closes
        setTimeout(() => {
            if (loggedUser.role !== 'Leitor') {
                setView('admin');
                updateHash('/admin');
            } else {
                setView('home');
            }
        }, 100);
    };

    /**
     * Handler para solicitação de cadastro
     */
    const handleSignupRequest = (email: string) => {
        setPendingManualEmail(email);
        setShowLoginModal(false);
        setShowRoleSelector(true);
    };

    return (
        <>
            {/* Role Selection Modal */}
            {showRoleSelector && (pendingGoogleUser || pendingManualEmail) && (
                <RoleSelectionModal
                    userName={pendingGoogleUser?.user_metadata?.full_name || ''}
                    userAvatar={pendingGoogleUser?.user_metadata?.avatar_url}
                    email={pendingGoogleUser?.email || pendingManualEmail || ''}
                    isSocialLogin={!!pendingGoogleUser}
                    onSelect={handleRoleSelect}
                    onCancel={() => setShowRoleSelector(false)}
                />
            )}

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                message={successMessage}
                onClose={() => {
                    setShowSuccessModal(false);
                    if (!localStorage.getItem('lfnm_user')) {
                        setShowLoginModal(true);
                    }
                }}
            />

            {/* Access Denied Modal */}
            <AccessDeniedModal
                visible={showAccessDenied}
                title={accessDeniedConfig?.title}
                message={accessDeniedConfig?.message}
                onClose={() => setShowAccessDenied(false)}
                onHomeClick={() => {
                    setShowAccessDenied(false);
                    handleBackToHome();
                }}
            />

            {/* Login Modal */}
            {showLoginModal && (
                <Login
                    onLogin={handleLoginSuccess}
                    onSignupRequest={handleSignupRequest}
                    onClose={() => setShowLoginModal(false)}
                    disableSignup={!systemSettings.registrationEnabled}
                />
            )}
        </>
    );
};

export default AuthModalsContainer;
