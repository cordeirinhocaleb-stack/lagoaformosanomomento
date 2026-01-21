import React, { useState } from 'react';
import { User, SystemSettings } from '@/types';
import { sendErrorReport } from '@/services/supabaseService';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Logo from '@/components/common/Logo';

interface ErrorPageProps {
    error: any;
    stack?: string;
    user: User | null;
    systemSettings: SystemSettings;
    onBack: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, stack, user, systemSettings, onBack }) => {
    const [reportText, setReportText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [hasSent, setHasSent] = useState(false);

    const handleSendReport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            await sendErrorReport(
                error instanceof Error ? error : new Error(String(error || 'Erro Crítico')),
                `Relato do Usuário: ${reportText}\n\nStack: ${stack || 'N/A'}`,
                user
            );
            setHasSent(true);
        } catch (err) {
            console.error("Falha ao enviar relato:", err);
            alert("Erro ao enviar relatório. Tente novamente.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 animate-fadeIn">
            {/* Header Simplified or Full depending on preference, but usually full for "Home Style" */}
            <Header
                onAdminClick={() => { }}
                onHomeClick={onBack}
                latestNews={[]}
                brazilNews={[]}
                user={user}
                onOpenProfile={() => { }}
                selectedCategory="all"
                onSelectCategory={() => { }}
                selectedRegion="Lagoa Formosa"
                onSelectRegion={() => { }}
            />

            <main className="flex-grow flex items-center justify-center p-6 py-12">
                <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border-4 border-red-600 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-3 bg-red-600"></div>
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                            <i className="fas fa-exclamation-triangle text-5xl text-red-600"></i>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">
                            Ops! Detectamos uma falha.
                        </h1>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-lg mx-auto">
                            Ocorreu um erro inesperado que impediu o carregamento da página. Mas não se preocupe, você pode nos ajudar a consertar!
                        </p>
                    </div>

                    {!hasSent ? (
                        <form onSubmit={handleSendReport} className="space-y-6 animate-slideUp">
                            <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-red-600 mb-3">
                                    O que você estava fazendo no momento?
                                </label>
                                <textarea
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    placeholder="Ex: Eu estava tentando abrir a notícia sobre o evento tal..."
                                    className="w-full bg-white border-2 border-transparent focus:border-red-600 rounded-xl p-4 text-sm font-medium transition-all outline-none min-h-[120px] shadow-sm"
                                    required
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={isSending}
                                    className="flex-[2] bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSending ? (
                                        <i className="fas fa-spinner fa-spin"></i>
                                    ) : (
                                        <i className="fas fa-paper-plane"></i>
                                    )}
                                    {isSending ? 'Enviando...' : 'Enviar Relato de Debug'}
                                </button>

                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Voltar ao Home
                                </button>
                            </div>

                            <details className="mt-8 group">
                                <summary className="text-[10px] font-black uppercase text-gray-400 cursor-pointer hover:text-gray-600 transition-colors list-none flex items-center gap-2">
                                    <i className="fas fa-chevron-right transition-transform group-open:rotate-90"></i>
                                    Detalhes técnicos para nerds
                                </summary>
                                <div className="mt-4 bg-gray-900 rounded-xl p-6 overflow-x-auto">
                                    <code className="text-xs text-red-400 font-mono leading-relaxed block whitespace-pre">
                                        {String(error)}
                                        {stack && `\n\nStack Trace:\n${stack}`}
                                    </code>
                                </div>
                            </details>
                        </form>
                    ) : (
                        <div className="text-center py-10 animate-scaleIn">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                                <i className="fas fa-check text-4xl text-green-500"></i>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase italic mb-2">Relatório Enviado!</h2>
                            <p className="text-gray-500 font-medium mb-8">Obrigado pela ajuda. Nossos desenvolvedores já foram notificados.</p>

                            <button
                                onClick={onBack}
                                className="bg-black text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 transition-all shadow-xl"
                            >
                                Voltar ao Home
                            </button>
                        </div>
                    )}

                    <div className="mt-12 pt-12 border-t border-gray-100 text-center">
                        <Logo className="w-24 mx-auto opacity-20 grayscale" />
                    </div>
                </div>
            </main>

            <Footer settings={systemSettings} />
        </div>
    );
};

export default ErrorPage;
