'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { getSupabase } from '@/services/core/supabaseClient';
import { mapDbToUser } from '@/services/users/userService';
import Logo from './Logo';
// import TurnstileWidget from './TurnstileWidget'; // DESABILITADO

interface LoginProps {
    onLogin: (loggedUser: User, remember: boolean) => void;
    onSignupRequest: (email: string) => void;
    onClose: () => void;
    disableSignup?: boolean;
    onOpenTerms?: () => void;
    onForgotPassword?: () => void;
}

const Login: React.FC<LoginProps> = ({
    onLogin,
    onSignupRequest,
    onClose,
    disableSignup = false,
    onOpenTerms,
    onForgotPassword
}) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    // const [captchaToken, setCaptchaToken] = useState<string | null>(null); // DESABILITADO

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Preencha e-mail e senha.');
            return;
        }

        // CAPTCHA desabilitado
        // if (!captchaToken) {
        //     setError('Por favor, complete a verificação de segurança.');
        //     return;
        // }

        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Erro de conexão com o servidor.');

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                if (authError.message.includes('Invalid login credentials')) {
                    throw new Error('E-mail ou senha incorretos.');
                }
                throw authError;
            }

            if (data?.user) {
                // Buscar dados completos do perfil
                const { data: dbUser, error: dbError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (dbError) throw dbError;

                const mappedUser = mapDbToUser(dbUser);
                if (mappedUser) {
                    onLogin(mappedUser, remember);
                    onClose();
                } else {
                    throw new Error('Erro ao processar perfil do usuário.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao entrar.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Erro de conexão com o servidor.');

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`,
                    skipBrowserRedirect: false
                }
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login com Google.');
        }
    };

    return (
        <div className="fixed inset-0 z-[10020] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
            {/* Background Effect - Adjusted for Light Theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-red-600/5 blur-[100px] md:blur-[120px] rounded-full animate-pulse-slow"></div>
            </div>

            <div className="relative w-full max-w-[450px] md:max-w-[550px] bg-white border border-gray-100 rounded-2xl shadow-2xl px-6 md:px-10 py-6 md:py-8 overflow-hidden animate-scaleIn">
                {/* Exit Button - Adjusted UI */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-5 md:right-5 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all z-20"
                    aria-label="Fechar"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center mb-6 md:mb-8 mt-1">
                    <div className="inline-block mb-3 scale-75 md:scale-90 transition-transform">
                        <Logo />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 italic uppercase tracking-tighter leading-none mb-1.5">
                        Bem-vindo de <span className="text-red-600 font-black italic">Volta</span>
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 leading-tight">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* Botão de Login com Google - Adjusted UI */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full mb-5 py-3 md:py-3.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-100 font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-95 shadow-sm"
                >
                    <i className="fab fa-google text-red-600 text-lg"></i>
                    <span>Continuar com Google</span>
                </button>

                {/* Divisor */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-white px-4 text-gray-400 font-black tracking-widest">Ou com e-mail</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl animate-shake flex items-center gap-3">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span className="flex-1 text-left leading-tight">{error}</span>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">E-mail</label>
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 md:py-4 text-gray-900 text-sm md:text-base font-bold outline-none focus:border-red-600 focus:bg-white transition-all placeholder:text-gray-300"
                                placeholder="seu@email.com"
                                required
                            />
                            <i className="fas fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors text-sm"></i>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-2">
                            <label className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha</label>
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-[9px] font-black text-red-600 uppercase hover:text-red-700 hover:underline transition-colors"
                            >
                                Esqueceu?
                            </button>
                        </div>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 md:py-4 text-gray-900 text-sm md:text-base font-bold outline-none focus:border-red-600 focus:bg-white transition-all placeholder:text-gray-300"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors p-1"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between ml-2 py-1">
                        <label className="flex items-center gap-2 cursor-pointer group select-none">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${remember ? 'bg-red-600 border-red-600' : 'bg-transparent border-gray-200 group-hover:border-gray-400'}`}>
                                {remember && <i className="fas fa-check text-[8px] text-white"></i>}
                            </div>
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-600 transition-colors">Lembrar de mim</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 md:py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs md:text-sm transition-all flex items-center justify-center gap-3 ${loading ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-gray-900 shadow-lg shadow-red-600/10 hover:shadow-xl active:scale-95'}`}
                    >
                        {loading ? (
                            <i className="fas fa-circle-notch fa-spin text-lg"></i>
                        ) : (
                            <>
                                <span>Entrar</span>
                                <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                {!disableSignup && (
                    <div className="mt-8 md:mt-10 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                            Não tem uma conta?
                        </p>
                        <button
                            onClick={() => onSignupRequest(email)}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-all group"
                        >
                            <span className="text-[10px] md:text-xs font-black text-gray-700 uppercase tracking-widest group-hover:text-red-600 transition-colors">Criar Nova Conta</span>
                            <i className="fas fa-magic text-red-600 text-xs group-hover:rotate-12 transition-transform"></i>
                        </button>
                    </div>
                )}

                {onOpenTerms && (
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <button
                            type="button"
                            onClick={onOpenTerms}
                            className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-gray-600 transition-colors underline decoration-dotted underline-offset-4"
                        >
                            Termos de Uso & Privacidade
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
