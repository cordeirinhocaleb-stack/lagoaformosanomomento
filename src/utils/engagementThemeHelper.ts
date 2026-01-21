


export interface ColorTheme {
    id: string;
    label: string;
    preview: string;
    icon?: string;         // Ícone FontAwesome
    iconColor?: string;    // Classe de cor do fundo do ícone (ex: bg-blue-500)
    classes: {
        wrapper: string;      // Container principal (fundo, borda, sombra, raio)
        text: string;         // Cor do texto
        accent: string;       // Cor de destaque (botões, ícones)
        secondary: string;    // Borda secundária
        button: string;       // Hover de botões
        header?: string;      // Estilo do cabeçalho/título
        badge?: string;       // Estilo da badge de tipo
        option?: string;      // Estilo das opções/alternativas
        barStyle?: string;    // Estilo das barras de progresso
        backgroundPattern?: string; // Pattern/marca d'água de fundo
        container?: string;   // Layout flex/grid para mudar ordem (flex-col-reverse, etc)
    }
}

// Mapeamento de cores base (mantido para compatibilidade)
const baseColors: Record<string, any> = {
    blue: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-blue-500', secondary: 'border-slate-200', btn: 'hover:bg-blue-600', preview: 'bg-blue-500' },
    red: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-red-500', secondary: 'border-slate-200', btn: 'hover:bg-red-600', preview: 'bg-red-500' },
    green: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-emerald-500', secondary: 'border-slate-200', btn: 'hover:bg-emerald-600', preview: 'bg-emerald-500' },
    amber: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-amber-500', secondary: 'border-slate-200', btn: 'hover:bg-amber-600', preview: 'bg-amber-500' },
    purple: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-purple-500', secondary: 'border-slate-200', btn: 'hover:bg-purple-600', preview: 'bg-purple-500' },
    orange: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-orange-500', secondary: 'border-slate-200', btn: 'hover:bg-orange-600', preview: 'bg-orange-500' },
    yellow: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-yellow-500', secondary: 'border-slate-200', btn: 'hover:bg-yellow-600', preview: 'bg-yellow-500' },
    pink: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-rose-500', secondary: 'border-slate-200', btn: 'hover:bg-rose-600', preview: 'bg-rose-500' },
    indigo: { wrapper: 'bg-slate-50 border-slate-200', text: 'text-slate-800', accent: 'bg-indigo-500', secondary: 'border-slate-200', btn: 'hover:bg-indigo-600', preview: 'bg-indigo-500' },
    zinc: { wrapper: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-800', accent: 'bg-zinc-700', secondary: 'border-zinc-300', btn: 'hover:bg-zinc-600', preview: 'bg-zinc-700' },
    dark: { wrapper: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-900', accent: 'bg-zinc-800', secondary: 'border-zinc-300', btn: 'hover:bg-zinc-700', preview: 'bg-zinc-800' },
};

// Função para criar temas com estilos customizados
const createCustomTheme = (
    id: string,
    label: string,
    baseColor: string,
    customStyles?: {
        wrapper?: string;
        header?: string;
        badge?: string;
        option?: string;
        barStyle?: string;
        backgroundPattern?: string;
        icon?: string;
        container?: string;
    }
): ColorTheme => {
    const c = baseColors[baseColor] || baseColors['blue'];

    return {
        id,
        label,
        preview: c.preview,
        icon: customStyles?.icon || 'fa-eye',
        iconColor: c.preview,
        classes: {
            wrapper: customStyles?.wrapper || c.wrapper,
            text: c.text,
            accent: c.accent,
            secondary: c.secondary,
            button: c.btn,
            header: customStyles?.header,
            badge: customStyles?.badge,
            option: customStyles?.option,
            barStyle: customStyles?.barStyle,
            backgroundPattern: customStyles?.backgroundPattern,
            container: customStyles?.container
        }
    };
};

// Função de compatibilidade para temas simples (sem customização)
const createTheme = (id: string, label: string, color: string, icon?: string): ColorTheme => {
    return createCustomTheme(id, label, color, { icon });
};

export const ENGAGEMENT_COLOR_THEMES: Record<string, ColorTheme[]> = {
    default: [
        createCustomTheme('default_blue', 'Padrão (Azul)', 'blue', { icon: 'fa-palette' }),
        createCustomTheme('urgent_red', 'Urgente (Vermelho)', 'red', { icon: 'fa-circle-exclamation' }),
        createCustomTheme('nature_green', 'Natureza (Verde)', 'green', { icon: 'fa-leaf' }),
        createCustomTheme('royal_purple', 'Real (Roxo)', 'purple', { icon: 'fa-crown' }),
        createCustomTheme('dark_mode', 'Dark Mode', 'dark', { icon: 'fa-moon' }),
    ],
    poll: [
        // 🚔 POLÍCIA - "PADRÃO PMMG"
        createCustomTheme('poll_police', '🚔 Polícia', 'zinc', {
            wrapper: 'bg-[#e5e0d3] border-x-[8px] border-[#4e3b31]/40 shadow-lg p-0 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-2 before:bg-[linear-gradient(45deg,#fbbf24_25%,#000_25%,#000_50%,#fbbf24_50%,#fbbf24_75%,#000_75%,#000)] before:bg-[length:20px_20px] before:z-20 after:absolute after:bottom-0 after:left-0 after:w-full after:h-2 after:bg-[linear-gradient(45deg,#fbbf24_25%,#000_25%,#000_50%,#fbbf24_50%,#fbbf24_75%,#000_75%,#000)] after:bg-[length:20px_20px] after:z-20',
            header: 'font-mono font-bold uppercase text-[#4e3b31] tracking-wider text-xl border-b border-[#4e3b31]/10 pb-4 mb-4 p-8 pt-10',
            badge: 'bg-[#4e3b31] text-[#e5e0d3] px-3 py-1 font-mono text-[10px] uppercase font-bold absolute top-6 right-6 z-30',
            option: 'bg-white/80 border-l-4 border-[#4e3b31]/30 text-zinc-800 font-mono hover:bg-white transition-all py-3 px-6 shadow-sm',
            barStyle: 'h-full bg-[#4e3b31] opacity-10',
            backgroundPattern: 'opacity-[0.03] absolute inset-0 pointer-events-none bg-[url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M60 20 L75 50 L105 50 L80 70 L90 100 L60 85 L30 100 L40 70 L15 50 L45 50 Z\' fill=\'%234e3b31\' /%3E%3C/svg%3E")] bg-center bg-no-repeat bg-[length:200px_200px]',
            icon: 'fa-shield-halved',
            container: 'flex flex-col'
        }),

        // 🌾 AGRO - "FOLHAS & TERRA"
        createCustomTheme('poll_agro', '🌾 Agro', 'zinc', {
            wrapper: 'bg-[#faf7f2] border-t-[12px] border-emerald-800/20 rounded-[2rem] shadow-xl p-2 relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-12 before:bg-[url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 5 Q10 20 20 35 Q30 20 20 5\' fill=\'%23166534\' opacity=\'0.1\' /%3E%3C/svg%3E")] before:bg-repeat-y after:absolute after:inset-y-0 after:right-0 after:w-12 after:bg-[url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 5 Q10 20 20 35 Q30 20 20 5\' fill=\'%23166534\' opacity=\'0.1\' /%3E%3C/svg%3E")] after:bg-repeat-y',
            header: 'font-serif text-2xl text-emerald-900/80 text-center mb-6 tracking-tight p-6 md:p-8 relative z-10',
            badge: 'bg-emerald-800/10 text-emerald-800 border border-emerald-800/20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mx-auto block w-fit mb-4 relative z-10',
            option: 'rounded-full bg-white border border-emerald-800/10 text-emerald-900/80 font-bold hover:bg-emerald-50 transition-all py-3 shadow-sm relative z-10',
            barStyle: 'h-full bg-emerald-600 opacity-5 rounded-full',
            backgroundPattern: 'opacity-[0.02] absolute inset-0 pointer-events-none bg-[url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10 Q30 30 50 10 T90 10\' stroke=\'%234d7c0f\' fill=\'none\' stroke-width=\'2\' /%3E%3C/svg%3E")]',
            icon: 'fa-leaf',
            container: 'flex flex-col text-center'
        }),

        // 🏛️ POLÍTICA - "DEBATE"
        createCustomTheme('poll_politics', '🏛️ Política', 'zinc', {
            wrapper: 'bg-slate-50 border border-slate-200 p-0 shadow-lg rounded-none relative overflow-hidden flex before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-blue-600/30 after:absolute after:inset-y-0 after:right-0 after:w-1 after:bg-red-600/30',
            header: 'font-bold text-3xl text-slate-800 text-center mb-6 uppercase tracking-tight p-10 pt-12 relative z-10',
            badge: 'bg-slate-800 text-white px-6 py-2 font-bold text-[10px] uppercase tracking-widest mx-auto block w-fit shadow-md -mt-4 mb-8 z-30',
            option: 'border-y border-slate-100 bg-white font-bold text-slate-600 hover:bg-slate-50 transition-all py-4 uppercase text-xs tracking-widest',
            barStyle: 'h-full bg-slate-200 opacity-50',
            backgroundPattern: 'opacity-5 absolute inset-0 pointer-events-none flex justify-between px-10 items-center text-6xl font-black text-slate-400 select-none uppercase tracking-tighter',
            icon: 'fa-landmark',
            container: 'flex flex-col flex-1'
        }),

        // 🚨 URGENTE - "NOTÍCIA AGORA"
        createCustomTheme('poll_urgent', '🚨 Urgente', 'red', {
            wrapper: 'bg-zinc-50 border border-red-200 shadow-xl p-0 relative overflow-hidden',
            header: 'font-black uppercase text-2xl text-white bg-red-600 px-6 py-4 mb-6 tracking-tight',
            badge: 'bg-red-100 text-red-600 border border-red-200 px-3 py-1 font-black text-[10px] uppercase absolute top-4 right-4 z-30',
            option: 'bg-white border-l-4 border-red-500 text-zinc-800 font-bold uppercase hover:bg-red-50 transition-all py-4 px-6 mb-1 shadow-sm',
            barStyle: 'h-full bg-red-500 opacity-10',
            backgroundPattern: 'opacity-[0.03] absolute inset-0 pointer-events-none bg-[url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 40 L40 0\' stroke=\'%23ef4444\' stroke-width=\'1\' /%3E%3C/svg%3E")]',
            icon: 'fa-bolt',
            container: 'flex flex-col'
        }),

        // 💰 ECONOMIA - "MERCADO"
        createCustomTheme('poll_economy', '💰 Economia', 'amber', {
            wrapper: 'bg-slate-50 border-l-[8px] border-amber-400 p-2 shadow-lg relative',
            header: 'font-bold tracking-tight text-slate-900 uppercase text-right border-r-2 border-amber-200 pr-6 mb-8 py-4',
            badge: 'text-amber-600 font-bold text-[9px] uppercase tracking-widest text-right block mb-2 opacity-60 w-full pr-8',
            option: 'bg-white border border-slate-100 text-slate-700 font-medium hover:border-amber-400 transition-all py-3 px-6 rounded-sm shadow-sm',
            barStyle: 'h-[2px] bg-amber-400 absolute bottom-0 left-0 w-full',
            backgroundPattern: 'opacity-[0.04] absolute inset-0 pointer-events-none bg-[url("data:image/svg+xml,%3Csvg width=\'120\' height=\'120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ctext x=\'10\' y=\'40\' font-size=\'20\' fill=\'%23000\' opacity=\'0.2\'%3E$%3C/text%3E%3C/svg%3E")] bg-repeat',
            icon: 'fa-chart-line',
            container: 'flex flex-col items-stretch'
        }),
    ],
    reaction: [
        createCustomTheme('reaction_emoji', 'Emojis', 'yellow', {
            wrapper: 'bg-slate-50 border border-yellow-200 rounded-2xl shadow-sm',
            header: 'font-bold text-zinc-800 text-xl m-4',
            badge: 'bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase',
            option: 'hover:scale-110 transition-transform cursor-pointer',
            icon: 'fa-face-smile',
            backgroundPattern: 'opacity-5 absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'5\' fill=\'%23facc15\' /%3E%3C/svg%3E")]'
        }),
        createCustomTheme('reaction_hearts', 'Corações', 'pink', {
            wrapper: 'bg-slate-50 border border-rose-200 rounded-2xl shadow-sm',
            header: 'font-bold text-zinc-800 text-xl m-4',
            badge: 'bg-rose-100 text-rose-600 rounded px-2 py-0.5 text-[9px] uppercase font-bold',
            icon: 'fa-heart',
        }),
        createCustomTheme('reaction_stars', 'Estrelas', 'zinc', {
            wrapper: 'bg-slate-50 border border-zinc-200 rounded-2xl shadow-sm',
            header: 'font-bold text-zinc-800 text-xl m-4',
            badge: 'bg-zinc-200 text-zinc-700 font-black px-2 py-0.5 text-[9px] uppercase',
            icon: 'fa-star',
        }),
    ],
    counter: [
        createCustomTheme('counter_button', 'Botão', 'zinc', {
            wrapper: 'bg-slate-50 border border-zinc-200 rounded-2xl shadow-sm',
            header: 'font-bold text-zinc-800 text-center p-4',
            badge: 'bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[9px] mx-auto block w-fit mb-4',
            icon: 'fa-mouse-pointer'
        }),
        createCustomTheme('counter_badge', 'Medalha', 'amber', {
            wrapper: 'bg-slate-50 border-t-4 border-amber-400 rounded-2xl shadow-sm',
            header: 'font-bold text-zinc-800 text-center pt-6',
            badge: 'bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold text-[9px] mx-auto block w-fit mb-4',
            icon: 'fa-award'
        }),
    ],
    quiz: [
        createCustomTheme('quiz_education', '📚 Escola', 'zinc', {
            wrapper: 'bg-slate-50 border border-emerald-100 rounded-2xl p-4 shadow-sm',
            header: 'font-serif text-slate-800 text-2xl mb-4 border-b border-emerald-100 pb-2',
            badge: 'text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] mb-4 block w-fit rounded',
            option: 'bg-white border border-slate-100 text-slate-700 hover:border-emerald-300 transition-all py-3 px-4 rounded',
            icon: 'fa-graduation-cap'
        }),
        createCustomTheme('quiz_sports', '⚽ Esportes', 'zinc', {
            wrapper: 'bg-slate-50 border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden',
            header: 'font-black text-slate-800 italic uppercase text-2xl text-center mb-6',
            badge: 'bg-emerald-600 text-white px-4 py-1 font-black text-[9px] uppercase mx-auto block w-fit mb-4',
            option: 'bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition-all py-3 px-6 rounded-lg',
            icon: 'fa-basketball',
        }),
        createCustomTheme('quiz_tech', '💻 Tecnologia', 'indigo', {
            wrapper: 'bg-slate-50 border border-indigo-100 rounded-2xl shadow-sm p-4',
            header: 'font-mono text-slate-800 uppercase text-center mb-6 py-2 border-b border-indigo-50',
            badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 text-[9px] block w-fit rounded',
            option: 'bg-white border border-indigo-50 text-slate-700 font-mono hover:border-indigo-400 transition-all py-3 px-4 rounded-lg',
            icon: 'fa-laptop-code'
        }),
    ],
    slider: [
        createCustomTheme('slider_opinion', 'Opinião', 'amber', {
            wrapper: 'bg-slate-50 border border-amber-100 shadow-sm rounded-2xl p-6',
            header: 'font-serif text-slate-800 text-2xl mb-4 border-b border-amber-50 pb-2',
            badge: 'text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[9px] mb-4 block w-fit',
            icon: 'fa-message',
        }),
        createCustomTheme('slider_satisfaction', 'Satisfação', 'orange', {
            wrapper: 'bg-slate-50 border border-orange-100 shadow-sm rounded-2xl p-4',
            header: 'font-bold text-slate-800 text-2xl text-center py-4',
            badge: 'bg-orange-100 text-orange-600 rounded-full px-4 py-1 text-[9px] mx-auto block w-fit mb-4 font-bold',
            icon: 'fa-face-grin-width'
        }),
    ],
    thermometer: [
        createCustomTheme('thermo_hot', 'Termômetro', 'zinc', {
            wrapper: 'bg-slate-50 border border-red-100 shadow-sm rounded-2xl p-6',
            header: 'font-black text-slate-800 text-2xl uppercase mb-4',
            badge: 'bg-red-600 text-white px-3 py-0.5 text-[9px] rounded-full',
            icon: 'fa-fire',
        }),
        createCustomTheme('thermo_moderate', '🍃 Brisa', 'green', {
            wrapper: 'bg-emerald-50 border border-emerald-100 rounded-full shadow-sm p-10',
            header: 'font-bold text-emerald-800 text-2xl text-center mb-6 px-10',
            badge: 'bg-emerald-500 text-white px-6 py-2 rounded-full font-bold text-xs shadow-md mx-auto block w-fit mb-4',
            icon: 'fa-temperature-half'
        }),
        createCustomTheme('thermo_cold', '❄️ Ártico', 'blue', {
            wrapper: 'bg-blue-50 border border-blue-100 shadow-sm rounded-3xl p-10',
            header: 'font-black text-blue-900 text-center text-3xl mb-8 tracking-tight',
            badge: 'bg-blue-100 text-blue-600 border border-white px-5 py-2 rounded-full font-black text-xs mx-auto block w-fit mb-4',
            icon: 'fa-snowflake',
        }),
    ],
    comparison: [
        createCustomTheme('compare_vs', 'Arena', 'zinc', {
            wrapper: 'bg-slate-50 border border-slate-200 shadow-md rounded-none relative overflow-hidden flex flex-col before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-red-400 after:absolute after:inset-y-0 after:right-0 after:w-1 after:bg-blue-400',
            header: 'font-black text-slate-700 italic text-3xl text-center mb-4 py-6',
            badge: 'bg-slate-800 text-white font-bold px-4 py-1 mx-auto block w-fit -mt-4 mb-4 z-30',
            icon: 'fa-swords'
        }),
        createCustomTheme('compare_choice', 'Dilema', 'indigo', {
            wrapper: 'bg-slate-50 border border-indigo-100 shadow-md rounded-3xl p-8 transition-all',
            header: 'font-serif text-indigo-950 text-3xl text-center mb-6',
            badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full px-6 py-1 font-bold text-[9px] mx-auto block w-fit mb-4 uppercase tracking-widest',
            icon: 'fa-code-compare'
        }),
        createCustomTheme('compare_debate', 'Podcast', 'zinc', {
            wrapper: 'bg-slate-50 border border-slate-200 shadow-md rounded-xl p-6 relative overflow-hidden',
            header: 'font-bold text-slate-800 text-2xl mb-8 border-l-4 border-red-500 pl-4',
            badge: 'text-red-500 font-mono text-[9px] uppercase font-bold tracking-widest block mb-1 px-4',
            icon: 'fa-comments',
        }),
    ],
    ranking: [
        createCustomTheme('rank_top', 'Pódio', 'amber', {
            wrapper: 'bg-slate-50 border-t-8 border-amber-400 shadow-md rounded-b-2xl p-8',
            header: 'font-black text-amber-900/80 text-center text-3xl mb-8 uppercase',
            badge: 'bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-6 py-1.5 font-bold text-[10px] mx-auto block w-fit -mt-12 mb-6 shadow-sm',
            icon: 'fa-trophy'
        }),
        createCustomTheme('rank_order', '📋 Lista', 'blue', {
            wrapper: 'bg-white border-2 border-blue-200 shadow-2xl rounded-none p-12 relative overflow-hidden',
            header: 'font-sans font-black text-blue-900 text-3xl mb-10 border-b-8 border-blue-600 pb-6 uppercase italic tracking-tighter',
            badge: 'bg-blue-600 text-white px-4 py-1 font-bold text-[10px] absolute top-8 right-8 uppercase tracking-widest',
            icon: 'fa-list-ol',
            backgroundPattern: 'opacity-[0.05] absolute inset-0 bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'1\' fill=\'%232563eb\' /%3E%3C/svg%3E")]'
        }),
        createCustomTheme('rank_favorite', 'Galáxia', 'purple', {
            wrapper: 'bg-slate-50 border border-purple-100 shadow-md rounded-[2rem] p-8 relative overflow-hidden',
            header: 'font-bold text-slate-800 text-center text-3xl mb-8',
            badge: 'bg-purple-50 text-purple-600 border border-purple-100 rounded-full px-4 py-1 font-bold text-[9px] mx-auto block w-fit mb-4',
            icon: 'fa-ranking-star',
            backgroundPattern: 'opacity-5 absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.2),transparent)]'
        }),
    ]
};

export const getEngagementColors = (type: string): ColorTheme[] => {
    if (ENGAGEMENT_COLOR_THEMES[type]) return ENGAGEMENT_COLOR_THEMES[type];
    if (['countdown', 'timeline', 'flipcard', 'accordion', 'cta', 'testimonial'].includes(type)) {
        return ENGAGEMENT_COLOR_THEMES['quiz'];
    }
    return ENGAGEMENT_COLOR_THEMES['default'];
};

export const getEngagementAccentColor = (variant: string): string => {
    // Busca em todos os temas o que tem esse ID
    for (const group of Object.values(ENGAGEMENT_COLOR_THEMES)) {
        const found = group.find(t => t.id === variant);
        if (found) {
            // Extrai a cor do preview ou usa um mapa de fallback
            const fallbackMap: Record<string, string> = {
                'bg-blue-500': '#3b82f6',
                'bg-red-500': '#ef4444',
                'bg-green-500': '#22c55e',
                'bg-purple-500': '#a855f7',
                'bg-orange-500': '#f97316',
                'bg-yellow-500': '#eab308',
                'bg-pink-500': '#ec4899',
                'bg-indigo-500': '#6366f1',
                'bg-zinc-800': '#27272a',
                'bg-zinc-900': '#18181b',
            };
            return fallbackMap[found.preview] || '#dc2626';
        }
    }
    return '#dc2626';
};
