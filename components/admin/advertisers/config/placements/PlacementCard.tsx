
import React from 'react';
import { PlacementDef } from './placementTypes';
import { AdPlanConfig } from '../../../../../types';

interface PlacementCardProps {
  placement: PlacementDef;
  plans: AdPlanConfig[];
  onTogglePlan: (planId: string, placementId: string) => void;
}

const PlacementCard: React.FC<PlacementCardProps> = ({ placement, plans, onTogglePlan }) => {
  const isComingSoon = placement.status === 'coming_soon';

  return (
    <div className={`bg-white rounded-2xl border p-5 flex flex-col h-full transition-all ${isComingSoon ? 'border-gray-100 opacity-70 bg-gray-50/50' : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'}`}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isComingSoon ? 'bg-gray-200 text-gray-400' : 'bg-black text-white'}`}>
                    <i className={`fas ${placement.icon}`}></i>
                </div>
                <div>
                    <h4 className="text-xs font-black uppercase text-gray-900 leading-tight">{placement.label}</h4>
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${isComingSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {isComingSoon ? 'Em Breve' : 'Ativo'}
                    </span>
                </div>
            </div>
        </div>

        {/* Description */}
        <p className="text-[10px] text-gray-500 font-medium mb-6 leading-relaxed flex-grow">
            {placement.description}
        </p>

        {/* Plans Toggles */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-[8px] font-black uppercase text-gray-300 tracking-widest mb-2">Disponível nos Planos:</p>
            {plans.map(plan => {
                const isChecked = plan.features.placements.includes(placement.id);
                return (
                    <label key={plan.id} className={`flex items-center justify-between cursor-pointer group ${isComingSoon ? 'pointer-events-none grayscale opacity-50' : ''}`}>
                        <span className={`text-[10px] font-bold uppercase transition-colors ${isChecked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                            {plan.name}
                        </span>
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={isChecked}
                                onChange={() => onTogglePlan(plan.id, placement.id)}
                                disabled={isComingSoon}
                            />
                            <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black"></div>
                        </div>
                    </label>
                );
            })}
        </div>
    </div>
  );
};

export default PlacementCard;
