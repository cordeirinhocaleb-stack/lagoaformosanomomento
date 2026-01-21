/**
 * Serviço de Sanitização de Dados
 * Limpa e normaliza entrada de dados antes do processamento
 */

// ==================== SANITIZAÇÃO BÁSICA ====================

/**
 * Remove tags HTML e scripts de texto
 */
export const sanitizeText = (text: string): string => {
    if (!text) {return '';}

    // Remove tags HTML
    let clean = text.replace(/<[^>]*>/g, '');

    // Remove caracteres de controle
    clean = clean.replace(/[\x00-\x1F\x7F]/g, '');

    // Escapa caracteres especiais HTML
    clean = clean
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return clean.trim();
};

/**
 * Extrai apenas dígitos de uma string
 */
export const sanitizeNumber = (value: string): string => {
    if (!value) {return '';}
    return value.replace(/\D/g, '');
};

/**
 * Extrai apenas letras e espaços
 */
export const sanitizeAlpha = (value: string): string => {
    if (!value) {return '';}
    return value.replace(/[^A-Za-zÀ-ÿ\s]/g, '').trim();
};

/**
 * Limita comprimento de texto
 */
export const limitText = (text: string, maxLength: number = 250): string => {
    if (!text) {return '';}
    return text.slice(0, maxLength);
};

// ==================== SANITIZAÇÃO DE DOCUMENTOS ====================

/**
 * Remove formatação de CPF, mantendo apenas dígitos
 */
export const sanitizeCPF = (cpf: string): string => {
    return sanitizeNumber(cpf).slice(0, 11);
};

/**
 * Remove formatação de CNPJ, mantendo apenas dígitos
 */
export const sanitizeCNPJ = (cnpj: string): string => {
    return sanitizeNumber(cnpj).slice(0, 14);
};

/**
 * Remove formatação de telefone, mantendo apenas dígitos
 */
export const sanitizePhone = (phone: string): string => {
    return sanitizeNumber(phone).slice(0, 11);
};

/**
 * Remove formatação de CEP, mantendo apenas dígitos
 */
export const sanitizeCEP = (cep: string): string => {
    return sanitizeNumber(cep).slice(0, 8);
};

// ==================== SANITIZAÇÃO DE CONTATO ====================

/**
 * Normaliza email (lowercase, trim)
 */
export const sanitizeEmail = (email: string): string => {
    if (!email) {return '';}
    return email.toLowerCase().trim().replace(/\s/g, '');
};

// ==================== SANITIZAÇÃO DE SEGURANÇA ====================

/**
 * Escapa caracteres HTML perigosos
 */
export const escapeHTML = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Remove palavras-chave SQL perigosas
 */
export const preventSQLInjection = (text: string): string => {
    if (!text) {return '';}

    const dangerous = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE',
        'ALTER', 'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', '--', ';'
    ];

    let safe = text;
    dangerous.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        safe = safe.replace(regex, '');
    });

    return safe;
};

/**
 * Valida e sanitiza URL
 */
export const sanitizeURL = (url: string): string => {
    if (!url) {return '';}

    try {
        const urlObj = new URL(url);

        // Permitir apenas HTTP e HTTPS
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            return '';
        }

        // Remover javascript: e data: URIs
        if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
            return '';
        }

        return urlObj.toString();
    } catch {
        return '';
    }
};

// ==================== MÁSCARAS DE VISUALIZAÇÃO ====================

/**
 * Mascara CPF parcialmente para exibição
 * Exemplo: 123.456.789-00 → ***.456.***-00
 */
export const maskCPF = (cpf: string): string => {
    const clean = sanitizeCPF(cpf);
    if (clean.length !== 11) {return cpf;}

    return `***.${clean.substr(3, 3)}.***-${clean.substr(9, 2)}`;
};

/**
 * Mascara CNPJ parcialmente
 * Exemplo: 12.345.678-0001-00 vira **.345.***-0001-00
 */
export const maskCNPJ = (cnpj: string): string => {
    const clean = sanitizeCNPJ(cnpj);
    if (clean.length !== 14) {return cnpj;}

    return `**.${clean.substr(2, 3)}.***/${clean.substr(8, 4)}-${clean.substr(12, 2)}`;
};

/**
 * Mascara email parcialmente
 * Exemplo: usuario@dominio.com → u***o@dominio.com
 */
export const maskEmail = (email: string): string => {
    const [user, domain] = email.split('@');
    if (!user || !domain) {return email;}

    if (user.length <= 2) {return `*@${domain}`;}

    return `${user[0]}***${user[user.length - 1]}@${domain}`;
};

/**
 * Mascara telefone parcialmente
 * Exemplo: (11) 98765-4321 → (**) ****-4321
 */
export const maskPhone = (phone: string): string => {
    const clean = sanitizePhone(phone);
    if (clean.length < 10) {return phone;}

    const last4 = clean.slice(-4);
    return `(**) ****-${last4}`;
};

/**
 * Oculta campo completamente
 */
export const maskHidden = (): string => {
    return '••••••••';
};

// ==================== SANITIZAÇÃO DE FORMULÁRIOS ====================

export interface FieldSchema {
    name: string;
    type: 'text' | 'number' | 'email' | 'cpf' | 'cnpj' | 'phone' | 'cep' | 'url';
    maxLength?: number;
    required?: boolean;
}

/**
 * Sanitiza objeto completo de dados baseado em schema
 */
export const sanitizeFormData = <T extends Record<string, any>>(
    data: T,
    schema: FieldSchema[]
): T => {
    const sanitized: any = { ...data };

    schema.forEach(field => {
        const value = sanitized[field.name];

        if (!value && !field.required) {
            return;
        }

        switch (field.type) {
            case 'text':
                sanitized[field.name] = limitText(
                    sanitizeText(value),
                    field.maxLength || 250
                );
                break;

            case 'number':
                sanitized[field.name] = sanitizeNumber(value);
                break;

            case 'email':
                sanitized[field.name] = sanitizeEmail(value);
                break;

            case 'cpf':
                sanitized[field.name] = sanitizeCPF(value);
                break;

            case 'cnpj':
                sanitized[field.name] = sanitizeCNPJ(value);
                break;

            case 'phone':
                sanitized[field.name] = sanitizePhone(value);
                break;

            case 'cep':
                sanitized[field.name] = sanitizeCEP(value);
                break;

            case 'url':
                sanitized[field.name] = sanitizeURL(value);
                break;
        }
    });

    return sanitized as T;
};

// ==================== UTILITÁRIOS DE MÁSCARA ====================

/**
 * Aplica máscara baseada no tipo
 */
export const applyMask = (
    value: string,
    maskType: 'full' | 'partial_cpf' | 'partial_cnpj' | 'partial_email' | 'partial_phone' | 'hidden'
): string => {
    switch (maskType) {
        case 'partial_cpf':
            return maskCPF(value);
        case 'partial_cnpj':
            return maskCNPJ(value);
        case 'partial_email':
            return maskEmail(value);
        case 'partial_phone':
            return maskPhone(value);
        case 'hidden':
            return maskHidden();
        case 'full':
        default:
            return value;
    }
};
