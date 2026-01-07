/**
 * Utilitários de Máscara de Input
 * Formatação automática de campos durante digitação
 */

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 3) {return numbers;}
    if (numbers.length <= 6) {return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;}
    if (numbers.length <= 9) {return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;}

    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

/**
 * Aplica máscara de CNPJ: 00.000.000/0000-00
 */
export const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 14);

    if (numbers.length <= 2) {return numbers;}
    if (numbers.length <= 5) {return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;}
    if (numbers.length <= 8) {return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;}
    if (numbers.length <= 12) {return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;}

    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
};

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 2) {return numbers;}
    if (numbers.length <= 6) {return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;}

    // Celular (11 dígitos)
    if (numbers.length === 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }

    // Fixo (10 dígitos)
    if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

/**
 * Aplica máscara de CEP: 00000-000
 */
export const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);

    if (numbers.length <= 5) {return numbers;}
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

/**
 * Aplica máscara de data: DD/MM/AAAA
 */
export const formatDate = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);

    if (numbers.length <= 2) {return numbers;}
    if (numbers.length <= 4) {return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;}
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
};

/**
 * Aplica máscara de moeda: R$ 0.000,00
 */
export const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');

    if (!numbers) {return '';}

    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

/**
 * Aplica máscara de porcentagem: 00,00%
 */
export const formatPercentage = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 4);

    if (!numbers) {return '';}

    const num = parseInt(numbers) / 100;
    return `${num.toFixed(2).replace('.', ',')}%`;
};

/**
 * Remove formatação de valor monetário
 */
export const unformatCurrency = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseInt(numbers || '0') / 100;
};

/**
 * Remove formatação de porcentagem
 */
export const unformatPercentage = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseInt(numbers || '0') / 100;
};

/**
 * Detecta tipo de máscara baseado no conteúdo
 */
export const detectMaskType = (value: string): string => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 11 && value.includes('-')) {return 'cpf';}
    if (numbers.length === 14 && value.includes('/')) {return 'cnpj';}
    if (numbers.length >= 10 && value.includes('(')) {return 'phone';}
    if (numbers.length === 8 && value.includes('-')) {return 'cep';}
    if (value.includes('/') && value.split('/').length === 3) {return 'date';}
    if (value.includes('R$')) {return 'currency';}
    if (value.includes('%')) {return 'percentage';}

    return 'text';
};

/**
 * Aplica máscara genérica baseada no tipo
 */
export const applyMaskByType = (value: string, type: string): string => {
    switch (type) {
        case 'cpf':
            return formatCPF(value);
        case 'cnpj':
            return formatCNPJ(value);
        case 'phone':
            return formatPhone(value);
        case 'cep':
            return formatCEP(value);
        case 'date':
            return formatDate(value);
        case 'currency':
            return formatCurrency(value);
        case 'percentage':
            return formatPercentage(value);
        default:
            return value;
    }
};

/**
 * Valida caractere durante digitação
 */
export const isValidCharForType = (char: string, type: string, currentValue: string): boolean => {
    switch (type) {
        case 'cpf':
        case 'cnpj':
        case 'phone':
        case 'cep':
        case 'number':
            return /\d/.test(char);

        case 'date':
            return /[\d/]/.test(char);

        case 'currency':
        case 'percentage':
            return /[\d,.]/.test(char);

        case 'alphabetic':
            return /[A-Za-zÀ-ÿ\s]/.test(char);

        case 'alphanumeric':
            return /[A-Za-z0-9À-ÿ\s]/.test(char);

        case 'email':
            return /[A-Za-z0-9@._+-]/.test(char);

        default:
            return true;
    }
};
