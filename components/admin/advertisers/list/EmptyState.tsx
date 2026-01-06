
import React from 'react';

interface EmptyStateProps {
  onCreate: () => void;
  hasFilter: boolean;
  onClearFilter: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreate, hasFilter, onClearFilter }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm text-center px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full animate-pulse"></div>
            <i className="fas fa-store-slash text-3xl text-gray-300"></i>
        </div>
        
        <h3 className="text-xl font-black uppercase text-gray-900 tracking-tight mb-2">
            {hasFilter ? 'Nenhum parceiro encontrado' : 'Carteira Vazia'}
        </h3>
        
        <p className="text-sm font-medium text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
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
                className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95"
            >
                Cadastrar Parceiro
            </button>
        )}
    </div>
  );
};

export default EmptyState;
