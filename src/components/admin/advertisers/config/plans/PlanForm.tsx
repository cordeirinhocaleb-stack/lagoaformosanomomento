
import React from 'react';
import { AdPlanConfig } from '../../../../../types';
import PlanPricesTable from './PlanPricesTable';
import PlanFeaturesForm from './PlanFeaturesForm';

interface PlanFormProps {
    plan: AdPlanConfig;
    onChange: (updated: AdPlanConfig) => void;
    canEditFinancials: boolean; // Permissão financial_edit
    isNew?: boolean;
    darkMode?: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ plan, onChange, canEditFinancials, isNew, darkMode = false }) => {
    return (
        <div className="space-y-8 animate-fadeIn">

            {/* Identificação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`text-[9px] font-black uppercase mb-2 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Nome do Plano</label>
                    <input
                        type="text"
                        value={plan.name}
                        onChange={e => onChange({ ...plan, name: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-white border-gray-200 focus:border-black'}`}
                        placeholder="Ex: Gold"
                    />
                </div>
                <div>
                    <label className={`text-[9px] font-black uppercase mb-2 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>ID do Sistema (Slug)</label>
                    <input
                        type="text"
                        value={plan.id}
                        onChange={e => onChange({ ...plan, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        disabled={!isNew}
                        className={`w-full border rounded-xl px-4 py-3 text-sm font-mono outline-none ${!isNew
                                ? (darkMode ? 'bg-white/5 border-white/5 text-gray-500 cursor-not-allowed' : 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed')
                                : (darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-white border-gray-200 focus:border-black')
                            }`}
                        placeholder="ex: gold_plan"
                    />
                </div>
            </div>

            {/* Descrição e Marketing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={`text-[9px] font-black uppercase mb-2 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Descrição Comercial</label>
                    <textarea
                        value={plan.description}
                        onChange={e => onChange({ ...plan, description: e.target.value })}
                        className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none h-24 ${darkMode ? 'bg-black/20 border-white/10 text-white focus:border-white/30' : 'bg-white border-gray-200 focus:border-black'}`}
                        placeholder="Benefícios principais..."
                    />
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={`text-[9px] font-black uppercase mb-2 block tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Cashback (%)</label>
                        <div className={`flex items-center gap-2 border rounded-xl p-3 w-32 ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white border-gray-200'}`}>
                            <i className={`fas fa-percent text-xs ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}></i>
                            <input
                                type="number"
                                value={plan.cashbackPercent || 0}
                                onChange={e => onChange({ ...plan, cashbackPercent: parseFloat(e.target.value) })}
                                disabled={!canEditFinancials}
                                className={`w-full font-black outline-none bg-transparent disabled:opacity-50 ${darkMode ? 'text-green-500' : 'text-green-600'}`}
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
                        <span className={`text-xs font-bold uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Marcar como "Mais Popular"</span>
                    </label>
                </div>
            </div>

            <div className={`w-full h-px my-4 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}></div>

            {/* Preços */}
            <PlanPricesTable
                prices={plan.prices}
                onChange={prices => onChange({ ...plan, prices })}
                readOnly={!canEditFinancials}
                darkMode={darkMode}
            />

            <div className={`w-full h-px my-4 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}></div>

            {/* Features */}
            <PlanFeaturesForm
                features={plan.features}
                onChange={features => onChange({ ...plan, features })}
                readOnly={!canEditFinancials}
                darkMode={darkMode}
            />

        </div>
    );
};

export default PlanForm;
