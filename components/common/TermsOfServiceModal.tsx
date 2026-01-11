import React, { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import { getTermsOfServiceContent, getPrivacyPolicyContent, TERMS_VERSION, TERMS_LAST_UPDATED } from '../../src/constants/termsOfService';
import ReactMarkdown from 'react-markdown';
import { User } from '../../types';

interface TermsOfServiceModalProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
    user?: User | null;
}

type Tab = 'terms' | 'privacy';

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ visible, onAccept, onDecline, user }) => {
    const [activeTab, setActiveTab] = useState<Tab>('terms');

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
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [visible]);

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
                if (activeTab === 'terms' && !scrolledTerms) {setScrolledTerms(true);}
                if (activeTab === 'privacy' && !scrolledPrivacy) {setScrolledPrivacy(true);}
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

    if (!visible) {return null;}

    return (
        <div className="fixed inset-0 z-[10050] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
            {/* Background Logo Effect */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.015] transform scale-[4]">
                <Logo />
            </div>

            {/* Main Card */}
            <div className="w-full max-w-5xl bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with Tabs */}
                <div className="bg-gradient-to-r from-zinc-900 to-black p-0 border-b border-white/10">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('terms')}
                            className={`flex-1 py-6 md:py-8 text-center transition-all relative ${activeTab === 'terms' ? 'bg-white/5' : 'hover:bg-white/5 text-gray-500'}`}
                        >
                            <h2 className={`text-sm md:text-lg font-black uppercase tracking-widest mb-1 ${activeTab === 'terms' ? 'text-white' : 'text-gray-600'}`}>Termos de Uso</h2>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Regras e Condições</p>
                            {activeTab === 'terms' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>}
                            {acceptedTerms && <div className="absolute top-4 right-4 text-green-500"><i className="fas fa-check-circle"></i></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`flex-1 py-6 md:py-8 text-center transition-all relative ${activeTab === 'privacy' ? 'bg-white/5' : 'hover:bg-white/5 text-gray-500'}`}
                        >
                            <h2 className={`text-sm md:text-lg font-black uppercase tracking-widest mb-1 ${activeTab === 'privacy' ? 'text-white' : 'text-gray-600'}`}>Privacidade</h2>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Dados e Segurança</p>
                            {activeTab === 'privacy' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"></div>}
                            {acceptedPrivacy && <div className="absolute top-4 right-4 text-green-500"><i className="fas fa-check-circle"></i></div>}
                        </button>
                    </div>

                    <div className="px-8 py-4 flex items-center justify-between">
                        <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
                            Versão {TERMS_VERSION} • Atualizado em {TERMS_LAST_UPDATED}
                        </p>
                        {!currentScrolled && (
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
                    {!currentScrolled && (
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
                <div className="bg-black/60 border-t border-white/10 p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Terms Checkbox */}
                        <label className={`flex items-start gap-4 cursor-pointer group transition-opacity ${(!scrolledTerms && !user?.termsAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => {
                                    if (user?.termsAccepted) {return;} // Prevent change if already accepted
                                    setAcceptedTerms(e.target.checked);
                                    if (e.target.checked && !acceptedPrivacy) {
                                        setTimeout(() => setActiveTab('privacy'), 500);
                                    }
                                }}
                                disabled={(!scrolledTerms && !user?.termsAccepted) || !!user?.termsAccepted}
                                className="w-5 h-5 mt-1 rounded border-2 border-white/20 bg-white/5 checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            />
                            <div>
                                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">
                                    {user?.termsAccepted ? 'Termos de Uso Aceitos' : 'Li e aceito os Termos de Uso'}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-0.5">
                                    {user?.termsAccepted ? 'Você já aceitou este documento' : 'Necessário ler todo o conteúdo da aba "Termos"'}
                                </p>
                            </div>
                        </label>

                        {/* Privacy Checkbox */}
                        <label className={`flex items-start gap-4 cursor-pointer group transition-opacity ${(!scrolledPrivacy && !user?.termsAccepted) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <input
                                type="checkbox"
                                checked={acceptedPrivacy}
                                onChange={(e) => {
                                    if (user?.termsAccepted) {return;} // Prevent change if already accepted
                                    setAcceptedPrivacy(e.target.checked);
                                    if (e.target.checked && !acceptedTerms) {
                                        setTimeout(() => setActiveTab('terms'), 500);
                                    }
                                }}
                                disabled={(!scrolledPrivacy && !user?.termsAccepted) || !!user?.termsAccepted}
                                className="w-5 h-5 mt-1 rounded border-2 border-white/20 bg-white/5 checked:bg-red-600 checked:border-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            />
                            <div>
                                <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">
                                    {user?.termsAccepted ? 'Política Aceita' : 'Aceito a Política de Privacidade'}
                                </p>
                                <p className="text-gray-500 text-[10px] mt-0.5">
                                    {user?.termsAccepted ? 'Você já aceitou este documento' : 'Necessário ler todo o conteúdo da aba "Privacidade"'}
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {!user?.termsAccepted && (
                            <button
                                onClick={onDecline}
                                className="flex-1 py-4 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all bg-white/5 border-2 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                            >
                                <i className="fas fa-times mr-2"></i>
                                Recusar e Sair
                            </button>
                        )}
                        <button
                            onClick={onAccept}
                            disabled={!canAccept}
                            className={`flex-1 py-4 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${canAccept
                                ? 'bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-lg hover:shadow-red-600/20'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed border-2 border-white/5'
                                }`}
                        >
                            <i className="fas fa-check mr-2"></i>
                            {user?.termsAccepted ? 'Fechar' : (canAccept ? 'Aceitar e Continuar' : 'Leia os Termos Completos')}
                        </button>
                    </div>

                    {/* Helper Text */}
                    {!currentScrolled && (
                        <p className="text-center text-xs text-gray-500 mt-4 font-bold uppercase tracking-wider">
                            <i className="fas fa-info-circle mr-1"></i>
                            Role o documento da aba <span className="text-white">"{activeTab === 'terms' ? 'Termos de Uso' : 'Privacidade'}"</span> até o final
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TermsOfServiceModal;
