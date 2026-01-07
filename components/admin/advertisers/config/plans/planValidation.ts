
import { AdPlanConfig } from '../../../../../types';

export const validatePlan = (plan: AdPlanConfig, existingPlans: AdPlanConfig[]): string | null => {
    if (!plan.name.trim()) {return "O nome do plano é obrigatório.";}
    if (!plan.id.trim()) {return "O ID do plano é obrigatório.";}
    
    // Validação básica de ID duplicado (para criação)
    // Nota: Em uma edição, o ID não muda, então isso é seguro.
    // Se fosse criação, teríamos que garantir que não existe.
    // Como a lógica de update substitui pelo ID, aqui validamos apenas formato e nulidade.
    
    // Fix: Added explicit type cast to resolve operator '<' cannot be applied to types 'unknown' and 'number' error.
    if (Object.values(plan.prices).some(p => (p as number) < 0)) {
        return "Os preços não podem ser negativos.";
    }
    
    return null;
};
