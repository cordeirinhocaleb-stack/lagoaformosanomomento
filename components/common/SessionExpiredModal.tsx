import React from 'react';

interface SessionExpiredModalProps {
    onClose: () => void;
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/30 rounded-3xl shadow-2xl shadow-red-600/20 max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 border-b border-red-500/20">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <i className="fas fa-clock text-white text-2xl"></i>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                                Sessão Expirada
                            </h2>
                            <p className="text-red-100 text-xs font-medium mt-1">
                                Inatividade detectada
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                        Sua sessão expirou por inatividade. Por favor, faça login novamente para continuar acessando o sistema.
                    </p>

                    <div className="bg-red-950/30 border border-red-600/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <i className="fas fa-shield-alt text-red-500 text-lg mt-0.5"></i>
                            <div>
                                <h4 className="text-red-400 font-bold text-xs uppercase tracking-wider mb-1">
                                    Segurança
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    Esta medida protege sua conta contra acessos não autorizados.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Fazer Login Novamente
                    </button>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-black/40 border-t border-white/5">
                    <p className="text-gray-500 text-[10px] text-center uppercase tracking-wider">
                        Tempo de inatividade: 30 minutos
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
