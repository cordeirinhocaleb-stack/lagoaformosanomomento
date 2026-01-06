
export interface WidgetStyle {
    id: string;
    label: string;
    icon: string;
    class: string;
}

export const WIDGET_PRESETS: Record<string, WidgetStyle[]> = {
    // DEFAULT GENERIC
    default: [
        { id: 'clean', label: 'Clean', icon: 'fa-square', class: 'bg-white border border-zinc-100 font-sans' },
        { id: 'card', label: 'Cartão', icon: 'fa-id-card', class: 'bg-white shadow-lg rounded-[2rem] border border-zinc-100 p-2 font-sans' },
        { id: 'minimal', label: 'Minimal', icon: 'fa-minus', class: 'bg-transparent border-none font-sans' },
        { id: 'dark', label: 'Dark', icon: 'fa-moon', class: 'bg-zinc-900 text-white rounded-3xl font-sans' }
    ],

    // NOTA OFICIAL
    nota_oficial: [
        { id: 'nota_padrao', label: 'Padrão', icon: 'fa-file', class: 'p-8 bg-zinc-50 border-l-4 border-zinc-900 shadow-sm font-sans' },
        { id: 'nota_alerta', label: 'Alerta', icon: 'fa-bullhorn', class: 'p-8 bg-red-50 border-4 border-red-600 rounded-lg text-red-900 shadow-xl' },
        { id: 'nota_formal', label: 'Formal', icon: 'fa-scale-balanced', class: 'p-10 bg-white border-y-2 border-zinc-200 text-center font-serif text-zinc-900' }
    ],

    // PLANTÃO URGENTE
    plantao_urgente: [
        { id: 'plantao_red', label: 'Urgente', icon: 'fa-triangle-exclamation', class: 'bg-red-600 text-white p-6 rounded-xl shadow-lg border-4 border-white ring-4 ring-red-600' },
        { id: 'plantao_dark', label: 'Noturno', icon: 'fa-moon', class: 'bg-zinc-950 text-yellow-400 p-6 rounded-none border-l-8 border-yellow-400 font-mono shadow-2xl' },
        { id: 'plantao_clean', label: 'Digital', icon: 'fa-wifi', class: 'bg-blue-900 text-cyan-300 p-6 rounded-2xl border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]' }
    ],

    // CITAÇÃO COM FOTO
    destaque_citacao: [
        { id: 'quote_modern', label: 'Moderno', icon: 'fa-quote-right', class: 'flex flex-col md:flex-row items-center gap-6 bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-xl' },
        { id: 'quote_classic', label: 'Clássico', icon: 'fa-scroll', class: 'flex flex-col items-center text-center gap-4 bg-zinc-50 p-10 rounded-none border-y-4 border-zinc-300 font-serif' },
        { id: 'quote_bold', label: 'Impacto', icon: 'fa-bolt', class: 'flex flex-col md:flex-row-reverse items-center gap-6 bg-black text-white p-10 rounded-none border-b-8 border-red-600' }
    ],

    // FATO OU FAKE
    fato_fake: [
        { id: 'check_def', label: 'Padrão', icon: 'fa-check', class: 'flex items-stretch border-2 border-zinc-100 rounded-xl overflow-hidden bg-white' },
        { id: 'check_flat', label: 'Flat', icon: 'fa-square', class: 'flex items-center gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200' },
        { id: 'check_bold', label: 'Bold', icon: 'fa-bold', class: 'flex flex-col items-center text-center bg-zinc-900 text-white p-6 rounded-xl border-4 border-zinc-800' }
    ],

    // NÚMEROS EM DESTAQUE
    numeros_destaque: [
        { id: 'stat_blue', label: 'Azul', icon: 'fa-circle', class: 'text-center p-8 bg-blue-50 rounded-3xl' },
        { id: 'stat_dark', label: 'Dark', icon: 'fa-moon', class: 'text-center p-8 bg-zinc-900 text-white rounded-xl' },
        { id: 'stat_outline', label: 'Outline', icon: 'fa-border-all', class: 'text-center p-8 bg-transparent border-2 border-zinc-200 rounded-full aspect-square flex flex-col justify-center' }
    ],

    // LINHA DO TEMPO
    cronologia_vertical: [
        { id: 'timeline_def', label: 'Linha', icon: 'fa-stream', class: 'relative pl-4 border-l-2 border-zinc-200 py-2 space-y-6' },
        { id: 'timeline_cards', label: 'Cards', icon: 'fa-th-list', class: 'space-y-4' }, // Layout requires CSS magic or simple override
        { id: 'timeline_dots', label: 'Pontos', icon: 'fa-ellipsis-v', class: 'space-y-6 text-center' }
    ],

    // PRÓS E CONTRAS
    pros_contras: [
        { id: 'vs_split', label: 'Lado a Lado', icon: 'fa-columns', class: 'grid grid-cols-2 gap-4' },
        { id: 'vs_stack', label: 'Lista', icon: 'fa-list', class: 'flex flex-col gap-4' },
        { id: 'vs_card', label: 'Cards', icon: 'fa-id-card', class: 'grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-6 rounded-2xl' }
    ],

    // DEFINIÇÃO
    definicao_glossario: [
        { id: 'dict_yellow', label: 'Destaque', icon: 'fa-highlighter', class: 'bg-yellow-50 p-6 rounded-none border-l-4 border-yellow-400 font-serif' },
        { id: 'dict_clean', label: 'Clean', icon: 'fa-book', class: 'bg-white p-6 border-b-2 border-zinc-100 font-serif' },
        { id: 'dict_box', label: 'Box', icon: 'fa-box', class: 'bg-zinc-100 p-8 rounded-xl font-sans text-center' }
    ],

    // CARTÃO DE SERVIÇO
    cartao_servico: [
        { id: 'card_clean', label: 'Clean', icon: 'fa-id-card', class: 'bg-white border-2 border-zinc-100 rounded-2xl p-6 flex items-center justify-between shadow-sm' },
        { id: 'card_highlight', label: 'Destaque', icon: 'fa-star', class: 'bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 flex items-center justify-between text-blue-900 shadow-md' },
        { id: 'card_outline', label: 'Contorno', icon: 'fa-square', class: 'bg-transparent border-2 border-zinc-800 rounded-xl p-6 flex items-center justify-between text-zinc-900' }
    ]
};

export const getWidgetStyles = (widgetId: string) => {
    return WIDGET_PRESETS[widgetId] || WIDGET_PRESETS['default'];
};
