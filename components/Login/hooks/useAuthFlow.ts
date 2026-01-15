import { useState, useRef } from 'react';
import { User } from '../../../types';
import { logger as DebugLogger } from '../../../services/core/debugLogger';
import {
    getSupabase,
    getEmailByUsername,
    registerAuthFailure,
    resetAuthSecurity,
    checkAuthLockout,
    requestPasswordRecovery
} from '../../../services/supabaseService';
import { mapDbToUser } from '../../../services/users/userService'; // Import normalization helper
import { useLoginSecurity } from './useLoginSecurity';
import { translateAuthError } from '../../../utils/authErrors';

interface AuthFlowProps {
    onLogin: (user: User, remember: boolean) => void;
    onSignupRequest: (email: string) => void;
    onClose: () => void;
    security: ReturnType<typeof useLoginSecurity>; // Share security state/actions
}

export const useAuthFlow = ({ onLogin, onSignupRequest, onClose, security }: AuthFlowProps) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'recovery'>('login');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showResendButton, setShowResendButton] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const isMounted = useRef(true); // Should be passed or managed? Hook instance usually fine.

    // Welcome Message Helper
    const showWelcomeMessage = (userName: string) => {
        const welcomeToast = document.createElement('div');
        welcomeToast.style.cssText = `
            position: fixed; top: 24px; right: 24px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: white; padding: 24px 32px; border-radius: 20px; border-left: 5px solid #dc2626;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1); z-index: 10000;
            font-family: Inter, sans-serif; animation: slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: blur(10px); max-width: 420px; min-width: 320px;
        `;
        if (window.innerWidth < 640) { welcomeToast.style.cssText += `top: 16px; right: 16px; left: 16px; max-width: none; min-width: auto; padding: 20px 24px;`; }

        welcomeToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4); flex-shrink: 0;">👋</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 6px; line-height: 1.2;">Bem-vindo, <span style="color: #dc2626;">${userName}</span>!</div>
                    <div style="font-size: 13px; opacity: 0.7; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">Login realizado com sucesso</div>
                </div>
            </div>`;
        document.body.appendChild(welcomeToast);
        setTimeout(() => {
            welcomeToast.style.animation = 'slideOutRight 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.34)';
            setTimeout(() => welcomeToast.remove(), 600);
        }, 5000);
    };

    const handleGoogleLogin = async () => {
        if (security.lockoutExpiry) { return; }
        const supabase = getSupabase();
        if (!supabase) { return setErrorMessage("Serviço indisponível."); }
        setLoading(true);
        try {
            // SIMPLIFICAÇÃO MÁXIMA: Deixar o Supabase gerenciar o redirect automaticamente
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    skipBrowserRedirect: false,
                    queryParams: { prompt: 'select_account' }
                }
            });
            if (error) { setErrorMessage(translateAuthError(error.message)); }
        } catch (e: any) { setErrorMessage(translateAuthError(e.message)); }
        finally { setLoading(false); }
    };

    const handleRecoveryRequest = async (email: string) => {
        const targetEmail = email.trim().toLowerCase();
        if (!targetEmail.includes('@')) { return setErrorMessage("E-mail inválido."); }
        setLoading(true); setErrorMessage(null); setSuccessMessage(null);
        try {
            const res = await requestPasswordRecovery(targetEmail);
            if (res.success) {
                setSuccessMessage(res.message);
                setTimeout(() => { if (isMounted.current) { setMode('login'); } }, 6000);
            } else { setErrorMessage(res.message); }
        } catch (err: any) { setErrorMessage("Falha na comunicação com o servidor."); }
        finally { setLoading(false); }
    };

    const handleResendConfirmation = async (identifier: string) => {
        const supabase = getSupabase();
        if (!supabase) { return; }
        let targetEmail = identifier.trim();
        if (!targetEmail.includes('@')) {
            const found = await getEmailByUsername(targetEmail);
            if (found) { targetEmail = found; }
            else { setErrorMessage("E-mail não identificado."); return; }
        }
        try {
            const { error } = await supabase.auth.resend({ type: 'signup', email: targetEmail });
            if (error) { throw error; }
            setSuccessMessage(`LINK ENVIADO!`);
        } catch (err) { setErrorMessage("Falha ao reenviar."); }
    };

    const handleLoginSubmit = async (identifier: string, password: string, captchaToken?: string) => {
        if (loading || security.lockoutExpiry) { return; }
        const cleanIdentifier = identifier.trim();
        const cleanPassword = password.trim();
        setLoading(true); setErrorMessage(null); setSuccessMessage(null);
        DebugLogger.log('[Login] 🟢 Login attempt:', { email: cleanIdentifier, hasCaptcha: !!captchaToken });

        const safetyTimeout = setTimeout(() => {
            if (loading) { setLoading(false); setErrorMessage("Tempo limite excedido."); }
        }, 15000);

        const supabase = getSupabase();
        if (!supabase) { clearTimeout(safetyTimeout); setErrorMessage("Erro de servidor."); setLoading(false); return; }

        try {
            let finalEmail = cleanIdentifier;
            if (!cleanIdentifier.includes('@')) {
                const foundEmail = await getEmailByUsername(cleanIdentifier);
                if (!foundEmail) { setLoading(false); throw new Error("Credenciais inválidas."); }
                finalEmail = foundEmail;
            }

            // Lockout Check
            try {
                const dbLock: any = await checkAuthLockout(finalEmail);
                if (dbLock && dbLock.isLocked) {
                    security.saveSecurityState(new Date(Date.now() + dbLock.secondsRemaining * 1000).toISOString(), 5);
                    throw new Error(`Acesso bloqueado por segurança.`);
                }
            } catch (e: any) { if (e.message.includes('Acesso bloqueado')) { throw e; } }

            const { data, error }: any = await supabase.auth.signInWithPassword({
                email: finalEmail,
                password: cleanPassword,
                options: {
                    captchaToken
                }
            });
            if (error) {
                const sec = await registerAuthFailure(finalEmail);
                security.saveSecurityState(sec.lockoutUntil, sec.attempts);
                if (error.message.includes('Email not confirmed')) { setErrorMessage("CONTA NÃO ATIVADA!"); setShowResendButton(true); }
                else if (sec.lockoutUntil) { throw new Error(`Tentativas excedidas. Bloqueado.`); }
                else if (error.message.includes('invalid login credentials') || error.message.includes('Invalid login credentials')) {
                    throw new Error(`Senha ou usuário incorretos.`);
                }
                else { throw error; }
            } else if (data.user) {
                localStorage.removeItem('lfnm_login_security');
                await resetAuthSecurity(finalEmail);
                const { data: profile } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();

                // Trigger automático agora cria o usuário, apenas verificamos se existe
                if (profile) {
                    const user = mapDbToUser(profile); // Normalize data
                    if (user) {
                        onLogin(user, rememberMe);
                        setTimeout(() => { showWelcomeMessage(user.name); sessionStorage.removeItem('lfnm_login_temp'); onClose(); }, 300);
                    } else {
                        setErrorMessage("Falha ao carregar perfil.");
                    }
                } else {
                    // SE O PERFIL NÃO EXISTE MAS O AUTH SIM:
                    // Enviamos para o RoleSelectionModal em vez de dar erro.
                    // Isso recupera usuários "zumbis" que saíram antes de terminar o cadastro.
                    console.warn('⚠️ Perfil não encontrado para conta existente. Redirecionando para completar cadastro.'); // eslint-disable-line no-console
                    onSignupRequest(finalEmail);
                    onClose();
                }
            }
        } catch (error: any) {
            setErrorMessage(translateAuthError(error.message || "Erro na autenticação."));
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    };

    const handleSignupSubmit = async (email: string, _captchaToken?: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.includes('@')) { return setErrorMessage("E-mail inválido."); }
        setLoading(true); setErrorMessage(null);
        try {
            if (loading) { await new Promise(r => setTimeout(r, 600)); }
            const existing = await getEmailByUsername(cleanEmail);
            if (existing) { setErrorMessage("E-MAIL JÁ CADASTRADO!"); setLoading(false); return; }
            onSignupRequest(cleanEmail);
            setTimeout(() => setLoading(false), 2000);
        } catch (err: any) { setErrorMessage(translateAuthError(err.message)); setLoading(false); }
    };

    return {
        mode, setMode,
        loading,
        errorMessage, setErrorMessage,
        successMessage, setSuccessMessage,
        showResendButton,
        rememberMe, setRememberMe,
        handleGoogleLogin,
        handleRecoveryRequest,
        handleResendConfirmation,
        handleLoginSubmit,
        handleSignupSubmit
    };
};
