import { getEngagementStyles } from './editor/EngagementStyles';

export interface WidgetStyle {
    id: string;
    label: string;
    icon: string;
    classes: string;
}

export const WIDGET_STYLES: Record<string, WidgetStyle[]> = {
    nota_oficial: [
        {
            id: 'modern_soft',
            label: 'Moderno Soft',
            icon: 'fa-wand-magic-sparkles',
            classes: 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none rounded-3xl p-10 font-sans'
        },
        {
            id: 'newspaper_classic',
            label: 'Papel Clássico',
            icon: 'fa-newspaper',
            classes: 'bg-[#faf9f6] border-y-2 border-slate-900 rounded-none p-12 font-serif text-slate-900'
        },
        {
            id: 'glass_premium',
            label: 'Premium Glass',
            icon: 'fa-gem',
            classes: 'bg-white/40 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2.5rem] p-10 ring-1 ring-black/5'
        },
        {
            id: 'sidebar_accent',
            label: 'Destaque Lateral',
            icon: 'fa-grip-lines-vertical',
            classes: 'bg-slate-50 border-l-[12px] border-slate-300 rounded-r-3xl p-10 shadow-sm'
        }
    ],
    plantao_urgente: [
        {
            id: 'breaking_soft',
            label: 'Plantão Suave',
            icon: 'fa-bolt',
            classes: 'bg-rose-50 border-2 border-rose-100 rounded-3xl p-8 shadow-sm text-rose-900'
        },
        {
            id: 'urgent_neon',
            label: 'Impacto Glass',
            icon: 'fa-fire',
            classes: 'bg-red-600/10 backdrop-blur-md border border-red-200 shadow-[0_0_40px_rgba(225,29,72,0.1)] rounded-none p-8 border-l-8 border-l-red-600'
        },
        {
            id: 'classic_strip',
            label: 'Tarja Noticiário',
            icon: 'fa-window-maximize',
            classes: 'bg-zinc-900 text-white rounded-none p-6 border-b-4 border-red-600 shadow-2xl'
        },
        {
            id: 'warning_abstract',
            label: 'Alerta Abstrato',
            icon: 'fa-triangle-exclamation',
            classes: 'bg-orange-50/80 border-dashed border-2 border-orange-200 rounded-[3rem] p-10'
        }
    ],
    destaque_citacao: [
        {
            id: 'quote_minimal',
            label: 'Citação Limpa',
            icon: 'fa-quote-left',
            classes: 'bg-white shadow-lg rounded-3xl p-12 scale-95 hover:scale-100 transition-transform'
        },
        {
            id: 'quote_editorial',
            label: 'Editorial Revista',
            icon: 'fa-book-open',
            classes: 'bg-[#f8f5f2] border-t-8 border-zinc-800 rounded-none p-12 text-center'
        },
        {
            id: 'quote_gradient',
            label: 'Degradê Suave',
            icon: 'fa-palette',
            classes: 'bg-gradient-to-br from-indigo-50 to-white border-none rounded-[3rem] p-12 shadow-inner'
        },
        {
            id: 'quote_newspaper',
            label: 'Furo de Reportagem',
            icon: 'fa-pen-nib',
            classes: 'bg-white border-4 border-double border-zinc-200 rounded-none p-10 italic shadow-sm'
        }
    ],
    fato_fake: [
        {
            id: 'fact_check_modern',
            label: 'Moderno (Soft)',
            icon: 'fa-shield-halved',
            classes: 'bg-white shadow-xl border-none rounded-3xl overflow-hidden'
        },
        {
            id: 'fact_check_duo',
            label: 'Duo Tone',
            icon: 'fa-columns',
            classes: 'bg-slate-50 border-2 border-slate-100 rounded-none scale-[0.98]'
        },
        {
            id: 'fact_check_glass',
            label: 'Transparente',
            icon: 'fa-droplet',
            classes: 'bg-white/60 backdrop-blur-lg border border-white rounded-[2rem] shadow-sm'
        },
        {
            id: 'fact_check_newspaper',
            label: 'Papel de Jornal',
            icon: 'fa-scroll',
            classes: 'bg-[#fdfbf7] border-y-4 border-black/5 rounded-none p-2'
        }
    ],
    numeros_destaque: [
        {
            id: 'data_minimal',
            label: 'Minimalista',
            icon: 'fa-chart-pie',
            classes: 'bg-white shadow-sm border border-slate-100 rounded-[2rem] p-12'
        },
        {
            id: 'data_impact',
            label: 'Grande Impacto',
            icon: 'fa-expand',
            classes: 'bg-blue-600/5 border-none rounded-none p-16 font-black'
        },
        {
            id: 'data_circular',
            label: 'Foco Central',
            icon: 'fa-circle-dot',
            classes: 'bg-slate-50 rounded-full aspect-square flex flex-col items-center justify-center p-12 shadow-inner border-4 border-white'
        },
        {
            id: 'data_card',
            label: 'Cartão Moderno',
            icon: 'fa-id-card',
            classes: 'bg-indigo-50/50 border-t-8 border-indigo-400 rounded-b-3xl p-10 shadow-lg'
        }
    ],
    cronologia_vertical: [
        {
            id: 'time_clean',
            label: 'Clean Line',
            icon: 'fa-ellipsis-v',
            classes: 'bg-white shadow-md rounded-[2.5rem] p-10 border-none'
        },
        {
            id: 'time_dark',
            label: 'Soft Dark',
            icon: 'fa-moon',
            classes: 'bg-zinc-900 border-none rounded-3xl p-10 text-zinc-400'
        },
        {
            id: 'time_abstract',
            label: 'Abstrato',
            icon: 'fa-shapes',
            classes: 'bg-emerald-50/30 border-2 border-emerald-100 border-dashed rounded-none p-10'
        },
        {
            id: 'time_paper',
            label: 'Arquivo Histórico',
            icon: 'fa-box-archive',
            classes: 'bg-[#f4f1ea] border-l-4 border-stone-400 rounded-none p-10 font-serif'
        }
    ],
    pros_contras: [
        {
            id: 'debate_modern',
            label: 'Arena Soft',
            icon: 'fa-balance-scale',
            classes: 'bg-white shadow-2xl border-none rounded-[3rem] p-6'
        },
        {
            id: 'debate_newspaper',
            label: 'Opinião Editorial',
            icon: 'fa-pen-fancy',
            classes: 'bg-[#fafafa] border-y-2 border-zinc-200 rounded-none p-8 scale-95'
        },
        {
            id: 'debate_glass',
            label: 'Contraste Glass',
            icon: 'fa-clone',
            classes: 'bg-black/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-sm'
        },
        {
            id: 'debate_split',
            label: 'Divisória Forte',
            icon: 'fa-arrows-left-right',
            classes: 'bg-zinc-50 border-x-8 border-zinc-300 rounded-none p-8'
        }
    ],
    definicao_glossario: [
        {
            id: 'dict_clean',
            label: 'Dicionário Moderno',
            icon: 'fa-language',
            classes: 'bg-white shadow-lg border-none rounded-3xl p-10 ring-1 ring-black/5'
        },
        {
            id: 'dict_serif',
            label: 'Clássico Literário',
            icon: 'fa-book',
            classes: 'bg-[#fdfdfd] border-l-[10px] border-amber-200 rounded-none p-10 font-serif italic'
        },
        {
            id: 'dict_card',
            label: 'Flashcard',
            icon: 'fa-square',
            classes: 'bg-yellow-50 shadow-[8px_8px_0px_0px_rgba(251,191,36,0.2)] border-2 border-yellow-200 rounded-none p-10'
        },
        {
            id: 'dict_glass',
            label: 'Translucidez',
            icon: 'fa-wind',
            classes: 'bg-white/50 backdrop-blur-md rounded-[2rem] p-10 border border-white shadow-sm'
        }
    ],
    cartao_servico: [
        {
            id: 'service_premium',
            label: 'Cartão Premium',
            icon: 'fa-address-card',
            classes: 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-none rounded-[2rem] p-8'
        },
        {
            id: 'service_glass',
            label: 'Glassmorphism',
            icon: 'fa-layer-group',
            classes: 'bg-cyan-50/20 backdrop-blur-xl border border-cyan-100/50 rounded-3xl p-8 shadow-sm'
        },
        {
            id: 'service_minimal',
            label: 'Botão Gigante',
            icon: 'fa-hand-pointer',
            classes: 'bg-slate-50 border-2 border-slate-100 hover:bg-white hover:border-blue-300 transition-all rounded-none p-10'
        },
        {
            id: 'service_newsletter',
            label: 'Estilo Digest',
            icon: 'fa-envelope-open-text',
            classes: 'bg-white border-l-8 border-cyan-500 rounded-r-3xl p-8 shadow-md'
        }
    ],
    galeria_mini: [
        {
            id: 'gallery_modern',
            label: 'Grid Moderno',
            icon: 'fa-border-all',
            classes: 'bg-white shadow-xl border-none rounded-[2rem] p-6'
        },
        {
            id: 'gallery_polaroid',
            label: 'Polaroid Stack',
            icon: 'fa-images',
            classes: 'bg-[#fafafa] border border-zinc-200 rounded-none p-8 shadow-[5px_5px_0px_rgba(0,0,0,0.1)] rotate-1 hover:rotate-0 transition-transform duration-500'
        },
        {
            id: 'gallery_filmstrip',
            label: 'Película de Filme',
            icon: 'fa-film',
            classes: 'bg-black text-white rounded-none p-4 border-y-8 border-dashed border-zinc-800'
        },
        {
            id: 'gallery_mosaic',
            label: 'Mosaico Dinâmico',
            icon: 'fa-shapes',
            classes: 'bg-indigo-50/50 backdrop-blur-3xl border border-white/40 rounded-3xl p-4 grid-flow-dense shadow-inner'
        }
    ],

    // --- INTERACTIVE (POLL) STYLES ---
    poll: [
        {
            id: 'police_tactical',
            label: 'Operação Tática',
            icon: 'fa-user-secret',
            classes: '' // Managed by engagementThemeHelper
        },
        {
            id: 'fire_brigade',
            label: 'Brigada 193',
            icon: 'fa-fire-extinguisher',
            classes: '' // Managed by engagementThemeHelper
        },
        {
            id: 'cyber_dystopia',
            label: 'Futuro Distópico',
            icon: 'fa-robot',
            classes: '' // Managed by engagementThemeHelper
        }
    ]
};

export const getWidgetStyles = (widgetId: string): WidgetStyle[] => {
    // List of interactive types that use EngagementStyles
    const interactiveTypes = ['poll', 'quiz', 'countdown', 'ranking', 'image_poll', 'comparison', 'reaction', 'counter', 'timeline', 'flipcard', 'accordion', 'cta'];

    // Check if widgetId matches any interactive type
    const matchedType = interactiveTypes.find(type => widgetId.includes(type));

    if (matchedType) {
        const styles = getEngagementStyles(matchedType);
        // Map EngagementStyle to WidgetStyle (classes empty as they are handled by helper)
        return styles.map(s => ({
            id: s.id,
            label: s.label,
            icon: s.icon,
            classes: ''
        }));
    }

    return WIDGET_STYLES[widgetId] || WIDGET_STYLES['nota_oficial']; // Safe default
};
