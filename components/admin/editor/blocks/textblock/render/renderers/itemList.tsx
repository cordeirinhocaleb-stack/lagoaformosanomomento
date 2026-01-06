
import React from 'react';

export const renderItemList = (variant: string, perStyle: any, baseStyles: React.CSSProperties, Tag: any, contentRef: any, handleInput: () => void) => {
    let variantStyles: React.CSSProperties = {
        width: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap'
    };
    
    let variantClasses = "";

    // Configurações Específicas do Preset
    const config = perStyle[variant] || {};

    // Classes Utilitárias Dinâmicas
    const spacingClass = config.spacing ? `list-spacing-${config.spacing}` : '';
    const colorClass = config.markerColor ? `list-marker-${config.markerColor}` : '';
    const sizeClass = config.fontSize ? `list-size-${config.fontSize}` : '';
    const weightClass = config.weight === 'bold' ? 'font-bold' : '';
    const styleClass = config.markerStyle ? `marker-style-${config.markerStyle}` : '';
    const rowClass = config.rowStyle && config.rowStyle !== 'none' ? `list-row-${config.rowStyle}` : '';

    // Mapeamento de estilos oficiais do estúdio
    if (variant === 'bullets_clean') {
        variantClasses = "list-bullets-clean";
    } else if (variant === 'bullets_square') {
        variantClasses = "list-bullets-square";
    } else if (variant === 'numbered_steps') {
        variantClasses = "list-numbered-steps";
    } else if (variant === 'timeline_dots') {
        variantClasses = "list-timeline-dots";
    } else if (variant === 'checklist_pro') {
        const cl = perStyle.checklist_pro || { marker: 'check', markerTone: 'accent' };
        variantClasses = `checklist-custom marker-${cl.marker}`;
    }

    // Combina classes base do variante + classes de configuração
    const finalClasses = `${variantClasses} ${spacingClass} ${colorClass} ${sizeClass} ${weightClass} ${styleClass} ${rowClass} transition-all duration-300 w-full`;

    return (
        <div style={{ ...baseStyles, ...variantStyles }} className={finalClasses}>
            <Tag 
                ref={contentRef} 
                contentEditable 
                onInput={handleInput} 
                className="focus:outline-none min-h-[1.5em] w-full" 
                role="textbox" 
                aria-multiline="true"
                data-placeholder="Digite os itens da lista..."
            />
        </div>
    );
};
