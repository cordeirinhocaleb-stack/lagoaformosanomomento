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

        let createdUserId: string | null = null;
        let createdUserEmail: string | null = null;

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
                    createdUserId = authData.user.id;
                    createdUserEmail = pendingManualEmail;

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

                    try {
                        await createUser(newUser as any);
                    } catch (dbError) {
                        // Se falhar o insert no banco (RLS por falta de sessão ativa), ignoramos.
                        // O Self-Healing no Login cuidará disso quando o usuário confirmar o email e logar.
                        console.warn('⚠️ Cadastro Auth OK, mas Perfil falhou (provável RLS/EmailCheck):', dbError);
                        if (!authData.session) {
                            console.log('ℹ️ Sem sessão ativa. Fluxo de verificação de email assumido.');
                        } else {
                            // Se tinha sessão e falhou, rethrow para cair no fallback
                            throw dbError;
                        }
                    }

                    // Limpeza de cache de cadastro
                    localStorage.removeItem('lfnm_registration_backup');

                    setSuccessMessage('Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.');
                    setShowRoleSelector(false);
                    setShowSuccessModal(true);
                    // Login modal will be opened by SuccessModal onClose if needed
                }
            }
            // CADASTRO SOCIAL (Google)
            else {
                createdUserId = pendingGoogleUser.id;
                createdUserEmail = pendingGoogleUser.email || null;

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
                // Tenta recuperar ID do escopo anterior ou da sessão
                const fallbackId = createdUserId || (await sb.auth.getUser()).data.user?.id;
                const fallbackEmail = createdUserEmail || pendingGoogleUser?.email || pendingManualEmail;

                if (!fallbackId || !fallbackEmail) {
                    // Se ainda não temos ID (signup falhou totalmente), é um erro real de auth, não de perfil db
                    // Repassamos o erro original
                    throw e;
                }

                const basicUser = {
                    id: fallbackId,
                    name: data.username,
                    email: fallbackEmail,
                    role,
                    status: 'active',
                    phone: data.phone,
                };

                await createUser(basicUser as any);

                const successMsg =
                    'Cadastro realizado! Alguns dados complementares foram salvos localmente e serão sincronizados em breve.';

                // Se funcionou o básico, atualiza estado local e avisa
                if (pendingGoogleUser) {
                    setSuccessMessage(successMsg);
                    setShowSuccessModal(true);
                    setShowRoleSelector(false);
                } else {
                    // Manual Fallback Success
                    setSuccessMessage('Cadastro básico salvo. Verifique seu email para concluir a ativação.');
                    setShowRoleSelector(false);
                    setShowSuccessModal(true);
                }
            } catch (retryError: any) {
                console.error('❌ Falha crítica no cadastro:', retryError);
                triggerErrorModal(
                    retryError,
                    'Cadastro de Usuário - Falha Crítica RLS/Schema',
                    'critical'
                );
                alert(
                    'Erro ao processar cadastro: ' +
                    (retryError.message || e.message)
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
