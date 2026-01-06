
import React from 'react';
import { AdPricingConfig } from '../../../../types';

interface PlansConfigViewProps {
  config: AdPricingConfig;
  onSave: (config: AdPricingConfig) => void;
  onCancel: () => void;
}

const PlansConfigView: React.FC<PlansConfigViewProps> = ({ config, onSave, onCancel }) => {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
            <button 
                onClick={onCancel}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-2 flex items-center gap-2 transition-colors"
            >
                <i className="fas fa-arrow-left"></i> Voltar
            </button>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">
                Configuração de <span className="text-red-600">Planos</span>
            </h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <i className="fas fa-tags text-3xl"></i>
        </div>
        <h3 className="text-lg font-black uppercase text-gray-400 tracking-widest">
            Configurador em Construção
        </h3>
        <p className="text-xs text-gray-400 mt-2">
            A gestão de preços e recursos dos planos será implementada aqui.
        </p>
      </div>
    </div>
  );
};

export default PlansConfigView;
