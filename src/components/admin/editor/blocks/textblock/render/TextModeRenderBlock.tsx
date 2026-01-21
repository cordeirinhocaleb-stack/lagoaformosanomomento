import React from 'react';
import { renderCurrentText } from './renderers/CurrentText';
import { renderHeadlineBlock } from './renderers/HeadlineBlock';
import { renderQuoteAspas } from './renderers/QuoteAspas';
import { renderItemList } from './renderers/ItemList';

import { renderAdvancedDivider } from './renderers/VisualDivider';

/**
 * Orquestra a renderização baseada na variante visual selecionada chamando renderers especializados.
 */
export const renderTextMode = (
    variant: string,
    perStyle: unknown,
    baseStyles: React.CSSProperties,
    Tag: unknown,
    contentRef: unknown,
    handleInput: () => void,
    settings?: unknown
) => {
    const styles = (perStyle as Record<string, any>) || {};
    const LayoutTag = Tag as React.ElementType;
    // 1. Grupos de Variantes: Texto Corrido
    if (['newspaper_standard', 'footnote', 'tech_neon', 'standard_clean', 'editorial_prose', 'breaking_brief'].includes(variant)) {
        return renderCurrentText(variant, perStyle, baseStyles, Tag, contentRef, handleInput);
    }

    // 2. Grupos de Variantes: Manchetes e Alertas
    if (['hero_headline', 'breaking_alert', 'police_siren', 'sub_classic', 'live_update'].includes(variant)) {
        return renderHeadlineBlock(variant, perStyle, baseStyles, Tag, contentRef, handleInput);
    }

    // 3. Grupos de Variantes: Citações e Estilos Literários
    if (['impact_quote', 'vintage_letter', 'quote_modern_accent', 'quote_elegant_editorial', 'quote_breaking_card', 'pull_quote', 'tweet_style'].includes(variant)) {
        return renderQuoteAspas(variant, perStyle, baseStyles, Tag, contentRef, handleInput);
    }

    // 4. Grupos de Variantes: Listas e Resumos
    if (['checklist_pro', 'executive_summary', 'bullets_clean', 'bullets_square', 'numbered_steps', 'timeline_dots', 'list_bullets_classic', 'list_check_circle', 'list_numbered_modern', 'list_timeline_vertical', 'list_cards_shadow', 'checklist_flow'].includes(variant)) {
        return renderItemList(variant, perStyle, baseStyles, Tag, contentRef, handleInput, settings);
    }

    // 5. Grupos de Variantes: Divisores (Novo)
    if (['divider_minimal', 'divider_ornamental', 'divider_dots'].includes(variant)) {
        // Mapeia variante para config se não houver override via settings
        const variantConfig = styles[variant] || {};
        const config = { enabled: true, ...variantConfig, ...(settings as Record<string, unknown>) };

        // Defaults por variante se vazio
        if (variant === 'divider_minimal' && !config.kind) config.kind = 'solid';
        if (variant === 'divider_ornamental' && !config.kind) { config.kind = 'double'; config.icon = { enabled: true, name: 'diamond' }; }
        if (variant === 'divider_dots' && !config.kind) config.kind = 'dotted';

        return renderAdvancedDivider(config);
    }

    // Fallback padrão: Renderiza como texto básico
    return (
        <div style={baseStyles}>
            <LayoutTag ref={contentRef} contentEditable onInput={handleInput} className="focus:outline-none min-h-[1.5em]" role="textbox" aria-multiline="true" />
        </div>
    );
};
