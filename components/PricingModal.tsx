
import React from 'react';
import { AdPricingConfig, AdPlan } from '../types';

interface PricingModalProps {
  config: AdPricingConfig;
  onClose: () => void;
  onSelectPlan: (plan: AdPlan) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ config, onClose, onSelectPlan }) => {
  return (
    <div className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      {/* Botão Fechar */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
      >
        <i className="fas fa-times text-2xl"></i>
      </button>

      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-4">
            Destaque sua <span className="text-red-600">Marca</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio e apareça para milhares de leitores no maior portal da região.
          </p>
          {config.promoText && (
             <div className="mt-6 inline-block bg-yellow-400 text-black px-6 py-2 rounded-full font-black uppercase text-xs tracking-widest animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                <i className="fas fa-bullhorn mr-2"></i> {config.promoText}
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          
          {/* PLANO PREMIUM */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
             <div className="mb-8">
                <h3 className="text-2xl font-black uppercase text-gray-900 tracking-tight flex items-center gap-3">
                   <i className="fas fa-star text-blue-500"></i> Premium
                </h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Visibilidade Constante</p>
             </div>
             
             <div className="mb-8">
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black text-gray-900">R$ {config.premiumDailyPrice}</span>
                   <span className="text-gray-400 font-bold text-sm">/dia</span>
                </div>
                {config.cashbackPercent > 0 && (
                   <p className="text-green-600 font-bold text-xs uppercase mt-2 flex items-center gap-2">
                      <i className="fas fa-wallet"></i> Receba {config.cashbackPercent}% de Cashback
                   </p>
                )}
             </div>

             <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                   <i className="fas fa-check text-green-500"></i> Página Exclusiva do Anunciante
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                   <i className="fas fa-check text-green-500"></i> Link para WhatsApp e Instagram
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-700">
                   <i className="fas fa-check text-green-500"></i> Até 5 Produtos na Vitrine
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-400">
                   <i className="fas fa-times"></i> Destaque no Banner Rotativo Master
                </li>
             </ul>

             <button 
                onClick={() => onSelectPlan('premium')}
                className="w-full bg-blue-50 text-blue-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
             >
                Selecionar Premium
             </button>
          </div>

          {/* PLANO MASTER */}
          <div className="bg-black text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 border border-gray-800 shadow-2xl">
             <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded-bl-2xl">
                Mais Vendido
             </div>
             <div className="mb-8">
                <h3 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-3">
                   <i className="fas fa-crown text-yellow-400"></i> Master
                </h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Domínio Total do Portal</p>
             </div>
             
             <div className="mb-8">
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black text-white">R$ {config.masterDailyPrice}</span>
                   <span className="text-gray-500 font-bold text-sm">/dia</span>
                </div>
                {config.cashbackPercent > 0 && (
                   <p className="text-green-400 font-bold text-xs uppercase mt-2 flex items-center gap-2">
                      <i className="fas fa-wallet"></i> Receba {config.cashbackPercent}% de Cashback
                   </p>
                )}
             </div>

             <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                   <i className="fas fa-check text-red-500"></i> Todas as vantagens do Premium
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                   <i className="fas fa-check text-red-500"></i> <span className="text-white">Destaque no Banner Rotativo (Topo)</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                   <i className="fas fa-check text-red-500"></i> Vitrine Ilimitada de Produtos
                </li>
                <li className="flex items-center gap-3 text-sm font-bold text-gray-300">
                   <i className="fas fa-check text-red-500"></i> Prioridade no Suporte
                </li>
             </ul>

             <button 
                onClick={() => onSelectPlan('master')}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
             >
                Contratar Master
             </button>
          </div>

        </div>
        
        <div className="mt-12 text-center">
           <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
              Pagamento via PIX ou Cartão de Crédito. Cancelamento a qualquer momento.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
