
import React, { useEffect } from 'react';
import { ShieldAlert, X, Home, MessageSquare } from 'lucide-react';

interface AccessDeniedModalProps {
    visible: boolean;
    title?: string;
    message?: string;
    onClose: () => void;
    onHomeClick: () => void;
}

const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
    visible,
    title = "ACESSO RESTRITO",
    message = "Esta conta não possui permissão para acessar o portal ou o cadastro de novos usuários está temporariamente desativado.",
    onClose,
    onHomeClick
}) => {
    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [visible]);

    if (!visible) {return null;}

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            {/* Backdrop com desfoque profundo */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg bg-zinc-950/40 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-md animate-scaleIn">

                {/* Efeito de Brilho Vermelho (Mockup inspirado) */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-600/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />

                {/* Header/Banner */}
                <div className="relative h-48 flex flex-col items-center justify-center overflow-hidden">
                    {/* Botão Fechar */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Escudo Animado */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-600/40 rounded-full blur-2xl animate-pulse" />
                        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-900/40 transform -rotate-12">
                            <ShieldAlert size={56} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="relative px-8 pb-10 text-center">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-4 uppercase">
                        {title}
                    </h2>

                    <div className="h-1 w-16 bg-red-600 mx-auto mb-6 rounded-full" />

                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8 max-w-xs mx-auto">
                        {message}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onHomeClick}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Home size={18} />
                            VOLTAR AO INÍCIO
                        </button>

                        <button
                            onClick={() => window.open('https://wa.me/5534991234567', '_blank')}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                        >
                            <MessageSquare size={18} />
                            SOLICITAR ACESSO
                        </button>
                    </div>

                    <p className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                        LFNM • SEGURANÇA v1.118
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccessDeniedModal;
