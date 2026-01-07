
import React, { useState } from 'react';
import { AdPlanConfig, User, checkPermission } from '../../../../../types';
import PlanForm from './PlanForm';
import { DEFAULT_PLAN } from './planDefaults';
import { validatePlan } from './planValidation';

interface PlansEditorProps {
    plans: AdPlanConfig[];
    onChange: (plans: AdPlanConfig[]) => void;
    currentUser: User;
    darkMode?: boolean;
}

const PlansEditor: React.FC<PlansEditorProps> = ({ plans, onChange, currentUser, darkMode = false }) => {
    const [editingPlan, setEditingPlan] = useState<AdPlanConfig | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const canManagePlans = checkPermission(currentUser, 'plans_edit');
    const canEditFinancials = checkPermission(currentUser, 'financial_edit');

    const handleCreateClick = () => {
        setEditingPlan({ ...DEFAULT_PLAN });
        setIsCreating(true);
    };

    const handleEditClick = (plan: AdPlanConfig) => {
        setEditingPlan({ ...plan });
        setIsCreating(false);
    };

    const handleSave = () => {
        if (!editingPlan) { return; }

        const error = validatePlan(editingPlan, plans);
        if (error) {
            alert(error);
            return;
        }

        if (isCreating) {
            if (plans.some(p => p.id === editingPlan.id)) {
                alert("Já existe um plano com este ID.");
                return;
            }
            onChange([...plans, editingPlan]);
        } else {
            onChange(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
        }

        setEditingPlan(null);
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano?")) { return; }
        onChange(plans.filter(p => p.id !== id));
    };

    // MODO EDIÇÃO
    if (editingPlan) {
        return (
            <div className="animate-fadeIn">
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4 ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <button onClick={() => setEditingPlan(null)} className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
                            <i className="fas fa-arrow-left"></i> Voltar
                        </button>
                        <h3 className={`text-sm font-black uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>{isCreating ? 'Novo Plano' : `Editando ${editingPlan.name}`}</h3>
                    </div>
                    <button
                        onClick={handleSave}
                        className={`w-full sm:w-auto px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg ${darkMode ? 'bg-white text-black hover:bg-green-500 hover:text-white' : 'bg-black text-white hover:bg-green-600'}`}
                    >
                        Salvar
                    </button>
                </div>
                <PlanForm
                    plan={editingPlan}
                    onChange={setEditingPlan}
                    canEditFinancials={canEditFinancials}
                    isNew={isCreating}
                    darkMode={darkMode}
                />
            </div>
        );
    }

    // MODO LISTA
    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Planos Disponíveis ({plans.length})</h3>
                {canManagePlans && (
                    <button
                        onClick={handleCreateClick}
                        className="text-[10px] font-bold text-red-600 hover:underline uppercase flex items-center gap-2"
                    >
                        <i className="fas fa-plus"></i> Criar Plano
                    </button>
                )}
            </div>

            {plans.map(plan => {
                const isMaster = plan.id === 'master';
                return (
                    <div
                        key={plan.id}
                        className={`rounded-3xl border transition-all p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group ${isMaster
                            ? (darkMode ? 'bg-zinc-900/50 text-white border-red-900/50 shadow-xl ring-2 ring-red-600/20' : 'bg-zinc-900 text-white border-black shadow-xl ring-2 ring-red-600/20')
                            : (darkMode ? 'bg-black/20 border-white/5 hover:border-red-500/30' : 'bg-white border-gray-100 hover:border-red-100 hover:shadow-md')
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isMaster
                                ? (darkMode ? 'bg-white/5 text-white' : 'bg-white/10 text-white')
                                : (darkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-50 text-gray-400')
                                }`}>
                                <i className={`fas ${isMaster ? 'fa-crown' : 'fa-tags'}`}></i>
                            </div>
                            <div>
                                <h4 className={`text-lg font-black uppercase flex items-center gap-2 ${darkMode ? 'text-white' : (isMaster ? 'text-white' : 'text-gray-900')}`}>
                                    {plan.name}
                                    {plan.isPopular && <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full tracking-widest shadow-sm">POPULAR</span>}
                                </h4>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isMaster ? 'text-zinc-400' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                                    R$ {plan.prices.monthly.toFixed(2)}/mês • {plan.features.placements.length} Placements
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 mt-2 md:mt-0 ${isMaster
                            ? (darkMode ? 'border-white/5 border-t md:border-t-0' : 'border-white/10 border-t md:border-t-0')
                            : (darkMode ? 'border-white/5 border-t md:border-t-0' : 'border-gray-100 border-t md:border-t-0')
                            }`}>
                            <button
                                onClick={() => handleEditClick(plan)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isMaster
                                    ? 'bg-white text-black hover:bg-red-600 hover:text-white'
                                    : (darkMode ? 'bg-white/5 text-gray-400 hover:bg-white hover:text-black' : 'bg-gray-50 text-gray-600 hover:bg-black hover:text-white')
                                    }`}
                            >
                                Editar
                            </button>
                            {canManagePlans && (
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors ${isMaster
                                        ? 'bg-transparent border-white/20 text-white/50 hover:text-red-500 hover:border-red-500'
                                        : (darkMode ? 'bg-transparent border-white/10 text-gray-600 hover:text-red-500 hover:border-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-600')
                                        }`}
                                    title="Excluir"
                                >
                                    <i className="fas fa-trash text-xs"></i>
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PlansEditor;
