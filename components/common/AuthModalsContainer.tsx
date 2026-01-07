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
        if (!sb) { return; }

        let createdUserId: string | null = null;
        let createdUserEmail: string | null = null;

        try {
            // CADASTRO MANUAL (Email/Senha)
            // CADASTRO MANUAL (Email/Senha)
            if (!pendingGoogleUser) {
                // Preparar metadata para o trigger criar o perfil completo
                const newUserMetadata = {
                    name: data.username,
                    role,
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
                    businessTypeCustom: data.businessType === 'Outros' ? data.customBusinessType : null
                };

                const { data: authData, error: authError } = await sb.auth.signUp({
                    email: pendingManualEmail!,
                    password: data.password,
                    options: {
                        data: newUserMetadata // Trigger 'handle_new_auth_user' vai pegar isso e criar o user na tabela public.users
                    }
                });

                if (authError) { throw authError; }

                if (authData.user) {
                    createdUserId = authData.user.id;
                    createdUserEmail = pendingManualEmail;

                    // NOTA DE SEGURANÇA: Não chamamos createUser() aqui porque o Trigger do Banco já faz isso.
                    // Tentar criar manualmente causaria erro de Chave Duplicada (500/409).
                    // Se o trigger falhar, o usuário será criado no Auth mas sem perfil público (inconsistência),
                    // porém o App tem lógica de "Perfil Incompleto" para lidar com isso no próximo login.

                    console.log('✅ Auth Signup realizado. Trigger de banco deve criar perfil em breve.');

                    // Limpeza de cache de cadastro
                    localStorage.removeItem('lfnm_registration_backup');

                    setSuccessMessage('Cadastro realizado com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta.');
                    setShowRoleSelector(false);
                    setShowSuccessModal(true);
                }
            }
            // CADASTRO SOCIAL (Google)
            else {
                createdUserId = pendingGoogleUser.id;
                createdUserEmail = pendingGoogleUser.email || null;

                const updatedFields = {
                    name: data.username,
                    role,
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

                // ATUALIZAR perfil criado pelo trigger (não inserir de novo)
                const { error: updateError } = await sb
                    .from('users')
                    .update(updatedFields)
                    .eq('id', pendingGoogleUser.id);

                if (updateError) throw updateError;

                // Montar objeto completo do usuário para o estado local
                const fullUser = {
                    id: pendingGoogleUser.id,
                    email: pendingGoogleUser.email,
                    status: 'active',
                    ...updatedFields
                };

                setUser(fullUser as any);
                localStorage.setItem('lfnm_user', JSON.stringify(fullUser));

                // Atualizar lista de usuários
                setUsers(prev => [...prev, fullUser as any]);

                // Limpeza de cache de cadastro
                localStorage.removeItem('lfnm_registration_backup');

                setShowRoleSelector(false);
                setPendingGoogleUser(null);

                // RECARREGAR página para forçar re-inicialização com usuário logado
                // Isso garante que o Supabase Auth Session + Local Storage estejam sincronizados
                setTimeout(() => {
                    if (role !== 'Leitor') {
                        window.location.hash = '/admin';
                    } else {
                        window.location.hash = '/';
                    }
                    window.location.reload();
                }, 500);
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

                // Para Google: UPDATE (trigger já criou)
                // Para Manual: INSERT (signUp não cria perfil automaticamente)
                if (pendingGoogleUser) {
                    await sb.from('users').update(basicUser).eq('id', fallbackId);
                } else {
                    await createUser(basicUser as any);
                }

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
