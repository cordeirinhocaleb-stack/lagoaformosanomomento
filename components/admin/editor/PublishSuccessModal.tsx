import React, { useMemo } from 'react';

interface PublishSuccessModalProps {
    isOpen: boolean;
    status: 'uploading' | 'success' | 'error' | 'idle';
    progress: number;
    progressMessage: string;
    onClose: () => void;
    onCreateNew?: () => void;
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
    onCreateNew,
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

    if (!isOpen || status === 'idle') {return null;}

    return (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-3xl animate-fadeIn">
            <div className="relative w-full max-w-lg mx-4">

                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

                <div className="bg-black border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">

                    {/* Decorative Top Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-900"></div>

                    {/* STATUS: UPLOADING */}
                    {status === 'uploading' && (
                        <div className="flex flex-col items-center py-4 animate-slideUp">
                            <div className="mb-12 relative group">
                                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl group-hover:bg-red-600/30 transition-all duration-500"></div>
                                <div className="w-24 h-24 rounded-full border-[6px] border-white/5 border-t-red-600 animate-spin relative z-10"></div>
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <span className="font-[1000] text-xl text-white tracking-tighter">{progress}%</span>
                                </div>
                            </div>

                            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 text-center">{texts.uploadingTitle}</h3>

                            <div className="bg-white/5 px-8 py-4 rounded-xl border border-white/5 w-full text-center backdrop-blur-sm">
                                <p className="text-gray-300 text-xs font-bold animate-pulse tracking-wide">
                                    {progressMessage || "PROCESSANDO DADOS..."}
                                </p>
                            </div>

                            <div className="w-full bg-white/5 h-1 rounded-full mt-8 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* STATUS: SUCCESS */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center py-2 text-center animate-slideUp">
                            <div className="mb-8 relative">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="w-20 h-20 bg-gradient-to-tr from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] relative z-10 border border-white/20">
                                    <i className="fas fa-check text-3xl text-white"></i>
                                </div>
                            </div>

                            <div className="bg-red-600/10 px-4 py-1.5 rounded-full border border-red-600/20 mb-6">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                                    LFNM • SYSTEM
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-[1000] text-white mb-4 tracking-tighter italic uppercase leading-none drop-shadow-lg">
                                {texts.successTitle}
                            </h2>

                            <p className="text-gray-400 mb-10 text-sm font-medium leading-relaxed max-w-[280px] mx-auto border-t border-white/5 pt-4">
                                {texts.successMessage}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                {mode === 'publish' && (
                                    <button
                                        onClick={onViewNews}
                                        className="w-full py-4 bg-red-600 text-white rounded-xl font-[1000] text-xs uppercase tracking-[0.2em] hover:bg-red-700 transform hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group"
                                    >
                                        VER NO SITE
                                        <i className="fas fa-external-link-alt group-hover:translate-x-1 transition-transform"></i>
                                    </button>
                                )}

                                {/* NEW "CREATE NEW" BUTTON */}
                                {onCreateNew && (
                                    <button
                                        onClick={() => { onClose(); onCreateNew(); }}
                                        className="w-full py-4 bg-white text-black rounded-xl font-[1000] text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transform hover:scale-[1.02] transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-plus"></i> CRIAR NOVA NOTÍCIA
                                    </button>
                                )}

                                <button
                                    onClick={onClose}
                                    className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all border border-white/10 ${mode === 'publish'
                                        ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                                        : 'bg-white text-black hover:bg-gray-200 transform hover:scale-[1.02] shadow-lg font-[1000]'
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
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                                <i className="fas fa-times text-4xl text-red-500"></i>
                            </div>
                            <h3 className="text-2xl font-[1000] text-white uppercase italic tracking-tighter mb-2">Falha no Envio</h3>

                            <div className="bg-red-900/20 p-6 rounded-2xl border border-red-500/20 w-full mb-8 backdrop-blur-sm">
                                <p className="text-red-400 text-xs font-bold uppercase tracking-wide leading-relaxed break-words">{progressMessage}</p>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-white text-black rounded-xl font-[1000] text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all shadow-xl hover:scale-[1.02]"
                            >
                                <i className="fas fa-redo mr-2"></i> Tentar Novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublishSuccessModal;
