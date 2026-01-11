import React from 'react';
import { renderCurrentText } from './renderers/currentText';
import { renderHeadlineBlock } from './renderers/headlineBlock';
import { renderQuoteAspas } from './renderers/quoteAspas';
import { renderItemList } from './renderers/itemList';

/**
 * Orquestra a renderização baseada na variante visual selecionada chamando renderers especializados.
 */
export const renderTextMode = (
    variant: string,
    perStyle: any,
    baseStyles: React.CSSProperties,
    Tag: any,
    contentRef: any,
    handleInput: () => void,
    settings?: any
) => {
    // 1. Grupos de Variantes: Texto Corrido
    if (['newspaper_standard', 'footnote', 'tech_neon'].includes(variant)) {
        return renderCurrentText(variant, perStyle, baseStyles, Tag, contentRef, handleInput);
    }

    // 2. Grupos de Variantes: Manchetes e Alertas
    if (['hero_headline', 'breaking_alert', 'police_siren'].includes(variant)) {
        return renderHeadlineBlock(variant, perStyle, baseStyles, Tag, contentRef, handleInput);
    }

    // 3. Grupos de Variantes: Citações e Estilos Literários
    if (['impact_quote', 'vintage_letter', 'quote_modern_accent', 'quote_elegant_editorial', 'quote_breaking_card'].includes(variant)) {
        return renderQuoteAspas(variant, perStyle, baseStyles, Tag, contentRef, handleInput);
    }

    // 4. Grupos de Variantes: Listas e Resumos
    if (['checklist_pro', 'executive_summary', 'bullets_clean', 'bullets_square', 'numbered_steps', 'timeline_dots', 'list_bullets_classic', 'list_check_circle', 'list_numbered_modern', 'list_timeline_vertical', 'list_cards_shadow'].includes(variant)) {
        return renderItemList(variant, perStyle, baseStyles, Tag, contentRef, handleInput, settings);
    }

    // Fallback padrão: Renderiza como texto básico
    return (
        <div style={baseStyles}>
            <Tag ref={contentRef} contentEditable onInput={handleInput} className="focus:outline-none min-h-[1.5em]" role="textbox" aria-multiline="true" />
        </div>
    );
};
