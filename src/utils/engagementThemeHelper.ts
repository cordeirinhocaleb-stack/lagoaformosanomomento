
export interface ColorTheme {
    id: string;
    label: string;
    preview: string;
    icon?: string;
    iconColor?: string;
    classes: {
        wrapper: string;
        text: string;
        accent: string;
        secondary: string;
        button: string;
        header?: string;
        badge?: string;
        option?: string;
        barStyle?: string;
        backgroundPattern?: string;
        container?: string;
    }
}

const baseColors: Record<string, any> = {
    blue: { wrapper: 'bg-white border-blue-50', text: 'text-blue-900', accent: 'bg-blue-600/10', secondary: 'border-blue-100', btn: 'hover:bg-blue-50', preview: 'bg-blue-400' },
    red: { wrapper: 'bg-white border-rose-50', text: 'text-rose-900', accent: 'bg-rose-600/10', secondary: 'border-rose-100', btn: 'hover:bg-rose-50', preview: 'bg-rose-400' },
    green: { wrapper: 'bg-white border-emerald-50', text: 'text-emerald-900', accent: 'bg-emerald-600/10', secondary: 'border-emerald-100', btn: 'hover:bg-emerald-50', preview: 'bg-emerald-400' },
    zinc: { wrapper: 'bg-white border-slate-100', text: 'text-slate-800', accent: 'bg-slate-600/10', secondary: 'border-slate-200', btn: 'hover:bg-slate-50', preview: 'bg-slate-400' },
    dark_soft: { wrapper: 'bg-zinc-900/90 backdrop-blur-xl border-zinc-800', text: 'text-zinc-100', accent: 'bg-zinc-100/10', secondary: 'border-zinc-700', btn: 'hover:bg-white/5', preview: 'bg-zinc-700' },
};

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
    const c = baseColors[baseColor] || baseColors['zinc'];

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

export const ENGAGEMENT_COLOR_THEMES: Record<string, ColorTheme[]> = {
    default: [
        {
            id: 'glass_minimal',
            label: 'Minimal Glass',
            preview: 'bg-white/50',
            icon: 'fa-droplet',
            classes: {
                wrapper: 'bg-white/60 backdrop-blur-xl border border-white shadow-xl rounded-[2.5rem] p-8',
                text: 'text-slate-800',
                accent: 'bg-slate-900/5',
                secondary: 'border-slate-100',
                button: 'hover:bg-slate-900/10',
                header: 'font-sans font-black text-slate-900 tracking-tight'
            }
        },
        {
            id: 'soft_newspaper',
            label: 'Papel Suave',
            preview: 'bg-stone-50',
            icon: 'fa-scroll',
            classes: {
                wrapper: 'bg-[#faf9f6] border-y-2 border-slate-200 rounded-none p-10 shadow-sm',
                text: 'text-slate-900',
                accent: 'bg-slate-900/5',
                secondary: 'border-slate-300',
                button: 'hover:bg-slate-100',
                header: 'font-serif font-bold text-slate-900 italic'
            }
        },
        {
            id: 'modern_card',
            label: 'Card Moderno',
            preview: 'bg-indigo-50',
            icon: 'fa-id-card',
            classes: {
                wrapper: 'bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none rounded-3xl p-8',
                text: 'text-slate-800',
                accent: 'bg-indigo-600/5',
                secondary: 'border-indigo-100',
                button: 'hover:bg-indigo-50',
                header: 'font-sans font-bold text-indigo-900'
            }
        }
    ],
    poll: [
        // TEMA 1: POLICIA TÁTICA
        createCustomTheme('police_tactical', '🚔 Operação Tática', 'dark_soft', {
            wrapper: 'bg-zinc-950 border-4 border-zinc-900 rounded-none p-0 shadow-2xl relative overflow-hidden flex flex-col',
            header: 'font-mono font-black uppercase text-yellow-500 tracking-widest text-xl border-b-[4px] border-yellow-500 p-8 pt-10 bg-[url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 40 L40 0\' stroke=\'%23eab308\' stroke-width=\'1\' opacity=\'0.2\'/%3E%3C/svg%3E")]',
            badge: 'bg-yellow-500 text-black px-4 py-1 font-black text-[12px] uppercase absolute top-0 left-0 z-30 tracking-[0.2em] transform border-b-4 border-black',
            option: 'bg-zinc-900/80 border-l-[6px] border-yellow-500/50 text-zinc-300 font-mono text-sm hover:bg-yellow-500 hover:text-black hover:border-black transition-all py-4 px-6 mb-1 shadow-black shadow-lg uppercase tracking-wide',
            barStyle: 'h-full bg-yellow-500 opacity-20',
            container: 'font-mono'
        }),

        // TEMA 2: BRIGADA 193
        createCustomTheme('fire_brigade', '🔥 Brigada 193', 'red', {
            wrapper: 'bg-[#fef2f2] border-8 border-red-600 rounded-3xl p-8 shadow-[0_10px_0px_rgba(185,28,28,1)] relative overflow-visible mt-6',
            header: 'font-black uppercase text-red-700 tracking-tighter text-4xl mb-8 text-center drop-shadow-sm',
            badge: 'bg-red-600 text-white px-6 py-2 rounded-t-xl font-bold text-[10px] uppercase absolute -top-12 left-1/2 -translate-x-1/2 shadow-lg border-x-4 border-t-4 border-red-800',
            option: 'bg-white border-2 border-red-100 rounded-xl text-zinc-800 font-bold hover:bg-gradient-to-r hover:from-white hover:to-orange-50 hover:border-orange-500 transition-all py-5 px-8 mb-3 shadow-md active:translate-y-1 active:shadow-none',
            barStyle: 'h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-xl',
            container: 'font-sans'
        }),

        // TEMA 3: FUTURO DISTÓPICO
        createCustomTheme('cyber_dystopia', '🤖 Futuro Distópico', 'dark_soft', {
            wrapper: 'bg-black border border-cyan-500/50 rounded-none p-10 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden',
            header: 'font-mono text-cyan-400 uppercase tracking-[0.2em] text-lg mb-10 text-right border-r-4 border-cyan-500 pr-4 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]',
            badge: 'text-cyan-500 border border-cyan-500/30 px-2 py-1 text-[8px] font-mono absolute top-4 left-4 tracking-widest animate-pulse',
            option: 'bg-black border border-zinc-800 text-cyan-500/70 font-mono hover:text-cyan-300 hover:border-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all py-4 px-6 mb-4 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-[2px] before:h-full before:bg-cyan-500 before:opacity-0 hover:before:opacity-100',
            barStyle: 'h-full bg-cyan-500 opacity-20',
            backgroundPattern: 'opacity-[0.05] absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px]',
            container: 'font-mono'
        }),
    ],
    quiz: [
        createCustomTheme('quiz_glass', '🔍 Investigativo Glass', 'zinc', {
            wrapper: 'bg-white/40 backdrop-blur-xl border border-white shadow-2xl rounded-[3rem] p-12',
            header: 'font-sans font-black text-slate-900 uppercase italic text-center text-3xl mb-10',
            option: 'bg-white/80 border border-white rounded-2xl text-slate-800 font-bold hover:bg-white transition-all py-5 px-8 mb-4 shadow-sm'
        }),
        createCustomTheme('quiz_soft_newspaper', '🖊️ Crônica Editorial', 'zinc', {
            wrapper: 'bg-[#fcfaf7] border border-stone-200 rounded-none p-12 font-serif text-stone-900 shadow-sm',
            header: 'border-b-4 border-stone-800 pb-6 mb-10 text-4xl font-black italic text-center',
            option: 'border-b border-stone-100 hover:bg-stone-50 transition-all py-4 uppercase text-xs tracking-widest font-bold text-stone-600'
        }),
        createCustomTheme('interactive_interview', 'Entrevista Interativa', 'sky', {
            wrapper: 'bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-xl border-none rounded-2xl p-8',
            header: 'font-sans font-bold text-indigo-900 border-b-2 border-indigo-100 pb-4 mb-6',
            option: 'hover:bg-indigo-50 border border-indigo-100 rounded-xl transition-all shadow-sm group',
            badge: 'bg-indigo-100 text-indigo-700 font-medium px-3 py-1 rounded-full text-xs uppercase'
        })
    ],
    countdown: [
        createCustomTheme('breaking_news', '🚨 Plantão Urgente', 'red', {
            wrapper: 'bg-red-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.4)] border-y-8 border-yellow-400 rounded-none p-8 animate-pulse-slow',
            header: 'font-black uppercase tracking-widest text-center text-4xl mb-4 drop-shadow-md italic',
            option: 'text-white border-2 border-white/30 bg-black/20 rounded-lg p-4 font-mono text-xl',
            badge: 'bg-yellow-400 text-black font-black uppercase px-2 py-1 rotate-[-2deg] shadow-lg'
        }),
        createCustomTheme('election_day', '🗳️ Urnas Abertas', 'emerald', {
            wrapper: 'bg-gradient-to-r from-gray-200 to-gray-300 border-t-[12px] border-emerald-600 shadow-2xl rounded-sm p-10',
            header: 'font-serif font-bold text-gray-800 text-center uppercase tracking-wider border-b border-gray-400 pb-4 mb-6',
            option: 'bg-white border-l-4 border-emerald-600 shadow-sm rounded-r-md px-6 py-4 font-mono text-gray-800',
            badge: 'bg-emerald-700 text-white font-bold uppercase px-4 py-1 rounded-sm text-[10px] tracking-widest'
        }),
        createCustomTheme('event_premiere', '🌟 Grande Estreia', 'amber', {
            wrapper: 'bg-zinc-950 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.1)] rounded-[3rem] p-12 radial-gradient-gold',
            header: 'font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 text-center text-3xl mb-10',
            option: 'bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all rounded-full px-8 py-4 text-amber-100',
            badge: 'bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-black uppercase px-4 py-1.5 rounded-full text-xs'
        })
    ],
    ranking: [
        createCustomTheme('power_list', 'Top Power List', 'slate', {
            wrapper: 'bg-white border-[20px] border-slate-900 shadow-2xl p-10 max-w-2xl mx-auto',
            header: 'font-serif font-black text-6xl text-slate-900 mb-8 tracking-tighter leading-[0.8]',
            option: 'border-b-2 border-slate-900 py-6 flex items-center justify-between hover:indent-4 transition-all duration-300 cursor-pointer',
            badge: 'bg-black text-white font-serif italic text-lg px-4 pt-1 pb-2'
        }),
        createCustomTheme('sports_podium', 'Pódio Esportivo', 'green', {
            wrapper: 'bg-[#1a472a] bg-[radial-gradient(#2f855a_1px,transparent_1px)] bg-[size:20px_20px] border-4 border-white shadow-[0_10px_0_rgba(0,0,0,0.3)] rounded-3xl p-8 text-white',
            header: 'font-black uppercase text-center text-4xl italic transform -skew-x-12 text-yellow-400 drop-shadow-[5px_5px_0_rgba(0,0,0,1)] mb-8',
            option: 'bg-white text-black font-black uppercase transform skew-x-[-12deg] rounded-none p-4 mb-3 shadow-[5px_5px_0_rgba(0,0,0,0.5)] border-2 border-black hover:bg-yellow-400 transition-colors',
            badge: 'bg-yellow-400 text-black font-black uppercase px-2 py-0.5 transform -skew-x-12 border border-black'
        }),
        createCustomTheme('market_index', 'Índice de Mercado', 'blue', {
            wrapper: 'bg-slate-50 border border-slate-200 rounded-xl p-6 font-mono text-sm uppercase',
            header: 'border-b border-slate-300 pb-2 mb-4 font-bold text-slate-500 flex justify-between',
            option: 'flex justify-between items-center py-2 border-b border-dashed border-slate-200 hover:bg-blue-50 cursor-pointer px-2 transition-colors',
            badge: 'bg-green-100 text-green-700 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-tight'
        })
    ],
    image_poll: [
        createCustomTheme('versus_battle', '⚔️ Batalha VS', 'rose', {
            wrapper: 'bg-zinc-900 text-white border-x-[20px] border-rose-600 rounded-none p-0 overflow-hidden relative',
            header: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-600 text-white font-black text-4xl p-6 rounded-full border-4 border-white z-20 shadow-[0_0_50px_rgba(225,29,72,0.8)]',
            option: 'relative h-64 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer overflow-hidden group',
            badge: 'absolute bottom-4 left-4 bg-black text-white font-bold uppercase px-4 py-2 text-xl italic'
        }),
        createCustomTheme('gallery_award', 'Galeria de Prêmios', 'zinc', {
            wrapper: 'bg-black text-white p-12 shadow-2xl',
            header: 'font-light text-center uppercase tracking-[1em] text-xs text-zinc-500 mb-12 border-b border-zinc-800 pb-8',
            option: 'aspect-square bg-zinc-900 border border-zinc-800 hover:border-white transition-colors duration-500 p-2 cursor-pointer',
            badge: 'bg-white text-black font-serif italic text-xs px-3 py-1 mt-2 inline-block'
        }),
        createCustomTheme('before_after_tech', 'Antes & Depois Tech', 'cyan', {
            wrapper: 'bg-slate-900 border border-cyan-500/30 p-1 rounded-lg grid grid-cols-2 gap-1',
            header: 'col-span-2 bg-slate-800 text-cyan-400 font-mono text-xs p-2 uppercase text-center border-b border-cyan-900 mb-2',
            option: 'relative group overflow-hidden border border-slate-700 rounded hover:border-cyan-400 transition-all',
            badge: 'absolute top-2 right-2 bg-black/80 text-cyan-400 font-mono text-[10px] px-2 py-0.5 border border-cyan-500/50 backdrop-blur-sm'
        })
    ],
    // Alias for 'comparison'
    comparison: [
        createCustomTheme('versus_battle', '⚔️ Batalha VS', 'rose', {
            wrapper: 'bg-zinc-900 text-white border-x-[20px] border-rose-600 rounded-none p-0 overflow-hidden relative',
            header: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-600 text-white font-black text-4xl p-6 rounded-full border-4 border-white z-20 shadow-[0_0_50px_rgba(225,29,72,0.8)]',
            option: 'relative h-64 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer overflow-hidden group',
            badge: 'absolute bottom-4 left-4 bg-black text-white font-bold uppercase px-4 py-2 text-xl italic'
        }),
        createCustomTheme('gallery_award', 'Galeria de Prêmios', 'zinc', {
            wrapper: 'bg-black text-white p-12 shadow-2xl',
            header: 'font-light text-center uppercase tracking-[1em] text-xs text-zinc-500 mb-12 border-b border-zinc-800 pb-8',
            option: 'aspect-square bg-zinc-900 border border-zinc-800 hover:border-white transition-colors duration-500 p-2 cursor-pointer',
            badge: 'bg-white text-black font-serif italic text-xs px-3 py-1 mt-2 inline-block'
        }),
        createCustomTheme('before_after_tech', 'Antes & Depois Tech', 'cyan', {
            wrapper: 'bg-slate-900 border border-cyan-500/30 p-1 rounded-lg grid grid-cols-2 gap-1',
            header: 'col-span-2 bg-slate-800 text-cyan-400 font-mono text-xs p-2 uppercase text-center border-b border-cyan-900 mb-2',
            option: 'relative group overflow-hidden border border-slate-700 rounded hover:border-cyan-400 transition-all',
            badge: 'absolute top-2 right-2 bg-black/80 text-cyan-400 font-mono text-[10px] px-2 py-0.5 border border-cyan-500/50 backdrop-blur-sm'
        })
    ],
    reaction: [
        createCustomTheme('comic_boom', 'Comic Boom 💥', 'yellow', {
            wrapper: 'bg-yellow-300 border-[6px] border-black shadow-[10px_10px_0px_rgba(0,0,0,1)] p-8 rounded-none transform rotate-1',
            header: 'font-black text-black text-4xl uppercase tracking-tighter drop-shadow-md -skew-x-6',
            option: 'bg-white border-4 border-black rounded-full p-4 hover:scale-125 transition-transform cursor-pointer shadow-[4px_4px_0_black]',
            badge: 'bg-red-600 text-white font-black px-4 py-1 skew-x-[-10deg] border-2 border-black'
        }),
        createCustomTheme('pixel_pet', 'Pixel Pet 👾', 'green', {
            wrapper: 'bg-[#9bbc0f] border-8 border-[#0f380f] rounded-none p-6 font-mono', // Gameboy palette
            header: 'text-[#0f380f] font-bold text-xl uppercase tracking-widest text-center border-b-4 border-[#0f380f] pb-4 mb-6 border-dashed',
            option: 'bg-[#8bac0f] border-4 border-[#306230] p-4 text-center hover:bg-[#306230] hover:text-[#9bbc0f] cursor-pointer active:translate-y-1',
            badge: 'bg-[#0f380f] text-[#9bbc0f] px-2 py-0 text-[10px] uppercase font-bold'
        }),
        createCustomTheme('glass_emojis', 'Glass Emojis 💎', 'blue', {
            wrapper: 'bg-white/30 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.15)] rounded-[2rem] p-8',
            header: 'text-zinc-800 font-bold text-2xl text-center mb-8 drop-shadow-sm',
            option: 'bg-white/40 hover:bg-white/80 border border-white rounded-3xl p-4 transition-all hover:-translate-y-2 shadow-sm',
            badge: 'bg-white/50 backdrop-blur-md text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold'
        })
    ],
    counter: [
        createCustomTheme('life_bar', 'Barra de Vida ❤️', 'red', {
            wrapper: 'bg-zinc-950 border-4 border-zinc-800 rounded-lg p-6 relative overflow-hidden',
            header: 'text-red-500 font-black uppercase text-xl animate-pulse tracking-widest pl-8',
            option: 'h-12 bg-red-900/30 border-2 border-red-600 rounded-sm relative overflow-hidden after:content-[""] after:absolute after:top-0 after:left-0 after:h-full after:w-[var(--progress,50%)] after:bg-red-600 after:transition-all',
            badge: 'absolute top-0 right-0 bg-red-600 text-black font-bold px-2 py-1 text-xs' // Heart icon style
        }),
        createCustomTheme('crowd_power', 'Poder da Multidão 🙌', 'indigo', {
            wrapper: 'bg-indigo-950 text-white p-8 rounded-t-3xl border-b-8 border-indigo-500',
            header: 'font-bold text-3xl text-center text-indigo-300 uppercase tracking-wide',
            option: 'bg-indigo-800 hover:bg-indigo-700 transition-colors rounded-xl p-4 flex items-center justify-center border border-indigo-600',
            badge: 'bg-indigo-500 text-white rounded-full px-4 py-1 text-sm font-bold shadow-glow'
        }),
        createCustomTheme('gold_coin', 'Moeda Dourada 🪙', 'amber', {
            wrapper: 'bg-amber-100 border-4 border-amber-400 rounded-3xl p-8 shadow-inner',
            header: 'text-amber-800 font-black text-2xl text-center drop-shadow-sm',
            option: 'w-16 h-16 rounded-full bg-amber-400 border-4 border-amber-500 shadow-xl flex items-center justify-center text-amber-900 font-black text-xl hover:rotate-[360deg] transition-transform duration-700 cursor-pointer',
            badge: 'bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold border border-amber-200'
        })
    ],
    timeline: [
        createCustomTheme('metro_line', 'Linha de Metrô 🚇', 'blue', {
            wrapper: 'bg-white p-6 relative ml-4 border-l-[12px] border-blue-600', // The "rail"
            header: 'text-blue-900 font-black uppercase text-4xl mb-8 -ml-9 bg-white px-4 inline-block',
            option: 'relative pl-8 mb-8 before:absolute before:left-[-41px] before:top-1 before:w-6 before:h-6 before:bg-white before:border-4 before:border-blue-600 before:rounded-full hover:before:bg-blue-600 transition-colors',
            badge: 'bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-xs uppercase tracking-widest'
        }),
        createCustomTheme('film_roll', 'Rolo de Filme 🎞️', 'zinc', {
            wrapper: 'bg-black text-white p-8 border-y-[24px] border-dashed border-zinc-800 relative', // Film sprocket holes
            header: 'font-serif italic text-3xl text-zinc-400 text-center mb-10',
            option: 'border-l border-r border-zinc-800 bg-zinc-900/50 p-6 mx-4 hover:bg-zinc-800 transition-colors rounded-sm',
            badge: 'bg-white text-black font-mono text-xs px-2 py-1 transform -rotate-90 absolute -left-6 top-10'
        }),
        createCustomTheme('whatsapp_chat', 'Chat Zap 💬', 'emerald', {
            wrapper: 'bg-[#e5ddd5] p-4 rounded-lg shadow-sm', // WhatsApp generic background color
            header: 'bg-[#008069] text-white p-4 -m-4 mb-4 rounded-t-lg flex items-center gap-3 font-bold shadow-md',
            option: 'bg-white p-3 rounded-lg shadow-sm mb-2 relative after:content-[""] after:absolute after:top-0 after:left-[-10px] after:border-[10px] after:border-transparent after:border-t-white max-w-[85%] ml-auto mr-0', // Bubble right (sent) or left (received)
            badge: 'text-[10px] text-gray-500 self-end mt-1 block text-right' // Timestamp style
        })
    ],
    flipcard: [
        createCustomTheme('vinyl_cover', 'Capa de Vinil 🎵', 'zinc', {
            wrapper: 'bg-zinc-900 p-1 rounded-none shadow-2xl w-full aspect-square relative group overflow-visible',
            header: 'absolute top-4 left-4 z-20 font-black text-white mix-blend-difference text-4xl leading-none',
            option: 'absolute top-0 right-0 w-full h-full rounded-full bg-zinc-800 border-[30px] border-black flex items-center justify-center animate-spin-slow group-hover:translate-x-1/2 transition-transform duration-700 ease-out z-0',
            badge: 'absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 font-bold uppercase text-xs z-20'
        }),
        createCustomTheme('top_secret', 'Top Secret ✉️', 'amber', {
            wrapper: 'bg-[#d4c4a8] p-8 shadow-lg border-2 border-[#bfa886] rotate-1 relative', // Manila folder
            header: 'text-red-700 font-black uppercase text-4xl border-4 border-red-700 p-2 inline-block transform -rotate-12 opacity-80 mb-8 mask-stamp',
            option: 'bg-white p-6 shadow-sm font-typewriter text-sm leading-relaxed relative top-0 hover:-top-16 transition-all duration-500 border-t-4 border-red-700',
            badge: 'bg-black text-white font-mono text-xs px-2 py-1 absolute top-2 right-2'
        }),
        createCustomTheme('tarot_card', 'Carta de Tarot 🔮', 'purple', {
            wrapper: 'bg-purple-950 border-[10px] border-amber-500 rounded-2xl p-4 shadow-[0_0_30px_rgba(147,51,234,0.5)] text-center text-amber-200',
            header: 'font-serif italic text-2xl mb-8 border-b border-amber-500/30 pb-4',
            option: 'bg-purple-900/50 border border-amber-500/30 p-4 rounded-xl hover:bg-amber-500/10 transition-colors cursor-pointer',
            badge: 'bg-amber-500 text-purple-950 px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full'
        })
    ],
    accordion: [
        createCustomTheme('file_cabinet', 'Arquivo de Aço 🗄️', 'emerald', {
            wrapper: 'bg-emerald-50 border-t-4 border-emerald-600 p-6 shadow-md rounded-b-lg',
            header: 'font-bold text-emerald-800 text-xl mb-6 uppercase tracking-tight',
            option: 'bg-white border text-emerald-900 px-4 py-3 mb-2 rounded-t-lg shadow-sm border-b-4 border-b-emerald-100 hover:mb-3 hover:pb-6 transition-all cursor-pointer',
            badge: 'bg-emerald-200 text-emerald-800 px-2 py-0.5 text-xs font-bold rounded-sm'
        }),
        createCustomTheme('code_terminal', 'Terminal Code 👨‍💻', 'zinc', {
            wrapper: 'bg-[#1e1e1e] border-l-4 border-l-blue-500 p-4 font-mono text-sm shadow-2xl',
            header: 'text-blue-400 font-bold mb-4 flex gap-2 before:content-[">"]',
            option: 'text-gray-300 hover:text-white hover:bg-[#2d2d2d] p-2 pl-4 border-l border-zinc-700 cursor-pointer block w-full text-left',
            badge: 'text-green-500 text-xs' // Syntax highlight style
        }),
        createCustomTheme('pizza_box', 'Caixa de Pizza 🍕', 'orange', {
            wrapper: 'bg-[#f4a460] border-4 border-[#8b4513] rounded-sm p-8 shadow-xl relative', // Cardboard color
            header: 'font-black text-[#8b4513] text-4xl text-center uppercase tracking-tighter transform rotate-[-2deg]',
            option: 'bg-white p-4 border-b-2 border-dashed border-[#8b4513] text-[#8b4513] font-bold hover:bg-[#fff8e7] transition-colors',
            badge: 'bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-black absolute -top-4 -right-4 shadow-lg rotate-12'
        })
    ],
    cta: [
        createCustomTheme('launch_button', 'Lançar Foguete 🚀', 'red', {
            wrapper: 'bg-zinc-200 p-12 rounded-3xl shadow-inner text-center',
            header: 'text-zinc-500 font-bold uppercase tracking-[0.3em] text-xs mb-8',
            option: 'bg-red-600 text-white font-black text-3xl uppercase py-8 px-12 rounded-full shadow-[0_10px_0_#991b1b] active:shadow-none active:translate-y-[10px] transition-all cursor-pointer border-4 border-red-700 inline-block',
            badge: 'hidden'
        }),
        createCustomTheme('golden_ticket', 'Bilhete Dourado 🎫', 'amber', {
            wrapper: 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 border-2 border-amber-400 p-8 rounded-lg shadow-xl relative overflow-hidden',
            header: 'font-serif italic text-amber-900 text-4xl text-center mb-6 drop-shadow-sm',
            option: 'border-2 border-dashed border-amber-600 p-4 text-amber-800 font-bold text-center hover:bg-white/30 transition-colors uppercase tracking-widest cursor-pointer',
            badge: 'bg-amber-900 text-amber-100 px-4 py-1.5 rounded-sm absolute top-4 left-[-30px] transform -rotate-45 shadow-md w-32 text-center text-xs font-bold'
        }),
        createCustomTheme('neon_sign', 'Luz Neon 🏩', 'fuchsia', {
            wrapper: 'bg-black p-10 border-4 border-zinc-900 shadow-2xl text-center',
            header: 'text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500 font-black text-5xl uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] animate-pulse-slow',
            option: 'text-white border-2 border-fuchsia-500 rounded-lg px-8 py-4 shadow-[0_0_15px_rgba(217,70,239,0.5)] hover:bg-fuchsia-500/20 hover:shadow-[0_0_30px_rgba(217,70,239,0.8)] transition-all uppercase font-bold tracking-widest',
            badge: 'bg-cyan-500 text-black font-black px-2 py-0.5 text-[10px] absolute top-4 right-4 rotate-6 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
        })
    ]
};

export const getEngagementColors = (type: string): ColorTheme[] => {
    if (ENGAGEMENT_COLOR_THEMES[type]) return ENGAGEMENT_COLOR_THEMES[type];
    if (['quiz', 'countdown', 'timeline', 'flipcard', 'accordion', 'cta', 'testimonial'].includes(type)) {
        return ENGAGEMENT_COLOR_THEMES['quiz'];
    }
    return ENGAGEMENT_COLOR_THEMES['default'];
};

export const getEngagementAccentColor = (variant: string): string => {
    for (const group of Object.values(ENGAGEMENT_COLOR_THEMES)) {
        const found = group.find(t => t.id === variant);
        if (found) {
            const fallbackMap: Record<string, string> = {
                'bg-white/50': '#cbd5e1',
                'bg-stone-50': '#78716c',
                'bg-indigo-50': '#4f46e5',
                'bg-blue-400': '#3b82f6',
                'bg-rose-400': '#e11d48',
                'bg-emerald-400': '#10b981',
                'bg-slate-400': '#64748b',
                'bg-zinc-700': '#3f3f46',
            };
            return fallbackMap[found.preview] || '#64748b';
        }
    }
    return '#64748b';
};
