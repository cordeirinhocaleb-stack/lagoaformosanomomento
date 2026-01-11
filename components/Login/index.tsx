import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Logo from '../../components/common/Logo';
import { useLoginSecurity } from './hooks/useLoginSecurity';
import { useAuthFlow } from './hooks/useAuthFlow';
import TurnstileWidget from '../common/TurnstileWidget';

interface LoginProps {
    onLogin: (user: User, remember: boolean) => void;
    onSignupRequest: (email: string) => void;
    onClose: () => void;
    disableSignup?: boolean;
    onOpenTerms?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSignupRequest, onClose, disableSignup = false, onOpenTerms }) => {
    // Form State
    const [email, setEmail] = useState('');
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    // Hooks
    const security = useLoginSecurity();
    const auth = useAuthFlow({ onLogin, onSignupRequest, onClose, security });

    // PERSISTÊNCIA DE FORMULÁRIO (F5) - Keep local or move to hook? Keeping simple logic here for now or extraction later
    useEffect(() => {
        const savedData = localStorage.getItem('lfnm_login_temp');
        if (savedData) {
            try {
                const { pendingEmail, pendingIdentifier, pendingPassword, pendingMode } = JSON.parse(savedData);
                if (pendingEmail) { setEmail(pendingEmail); }
                if (pendingIdentifier) { setLoginIdentifier(pendingIdentifier); }
                if (pendingPassword) { setPassword(pendingPassword); }
                if (pendingMode) { auth.setMode(pendingMode); }
            } catch (e) { }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Roda apenas NA MONTAGEM para restaurar restaurar estado

    useEffect(() => {
        localStorage.setItem('lfnm_login_temp', JSON.stringify({ pendingEmail: email, pendingIdentifier: loginIdentifier, pendingPassword: password, pendingMode: auth.mode }));
    }, [email, loginIdentifier, password, auth.mode]);

    // Body Lock
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = originalStyle; };
    }, []);

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (auth.mode === 'login') { auth.handleLoginSubmit(loginIdentifier, password, captchaToken || undefined); }
        else if (auth.mode === 'signup') { auth.handleSignupSubmit(email, captchaToken || undefined); }
        else if (auth.mode === 'recovery') { auth.handleRecoveryRequest(email); }
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-md overflow-y-auto custom-scrollbar animate-fadeIn">
            <div className="fixed inset-0" onClick={onClose}></div>
            <div className="min-h-full w-full flex items-center justify-center p-4 relative pointer-events-none">
                <button onClick={onClose} className="fixed top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-500 transition-colors flex items-center gap-2 z-[10010] cursor-pointer bg-black/30 md:bg-black/20 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-lg border border-white/10 shadow-lg group pointer-events-auto">
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Sair</span>
                    <i className="fas fa-times text-base md:text-lg group-hover:rotate-90 transition-transform duration-300"></i>
                </button>

                <div className="w-full max-w-[460px] bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeInUp relative z-10 border-t-[8px] md:border-t-[12px] border-red-600 ring-1 ring-gray-200 my-4 md:my-8 pointer-events-auto">
                    <div className="bg-gray-50 p-4 md:p-6 pb-2 text-center border-b border-gray-100 flex flex-col items-center">
                        <div className="w-28 h-28 md:w-52 md:h-52 mb-2 md:mb-4 drop-shadow-xl"><Logo /></div>
                        <h2 className="text-gray-900 text-xl md:text-3xl font-black uppercase tracking-tighter leading-none mt-1 md:mt-2">
                            {auth.mode === 'login' ? 'Identificação' : auth.mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha'}
                        </h2>
                    </div>

                    {auth.mode !== 'recovery' && (
                        <div className="px-6 md:px-8 pt-4 md:pt-6 pb-2 space-y-3">
                            {/* Dev Quick Login (Restrito a Local/Dev) */}
                            {(window.location.hostname === 'localhost' || window.location.hostname.includes('.dev.')) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginIdentifier('gustavocarcara.2@gmail.com');
                                        setPassword('65898562');
                                    }}
                                    className="w-full bg-amber-50 border-2 border-amber-200 text-amber-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 hover:border-amber-300 transition-all flex items-center justify-center gap-3"
                                >
                                    <i className="fas fa-bolt text-amber-500"></i> Acesso Rápido (Dev)
                                </button>
                            )}

                            <button type="button" onClick={auth.handleGoogleLogin} disabled={!!security.lockoutExpiry} className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 hover:text-black transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50">
                                <i className="fab fa-google text-lg md:text-xl text-red-600"></i> Entrar com Google
                            </button>
                            <div className="relative flex py-4 md:py-5 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest">Ou com E-mail</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={onFormSubmit} className="px-6 md:px-8 pb-6 md:pb-8 pt-0 space-y-4 md:space-y-5">
                        {auth.mode === 'signup' || auth.mode === 'recovery' ? (
                            <div className="relative group animate-slideUp">
                                <i className="fas fa-envelope absolute left-3.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors text-base md:text-lg"></i>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu melhor e-mail" className="w-full bg-white border-2 border-gray-200 focus:border-red-600 rounded-xl md:rounded-2xl p-3.5 pl-10 md:p-5 md:pl-14 text-sm md:text-base font-bold outline-none transition-all placeholder-gray-400 shadow-inner" />
                            </div>
                        ) : (
                            <>
                                <div className="relative group">
                                    <i className="fas fa-user-circle absolute left-3.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors text-base md:text-lg"></i>
                                    <input type="text" required value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} disabled={!!security.lockoutExpiry} placeholder="E-mail ou Usuário" className="w-full bg-white border-2 border-gray-200 focus:border-red-600 rounded-xl md:rounded-2xl p-3.5 pl-10 md:p-5 md:pl-14 text-sm md:text-base font-bold outline-none transition-all placeholder-gray-400 shadow-inner disabled:bg-gray-50" />
                                </div>
                                <div className="relative group">
                                    <i className="fas fa-lock absolute left-3.5 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors text-base md:text-lg"></i>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={!!security.lockoutExpiry}
                                        placeholder="Sua Senha"
                                        className="w-full bg-white border-2 border-gray-200 focus:border-red-600 rounded-xl md:rounded-2xl p-3.5 pl-10 md:p-5 md:pl-14 pr-12 md:pr-14 text-sm md:text-base font-bold outline-none transition-all placeholder-gray-400 shadow-inner disabled:bg-gray-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 md:right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors p-1"
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-base md:text-lg`}></i>
                                    </button>
                                </div>
                                <div className="flex justify-end pr-1">
                                    <button type="button" onClick={() => { auth.setMode('recovery'); auth.setErrorMessage(null); auth.setSuccessMessage(null); }} className="text-[8px] md:text-[9px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors tracking-widest">Esqueci minha senha</button>
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            {auth.mode === 'login' && !security.lockoutExpiry && (
                                <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                                    <input type="checkbox" checked={auth.rememberMe} onChange={(e) => auth.setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                                    <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">Lembrar minha senha</span>
                                </label>
                            )}

                            {security.lockoutExpiry ? (
                                <div className="w-full bg-red-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-[1000] uppercase text-xs md:text-sm tracking-[0.2em] flex flex-col items-center justify-center shadow-inner animate-pulse">
                                    <span>Acesso Bloqueado</span>
                                    <span className="text-lg md:text-xl mt-1 font-mono">{security.formatTime(security.secondsRemaining)}</span>
                                    <span className="text-[6px] md:text-[7px] mt-1 md:mt-2 opacity-50 uppercase tracking-[0.4em]">Sincronizado com o Servidor</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(auth.mode === 'login' && security.attemptsMade >= 3) && (
                                        <TurnstileWidget onVerify={setCaptchaToken} options={{ theme: 'light' }} />
                                    )}

                                    <button type="submit" disabled={auth.loading || (auth.mode === 'login' && security.attemptsMade >= 3 && !captchaToken)} className={`w-full py-3.5 md:py-5 rounded-xl md:rounded-2xl font-[1000] uppercase text-xs md:text-sm tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 ${auth.successMessage ? 'bg-green-600 text-white' : security.attemptsMade >= 4 ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-white hover:bg-red-600'}`}>
                                        {auth.loading ? <i className="fas fa-circle-notch fa-spin"></i> : auth.successMessage ? <><i className="fas fa-paper-plane animate-bounce"></i> Enviado</> : (auth.mode === 'login' ? <>Acessar <i className="fas fa-arrow-right"></i></> : auth.mode === 'signup' ? 'Começar Cadastro' : 'Recuperar Acesso')}
                                    </button>

                                    {auth.mode === 'signup' && onOpenTerms && (
                                        <div className="text-center pt-2">
                                            <p className="text-[9px] text-gray-400">
                                                Ao criar conta, você concorda com nossos <button type="button" onClick={onOpenTerms} className="font-bold text-gray-600 hover:text-black hover:underline transition-colors">Termos de Uso e Privacidade</button>
                                            </p>
                                        </div>
                                    )}
                                    {auth.mode === 'login' && security.attemptsMade > 0 && !security.lockoutExpiry && (
                                        <div className={`text-center animate-fadeInUp ${security.isShaking ? 'animate-shake' : ''}`}>
                                            <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] transition-colors duration-300 ${security.attemptsMade >= 4 ? 'text-red-600 animate-pulse' : 'text-gray-400'}`}>Tentativa <span className="text-sm">{security.attemptsMade}</span> de 5</p>
                                            <div className="w-32 md:w-40 h-1.5 bg-gray-100 rounded-full mx-auto mt-2 overflow-hidden border border-gray-100 shadow-inner">
                                                <div className={`h-full transition-all duration-700 ease-out ${security.attemptsMade >= 4 ? 'bg-red-600' : security.attemptsMade >= 3 ? 'bg-orange-500' : 'bg-yellow-400'}`} style={{ width: `${(security.attemptsMade / 5) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {auth.errorMessage && (
                            <div className="bg-red-50 text-red-600 p-3 md:p-4 rounded-xl text-[9px] md:text-[10px] font-bold uppercase border border-red-100 animate-shake">
                                <i className="fas fa-exclamation-triangle mr-2"></i> {auth.errorMessage}
                                {auth.showResendButton && <button onClick={() => auth.handleResendConfirmation(loginIdentifier)} className="block mt-2 underline">Reenviar ativação</button>}
                            </div>
                        )}

                        {auth.successMessage && (
                            <div className="bg-green-50 text-green-700 p-3 md:p-4 rounded-xl text-[9px] md:text-[10px] font-bold uppercase border border-green-100 animate-fadeIn">
                                <i className="fas fa-check-circle mr-2"></i> {auth.successMessage}
                            </div>
                        )}

                        <div className="pt-2 md:pt-4 text-center border-t border-gray-100 mt-4 md:mt-6">
                            {!disableSignup && (
                                <button type="button" onClick={() => { auth.setMode(auth.mode === 'login' ? 'signup' : 'login'); auth.setErrorMessage(null); auth.setSuccessMessage(null); }} disabled={!!security.lockoutExpiry} className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black disabled:opacity-30 p-2">
                                    {auth.mode === 'login' ? "Ainda não tem conta? Criar uma" : auth.mode === 'signup' ? "Já possui conta? Entrar" : "Voltar para Login"}
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
