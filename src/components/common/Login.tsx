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
}

const Login: React.FC<LoginProps> = ({
    onLogin,
    onSignupRequest,
    onClose,
    disableSignup = false,
    onOpenTerms
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
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login com Google.');
        }
    };

    return (
        <div className="fixed inset-0 z-[10020] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
            {/* Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            </div>

            <div className="relative w-full max-w-md bg-[#0F0F0F] border border-white/5 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden">
                {/* Exit Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center mb-10">
                    <div className="inline-block mb-4">
                        <Logo />
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                        Bem-vindo de <span className="text-red-600 font-black italic">Volta</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Acesse sua conta para continuar
                    </p>
                </div>

                {/* Botão de Login com Google */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full mb-6 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-95 shadow-lg"
                >
                    <i className="fab fa-google text-red-600"></i>
                    <span>Continuar com Google</span>
                </button>

                {/* Divisor */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#0F0F0F] px-4 text-gray-500 font-black tracking-widest">Ou continue com e-mail</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl animate-shake">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">E-mail</label>
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-red-600 transition-all"
                                placeholder="seu@email.com"
                                required
                            />
                            <i className="fas fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-red-600 transition-colors"></i>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Senha</label>
                            <button type="button" className="text-[9px] font-black text-red-600 uppercase hover:underline">Esqueceu?</button>
                        </div>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-red-600 transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between ml-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${remember ? 'bg-red-600 border-red-600' : 'bg-transparent border-white/20'}`}>
                                {remember && <i className="fas fa-check text-[8px] text-white"></i>}
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300">Lembrar de mim</span>
                        </label>
                    </div>

                    {/* CAPTCHA desabilitado */}
                    {/* <div className="py-2">
                        <TurnstileWidget onVerify={setCaptchaToken} options={{ theme: 'dark' }} />
                    </div> */}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 ${loading ? 'bg-white/5 text-gray-500' : 'bg-red-600 text-white hover:bg-white hover:text-black shadow-lg shadow-red-600/20 active:scale-95'}`}
                    >
                        {loading ? (
                            <i className="fas fa-circle-notch fa-spin"></i>
                        ) : (
                            <>
                                <span>Entrar</span>
                                <i className="fas fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </form>

                {!disableSignup && (
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">
                            Não tem uma conta?
                        </p>
                        <button
                            onClick={() => onSignupRequest(email)}
                            className="text-xs font-black text-white uppercase tracking-widest hover:text-red-600 transition-colors"
                        >
                            Crie sua conta agora
                        </button>
                    </div>
                )}

                {onOpenTerms && (
                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <button
                            type="button"
                            onClick={onOpenTerms}
                            className="text-[9px] text-gray-600 font-bold uppercase tracking-widest hover:text-gray-400"
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
