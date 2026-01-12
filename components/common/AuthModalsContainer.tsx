import React from 'react';
import { translateAuthError } from '../../utils/authErrors';
import Login from '../Login';
import RoleSelectionModal from '../RoleSelectionModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import AccessDeniedModal from './AccessDeniedModal';
import SuccessModal from './SuccessModal';
import { User, SystemSettings } from '../../types';
import { getSupabase, createUser, updateUser } from '../../services/supabaseService';
import { UseModalsReturn } from '../../hooks/useModals';

/**
 * Container que agrupa todos os modais relacionados à autenticação
 * Isola lógica complexa de cadastro e login do App.tsx principal
 */

interface GoogleUser {
    id: string;
    email?: string;
    user_metadata?: {
        full_name?: string;
        avatar_url?: string;
    };
}

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
        showTermsModal,
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

    const pendingGoogleUser = modals.pendingGoogleUser as GoogleUser | null;

    const [notice, setNotice] = React.useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
    const termsAutoOpenRef = React.useRef(false);

    // Reset auto-open ref when user logs out
    React.useEffect(() => {
        if (!user) {
            termsAutoOpenRef.current = false;
        }
    }, [user]);

    // Check for Terms Acceptance on Login/Load
    React.useEffect(() => {
        if (user) {
            const userId = user.id;
            const hasAcceptedLocally = localStorage.getItem(`lfnm_terms_accepted_${userId}`) === 'true';

            if (!user.termsAccepted && !hasAcceptedLocally && !termsAutoOpenRef.current) {
                termsAutoOpenRef.current = true;
                const timer = setTimeout(() => {
                    modals.openTermsModal();
                }, 1500); // Delay visual suave após login
                return () => clearTimeout(timer);
            }
        }
    }, [user?.id, user?.termsAccepted, modals.openTermsModal]);

    // Persistência do email de cadastro entre recarregamentos
    React.useEffect(() => {
        const savedEmail = localStorage.getItem('lfnm_pending_email');
        if (savedEmail && !pendingManualEmail) {
            setPendingManualEmail(savedEmail);
        }

        const savedGoogleUser = localStorage.getItem('lfnm_pending_google_user');
        if (savedGoogleUser && !pendingGoogleUser) {
            try {
                setPendingGoogleUser(JSON.parse(savedGoogleUser));
            } catch (e) { }
        }

        // Auto-retomada de cadastro pendente
        const registrationBackup = localStorage.getItem('lfnm_registration_backup');
        if (registrationBackup && !user && !showRoleSelector) {
            modals.setShowRoleSelector(true);
        }
    }, []);

    React.useEffect(() => {
        if (pendingManualEmail) {
            localStorage.setItem('lfnm_pending_email', pendingManualEmail);
        } else {
            localStorage.removeItem('lfnm_pending_email');
        }
    }, [pendingManualEmail]);

    React.useEffect(() => {
        if (pendingGoogleUser) {
            localStorage.setItem('lfnm_pending_google_user', JSON.stringify(pendingGoogleUser));
        } else {
            localStorage.removeItem('lfnm_pending_google_user');
        }
    }, [pendingGoogleUser, setPendingGoogleUser]);

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
                        data: newUserMetadata, // Trigger 'handle_new_auth_user' vai pegar isso e criar o user na tabela public.users
                        captchaToken: data.captchaToken
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
                    localStorage.removeItem('lfnm_pending_email');
                    localStorage.removeItem('lfnm_pending_google_user');

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

                if (updateError) { throw updateError; }

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
                localStorage.removeItem('lfnm_pending_email');
                localStorage.removeItem('lfnm_pending_google_user');

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

                if (!fallbackId || (!fallbackEmail && !pendingManualEmail)) {
                    // Se ainda não temos ID (signup falhou totalmente), é um erro real de auth
                    setNotice({
                        message: 'Erro na autenticação: ' + translateAuthError(e.message),
                        type: 'error'
                    });
                    return; // Interrompe para não cair no catch crítico abaixo
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
                setNotice({
                    message: 'Erro ao processar cadastro: ' + translateAuthError(retryError.message || e.message),
                    type: 'error'
                });
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
                    onOpenTerms={modals.openTermsModal}
                />
            )}

            <TermsOfServiceModal
                visible={modals.showTermsModal}
                onAccept={async () => {
                    if (user) {
                        const updatedUser = {
                            ...user,
                            termsAccepted: true,
                            termsAcceptedAt: new Date().toISOString()
                        };

                        // 1. Atualiza primeiro o estado local e cache para garantir fluidez na UI
                        // Mesmo que o banco falhe (ex: colunas faltando), o usuário não fica travado
                        try {
                            setUser(updatedUser);
                            localStorage.setItem('lfnm_user', JSON.stringify(updatedUser));
                            localStorage.setItem(`lfnm_terms_accepted_${user.id}`, 'true');
                        } catch (cacheErr) {
                            console.error("Erro ao salvar cache local:", cacheErr);
                        }

                        // 2. Tenta sincronizar com o banco de dados em background
                        try {
                            await updateUser(updatedUser);
                            console.log("✅ Termos sincronizados com sucesso no banco de dados.");
                            return true;
                        } catch (err: any) {
                            console.error("⚠️ Erro de sincronização:", err);
                            // Lançamos o erro para que o modal capture e mostre o ErrorAlertModal (padrão do site)
                            throw err;
                        }
                    }
                    return false;
                }}
                onDecline={() => {
                    modals.closeTermsModal();
                }}
                user={user}
                onError={triggerErrorModal}
            />

            {/* Premium Notice Modal Overlay */}
            {notice && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-slideUp text-center">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-3xl shadow-lg ${notice.type === 'error' ? 'bg-red-500 text-white shadow-red-500/30' :
                            notice.type === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/30' :
                                'bg-blue-500 text-white shadow-blue-500/30'
                            }`}>
                            <i className={`fas ${notice.type === 'error' ? 'fa-exclamation-circle' :
                                notice.type === 'warning' ? 'fa-exclamation-triangle' :
                                    'fa-info-circle'
                                }`}></i>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">
                            {notice.type === 'error' ? 'Ops! Erro' : notice.type === 'warning' ? 'Atenção' : 'Aviso'}
                        </h3>
                        <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
                            {notice.message}
                        </p>
                        <button
                            onClick={() => setNotice(null)}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuthModalsContainer;
