import React from 'react';
import { ContentBlock } from '@/types';

interface RenderListProps {
    block: ContentBlock;
    fontSizeClass: string;
}

export const RenderList: React.FC<RenderListProps> = ({ block, fontSizeClass }) => {
    const variant = block.settings?.editorialVariant || 'bullets_clean';
    const settings = block.settings || {};
    const perStyle = settings.perStyle || {};
    const config = perStyle[variant] || {};
    const listStyle = settings.listStyle || config.listStyle || 'bullet'; // Fallback to config if main setting missing

    // 1. Classes de Estilo Base
    let variantClasses = "";
    const spacingClass = config.spacing === 'compact' ? 'space-y-1' : config.spacing === 'relaxed' ? 'space-y-4' : 'space-y-2';

    // Configurações de Cor do Marcador
    const markerColors: Record<string, string> = {
        default: 'marker:text-zinc-900 dark:marker:text-zinc-100',
        red: 'marker:text-red-600',
        blue: 'marker:text-blue-600',
        green: 'marker:text-emerald-500',
        purple: 'marker:text-purple-600',
        orange: 'marker:text-orange-500',
        pink: 'marker:text-pink-500'
    };
    const colorClass = config.markerColor ? (markerColors[config.markerColor] || '') : '';

    // Tamanho da Fonte
    const sizeClass = config.fontSize === 'sm' ? 'text-sm' : config.fontSize === 'lg' ? 'text-lg' : fontSizeClass;
    const weightClass = config.weight === 'bold' ? 'font-bold' : '';

    // Estilo de Linha
    const rowStyle = config.rowStyle || 'none';
    const rowClass = rowStyle === 'divided' ? 'divide-y divide-zinc-100 dark:divide-zinc-800' :
        rowStyle === 'striped' ? 'even:bg-zinc-50 dark:even:bg-zinc-800/50' :
            rowStyle === 'boxed' ? 'space-y-2 [&>li]:bg-zinc-50 dark:[&>li]:bg-zinc-800/50 [&>li]:p-2 [&>li]:rounded-lg' : '';

    // Variantes Específicas
    if (variant === 'checklist_pro') {
        variantClasses = "pl-2";
    } else if (variant === 'executive_summary') {
        variantClasses = "border-l-4 border-zinc-900 dark:border-zinc-100 pl-4 py-2 bg-zinc-50 dark:bg-zinc-900/30";
    } else if (variant === 'bullets_clean') {
        variantClasses = "pl-5 list-disc marker:text-zinc-400";
    } else if (variant === 'bullets_square') {
        variantClasses = "pl-5 list-square marker:text-zinc-900 dark:marker:text-zinc-100";
    } else if (variant === 'numbered_steps') {
        variantClasses = "pl-5 list-decimal marker:font-bold marker:text-zinc-900 dark:marker:text-zinc-100";
    } else if (variant === 'timeline_dots') {
        variantClasses = "pl-4 border-l border-zinc-200 dark:border-zinc-700 relative";
    } else if (variant === 'list_bullets_classic') {
        variantClasses = "pl-6 border-l-2 border-zinc-300 dark:border-zinc-700 italic text-zinc-600 dark:text-zinc-400";
    } else if (variant === 'list_check_circle') {
        variantClasses = "bg-green-50/50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30 text-green-900 dark:text-green-300 font-medium";
    } else if (variant === 'list_numbered_modern') {
        variantClasses = "font-mono text-sm bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-lg border-l-4 border-blue-500 text-blue-800 dark:text-blue-300";
    } else if (variant === 'list_timeline_vertical') {
        variantClasses = "pl-6 border-l-[3px] border-purple-400 relative before:content-[''] before:absolute before:left-[-5px] before:top-0 before:w-2 before:h-2 before:rounded-full before:bg-purple-600";
    } else if (variant === 'list_cards_shadow') {
        variantClasses = "shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 dark:border-orange-900/30 rounded-2xl p-6 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow";
    } else if (variant === 'checklist_flow') {
        variantClasses = "bg-green-50/30 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20 text-zinc-700 dark:text-zinc-300 space-y-3";
    }

    // Ajuste fino para Numeração e Marcadores Personalizados (Sobreposição do seletor visual)
    const isOrdered = variant === 'numbered_steps' || variant === 'list_numbered_modern' || listStyle === 'ordered';

    if (isOrdered) {
        variantClasses += " list-decimal list-inside";
    } else if (listStyle === 'square') {
        // Remove disc e aplica square se não for nativo
        variantClasses = variantClasses.replace('list-disc', '').replace('list-decimal', '') + " list-none pl-6 relative not-prose [&>li]:relative [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-[-1rem] [&>li]:before:top-3 [&>li]:before:w-1.5 [&>li]:before:h-1.5 [&>li]:before:bg-zinc-800 dark:[&>li]:before:bg-zinc-200 [&>li]:before:block";
    } else if (listStyle === 'check') {
        // Versão Pública: Suporta os estados checked/failed salvos via data-state
        variantClasses = variantClasses.replace('list-disc', '').replace('list-decimal', '') +
            " list-none pl-8 relative not-prose " +
            // Default State
            "[&>li]:relative [&>li]:before:content-[''] [&>li]:before:absolute [&>li]:before:left-[-1.5rem] [&>li]:before:top-[0.4em] [&>li]:before:w-4 [&>li]:before:h-4 [&>li]:before:border-2 [&>li]:before:border-zinc-300 [&>li]:before:rounded-sm [&>li]:before:bg-white dark:[&>li]:before:bg-zinc-800 " +
            // Checked State
            "[&>li[data-state='checked']]:before:bg-green-500 [&>li[data-state='checked']]:before:border-green-500 [&>li[data-state='checked']]:before:content-['✓'] [&>li[data-state='checked']]:before:text-white [&>li[data-state='checked']]:before:text-[10px] [&>li[data-state='checked']]:before:flex [&>li[data-state='checked']]:before:items-center [&>li[data-state='checked']]:before:justify-center " +
            // Failed State
            "[&>li[data-state='failed']]:before:bg-red-500 [&>li[data-state='failed']]:before:border-red-500 [&>li[data-state='failed']]:before:content-['✕'] [&>li[data-state='failed']]:before:text-white [&>li[data-state='failed']]:before:text-[10px] [&>li[data-state='failed']]:before:flex [&>li[data-state='failed']]:before:items-center [&>li[data-state='failed']]:before:justify-center";
    } else if (listStyle === 'bullet') {
        if (!variantClasses.includes('list-')) { variantClasses += " list-disc list-inside"; }
    }

    const finalClasses = `${variantClasses} ${spacingClass} ${colorClass} ${sizeClass} ${weightClass} ${rowClass} mb-8 w-full`;
    const ListTag = isOrdered ? 'ol' : 'ul';

    return <ListTag className={finalClasses} dangerouslySetInnerHTML={{ __html: block.content }} />;
};
