
import React from 'react';
import { PlacementDef } from './placementTypes';
import { AdPlanConfig } from '../../../../../types';

interface PlacementCardProps {
    placement: PlacementDef;
    plans: AdPlanConfig[];
    onTogglePlan: (planId: string, placementId: string) => void;
    darkMode?: boolean;
}

const PlacementCard: React.FC<PlacementCardProps> = ({ placement, plans, onTogglePlan, darkMode = false }) => {
    const isComingSoon = placement.status === 'coming_soon';

    return (
        <div className={`rounded-2xl border p-5 flex flex-col h-full transition-all ${isComingSoon
                ? (darkMode ? 'bg-black/20 border-white/5 opacity-50' : 'border-gray-100 opacity-70 bg-gray-50/50')
                : (darkMode ? 'bg-black/40 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md')
            }`}>

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isComingSoon
                            ? (darkMode ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400')
                            : (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                        }`}>
                        <i className={`fas ${placement.icon}`}></i>
                    </div>
                    <div>
                        <h4 className={`text-xs font-black uppercase leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{placement.label}</h4>
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${isComingSoon
                                ? (darkMode ? 'bg-yellow-900/20 text-yellow-600' : 'bg-yellow-100 text-yellow-700')
                                : (darkMode ? 'bg-green-900/20 text-green-500' : 'bg-green-100 text-green-700')
                            }`}>
                            {isComingSoon ? 'Em Breve' : 'Ativo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <p className={`text-[10px] font-medium mb-6 leading-relaxed flex-grow ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {placement.description}
            </p>

            {/* Plans Toggles */}
            <div className={`border-t pt-4 space-y-3 ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>Disponível nos Planos:</p>
                {plans.map(plan => {
                    const isChecked = plan.features.placements.includes(placement.id);
                    return (
                        <label key={plan.id} className={`flex items-center justify-between cursor-pointer group ${isComingSoon ? 'pointer-events-none grayscale opacity-50' : ''}`}>
                            <span className={`text-[10px] font-bold uppercase transition-colors ${isChecked
                                    ? (darkMode ? 'text-white' : 'text-gray-900')
                                    : (darkMode ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600')
                                }`}>
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
                                <div className={`w-8 h-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black ${darkMode ? 'bg-white/10 peer-checked:bg-white peer-checked:after:border-transparent peer-checked:after:bg-black' : 'bg-gray-200'}`}></div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default PlacementCard;
