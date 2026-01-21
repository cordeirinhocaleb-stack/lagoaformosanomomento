/**
 * Utilitários de Validação de Dados
 * Sistema de validação centralizado para garantir integridade e segurança
 */

// ==================== VALIDADORES BÁSICOS ====================

export const isNumeric = (value: string): boolean => {
    return /^\d+$/.test(value);
};

export const isAlphabetic = (value: string): boolean => {
    return /^[A-Za-zÀ-ÿ\s]+$/.test(value);
};

export const isAlphanumeric = (value: string): boolean => {
    return /^[A-Za-z0-9À-ÿ\s]+$/.test(value);
};

export const isWithinTextLimit = (text: string, maxLength: number = 250): boolean => {
    return text.length <= maxLength;
};

// ==================== VALIDADORES DE DOCUMENTOS BR ====================

/**
 * Valida CPF com algoritmo de dígito verificador
 */
export const isValidCPF = (cpf: string): boolean => {
    // Remove formatação
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verifica tamanho
    if (cleanCPF.length !== 11) {return false;}

    // Verifica sequências inválidas (111.111.111-11, etc)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {return false;}

    // Validação do primeiro dígito
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) {digit1 = 0;}

    if (parseInt(cleanCPF.charAt(9)) !== digit1) {return false;}

    // Validação do segundo dígito
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) {digit2 = 0;}

    return parseInt(cleanCPF.charAt(10)) === digit2;
};

/**
 * Valida CNPJ com algoritmo de dígito verificador
 */
export const isValidCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    if (cleanCNPJ.length !== 14) {return false;}
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {return false;}

    // Validação primeiro dígito
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights1[i];
    }
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(cleanCNPJ.charAt(12)) !== digit1) {return false;}

    // Validação segundo dígito
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ.charAt(i)) * weights2[i];
    }
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return parseInt(cleanCNPJ.charAt(13)) === digit2;
};

// ==================== VALIDADORES DE CONTATO ====================

/**
 * Valida email (RFC compliant)
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
    return emailRegex.test(email);
};

/**
 * Valida telefone brasileiro (10 ou 11 dígitos)
 */
export const isValidPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Valida CEP brasileiro (8 dígitos)
 */
export const isValidCEP = (cep: string): boolean => {
    const cleanCEP = cep.replace(/\D/g, '');
    return cleanCEP.length === 8;
};

// ==================== VALIDADORES DE FORMATO ====================

/**
 * Valida data no formato DD/MM/AAAA
 * Previne datas impossíveis (ex: 31/02/2023)
 */
export const isValidDate = (dateStr: string): boolean => {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(dateRegex);

    if (!match) {return false;}

    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);

    if (month < 1 || month > 12) {return false;}
    if (day < 1 || day > 31) {return false;}

    // Validação de dias por mês
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Ano bissexto
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
        daysInMonth[1] = 29;
    }

    return day <= daysInMonth[month - 1];
};

/**
 * Valida URL básica (protocolo + domínio)
 */
export const isValidURL = (url: string): boolean => {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
};

// ==================== VALIDADORES DE SEGURANÇA ====================

/**
 * Verifica se texto contém tags HTML
 */
export const containsHTMLTags = (text: string): boolean => {
    return /<[^>]*>/g.test(text);
};

/**
 * Verifica se texto contém palavras-chave SQL suspeitas
 */
export const containsSQLKeywords = (text: string): boolean => {
    const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi;
    return sqlKeywords.test(text);
};

/**
 * Verifica se texto é seguro (anti-XSS básico)
 */
export const isSafeText = (text: string): boolean => {
    return !containsHTMLTags(text) && !containsSQLKeywords(text);
};

/**
 * Valida idade mínima (útil para data de nascimento)
 */
export const isMinimumAge = (dateStr: string, minAge: number = 18): boolean => {
    if (!isValidDate(dateStr)) {return false;}

    const [day, month, year] = dateStr.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= minAge;
};

// ==================== MENSAGENS DE ERRO ====================

export const getValidationMessage = (field: string, type: string): string => {
    const messages: Record<string, string> = {
        cpf: 'CPF inválido. Verifique os dígitos e tente novamente.',
        cnpj: 'CNPJ inválido. Verifique os dígitos e tente novamente.',
        email: 'Email inválido. Use o formato: exemplo@dominio.com',
        phone: 'Telefone inválido. Use o formato: (00) 00000-0000',
        cep: 'CEP inválido. Use o formato: 00000-000',
        date: 'Data inválida. Use o formato: DD/MM/AAAA',
        url: 'URL inválida. Deve começar com http:// ou https://',
        numeric: 'Este campo aceita apenas números.',
        alphabetic: 'Este campo aceita apenas letras.',
        textLimit: `Este campo não pode exceder 250 caracteres.`,
        minAge: 'Você deve ter pelo menos 18 anos.',
        unsafe: 'Texto contém caracteres não permitidos.',
    };

    return messages[type] || 'Valor inválido.';
};

// ==================== VALIDADOR GENÉRICO ====================

export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export const validate = (value: string, type: string): ValidationResult => {
    let isValid = true;
    let message: string | undefined;

    switch (type) {
        case 'cpf':
            isValid = isValidCPF(value);
            break;
        case 'cnpj':
            isValid = isValidCNPJ(value);
            break;
        case 'email':
            isValid = isValidEmail(value);
            break;
        case 'phone':
            isValid = isValidPhone(value);
            break;
        case 'cep':
            isValid = isValidCEP(value);
            break;
        case 'date':
            isValid = isValidDate(value);
            break;
        case 'url':
            isValid = isValidURL(value);
            break;
        case 'numeric':
            isValid = isNumeric(value);
            break;
        case 'alphabetic':
            isValid = isAlphabetic(value);
            break;
        case 'safe':
            isValid = isSafeText(value);
            break;
        default:
            isValid = true;
    }

    if (!isValid) {
        message = getValidationMessage('', type);
    }

    return { isValid, message };
};
