import React, { useState, useMemo } from 'react';
import Logo from './Logo';

interface ErrorAlertModalProps {
  error: string | Error;
  context?: string;
  severity?: 'info' | 'warning' | 'critical'; // Added severity
  onClose: () => void;
  onSendReport: () => Promise<void>;
}

const ErrorAlertModal: React.FC<ErrorAlertModalProps> = ({ error, context, severity = 'critical', onClose, onSendReport }) => {
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    await onSendReport();
    setIsSending(false);
    setHasSent(true);
    setTimeout(onClose, 2000);
  };

  const errorMessage = useMemo(() => {
    if (error instanceof Error) {return error.message;}
    if (typeof error === 'object' && error !== null) {
      // Tenta extrair mensagem de erro de objetos comuns (Supabase, Axios, etc)
      const msg = (error as any).message || (error as any).error_description || (error as any).details;
      if (msg) {return String(msg);}
      try {
        return JSON.stringify(error);
      } catch {
        return "Erro desconhecido (Objeto não serializável)";
      }
    }
    return String(error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      {/* BACKGROUND CLICK HANDLER */}
      <div className="fixed inset-0" onClick={onClose}></div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-red-600 relative overflow-hidden z-10">

        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full blur-2xl"></div>

        <div className="text-center mb-6 relative z-10">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg">
            {hasSent ? (
              <i className="fas fa-check text-4xl text-green-500 animate-bounce"></i>
            ) : (
              <i className="fas fa-bug text-4xl text-red-600 animate-pulse"></i>
            )}
          </div>

          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 mb-2">
            {hasSent ? "Relatório Enviado!" : "Ops! Deu um Probleminha"}
          </h2>

          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            {hasSent
              ? "Obrigado! Nossos desenvolvedores já foram notificados e irão corrigir isso."
              : "Olhe, deu um probleminha aqui. Por favor, clique no botão abaixo para mandar o relatório para o desenvolvedor para podermos arrumar."}
          </p>
        </div>

        {!hasSent && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 text-left">
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-1">Detalhes do Erro</p>
            <code className="text-xs text-red-600 font-mono block break-words leading-tight bg-red-50 p-2 rounded">
              {errorMessage.substring(0, 150)}{errorMessage.length > 150 ? '...' : ''}
            </code>
            {context && (
              <p className="text-[9px] text-gray-400 mt-2 font-mono">{context}</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!hasSent && (
            <>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-4 h-4 animate-coin object-contain" alt="Sending" />
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
                Enviar Relatório
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Logo className="w-20 opacity-30 grayscale" />
        </div>
      </div>
    </div>
  );
};

export default ErrorAlertModal;