export interface PurchaseDetails {
    maxProducts?: number;
    videoLimit?: number;
    posts?: number;
    videos?: number;
    featuredDays?: number;
    banners?: number;
    popups?: number;
    jobs?: number;
    gigs?: number;
    [key: string]: any; // Allow extensibility
}

export interface PurchaseValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validatePurchaseData = (
    itemType: string,
    itemId: string,
    cost: number,
    itemName: string,
    details?: PurchaseDetails
): PurchaseValidationResult => {
    const errors: string[] = [];
    if (!['plan', 'boost'].includes(itemType)) {
        errors.push(`Tipo de item inválido: ${itemType}`);
    }
    if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
        errors.push('ID do item é obrigatório');
    }
    if (typeof cost !== 'number' || isNaN(cost)) {
        errors.push('Custo deve ser um número válido');
    } else if (cost <= 0) {
        errors.push('Custo deve ser maior que zero');
    } else if (cost > 100000) {
        errors.push('Custo excede o limite máximo permitido (C$ 100.000)');
    }
    if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0) {
        errors.push('Nome do item é obrigatório');
    }
    if (details !== undefined && details !== null) {
        if (typeof details !== 'object') {
            errors.push('Detalhes devem ser um objeto');
        } else {
            const numericFields = ['posts', 'videos', 'featuredDays', 'maxProducts', 'videoLimit', 'banners', 'popups', 'jobs', 'gigs'];
            for (const field of numericFields) {
                if (details[field] !== undefined) {
                    if (typeof details[field] !== 'number' || isNaN(details[field]) || details[field] < 0) {
                        errors.push(`Campo ${field} deve ser um número não-negativo`);
                    }
                }
            }
        }
    }
    return { isValid: errors.length === 0, errors };
};

export const sanitizeNumber = (value: unknown, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || num < 0 ? defaultValue : Math.floor(num);
};
