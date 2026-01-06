
import React, { useState } from 'react';
import { AdPricingConfig, AdPlan } from '../../types';

interface PricingModalProps {
  config: AdPricingConfig;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
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

      <div className="w-full max-w-6xl overflow-y-auto max-h-[90vh]">
        <div className="text-center mb-12 pt-10">
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

        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(config.plans.length, 3)} gap-8 px-4 justify-center`}>
          
          {config.plans.map(plan => {
              const isMaster = plan.features.placements.includes('master_carousel');
              const isStandard = plan.features.placements.includes('standard_list');
              
              return (
                <div key={plan.id} className={`${isMaster ? 'bg-black text-white border-gray-800 shadow-2xl scale-105 z-10' : 'bg-white text-gray-900'} rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 border ${!isMaster ? 'border-gray-200' : ''}`}>
                    {isMaster && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded-bl-2xl">
                            Recomendado
                        </div>
                    )}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 to-gray-400"></div>
                    
                    <div className="mb-8">
                        <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                        {isMaster && <i className="fas fa-crown text-yellow-400"></i>}
                        {!isMaster && <i className="fas fa-star text-blue-500"></i>}
                        {plan.name}
                        </h3>
                        <p className={`${isMaster ? 'text-gray-400' : 'text-gray-500'} text-xs font-bold uppercase tracking-widest mt-2`}>
                            {plan.description || "Solução completa"}
                        </p>
                    </div>
                    
                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black">R$ {plan.prices.daily}</span>
                        <span className={`font-bold text-sm ${isMaster ? 'text-gray-500' : 'text-gray-400'}`}>/dia</span>
                        </div>
                        {plan.cashbackPercent && plan.cashbackPercent > 0 && (
                        <p className="text-green-500 font-bold text-xs uppercase mt-2 flex items-center gap-2">
                            <i className="fas fa-wallet"></i> Receba {plan.cashbackPercent}% de Cashback
                        </p>
                        )}
                    </div>

                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3 text-sm font-bold">
                            <i className={`fas fa-check ${isMaster ? 'text-red-500' : 'text-green-500'}`}></i> 
                            Banner: <span className="uppercase text-[10px] bg-gray-100 text-black px-2 py-0.5 rounded">{plan.features.placements.map(p => p.replace('_', ' ')).join(', ')}</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold">
                            <i className={`fas ${plan.features.canCreateJobs ? 'fa-check' : 'fa-times'} ${plan.features.canCreateJobs ? (isMaster ? 'text-red-500' : 'text-green-500') : 'text-gray-400'}`}></i>
                            Sistema de Vagas
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold">
                            <i className={`fas ${plan.features.socialVideoAd ? 'fa-check' : 'fa-times'} ${plan.features.socialVideoAd ? (isMaster ? 'text-red-500' : 'text-green-500') : 'text-gray-400'}`}></i>
                            Vídeo nas Redes
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold">
                            <i className={`fas fa-box-open ${isMaster ? 'text-red-500' : 'text-green-500'}`}></i>
                            {plan.features.maxProducts === 0 ? 'Produtos Ilimitados' : `Até ${plan.features.maxProducts} Produtos`}
                        </li>
                        <li className="flex items-center gap-3 text-sm font-bold">
                            <i className={`fas fa-share-alt ${isMaster ? 'text-red-500' : 'text-green-500'}`}></i>
                            {plan.features.allowedSocialNetworks.length > 0 ? plan.features.allowedSocialNetworks.join(', ') : 'Sem divulgação social'}
                        </li>
                    </ul>

                    <button 
                        onClick={() => onSelectPlan(plan.id)}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
                            isMaster 
                            ? 'bg-red-600 text-white hover:bg-white hover:text-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100'
                        }`}
                    >
                        Selecionar {plan.name}
                    </button>
                </div>
              );
          })}

        </div>
        
        <div className="mt-12 text-center pb-10">
           <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">
              Pagamento via PIX ou Cartão de Crédito. Cancelamento a qualquer momento.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
