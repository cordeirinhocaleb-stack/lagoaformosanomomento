
import React from 'react';

interface EmptyStateProps {
    onCreate: () => void;
    hasFilter: boolean;
    onClearFilter: () => void;
    darkMode?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreate, hasFilter, onClearFilter, darkMode = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center py-20 rounded-[3rem] border shadow-sm text-center px-4 ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className={`absolute inset-0 border-4 rounded-full animate-pulse ${darkMode ? 'border-white/5' : 'border-gray-100'}`}></div>
                <i className="fas fa-store-slash text-3xl text-gray-300"></i>
            </div>

            <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {hasFilter ? 'Nenhum parceiro encontrado' : 'Carteira Vazia'}
            </h3>

            <p className={`text-sm font-medium max-w-md mx-auto mb-8 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {hasFilter
                    ? 'Tente ajustar os filtros de busca ou status para encontrar o que procura.'
                    : 'O sistema comercial está pronto. Comece cadastrando o primeiro parceiro da rede.'}
            </p>

            {hasFilter ? (
                <button
                    onClick={onClearFilter}
                    className="text-red-600 font-black uppercase text-xs tracking-widest hover:underline"
                >
                    Limpar Filtros
                </button>
            ) : (
                <button
                    onClick={onCreate}
                    className={`px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95 ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                >
                    Cadastrar Parceiro
                </button>
            )}
        </div>
    );
};

export default EmptyState;
