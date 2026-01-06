import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import Logo from '../components/common/Logo';
import { logger as DebugLogger } from '../services/core/debugLogger';
import {
    getSupabase,
    getEmailByUsername,
    registerAuthFailure,
    resetAuthSecurity,
    checkAuthLockout,
    requestPasswordRecovery
} from '../services/supabaseService';

interface LoginProps {
    onLogin: (user: User, remember: boolean) => void;
    onSignupRequest: (email: string) => void;
    onClose: () => void;
    disableSignup?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignupRequest, onClose, disableSignup = false }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'recovery'>('login');
    const [email, setEmail] = useState('');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showResendButton, setShowResendButton] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ESTADOS DE SEGURANÇA (BLOQUEIO PROGRESSIVO)
    const [lockoutExpiry, setLockoutExpiry] = useState<number | null>(null);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [attemptsMade, setAttemptsMade] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);  // Estado para "Lembrar-me"

    const isMounted = useRef(true);

    // Carrega status de segurança
    useEffect(() => {
        isMounted.current = true;
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        const savedSecurity = localStorage.getItem('lfnm_login_security');
        if (savedSecurity) {
            try {
                const { expiry, attempts } = JSON.parse(savedSecurity);
                const now = Date.now();
                if (expiry > now) {
                    setLockoutExpiry(expiry);
                    setSecondsRemaining(Math.ceil((expiry - now) / 1000));
                }
                if (attempts) setAttemptsMade(attempts);
            } catch (e) {
                localStorage.removeItem('lfnm_login_security');
            }
        }

        return () => {
            isMounted.current = false;
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // PERSISTÊNCIA DE FORMULÁRIO (F5)
    // Restaura dados salvos ao montar
    useEffect(() => {
        const savedData = sessionStorage.getItem('lfnm_login_temp');
        if (savedData) {
            try {
                const { pendingEmail, pendingIdentifier, pendingPassword, pendingMode } = JSON.parse(savedData);
                if (pendingEmail) setEmail(pendingEmail);
                if (pendingIdentifier) setLoginIdentifier(pendingIdentifier);
                if (pendingPassword) setPassword(pendingPassword); // Nota: SessionStorage é limpo ao fechar aba
                if (pendingMode) setMode(pendingMode);
            } catch (e) {
                console.warn('Erro ao restaurar form:', e);
            }
        }
    }, []);

    // Salva dados sempre que mudarem
    useEffect(() => {
        const dataToSave = {
            pendingEmail: email,
            pendingIdentifier: loginIdentifier,
            pendingPassword: password,
            pendingMode: mode
        };
        sessionStorage.setItem('lfnm_login_temp', JSON.stringify(dataToSave));
    }, [email, loginIdentifier, password, mode]);

    // Timer do Bloqueio
    useEffect(() => {
        if (!secondsRemaining) return;
        const timer = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 1) {
                    setLockoutExpiry(null);
                    setAttemptsMade(0);
                    localStorage.setItem('lfnm_login_security', JSON.stringify({ expiry: 0, attempts: 0 }));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsRemaining]);

    const showWelcomeMessage = (userName: string) => {
        const welcomeToast = document.createElement('div');
        welcomeToast.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            color: white;
            padding: 24px 32px;
            border-radius: 20px;
            border-left: 5px solid #dc2626;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
            z-index: 10000;
            font-family: Inter, sans-serif;
            animation: slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: blur(10px);
            max-width: 420px;
            min-width: 320px;
        `;

        // Responsividade mobile
        if (window.innerWidth < 640) {
            welcomeToast.style.cssText += `
                top: 16px;
                right: 16px;
                left: 16px;
                max-width: none;
                min-width: auto;
                padding: 20px 24px;
            `;
        }

        welcomeToast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
                    flex-shrink: 0;
                ">
                    👋
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="
                        font-size: 22px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: -0.5px;
                        margin-bottom: 6px;
                        line-height: 1.2;
                    ">
                        Bem-vindo, <span style="color: #dc2626;">${userName}</span>!
                    </div>
                    <div style="
                        font-size: 13px;
                        opacity: 0.7;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                    ">
                        Login realizado com sucesso
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(welcomeToast);

        // Aumenta tempo para 5 segundos
        setTimeout(() => {
            welcomeToast.style.animation = 'slideOutRight 0.6s cubic-bezier(0.6, 0.04, 0.98, 0.34)';
            setTimeout(() => welcomeToast.remove(), 600);
        }, 5000);
    };

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const saveSecurityState = (expiryTimestamp: string | null, attempts: number) => {
        const expiry = expiryTimestamp ? new Date(expiryTimestamp).getTime() : 0;
        const state = { expiry, attempts };
        localStorage.setItem('lfnm_login_security', JSON.stringify(state));

        if (expiry > Date.now()) {
            setLockoutExpiry(expiry);
            setSecondsRemaining(Math.ceil((expiry - Date.now()) / 1000));
        }

        setAttemptsMade(attempts);
        if (attempts > 0) triggerShake();
    };

    const handleGoogleLogin = async () => {
        if (lockoutExpiry) return;
        const supabase = getSupabase();
        if (!supabase) return setErrorMessage("Serviço indisponível.");
        setLoading(true);
        try {
            // Tenta configurar persistência
            // @ts-ignore
            if (supabase.auth && typeof supabase.auth.setPersistence === 'function') {
                // @ts-ignore
                await supabase.auth.setPersistence(rememberMe ? localStorage : sessionStorage);
            }

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    queryParams: rememberMe ? {} : {
                        prompt: 'select_account'  // Só força seleção se "lembrar-me" não estiver marcado
                    }
                }
            });
            if (error) setErrorMessage(error.message);
        } catch (e: any) {
            setErrorMessage(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRecoveryRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetEmail = email.trim().toLowerCase();
        if (!targetEmail.includes('@')) return setErrorMessage("E-mail inválido.");

        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await requestPasswordRecovery(targetEmail);
            if (res.success) {
                setSuccessMessage(res.message);
                setTimeout(() => { if (isMounted.current) setMode('login'); }, 6000);
            } else {
                setErrorMessage(res.message);
            }
        } catch (err: any) {
            setErrorMessage("Falha na comunicação com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        const supabase = getSupabase();
        if (!supabase) return;
        let targetEmail = loginIdentifier.trim();
        if (!targetEmail.includes('@')) {
            const found = await getEmailByUsername(targetEmail);
            if (found) targetEmail = found;
            else { setErrorMessage("E-mail não identificado."); return; }
        }
        try {
            const { error } = await supabase.auth.resend({ type: 'signup', email: targetEmail });
            if (error) throw error;
            setSuccessMessage(`LINK ENVIADO!`);
        } catch (err: any) {
            setErrorMessage("Falha ao reenviar.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || lockoutExpiry) return;

        setErrorMessage(null);
        setSuccessMessage(null);

        // --- MODO CADASTRO (SIGNUP) ---
        if (mode === 'signup') {
            const cleanEmail = email.trim().toLowerCase();
            if (!cleanEmail.includes('@')) return setErrorMessage("E-mail inválido.");

            setLoading(true);
            try {
                // 1. UX Delay Shortened
                if (loading) await new Promise(r => setTimeout(r, 600));

                console.log('[Login] 🟡 Checks pré-cadastro: Validando unicidade...');

                // 2. Simple Await Logic (No Race Complexity)
                // If this hangs, it's a network issue, but it won't swallow errors silently
                const existingEmail = await getEmailByUsername(cleanEmail);

                if (existingEmail) {
                    console.log('[Login] 🟠 Email já existe:', existingEmail);
                    setErrorMessage("E-MAIL JÁ CADASTRADO! FAÇA LOGIN.");
                    setLoading(false);
                    return;
                }

                console.log('[Login] 🟢 E-mail novo verificado. Iniciando wizard...');

                // 3. Trigger Modal Handoff
                // We keep loading true briefly to prevent UI flash
                onSignupRequest(cleanEmail);

                // Safety: Force loading off after short delay in case unmount fails
                setTimeout(() => {
                    if (isMounted.current) setLoading(false);
                }, 2000);

                return;

            } catch (err: any) {
                console.error('[Login] 🔴 Signup Error:', err);
                setErrorMessage(`Erro : ${err.message || 'Falha de conexão'}`);
                setLoading(false);
            }
            return;
        }

        const cleanIdentifier = loginIdentifier.trim();
        const cleanPassword = password.trim();
        let isSubmissionComplete = false;

        // --- MODO LOGIN ---
        setLoading(true);
        DebugLogger.log('[Login] 🟢 Iniciando tentativa de login...', { email: cleanIdentifier });

        // Safety Timeout - Force stop loading after 15s
        const safetyTimeout = setTimeout(() => {
            if (isMounted.current && !isSubmissionComplete) {
                setLoading(false);
                setErrorMessage("Tempo limite excedido. Verifique sua conexão ou tente novamente.");
                DebugLogger.log('[Login] 🔴 Safety Timeout reached (15s) - Forcing stop');
            }
        }, 15000);

        const supabase = getSupabase();
        if (!supabase) {
            clearTimeout(safetyTimeout);
            setErrorMessage("Erro de servidor.");
            setLoading(false);
            DebugLogger.log('[Login] 🔴 Fatal: Supabase client is null');
            return;
        }

        try {
            let finalEmail = cleanIdentifier;
            if (!cleanIdentifier.includes('@')) {
                DebugLogger.log('[Login] 🔍 Resolvendo e-mail por usuário...');
                const emailPromise = getEmailByUsername(cleanIdentifier);
                const emailTimeout = new Promise((_, r) => setTimeout(() => r(new Error('Email resolution timeout')), 5000));

                const foundEmail: string | null = await Promise.race([emailPromise, emailTimeout]) as any;

                if (!foundEmail) {
                    setLoading(false);
                    throw new Error("Credenciais inválidas.");
                }
                finalEmail = foundEmail;
                DebugLogger.log('[Login] ✅ E-mail resolvido:', finalEmail);
            }

            DebugLogger.log('[Login] 🟡 Checks pré-login: Lockout...');

            // 1. Check Lockout com Timeout
            try {
                const lockoutPromise = checkAuthLockout(finalEmail);
                const lockoutTimeout = new Promise((_, r) => setTimeout(() => r(new Error('Lockout check timeout')), 5000));

                const dbLock: any = await Promise.race([lockoutPromise, lockoutTimeout]);

                if (dbLock && dbLock.isLocked) {
                    saveSecurityState(new Date(Date.now() + dbLock.secondsRemaining * 1000).toISOString(), 5);
                    throw new Error(`Acesso bloqueado por segurança.`);
                }
            } catch (lockError: any) {
                if (lockError.message.includes('Acesso bloqueado')) throw lockError;
                console.warn('[Login] Lockout check skipped/failed:', lockError);
                DebugLogger.log('[Login] ⚠️ Lockout check skipped:', lockError.message);
            }

            // Add timeout to signInWithPassword (increased to 30 seconds)
            DebugLogger.log('[Login] 🟡 Chamando signInWithPassword...');
            const signInPromise = supabase.auth.signInWithPassword({ email: finalEmail, password: cleanPassword });
            const authTimeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth timeout - conexão muito lenta')), 30000)
            );

            const { data, error }: any = await Promise.race([signInPromise, authTimeoutPromise]);
            DebugLogger.log('[Login] 📡 Resposta de Auth recebida');

            if (error) {
                DebugLogger.log('[Login] 🔴 Erro no signInWithPassword:', error.message);
                const security = await registerAuthFailure(finalEmail);
                saveSecurityState(security.lockoutUntil, security.attempts);

                if (error.message.includes('Email not confirmed')) {
                    setErrorMessage("CONTA NÃO ATIVADA!");
                    setShowResendButton(true);
                } else if (security.lockoutUntil) {
                    throw new Error(`Tentativas excedidas. Bloqueado temporariamente.`);
                } else {
                    throw new Error(`Senha ou usuário incorretos.`);
                }
            } else if (data.user) {
                DebugLogger.log('[Login] ✅ Login Sucesso - Auth. Verificando Profile...');
                localStorage.removeItem('lfnm_login_security');
                await resetAuthSecurity(finalEmail);

                try {
                    DebugLogger.log('[Login] 📡 Buscando perfil...');
                    const profilePromise = supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
                    );

                    const { data: profile, error: profileError } = await Promise.race([
                        profilePromise,
                        timeoutPromise
                    ]) as any;
                    DebugLogger.log('[Login] 📡 Resposta de Perfil recebida');

                    if (profile) {
                        // Perfil encontrado - login normal
                        console.log('✅ Perfil encontrado:', profile.name);
                        DebugLogger.log('[Login] ✅ Perfil encontrado com sucesso.');
                        onLogin(profile, rememberMe);

                        // Mostrar mensagem de boas-vindas
                        setTimeout(() => {
                            showWelcomeMessage(profile.name);
                            clearTempStorage(); // Limpa dados temporários
                            onClose(); // Fecha o painel de login
                        }, 300);

                    } else {
                        // Perfil não encontrado - criar perfil básico como fallback
                        console.warn('[Login] Perfil não encontrado no banco, criando perfil básico (Self-Healing)...');
                        DebugLogger.log('[Login] ⚠️ Perfil não encontrado. Iniciando Self-Healing.');

                        const basicProfile: User = {
                            id: data.user.id,
                            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
                            email: data.user.email!,
                            role: 'Leitor', // Default seguro
                            status: 'active'
                        };

                        try {
                            // SELF-HEALING: Tenta criar o registro no banco
                            // Importação dinâmica circular evitada? createUser já deve estar disponível ou importada
                            // NOTE: createUser is not imported in original snippet, need to ensure import
                            // Assuming createUser is available via supabaseService import at top
                            // Vamos ajustar a importação no próximo passo, mas aqui injetamos a chamada
                            // Como createUser não está importado no arquivo original (veja linha 5-12),
                            // faremos o insert direto via supabase aqui para garantir, ou adicionaremos import depois.
                            // Melhor: Insert direto para evitar refatoração massiva de imports agora.
                            const { error: createError } = await supabase.from('users').insert({
                                id: basicProfile.id,
                                name: basicProfile.name,
                                email: basicProfile.email,
                                role: basicProfile.role,
                                status: 'active',
                                created_at: new Date().toISOString()
                            });

                            if (createError) throw createError;
                            DebugLogger.log('[Login] ✅ Self-Healing concluído: Perfil criado.');

                        } catch (healingError: any) {
                            console.error('[Login] Falha no Self-Healing:', healingError);
                            DebugLogger.log('[Login] 🔴 Falha no Self-Healing:', healingError.message);
                            // Continua com login local mesmo falhando, para não travar o usuário
                        }

                        // Faz login com o perfil básico de qualquer forma


                        // Faz login com o perfil básico de qualquer forma
                        onLogin(basicProfile, rememberMe);

                        // Mostrar mensagem de boas-vindas
                        setTimeout(() => {
                            showWelcomeMessage(basicProfile.name);
                            clearTempStorage();
                            onClose(); // Fecha o painel de login
                        }, 300);
                    }
                } catch (profileFetchError: any) {
                    // Se houver erro ao buscar perfil, cria um perfil básico local
                    console.warn('[Login] Erro ao buscar perfil (provavelmente offline):', profileFetchError);
                    DebugLogger.log('[Login] ⚠️ Erro ao buscar perfil (Catch):', profileFetchError.message);
                    const fallbackProfile: User = {
                        id: data.user.id,
                        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuário',
                        email: data.user.email!,
                        role: 'Desenvolvedor',
                        status: 'active'
                    };
                    onLogin(fallbackProfile, rememberMe);

                    // Mostrar mensagem de boas-vindas
                    setTimeout(() => {
                        showWelcomeMessage(fallbackProfile.name);
                        clearTempStorage();
                        onClose(); // Fecha o painel de login
                    }, 300);
                }
            }
        } catch (error: any) {
            DebugLogger.log('[Login] 🔴 Erro Capturado no Catch Geral:', error.message);
            setErrorMessage(error.message || "Erro na autenticação.");
        } finally {
            isSubmissionComplete = true;
            clearTimeout(safetyTimeout);
            if (isMounted.current) setLoading(false);
            DebugLogger.log('[Login] 🏁 Fluxo Finalizado (Finally)');
        }
    };

    const clearTempStorage = () => {
        sessionStorage.removeItem('lfnm_login_temp');
    };

    // Encapsula o onClose original para limpar dados se desejado (opcional, aqui mantemos se o usuário fechar por engano)
    // Mas limpamos no sucesso do login.

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-md overflow-y-auto custom-scrollbar animate-fadeIn">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="min-h-full w-full flex items-center justify-center p-4 relative pointer-events-none">
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-500 transition-colors flex items-center gap-2 z-[3010] cursor-pointer bg-black/30 md:bg-black/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-lg border border-white/10 shadow-lg group pointer-events-auto"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Sair</span>
                    <i className="fas fa-times text-base md:text-lg group-hover:rotate-90 transition-transform duration-300"></i>
                </button>

                <div className="w-full max-w-[460px] bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeInUp relative z-10 border-t-[8px] md:border-t-[12px] border-red-600 ring-1 ring-gray-200 my-4 md:my-8 pointer-events-auto">
                    <div className="bg-gray-50 p-4 md:p-6 pb-2 text-center border-b border-gray-100 flex flex-col items-center">
                        <div className="w-28 h-28 md:w-52 md:h-52 mb-2 md:mb-4 drop-shadow-xl"><Logo /></div>
                        <h2 className="text-gray-900 text-xl md:text-3xl font-black uppercase tracking-tighter leading-none mt-1 md:mt-2">
                            {mode === 'login' ? 'Identificação' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha'}
                        </h2>
                    </div>

                    {mode !== 'recovery' && (
                        <div className="px-6 md:px-8 pt-4 md:pt-6 pb-2">
                            <button type="button" onClick={handleGoogleLogin} disabled={!!lockoutExpiry} className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 hover:text-black transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50">
                                <i className="fab fa-google text-lg md:text-xl text-red-600"></i> Entrar com Google
                            </button>


                            <label className="flex items-center justify-center gap-3 mt-4 mb-2 cursor-pointer group px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-red-50 transition-all border border-gray-200 hover:border-red-200">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-5 h-5 rounded-md border-2 border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0 cursor-pointer transition-all"
                                />
                                <span className="text-[10px] md:text-[11px] font-black text-gray-600 uppercase tracking-wider group-hover:text-red-600 transition-colors">
                                    🔒 Lembrar-me neste dispositivo
                                </span>
                            </label>


                            <div className="relative flex py-4 md:py-5 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest">Ou com E-mail</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={mode === 'recovery' ? handleRecoveryRequest : handleSubmit} className="px-6 md:px-8 pb-6 md:pb-8 pt-0 space-y-4 md:space-y-5">
                        {mode === 'signup' || mode === 'recovery' ? (
                            <div className="relative group animate-slideUp">
                                <i className="fas fa-envelope absolute left-3.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors text-base md:text-lg"></i>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu melhor e-mail" className="w-full bg-white border-2 border-gray-200 focus:border-red-600 rounded-xl md:rounded-2xl p-3.5 pl-10 md:p-5 md:pl-14 text-sm md:text-base font-bold outline-none transition-all placeholder-gray-400 shadow-inner" />
                            </div>
                        ) : (
                            <>
                                <div className="relative group">
                                    <i className="fas fa-user-circle absolute left-3.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors text-base md:text-lg"></i>
                                    <input type="text" required value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} disabled={!!lockoutExpiry} placeholder="E-mail ou Usuário" className="w-full bg-white border-2 border-gray-200 focus:border-red-600 rounded-xl md:rounded-2xl p-3.5 pl-10 md:p-5 md:pl-14 text-sm md:text-base font-bold outline-none transition-all placeholder-gray-400 shadow-inner disabled:bg-gray-50" />
                                </div>
                                <div className="relative group">
                                    <i className="fas fa-lock absolute left-3.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors text-base md:text-lg"></i>
                                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={!!lockoutExpiry} placeholder="Sua Senha" className="w-full bg-white border-2 border-gray-200 focus:border-red-600 rounded-xl md:rounded-2xl p-3.5 pl-10 md:p-5 md:pl-14 text-sm md:text-base font-bold outline-none transition-all placeholder-gray-400 shadow-inner disabled:bg-gray-50" />
                                </div>
                                <div className="flex justify-end pr-1">
                                    <button type="button" onClick={() => { setMode('recovery'); setErrorMessage(null); setSuccessMessage(null); }} className="text-[8px] md:text-[9px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors tracking-widest">Esqueci minha senha</button>
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            {lockoutExpiry ? (
                                <div className="w-full bg-red-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-[1000] uppercase text-xs md:text-sm tracking-[0.2em] flex flex-col items-center justify-center shadow-inner animate-pulse">
                                    <span>Acesso Bloqueado</span>
                                    <span className="text-lg md:text-xl mt-1 font-mono">{formatTime(secondsRemaining)}</span>
                                    <span className="text-[6px] md:text-[7px] mt-1 md:mt-2 opacity-50 uppercase tracking-[0.4em]">Sincronizado com o Servidor</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full py-3.5 md:py-5 rounded-xl md:rounded-2xl font-[1000] uppercase text-xs md:text-sm tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 ${successMessage ? 'bg-green-600 text-white' :
                                            attemptsMade >= 4 ? 'bg-red-600 text-white animate-pulse' :
                                                'bg-black text-white hover:bg-red-600'
                                            }`}
                                    >
                                        {loading ? <i className="fas fa-circle-notch fa-spin"></i> :
                                            successMessage ? <><i className="fas fa-paper-plane animate-bounce"></i> Enviado</> :
                                                (mode === 'login' ? <>Acessar <i className="fas fa-arrow-right"></i></> : mode === 'signup' ? 'Começar Cadastro' : 'Recuperar Acesso')}
                                    </button>

                                    {mode === 'login' && attemptsMade > 0 && !lockoutExpiry && (
                                        <div className={`text-center animate-fadeInUp ${isShaking ? 'animate-shake' : ''}`}>
                                            <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${attemptsMade >= 4 ? 'text-red-600 animate-pulse' : 'text-gray-400'}`}>
                                                Tentativa <span className="text-sm">{attemptsMade}</span> de 5
                                            </p>
                                            <div className="w-32 md:w-40 h-1.5 bg-gray-100 rounded-full mx-auto mt-2 overflow-hidden border border-gray-100 shadow-inner">
                                                <div
                                                    className={`h-full transition-all duration-700 ease-out ${attemptsMade >= 4 ? 'bg-red-600' : attemptsMade >= 3 ? 'bg-orange-500' : 'bg-yellow-400'}`}
                                                    style={{ width: `${(attemptsMade / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {errorMessage && (
                            <div className="bg-red-50 text-red-600 p-3 md:p-4 rounded-xl text-[9px] md:text-[10px] font-bold uppercase border border-red-100 animate-shake">
                                <i className="fas fa-exclamation-triangle mr-2"></i> {errorMessage}
                                {showResendButton && (
                                    <button onClick={handleResendConfirmation} className="block mt-2 underline">Reenviar ativação</button>
                                )}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-50 text-green-700 p-3 md:p-4 rounded-xl text-[9px] md:text-[10px] font-bold uppercase border border-green-100 animate-fadeIn">
                                <i className="fas fa-check-circle mr-2"></i> {successMessage}
                            </div>
                        )}

                        <div className="pt-2 md:pt-4 text-center border-t border-gray-100 mt-4 md:mt-6">
                            {!disableSignup && (
                                <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrorMessage(null); setSuccessMessage(null); }} disabled={!!lockoutExpiry} className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black disabled:opacity-30 p-2">
                                    {mode === 'login' ? "Ainda não tem conta? Criar uma" : mode === 'signup' ? "Já possui conta? Entrar" : "Voltar para Login"}
                                </button>
                            )}
                            {disableSignup && mode === 'login' && (
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Acesso Restrito</p>
                            )}
                            {disableSignup && mode === 'recovery' && (
                                <button type="button" onClick={() => { setMode('login'); setErrorMessage(null); setSuccessMessage(null); }} className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black disabled:opacity-30 p-2">
                                    Voltar para Login
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

