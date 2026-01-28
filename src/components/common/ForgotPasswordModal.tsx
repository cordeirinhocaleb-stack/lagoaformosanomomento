'use client';

import React, { useState } from 'react';
import { getSupabase } from '@/services/core/supabaseClient';
import Logo from './Logo';

interface ForgotPasswordModalProps {
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor, informe seu e-mail.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const supabase = getSupabase();
            if (!supabase) throw new Error('Erro de conexão.');

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.protocol}//${window.location.host}/auth/callback?type=recovery`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10030] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[400px] max-h-[400px] bg-blue-600/5 blur-[100px] md:blur-[120px] rounded-full animate-pulse-slow"></div>
            </div>

            <div className="relative w-full max-w-[450px] md:max-w-[500px] bg-white border border-gray-100 rounded-2xl shadow-2xl px-6 md:px-10 py-6 md:py-8 overflow-hidden animate-scaleIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-all z-20"
                >
                    <i className="fas fa-times"></i>
                </button>

                <div className="text-center mb-8">
                    <div className="inline-block mb-3 scale-75 transition-transform">
                        <Logo />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter leading-none mb-1.5">
                        Recuperar <span className="text-blue-600 font-black italic">Senha</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-4 leading-tight">
                        {success ? 'Verifique seu e-mail' : 'Informe seu e-mail para receber instruções'}
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl animate-shake flex items-center gap-3">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span className="flex-1 text-left leading-tight">{error}</span>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">E-mail</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3.5 text-gray-900 text-sm font-bold outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                    placeholder="seu@email.com"
                                    required
                                />
                                <i className="fas fa-envelope absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors text-sm"></i>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 ${loading ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-gray-900 shadow-lg shadow-blue-600/10 hover:shadow-xl active:scale-95'}`}
                        >
                            {loading ? (
                                <i className="fas fa-circle-notch fa-spin text-lg"></i>
                            ) : (
                                <>
                                    <span>Enviar Link</span>
                                    <i className="fas fa-paper-plane"></i>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-4 animate-fadeIn">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-100">
                            <i className="fas fa-check-circle text-blue-500 text-2xl"></i>
                        </div>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed px-2">
                            Enviamos um link de recuperação para o endereço informado. Verifique sua caixa de entrada e spam.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                        >
                            Voltar ao Início
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
