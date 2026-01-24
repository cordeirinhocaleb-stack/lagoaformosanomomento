import DOMPurify from 'dompurify';

/**
 * Configuração padrão do DOMPurify para permitir formatação rica
 * mas bloquear XSS, scripts e iframes não confiáveis.
 */
const config = {
    ADD_TAGS: ['iframe', 'embed'], // Permite iframes controlados (ex: Youtube)
    ADD_ATTR: [
        'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target',
        'contenteditable', 'data-key', 'data-img-key', 'data-variant'
    ],
    FORBID_TAGS: ['script', 'style', 'head', 'canvas', 'form', 'input'], // Bloqueia tags perigosas
    FORBID_ATTR: ['style', 'onmouseover', 'onclick', 'onerror'], // Bloqueia inline styles e event handlers
};

/**
 * Decodifica entidades HTML (&nbsp;, &amp;, etc) para caracteres normais
 */
const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

/**
 * Sanitiza uma string HTML para prevenir XSS.
 * @param dirty HTML não confiável
 * @returns HTML limpo e seguro
 */
export const sanitize = (dirty: string | undefined | null): string => {
    if (!dirty) return '';
    const decoded = decodeHtmlEntities(dirty);
    return DOMPurify.sanitize(decoded, config);
};

/**
 * Sanitiza apenas texto, removendo todas as tags HTML.
 */
export const sanitizeText = (dirty: string | undefined | null): string => {
    if (!dirty) return '';
    const decoded = decodeHtmlEntities(dirty);
    return DOMPurify.sanitize(decoded, { ALLOWED_TAGS: [] });
};
