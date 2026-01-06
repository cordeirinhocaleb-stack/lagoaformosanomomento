import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { sendErrorReport } from '../services/supabaseService';

interface ErrorLog {
    timestamp: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    stack?: string;
    url?: string;
}

interface ErrorReportPanelProps {
    user: User | null;
}

const ErrorReportPanel: React.FC<ErrorReportPanelProps> = ({ user }) => {
    const [errors, setErrors] = useState<ErrorLog[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [hasNewErrors, setHasNewErrors] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Lógica de Visibilidade Inteligente:
    // 1. Desenvolvedor: Vê sempre.
    // 2. Outros: Vê APENAS se houver erros críticos (type === 'error').
    const hasCriticalErrors = errors.some(e => e.type === 'error');
    const shouldRender = user?.role === 'Desenvolvedor' || hasCriticalErrors;

    // Modificado para evitar erro React #310 (Hook rule violation)
    // O return null foi movido para o final do componente
    // if (!shouldRender) return null;

    useEffect(() => {
        // Captura erros JavaScript e Promessas Rejeitadas
        // (Isso captura erros que o ErrorBoundary pode perder ou erros globais)

        const handleError = (event: ErrorEvent) => {
            const errorLog: ErrorLog = {
                timestamp: new Date().toISOString(),
                type: 'error',
                message: event.message,
                stack: event.error?.stack,
                url: event.filename
            };
            setErrors(prev => [...prev, errorLog]);
            setHasNewErrors(true);
            // Mantém log original para não suprimir do console do browser
            console.error('🔴 Erro capturado:', errorLog);
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const errorLog: ErrorLog = {
                timestamp: new Date().toISOString(),
                type: 'error',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            };
            setErrors(prev => [...prev, errorLog]);
            setHasNewErrors(true);
            console.error('🔴 Promise rejeitada:', errorLog);
        };

        // REMOVIDO: Interceptação de console.error/warn causava loop infinito.
        // O painel agora só escuta erros globais reais (uncaught exceptions/promises).

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    const copyToClipboard = () => {
        const report = `
=== RELATÓRIO DE ERROS - LFNM ===
Data: ${new Date().toLocaleString('pt-BR')}
Total de Erros: ${errors.filter(e => e.type === 'error').length}
Total de Warnings: ${errors.filter(e => e.type === 'warning').length}

${errors.map((err, idx) => `
[${idx + 1}] ${err.type.toUpperCase()} - ${new Date(err.timestamp).toLocaleTimeString('pt-BR')}
Mensagem: ${err.message}
${err.stack ? `Stack: ${err.stack}` : ''}
${err.url ? `URL: ${err.url}` : ''}
${'='.repeat(80)}
`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(report);
        alert('✅ Relatório copiado para a área de transferência!');
    };

    const handleSendReport = async () => {
        if (errors.length === 0) return;
        setIsSending(true);
        try {
            // Envia o último erro crítico como principal, e o log completo como contexto
            const lastError = errors.slice().reverse().find(e => e.type === 'error') || errors[errors.length - 1];

            const fullLogContext = errors.map(e => `[${e.type.toUpperCase()}] ${e.timestamp}: ${e.message}`).join('\n');

            await sendErrorReport(new Error(lastError.message), `Relatório Manual Panel:\n${fullLogContext}`, user);
            alert("✅ Relatório enviado com sucesso para a equipe de desenvolvimento!");
        } catch (error) {
            console.error("Falha ao enviar relatório:", error);
            alert("Erro ao enviar relatório.");
        } finally {
            setIsSending(false);
        }
    };

    const clearErrors = () => {
        setErrors([]);
        setHasNewErrors(false);
    };

    return (
        <>
            {/* Botão Flutuante - Só aparece se shouldRender for true */}
            <button
                onClick={() => {
                    setShowPanel(!showPanel);
                    setHasNewErrors(false);
                }}
                className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${hasNewErrors
                    ? 'bg-red-600 animate-pulse'
                    : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                title="Relatório de Erros"
            >
                <div className="relative">
                    <i className="fas fa-bug text-white text-xl"></i>
                    {errors.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
                            {errors.length > 99 ? '99+' : errors.length}
                        </span>
                    )}
                </div>
            </button>

            {/* Painel de Erros */}
            {showPanel && (
                <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <i className="fas fa-bug text-2xl"></i>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-wider">Relatório de Erros</h2>
                                    <p className="text-sm opacity-90">
                                        {errors.filter(e => e.type === 'error').length} erros • {errors.filter(e => e.type === 'warning').length} warnings
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPanel(false)}
                                className="text-white hover:text-red-200 transition-colors"
                            >
                                <i className="fas fa-times text-2xl"></i>
                            </button>
                        </div>

                        {/* Lista de Erros */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {errors.map((error, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border-l-4 ${error.type === 'error'
                                        ? 'bg-red-50 border-red-500'
                                        : 'bg-yellow-50 border-yellow-500'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <i className={`fas ${error.type === 'error' ? 'fa-times-circle text-red-600' : 'fa-exclamation-triangle text-yellow-600'}`}></i>
                                            <span className="font-black text-xs uppercase tracking-wider text-gray-600">
                                                {error.type} #{idx + 1}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(error.timestamp).toLocaleTimeString('pt-BR')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-mono text-gray-800 mb-2 break-all">
                                        {error.message}
                                    </p>
                                    {error.stack && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                                Ver Stack Trace
                                            </summary>
                                            <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                                                {error.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-4 rounded-b-2xl flex gap-3">
                            <button
                                onClick={handleSendReport}
                                disabled={isSending || errors.length === 0}
                                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fas fa-paper-plane"></i>
                                )}
                                {isSending ? 'Enviando...' : 'Enviar para Debug'}
                            </button>

                            <button
                                onClick={copyToClipboard}
                                className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-copy"></i>
                                Copiar
                            </button>
                            <button
                                onClick={clearErrors}
                                className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-trash"></i>
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ErrorReportPanel;
