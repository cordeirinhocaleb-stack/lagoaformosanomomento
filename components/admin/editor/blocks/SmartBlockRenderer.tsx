import React, { useEffect, useRef } from 'react';
import { ContentBlock } from '../../../../types';
import { sanitize } from '../../../../utils/sanitizer';
import { getWidgetStyles } from '../../WidgetPresets';
import { EDITOR_WIDGETS } from '../../EditorWidgets';

interface SmartBlockRendererProps {
    block: ContentBlock;
}

/**
 * Dedicated renderer for smart_block widgets with theme support.
 * Uses useEffect to watch editorialVariant changes and apply styles directly to DOM.
 * 
 * @version 1.105
 */
export const SmartBlockRenderer: React.FC<SmartBlockRendererProps> = ({ block }) => {
    console.log('[SmartBlockRenderer] RENDER: ', block.id, block.settings.widgetId); // ENABLED LOG 
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) { return; }

        // 1. Identificar ID com Fallback Robusto
        let widgetId = block.settings.widgetId;
        if (!widgetId) {
            // Tenta inferir pelo conteúdo HTML
            const content = block.content || '';
            const widgetDef = EDITOR_WIDGETS.find(w => {
                // Check unique strings from default HTML
                if (w.id === 'nota_oficial' && content.includes('COMUNICADO OFICIAL')) { return true; }
                if (w.id === 'plantao_urgente' && content.includes('URGENTE')) { return true; }
                if (w.id === 'destaque_citacao' && content.includes('fa-quote-left')) { return true; }
                if (w.id === 'cartao_servico' && content.includes('fa-address-card') || content.includes('FARMÁCIA')) { return true; }
                if (w.id === 'galeria_mini' && content.includes('grid-cols-2')) { return true; }
                return content.includes(`data-key`);
            });
            if (widgetDef) {
                widgetId = widgetDef.id;
                console.log('[SmartBlockRenderer] Inferred ID:', widgetId); // ENABLED LOG
            }
        }

        // 2. Obter Estilo Ativo
        const variant = block.settings.editorialVariant;
        const styles = getWidgetStyles(widgetId || 'default');

        // Se variante não existe no preset atual, usa o primeiro (Safe Fallback)
        const activeStyle = styles.find(s => s.id === variant) || styles[0];

        // 3. Aplicar tema
        // Tenta encontrar .widget-root, senão pega o primeiro filho direto
        const rootElement = containerRef.current.querySelector('.widget-root') || containerRef.current.firstElementChild;

        // Debug info attatched to container
        if (containerRef.current) {
            containerRef.current.dataset.debugId = widgetId;
            containerRef.current.dataset.debugVariant = variant;
            containerRef.current.dataset.debugActiveStyle = activeStyle?.id;
        }

        if (rootElement && activeStyle) {
            // Preservar classes de layout essenciais se necessário, mas para widgets full-control, substituímos.
            // A classe 'widget-root' é marcadora essencial.

            // Log para debug visual
            console.log(`[SmartBlockRenderer] Applying [${activeStyle.id}] to`, rootElement.tagName); // ENABLED LOG

            // Força a aplicação das classes
            rootElement.className = `widget-root ${activeStyle.class}`;

            // Adiciona atributo data para debug CSS
            (rootElement as HTMLElement).dataset.variant = activeStyle.id;
        } else {
            console.error('[SmartBlockRenderer] Root element or style not found', {
                root: !!rootElement,
                style: !!activeStyle,
                rootHtml: rootElement?.outerHTML.substring(0, 50),
                widgetId
            });
        }
    }, [block.settings.editorialVariant, block.content, block.settings.widgetId]);

    return (
        <div ref={containerRef} dangerouslySetInnerHTML={{ __html: sanitize(block.content) }} className="w-full" />
    );
};
