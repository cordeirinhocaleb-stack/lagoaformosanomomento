import React from 'react';

interface SecuritySectionProps {
    onOpenTerms?: () => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ onOpenTerms }) => {
    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-8">
                Segurança & <span className="text-red-600">Login</span>
            </h1>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase">
                            Termos de Uso e Privacidade
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Leia as regras e políticas da plataforma.
                        </p>
                    </div>
                    <button
                        onClick={onOpenTerms}
                        className="bg-gray-200 hover:bg-black hover:text-white text-gray-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Ler Termos
                    </button>
                </div>

                <div className="text-center py-10 border-t border-gray-100">
                    <p className="text-gray-300 font-bold uppercase text-xs">
                        Mais opções de segurança em breve...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SecuritySection;
