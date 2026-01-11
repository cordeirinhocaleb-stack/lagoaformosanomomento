
import React from 'react';

export const renderItemList = (
    variant: string,
    perStyle: any,
    baseStyles: React.CSSProperties,
    Tag: any,
    contentRef: any,
    handleInput: () => void,
    settings?: any
) => {
    const variantStyles: React.CSSProperties = {
        width: '100%',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap'
    };

    // Configurações Específicas do Preset
    const config = perStyle[variant] || {};

    let variantClasses = "";
    const spacingClass = config.spacing === 'compact' ? 'space-y-1' : config.spacing === 'relaxed' ? 'space-y-4' : 'space-y-2';

    // Configuração de Estilo de Marcador (Novo Seletor)
    const listStyle = settings?.listStyle || 'bullet';

    // Classes Utilitárias Dinâmicas (keeping from original, as they are not redefined in the snippet)
    const colorClass = config.markerColor ? `list-marker-${config.markerColor}` : '';
    const sizeClass = config.fontSize ? `list-size-${config.fontSize}` : '';
    const weightClass = config.weight === 'bold' ? 'font-bold' : '';
    const styleClass = config.markerStyle ? `marker-style-${config.markerStyle}` : '';
    const rowClass = config.rowStyle && config.rowStyle !== 'none' ? `list-row-${config.rowStyle}` : '';

    // Base Styles based on Variant
    if (variant === 'checklist_pro') {
        variantClasses = "pl-2";
    } else if (variant === 'executive_summary') {
        variantClasses = "border-l-4 border-zinc-900 pl-4 py-2 bg-zinc-50";
    } else if (variant === 'bullets_clean') {
        variantClasses = "pl-5 list-disc marker:text-zinc-400";
    } else if (variant === 'bullets_square') {
        variantClasses = "pl-5 list-square marker:text-zinc-900"; // Exemplo
    } else if (variant === 'numbered_steps') {
        variantClasses = "pl-5 list-decimal marker:font-bold marker:text-zinc-900";
    } else if (variant === 'timeline_dots') {
        variantClasses = "pl-4 border-l border-zinc-200 relative";
    } else if (variant === 'list_bullets_classic') {
        variantClasses = "pl-6 border-l-2 border-zinc-300 italic text-zinc-600";
    } else if (variant === 'list_check_circle') {
        variantClasses = "bg-green-50/50 p-5 rounded-xl border border-green-100 text-green-900 font-medium";
    } else if (variant === 'list_numbered_modern') {
        variantClasses = "font-mono text-sm bg-blue-50/30 p-4 rounded-lg border-l-4 border-blue-500 text-blue-800";
    } else if (variant === 'list_timeline_vertical') {
        variantClasses = "pl-6 border-l-[3px] border-purple-400 relative before:content-[''] before:absolute before:left-[-5px] before:top-0 before:w-2 before:h-2 before:rounded-full before:bg-purple-600";
    } else if (variant === 'list_cards_shadow') {
        variantClasses = "shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow";
    }

    // Ajuste fino para Numeração e Marcadores (Global Overrides)
    const isOrdered = variant === 'numbered_steps' || variant === 'list_numbered_modern' || listStyle === 'ordered';
    if (isOrdered) {
        variantClasses += " list-decimal list-inside";
    } else if (listStyle === 'square') {
        variantClasses = variantClasses.replace('list-disc', '').replace('list-decimal', '') + " list-none pl-6 relative [&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-[-1rem] [&_li]:before:top-3 [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:bg-zinc-800 [&_li]:before:block";
    } else if (listStyle === 'check') {
        // Interativo: Quadrado Vermelho -> Verde Check -> X Vermelho
        // Base: Quadrado Vermelho (Default)
        variantClasses = variantClasses.replace('list-disc', '').replace('list-decimal', '') +
            " list-none pl-8 relative " +
            // Default State (Red Square)
            "[&_li]:relative [&_li]:before:content-[''] [&_li]:before:absolute [&_li]:before:left-[-1.5rem] [&_li]:before:top-[0.4em] [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:border-2 [&_li]:before:border-red-500 [&_li]:before:rounded-sm [&_li]:before:cursor-pointer [&_li]:before:bg-white [&_li]:before:transition-all " +
            // Checked State (Green + Icon)
            "[&_li[data-state='checked']]:before:bg-green-500 [&_li[data-state='checked']]:before:border-green-500 [&_li[data-state='checked']]:before:content-['✓'] [&_li[data-state='checked']]:before:text-white [&_li[data-state='checked']]:before:text-[10px] [&_li[data-state='checked']]:before:flex [&_li[data-state='checked']]:before:items-center [&_li[data-state='checked']]:before:justify-center " +
            // Failed State (Red + X)
            "[&_li[data-state='failed']]:before:bg-red-500 [&_li[data-state='failed']]:before:border-red-500 [&_li[data-state='failed']]:before:content-['✕'] [&_li[data-state='failed']]:before:text-white [&_li[data-state='failed']]:before:text-[10px] [&_li[data-state='failed']]:before:flex [&_li[data-state='failed']]:before:items-center [&_li[data-state='failed']]:before:justify-center";
    } else if (listStyle === 'bullet') {
        if (!variantClasses.includes('list-')) {variantClasses += " list-disc list-inside";}
    }

    // Combina classes base do variante + classes de configuração
    const finalClasses = `${variantClasses} ${spacingClass} ${colorClass} ${sizeClass} ${weightClass} ${styleClass} ${rowClass} transition-all duration-300 w-full`;

    // Interatividade para Checklists
    const handleListClick = (e: React.MouseEvent) => {
        if (listStyle !== 'check' && variant !== 'checklist_pro') {return;}

        // Encontra o LI clicado
        const target = (e.target as HTMLElement).closest('li');
        if (!target) {return;}

        // Verifica se clicou no marker (pseudo-elemento) ou próximo
        // Como pseudo-elementos não disparam eventos separados, assumimos click no LI
        // Mas para evitar desfocar a edição de texto, idealmente checamos coordenadas, 
        // mas aqui vamos simplificar: qualquer click no LI com esse estilo alterna.
        // Se o usuário reclama de edição, refinamos para checar e.offsetX < 0 (margem esquerda).

        // Lógica de Toggle: null (Red Square) -> checked (Green) -> failed (Red X) -> null
        const currentState = target.getAttribute('data-state');
        let nextState = null;

        if (!currentState) {nextState = 'checked';}
        else if (currentState === 'checked') {nextState = 'failed';}
        else if (currentState === 'failed') {nextState = null;}

        if (nextState) {
            target.setAttribute('data-state', nextState);
        } else {
            target.removeAttribute('data-state');
        }

        // Importante: Dispara o handleInput para persistir o HTML alterado (com os novos atributos)
        handleInput();
    };

    return (
        <div style={{ ...baseStyles, ...variantStyles }} className={finalClasses} onClick={handleListClick}>
            <Tag
                ref={contentRef}
                contentEditable
                onInput={handleInput}
                className={`focus:outline-none min-h-[1.5em] w-full ${isOrdered ? 'list-decimal' : ''}`}
                role="textbox"
                aria-multiline="true"
                data-placeholder="Digite os itens da lista..."
            />
        </div>
    );
};
