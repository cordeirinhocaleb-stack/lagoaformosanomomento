
import React from 'react';
import { AdPlanConfig } from '../../../../../types';
import PlanPricesTable from './PlanPricesTable';
import PlanFeaturesForm from './PlanFeaturesForm';

interface PlanFormProps {
  plan: AdPlanConfig;
  onChange: (updated: AdPlanConfig) => void;
  canEditFinancials: boolean; // Permissão financial_edit
  isNew?: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ plan, onChange, canEditFinancials, isNew }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
        
        {/* Identificação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Nome do Plano</label>
                <input 
                    type="text" 
                    value={plan.name}
                    onChange={e => onChange({ ...plan, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black"
                    placeholder="Ex: Gold"
                />
            </div>
            <div>
                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">ID do Sistema (Slug)</label>
                <input 
                    type="text" 
                    value={plan.id}
                    onChange={e => onChange({ ...plan, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    disabled={!isNew}
                    className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none ${!isNew ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:border-black'}`}
                    placeholder="ex: gold_plan"
                />
            </div>
        </div>

        {/* Descrição e Marketing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Descrição Comercial</label>
                <textarea 
                    value={plan.description}
                    onChange={e => onChange({ ...plan, description: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none h-24 focus:border-black"
                    placeholder="Benefícios principais..."
                />
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cashback (%)</label>
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 w-32">
                        <i className="fas fa-percent text-gray-300 text-xs"></i>
                        <input 
                            type="number" 
                            value={plan.cashbackPercent || 0}
                            onChange={e => onChange({ ...plan, cashbackPercent: parseFloat(e.target.value) })}
                            disabled={!canEditFinancials}
                            className="w-full font-black text-green-600 outline-none bg-transparent disabled:text-gray-400"
                        />
                    </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={plan.isPopular}
                        onChange={e => onChange({ ...plan, isPopular: e.target.checked })}
                        className="rounded text-red-600 focus:ring-red-500" 
                    />
                    <span className="text-xs font-bold uppercase text-gray-600">Marcar como "Mais Popular"</span>
                </label>
            </div>
        </div>

        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Preços */}
        <PlanPricesTable 
            prices={plan.prices} 
            onChange={prices => onChange({ ...plan, prices })} 
            readOnly={!canEditFinancials}
        />

        <div className="w-full h-px bg-gray-100 my-4"></div>

        {/* Features */}
        <PlanFeaturesForm 
            features={plan.features}
            onChange={features => onChange({ ...plan, features })}
            readOnly={!canEditFinancials}
        />

    </div>
  );
};

export default PlanForm;
