import React, { useEffect, useRef } from 'react';
import { ContentBlock } from '@/types';
import { sanitize } from '@/utils/sanitizer';
import { getWidgetStyles } from '@/components/admin/WidgetPresets';
import { EDITOR_WIDGETS, EditorWidget } from '@/components/admin/EditorWidgets';
import { logger } from '@/services/core/debugLogger';

interface EditorialBlockProps {
    block: ContentBlock;
}

/**
 * Renderizador dedicado para widgets de conteúdo editorial com suporte a temas.
 * 
 * @version 1.119
 */
export const EditorialBlock: React.FC<EditorialBlockProps> = ({ block }) => {
    logger.log('\[EditorialBlock\] RENDER: ' + block.id + ' ' + block.settings.widgetId);
    const editorialRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editorialRef.current) { return; }

        let widgetId = block.settings.widgetId as string | undefined;
        if (!widgetId) {
            const content = (block.content as string) || '';
            const widgetDef = EDITOR_WIDGETS.find((w: EditorWidget) => {
                if (w.id === 'nota_oficial' && content.includes('COMUNICADO OFICIAL')) { return true; }
                if (w.id === 'plantao_urgente' && content.includes('URGENTE')) { return true; }
                if (w.id === 'destaque_citacao' && content.includes('fa-quote-left')) { return true; }
                if (w.id === 'cartao_servico' && (content.includes('fa-address-card') || content.includes('FARMÁCIA'))) { return true; }
                if (w.id === 'galeria_mini' && content.includes('grid-cols-2')) { return true; }
                return content.includes(`data-key`);
            });
            if (widgetDef) {
                widgetId = widgetDef.id;
            }
        }

        const variant = block.settings.editorialVariant as string | undefined;
        const styles = getWidgetStyles(widgetId || 'default');
        const activeStyle = styles.find((s: any) => s.id === variant) || styles[0];

        const rootElement = editorialRef.current.querySelector('.widget-root') || editorialRef.current.firstElementChild;

        if (editorialRef.current) {
            editorialRef.current.dataset.debugId = widgetId;
            editorialRef.current.dataset.debugVariant = variant;
            editorialRef.current.dataset.debugActiveStyle = activeStyle?.id;
        }

        if (rootElement && activeStyle) {
            rootElement.className = `widget-root ${activeStyle.class}`;
            (rootElement as HTMLElement).dataset.variant = activeStyle.id;
        } else {
            logger.error('[EditorialBlock] Root element or style not found', {
                root: !!rootElement,
                style: !!activeStyle,
                widgetId
            });
        }
    }, [block.settings.editorialVariant, block.content, block.settings.widgetId]);

    return (
        <div ref={editorialRef} dangerouslySetInnerHTML={{ __html: sanitize(block.content as string) }} className="w-full editorial-canvas" />
    );
};
