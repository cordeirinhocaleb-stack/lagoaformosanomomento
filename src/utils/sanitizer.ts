import DOMPurify from 'dompurify';

/**
 * Configuração padrão do DOMPurify para permitir formatação rica
 * mas bloquear XSS, scripts e iframes não confiáveis.
 */
const config = {
    ADD_TAGS: ['iframe', 'embed'], // Permite iframes controlados (ex: Youtube)
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
    FORBID_TAGS: ['script', 'style', 'head', 'canvas', 'form', 'input'], // Bloqueia tags perigosas
    FORBID_ATTR: ['style', 'onmouseover', 'onclick', 'onerror'], // Bloqueia inline styles e event handlers
};

/**
 * Sanitiza uma string HTML para prevenir XSS.
 * @param dirty HTML não confiável
 * @returns HTML limpo e seguro
 */
export const sanitize = (dirty: string | undefined | null): string => {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitiza apenas texto, removendo todas as tags HTML.
 */
export const sanitizeText = (dirty: string | undefined | null): string => {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};
