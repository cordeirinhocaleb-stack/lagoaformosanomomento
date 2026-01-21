
import React, { useMemo } from 'react';
import { AdPlanConfig } from '../../../../../types';
import { PLACEMENTS_REGISTRY } from './placementsRegistry';
import { PlacementModule, PlacementDef } from './placementTypes';
import PlacementCard from './PlacementCard';

interface PlacementsEditorProps {
    plans: AdPlanConfig[];
    onChange: (updatedPlans: AdPlanConfig[]) => void;
    darkMode?: boolean;
}

const MODULE_LABELS: Record<PlacementModule, string> = {
    home: 'Home Page',
    article: 'Leitura de Notícia',
    general: 'Estrutura Geral',
    jobs: 'Empregos',
    gigs: 'Bicos & Freelance',
    classifieds: 'Classificados',
    podcast: 'Podcast & Áudio',
    community: 'Comunidade & Grupos'
};

const PlacementsEditor: React.FC<PlacementsEditorProps> = ({ plans, onChange, darkMode = false }) => {

    const handleToggle = (planId: string, placementId: string) => {
        const updatedPlans = plans.map(plan => {
            if (plan.id !== planId) { return plan; }

            const currentList = plan.features.placements || [];
            const exists = currentList.includes(placementId);

            const newList = exists
                ? currentList.filter(id => id !== placementId)
                : [...currentList, placementId];

            return {
                ...plan,
                features: { ...plan.features, placements: newList }
            };
        });
        onChange(updatedPlans);
    };

    const groupedPlacements = useMemo(() => {
        const groups: Record<string, PlacementDef[]> = {};
        PLACEMENTS_REGISTRY.forEach(p => {
            if (!groups[p.module]) { groups[p.module] = []; }
            groups[p.module].push(p);
        });
        return groups;
    }, []);

    return (
        <div className="space-y-12 animate-fadeIn pb-20">

            {/* Info Header */}
            <div className={`rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start border ${darkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <i className="fas fa-map-signs"></i>
                </div>
                <div>
                    <h3 className={`text-sm font-black uppercase tracking-widest mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-900'}`}>Mapa de Inventário</h3>
                    <p className={`text-xs leading-relaxed max-w-2xl ${darkMode ? 'text-blue-300/80' : 'text-blue-700'}`}>
                        Gerencie onde os anúncios podem aparecer. Ative os locais (placements) para cada plano comercial.
                        Itens marcados como "Em Breve" aparecerão automaticamente aqui quando o módulo for lançado.
                    </p>
                </div>
            </div>

            {Object.entries(groupedPlacements).map(([moduleKey, placements]) => (
                <div key={moduleKey}>
                    <div className={`flex items-center gap-3 mb-6 border-b pb-2 ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {MODULE_LABELS[moduleKey as PlacementModule]}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(placements as PlacementDef[]).map(placement => (
                            <PlacementCard
                                key={placement.id}
                                placement={placement}
                                plans={plans}
                                onTogglePlan={handleToggle}
                                darkMode={darkMode}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlacementsEditor;
