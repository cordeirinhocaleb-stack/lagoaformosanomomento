import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { getTermsOfServiceContent, getPrivacyPolicyContent, TERMS_VERSION, TERMS_LAST_UPDATED } from '@/constants/termsOfService';
import ReactMarkdown from 'react-markdown';
import { User } from '../../types';

interface TermsOfServiceModalProps {
    visible: boolean;
    onAccept: () => Promise<boolean>;
    onDecline: () => void;
    user?: User | null;
    onError?: (error: any, context: string) => void;
    /** Permitir fechar sem aceitar (opcional) */
    allowClose?: boolean;
}

type Tab = 'terms' | 'privacy';

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
    visible, onAccept, onDecline, user, onError, allowClose
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('terms');
    const [isAccepting, setIsAccepting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Scroll tracking for each tab
    const [scrolledTerms, setScrolledTerms] = useState(false);
    const [scrolledPrivacy, setScrolledPrivacy] = useState(false);

    // Acceptance state
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate content
    const termsContent = getTermsOfServiceContent(
        user?.name || 'Visitante',
        user?.email || 'email@não.informado'
    );
    const privacyContent = getPrivacyPolicyContent();

    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
            // Reset state when reopening
            setScrolledTerms(!!user?.termsAccepted);
            setScrolledPrivacy(!!user?.termsAccepted);
            setAcceptedTerms(!!user?.termsAccepted);
            setAcceptedPrivacy(!!user?.termsAccepted);
            setActiveTab('terms');
            setShowSuccess(false);
            setIsAccepting(false);
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [visible, user?.termsAccepted]);

    // Reset scroll position when switching tabs
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

            if (isAtBottom) {
                if (activeTab === 'terms' && !scrolledTerms) { setScrolledTerms(true); }
                if (activeTab === 'privacy' && !scrolledPrivacy) { setScrolledPrivacy(true); }
            }
        }
    };

    const canAccept = acceptedTerms && acceptedPrivacy;
    const currentScrolled = activeTab === 'terms' ? scrolledTerms : scrolledPrivacy;

    const handleScrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const handleAcceptClick = async () => {
        if (isAccepting || showSuccess) return;

        // Se o usuário já aceitou os termos anteriormente (está apenas revisando),
        // o botão age como um "Fechar" imediato.
        if (user?.termsAccepted) {
            onDecline();
            return;
        }

        setIsAccepting(true);
        try {
            const success = await onAccept();
            if (success) {
                setShowSuccess(true);
                // Pequeno delay para o usuário ver o feedback de "Termos Aceitos"
                setTimeout(() => {
                    onDecline(); // Fecha o modal após o delay
                }, 1500);
            }
        } catch (error) {
            console.error("Erro ao aceitar termos:", error);
            if (onError) {
                onError(error, "Aceite de Termos");
            } else {
                alert("Erro ao salvar aceite. Tente novamente.");
            }
        } finally {
            setIsAccepting(false);
        }
    };

    if (!visible) { return null; }

    return (
        <div className="fixed inset-0 z-[10050] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
            {/* Background Logo Effect */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.015] transform scale-[4]">
                <Logo />
            </div>

            {/* Main Card */}
            <div className={`w-full max-w-5xl bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-500 relative ${showSuccess ? 'scale-95 opacity-50' : ''}`}>

                {/* Explicit Close Button for Revisors or Optional Close */}
                {(user?.termsAccepted || allowClose) && !showSuccess && (
                    <button
                        onClick={onDecline}
                        className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
                        title="Fechar"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                )}

                {/* Header with Tabs */}
                <div className="bg-gradient-to-r from-zinc-900 to-black p-0 border-b border-white/10">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`flex-1 py-6 md:py-8 text-center transition-all relative ${activeTab === 'terms' ? 'bg-white/5' : 'hover:bg-white/5 text-gray-500'}`}
                            disabled={showSuccess}
                        >
                            <h2 className={`text-sm md:text-lg font-black uppercase tracking-widest mb-1 ${activeTab === 'terms' ? 'text-white' : 'text-gray-600'}`}>Termos de Uso</h2>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Regras e Condições</p>
                            {activeTab === 'terms' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>}
                            {(acceptedTerms || showSuccess) && <div className="absolute top-4 right-4 text-green-500"><i className="fas fa-check-circle"></i></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`flex-1 py-6 md:py-8 text-center transition-all relative ${activeTab === 'privacy' ? 'bg-white/5' : 'hover:bg-white/5 text-gray-500'}`}
                            disabled={showSuccess}
                        >
                            <h2 className={`text-sm md:text-lg font-black uppercase tracking-widest mb-1 ${activeTab === 'privacy' ? 'text-white' : 'text-gray-600'}`}>Privacidade</h2>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Dados e Segurança</p>
                            {activeTab === 'privacy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>}
                            {(acceptedPrivacy || showSuccess) && <div className="absolute top-4 right-4 text-green-500"><i className="fas fa-check-circle"></i></div>}
                        </button>
                    </div>

                    <div className="px-8 py-4 flex items-center justify-between">
                        <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
                            Versão {TERMS_VERSION} • Atualizado em {TERMS_LAST_UPDATED}
                        </p>
                        {!currentScrolled && !showSuccess && (
                            <button
                                onClick={handleScrollToBottom}
                                className="text-xs font-black text-yellow-500 uppercase tracking-wider hover:text-white transition-colors"
                            >
                                <i className="fas fa-arrow-down mr-2 animate-bounce"></i> Pular para o final
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-[#0A0A0A] relative"
                >
                    <div className="prose prose-invert prose-sm md:prose-base max-w-none animate-fadeIn">
                        <ReactMarkdown
                            components={{
                                h1: ({ ...props }) => <h1 className="text-2xl md:text-3xl font-black text-white mb-4 mt-8 first:mt-0" {...props} />,
                                h2: ({ ...props }) => <h2 className="text-xl md:text-2xl font-black text-white mb-3 mt-6 border-b border-white/10 pb-2" {...props} />,
                                h3: ({ ...props }) => <h3 className="text-lg md:text-xl font-bold text-white mb-2 mt-4" {...props} />,
                                p: ({ ...props }) => <p className="text-gray-300 mb-4 leading-relaxed" {...props} />,
                                ul: ({ ...props }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2" {...props} />,
                                li: ({ ...props }) => <li className="ml-4" {...props} />,
                                strong: ({ ...props }) => <strong className="text-white font-bold" {...props} />,
                                hr: ({ ...props }) => <hr className="border-white/10 my-6" {...props} />,
                                blockquote: ({ ...props }) => (
                                    <blockquote className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-500/5 text-yellow-200/90 italic my-6 rounded-r-lg" {...props} />
                                ),
                            }}
                        >
                            {activeTab === 'terms' ? termsContent : privacyContent}
                        </ReactMarkdown>
                        {/* Footer visual spacing */}
                        <div className="h-12" />
                    </div>

                    {/* Scroll / Jump Button (Floating Overlay) */}
                    {!currentScrolled && !showSuccess && (
                        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-8 pb-4 text-center pointer-events-auto">
                            <button
                                onClick={handleScrollToBottom}
                                className="inline-flex items-center gap-2 bg-red-600 hover:bg-white text-white hover:text-red-600 border border-red-600 hover:border-white rounded-full px-6 py-3 transition-all shadow-lg hover:shadow-red-600/20 group"
                            >
                                <i className="fas fa-arrow-down animate-bounce group-hover:text-red-600"></i>
                                <span className="text-xs font-black uppercase tracking-wider">
                                    Pular para o final
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer with Checkboxes and Buttons */}
                <div className="bg-black/60 border-t border-white/10 p-6 md:p-8 relative">
                    {/* Success Overlay for Footer */}
                    {showSuccess && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col items-center justify-center animate-fadeIn">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/20 animate-scaleIn">
                                <i className="fas fa-check text-2xl text-white"></i>
                            </div>
                            <h3 className="text-white font-black uppercase italic tracking-tighter text-xl">Termos aceitos com sucesso!</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Sincronizando com o portal...</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Terms Checkbox */}
                        <label className={`flex items-start gap-4 cursor-pointer group transition-all ${(!scrolledTerms && !user?.termsAccepted) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 p-2 rounded-xl'}`}>
                            <input
                                type="checkbox"
                                checked={acceptedTerms || showSuccess}
                                onChange={(e) => {
                                    if (user?.termsAccepted || showSuccess) { return; }
                                    setAcceptedTerms(e.target.checked);
                                    if (e.target.checked && !acceptedPrivacy) {
                                        setTimeout(() => setActiveTab('privacy'), 500);
                                    }
                                }}
                                disabled={(!scrolledTerms && !user?.termsAccepted) || !!user?.termsAccepted || showSuccess}
                                className="w-5 h-5 mt-1 rounded border-2 border-white/20 bg-white/5 checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            />
                            <div>
                                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">
                                    {(user?.termsAccepted || showSuccess) ? 'Termos de Uso Aceitos' : 'Li e aceito os Termos de Uso'}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-0.5 font-medium">
                                    {(user?.termsAccepted || showSuccess) ? 'Consentimento registrado' : 'Necessário ler todo o conteúdo da aba "Termos"'}
                                </p>
                            </div>
                        </label>

                        {/* Privacy Checkbox */}
                        <label className={`flex items-start gap-4 cursor-pointer group transition-all ${(!scrolledPrivacy && !user?.termsAccepted) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 p-2 rounded-xl'}`}>
                            <input
                                type="checkbox"
                                checked={acceptedPrivacy || showSuccess}
                                onChange={(e) => {
                                    if (user?.termsAccepted || showSuccess) { return; }
                                    setAcceptedPrivacy(e.target.checked);
                                    if (e.target.checked && !acceptedTerms) {
                                        setTimeout(() => setActiveTab('terms'), 500);
                                    }
                                }}
                                disabled={(!scrolledPrivacy && !user?.termsAccepted) || !!user?.termsAccepted || showSuccess}
                                className="w-5 h-5 mt-1 rounded border-2 border-white/20 bg-white/5 checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            />
                            <div>
                                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">
                                    {(user?.termsAccepted || showSuccess) ? 'Política Aceita' : 'Aceito a Política de Privacidade'}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-0.5 font-medium">
                                    {(user?.termsAccepted || showSuccess) ? 'Privacidade garantida' : 'Necessário ler todo o conteúdo da aba "Privacidade"'}
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {(!user?.termsAccepted && !showSuccess) && (
                            <button
                                onClick={onDecline}
                                disabled={isAccepting}
                                className="flex-1 py-4 px-6 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all bg-white/5 border-2 border-white/10 text-white hover:bg-red-600/20 hover:border-red-600/50"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Recusar e Sair
                            </button>
                        )}
                        <button
                            onClick={handleAcceptClick}
                            disabled={(!canAccept && !showSuccess) || isAccepting || showSuccess}
                            className={`flex-1 py-4 px-6 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest transition-all relative overflow-hidden ${(canAccept || showSuccess) && !isAccepting
                                ? 'bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-xl'
                                : 'bg-white/5 text-gray-700 cursor-not-allowed border-2 border-white/5'
                                }`}
                        >
                            <span className={`flex items-center justify-center gap-2 ${isAccepting ? 'opacity-0' : 'opacity-100'}`}>
                                <i className={`fas ${showSuccess ? 'fa-check-circle' : 'fa-arrow-right'}`}></i>
                                {showSuccess ? 'Termos Aceitos' : ((user?.termsAccepted || showSuccess) ? 'Fechar' : (canAccept ? 'Confirmar e Continuar' : 'Leia os Termos'))}
                            </span>

                            {isAccepting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-700">
                                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                                    Sincronizando...
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Helper Text */}
                    {!currentScrolled && !showSuccess && (
                        <p className="text-center text-[10px] text-gray-500 mt-6 font-bold uppercase tracking-wider animate-pulse">
                            <i className="fas fa-mouse mr-1"></i>
                            Role a aba <span className="text-white">"{activeTab === 'terms' ? 'Termos de Uso' : 'Privacidade'}"</span> para habilitar o aceite
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TermsOfServiceModal;
