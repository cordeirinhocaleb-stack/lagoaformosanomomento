import React, { useMemo } from 'react';

interface PublishSuccessModalProps {
    isOpen: boolean;
    status: 'uploading' | 'success' | 'error' | 'idle';
    progress: number;
    progressMessage: string;
    onClose: () => void;
    onViewNews: () => void;
    isUpdate: boolean;
    mode?: 'save' | 'publish'; // New prop to distinguish actions
    authorName?: string;       // New prop for personalization
}

const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
    isOpen,
    status,
    progress,
    progressMessage,
    onClose,
    onViewNews,
    isUpdate,
    mode = 'publish',
    authorName = 'Editor'
}) => {
    // Dynamic Text Logic
    const texts = useMemo(() => {
        const action = mode === 'publish' ? (isUpdate ? 'Atualizando' : 'Publicando') : 'Salvando';
        const actionDone = mode === 'publish' ? (isUpdate ? 'Atualizada' : 'Publicada') : 'Salva';

        return {
            uploadingTitle: `AGUARDE, ${authorName.split(' ')[0].toUpperCase()}...`,
            successTitle: mode === 'publish' ? (isUpdate ? 'NOTÍCIA ATUALIZADA!' : 'NOTÍCIA NO AR!') : 'RASCUNHO SALVO!',
            successMessage: mode === 'publish'
                ? `Sua matéria foi ${actionDone.toLowerCase()} com sucesso e já está disponível.`
                : `Alterações salvas com segurança no seu rascunho.`,
            buttonPrimary: mode === 'publish' ? 'VER NO SITE' : 'CONTINUAR EDITANDO',
            buttonSecondary: mode === 'publish' ? 'VOLTAR PRO EDITOR' : 'FECHAR'
        };
    }, [mode, isUpdate, authorName]);

    if (!isOpen || status === 'idle') return null;

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-xl animate-fadeIn">
            {/* Background Gradient Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden border border-white/20">

                {/* STATUS: UPLOADING */}
                {status === 'uploading' && (
                    <div className="flex flex-col items-center py-4 animate-slideUp">
                        <div className="mb-10 relative">
                            {/* Premium Spinner */}
                            <div className="w-24 h-24 rounded-full border-[6px] border-zinc-100 border-t-red-600 animate-spin shadow-lg shadow-red-600/20"></div>
                            {/* Percentage Center */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-black text-2xl text-zinc-900 tracking-tighter">{progress}%</span>
                            </div>
                        </div>

                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 text-center">{texts.uploadingTitle}</h3>

                        <div className="bg-zinc-50 px-6 py-3 rounded-xl border border-zinc-100 w-full text-center">
                            <p className="text-zinc-600 text-xs font-medium animate-pulse truncate">
                                {progressMessage || "Processando dados..."}
                            </p>
                        </div>

                        {/* Progress Bar background */}
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-8 overflow-hidden">
                            <div
                                className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* STATUS: SUCCESS */}
                {status === 'success' && (
                    <div className="flex flex-col items-center py-2 text-center animate-slideUp">
                        <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-green-500/30 animate-bounce-slow ring-8 ring-green-50">
                            <i className="fas fa-check text-4xl text-white"></i>
                        </div>

                        <h2 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight italic uppercase">
                            {texts.successTitle}
                        </h2>
                        <p className="text-zinc-500 mb-10 text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
                            {texts.successMessage}
                        </p>

                        <div className="flex flex-col gap-3 w-full">
                            {mode === 'publish' && (
                                <button
                                    onClick={onViewNews}
                                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-red-700 transform hover:scale-[1.02] transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-external-link-alt"></i>
                                    {texts.buttonPrimary}
                                </button>
                            )}

                            <button
                                onClick={onClose}
                                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all ${mode === 'publish'
                                    ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
                                    : 'bg-black text-white hover:bg-zinc-800 shadow-xl transform hover:scale-[1.02]'
                                    }`}
                            >
                                {mode === 'publish' ? texts.buttonSecondary : texts.buttonPrimary}
                            </button>
                        </div>
                    </div>
                )}

                {/* STATUS: ERROR */}
                {status === 'error' && (
                    <div className="flex flex-col items-center py-4 text-center animate-shake">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
                            <i className="fas fa-times text-3xl text-red-600"></i>
                        </div>
                        <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-2">Falha no Envio</h3>

                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 w-full mb-8">
                            <p className="text-red-600 text-xs font-medium break-words leading-relaxed">{progressMessage}</p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-zinc-800 transition-all shadow-lg"
                        >
                            <i className="fas fa-redo mr-2"></i> Tentar Novamente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublishSuccessModal;
