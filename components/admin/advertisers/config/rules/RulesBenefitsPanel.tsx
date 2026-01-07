
import React from 'react';
import { AdPricingConfig } from '../../../../../types';
import BenefitList from './BenefitList';

interface RulesBenefitsPanelProps {
    config: AdPricingConfig;
    darkMode?: boolean;
}

const RulesBenefitsPanel: React.FC<RulesBenefitsPanelProps> = ({ config, darkMode = false }) => {
    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center gap-4 bg-yellow-50 border border-yellow-100 p-6 rounded-[2rem]">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xl shadow-lg shrink-0">
                    <i className="fas fa-scale-balanced"></i>
                </div>
                <div>
                    <h3 className="text-lg font-black uppercase text-yellow-900 tracking-tight">Regras de Negócio</h3>
                    <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest">
                        Visualize os limites e permissões atribuídos a cada plano comercial.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {config.plans.map(plan => {
                    const isMaster = plan.id === 'master';
                    return (
                        <div key={plan.id} className={`rounded-[2.5rem] p-6 border transition-all ${isMaster ? 'bg-black text-white border-black shadow-xl ring-4 ring-gray-100' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{plan.name}</h4>
                                    <span className={`text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded ${isMaster ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {isMaster ? 'Master' : 'Standard'}
                                    </span>
                                </div>
                                {isMaster && <i className="fas fa-crown text-yellow-400 text-2xl"></i>}
                            </div>

                            <div className="opacity-90">
                                <BenefitList plan={plan} />
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest opacity-60">
                                <span>Cashback: {plan.cashbackPercent}%</span>
                                <span>ID: {plan.id}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RulesBenefitsPanel;
