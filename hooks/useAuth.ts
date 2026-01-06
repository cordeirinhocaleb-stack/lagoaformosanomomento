import { useCallback } from 'react';
import { User } from '../types';
import { getSupabase, checkEmailExists as checkEmailService } from '../services/supabaseService';

/**
 * Hook para centralizar lógica de autenticação
 * Responsável por login, logout, cadastro e validações
 */

interface UseAuthParams {
    user: User | null;
    setUser: (user: User | null) => void;
    users: User[];
    setView: (view: string) => void;
    updateHash: (hash: string) => void;
    setShowLoginModal: (show: boolean) => void;
    setShowRoleSelector: (show: boolean) => void;
    setPendingManualEmail: (email: string | null) => void;
}

export const useAuth = ({
    user,
    setUser,
    users,
    setView,
    updateHash,
    setShowLoginModal,
    setShowRoleSelector,
    setPendingManualEmail,
}: UseAuthParams) => {

    /**
     * Logout completo do usuário
     * Limpa estado local e força reload da aplicação
     */
    const handleLogout = useCallback(async () => {
        // Sign out from Supabase first
        const supabase = getSupabase();
        if (supabase) {
            try {
                await supabase.auth.signOut();
            } catch (e) {
                console.warn('⚠️ Erro ao fazer signOut no Supabase:', e);
            }
        }

        // Clear local state immediately (works offline)
        setUser(null);
        localStorage.removeItem('lfnm_user');
        sessionStorage.removeItem('lfnm_user');

        // CRITICAL: Reset initialization state to allow re-login
        // This forces the app to re-initialize when user logs in again
        window.location.reload();
    }, [setUser]);

    /**
     * Processa login bem-sucedido
     * Fecha modal, salva usuário e navega para área apropriada
     */
    const handleLogin = useCallback((
        loggedUser: User,
        remember: boolean,
        onClose?: () => void
    ) => {
        console.log('✅ Login bem-sucedido:', loggedUser.name);

        // Close modal FIRST
        if (onClose) onClose();
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
    }, [setUser, setView, updateHash, setShowLoginModal]);

    /**
     * Inicia fluxo de cadastro manual
     * Abre seletor de role com email pendente
     */
    const handleSignupRequest = useCallback((email: string) => {
        setPendingManualEmail(email);
        setShowLoginModal(false);
        setShowRoleSelector(true);
    }, [setPendingManualEmail, setShowLoginModal, setShowRoleSelector]);

    /**
     * Verifica se email já existe no sistema
     * Checa localmente primeiro, depois no banco
     */
    const handleCheckEmail = useCallback(async (email: string): Promise<boolean> => {
        const localExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (localExists) return true;
        return await checkEmailService(email);
    }, [users]);

    return {
        handleLogout,
        handleLogin,
        handleSignupRequest,
        handleCheckEmail,
    };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
