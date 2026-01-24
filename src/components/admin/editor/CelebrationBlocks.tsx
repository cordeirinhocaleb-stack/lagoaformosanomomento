
// Version: 1.120 - Blocos de Coberturas Especiais (Soft Premium)
import { ContentBlock } from '../../../types';

export interface CelebrationBlock {
    id: string;
    name: string;
    emoji: string;
    date: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    icon: string;
    description: string;
    template: Partial<ContentBlock>;
}

export const CELEBRATION_BLOCKS: CelebrationBlock[] = [
    {
        id: 'crime_coverage_soft',
        name: 'Operação Policial',
        emoji: '🚔',
        date: 'AO VIVO',
        colors: { primary: '#f8fafc', secondary: '#94a3b8', accent: '#0f172a' },
        icon: 'fa-shield-halved',
        description: 'Template policial em tons de cinza e azul marinho suave',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root news-police bg-zinc-950/95 backdrop-blur-xl border-x-8 border-yellow-500/20 p-10 rounded-none shadow-2xl relative overflow-hidden flex flex-col items-center text-center"><div class="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0 L60 30 L30 60 L0 30 Z\' fill=\'%23eab308\' /%3E%3C/svg%3E')]"></div><div class="relative z-10"><h4 class="text-[10px] font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-1 uppercase tracking-[0.3em] mb-6 inline-block">UNIDADE MÓVEL</h4><h2 class="text-4xl font-black text-white uppercase tracking-tighter mb-4 lfnm-text" data-key="Titulo">Operação Impacto</h2><p class="text-lg text-zinc-400 font-mono italic mb-8 lfnm-text" data-key="Mensagem">Cobertura especial direta das frentes de investigação criminal.</p><div class="flex gap-8 justify-center text-4xl opacity-50"><span>🚔</span><span>🛡️</span><span>🚨</span></div></div></div>`,
            settings: { widgetId: 'news_police_block', width: 'full' }
        }
    },
    {
        id: 'politics_soft',
        name: 'Debate Eleitoral',
        emoji: '🏛️',
        date: 'ESPECIAL',
        colors: { primary: '#f0f4f8', secondary: '#1e3a8a', accent: '#ffffff' },
        icon: 'fa-landmark',
        description: 'Template político estilo "Long-form Editorial"',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root news-politics bg-[#fdfcf9] border-y-4 border-slate-200 p-12 rounded-none shadow-sm relative overflow-hidden"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900/40 via-blue-900/10 to-blue-900/40"></div><div class="relative z-10 text-center"><h2 class="text-5xl font-serif font-black text-slate-900 mb-6 lfnm-text" data-key="Titulo">Análise do Poder</h2><p class="text-xl text-slate-600 font-serif italic max-w-2xl mx-auto mb-10 lfnm-text" data-key="Mensagem">O futuro político da região em debate e análise pelos nossos especialistas.</p><div class="flex gap-6 items-center justify-center"><span class="w-16 h-[1px] bg-slate-300"></span><span class="text-xs font-bold text-slate-400 uppercase tracking-widest">DEBATE 2024</span><span class="w-16 h-[1px] bg-slate-300"></span></div></div></div>`,
            settings: { widgetId: 'news_politics_block', width: 'full' }
        }
    },
    {
        id: 'weather_soft',
        name: 'Alerta Clima',
        emoji: '⛈️',
        date: 'ALERTA',
        colors: { primary: '#fef2f2', secondary: '#ef4444', accent: '#ffffff' },
        icon: 'fa-cloud-showers-heavy',
        description: 'Template climático "Glassmorphism"',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root news-weather bg-white/40 backdrop-blur-2xl border border-white shadow-2xl rounded-[3.5rem] p-12 relative overflow-hidden"><div class="absolute -right-10 -top-10 text-red-500/5 text-[15rem] font-black shrink-0 pointer-events-none">⛈️</div><div class="relative z-10"><h4 class="text-xs font-black text-red-600 bg-red-50 border border-red-100 px-4 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">DEFESA CIVIL</h4><h2 class="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4 lfnm-text" data-key="Titulo">Alerta de Chuvas</h2><p class="text-xl font-bold text-slate-600 mb-8 lfnm-text" data-key="Mensagem">Condições meteorológicas severas previstas para as próximas horas.</p><div class="flex gap-4 text-5xl opacity-40"><span>⚡</span><span>🌊</span><span>🌬️</span></div></div></div>`,
            settings: { widgetId: 'news_weather_block', width: 'full' }
        }
    },
    {
        id: 'health_soft',
        name: 'Saúde Pública',
        emoji: '🏥',
        date: 'UTILIDADE',
        colors: { primary: '#f0fdf4', secondary: '#10b981', accent: '#ffffff' },
        icon: 'fa-square-h',
        description: 'Template saúde "Neo-Minimalist"',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root news-health bg-white shadow-[0_30px_60px_rgba(0,0,0,0.03)] border-none rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-10"><div class="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-lg"><span class="text-6xl items-center flex justify-center w-full h-full">🏥</span></div><div><h2 class="text-4xl font-black text-emerald-950 mb-3 tracking-tight lfnm-text" data-key="Titulo">Boletim de Saúde</h2><p class="text-lg text-slate-500 font-medium mb-0 lfnm-text" data-key="Mensagem">Informações oficiais sobre campanhas de vacinação e prevenção na cidade.</p></div></div>`,
            settings: { widgetId: 'news_health_block', width: 'full' }
        }
    },
    {
        id: 'traffic_soft',
        name: 'Flash Trânsito',
        emoji: '🚗',
        date: 'DIRETO',
        colors: { primary: '#fffbeb', secondary: '#f59e0b', accent: '#000000' },
        icon: 'fa-car-burst',
        description: 'Template trânsito "High Contrast Minimal"',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root news-traffic bg-amber-50 border-2 border-amber-200 p-8 rounded-none shadow-sm flex items-center gap-8"><div class="w-16 h-16 bg-amber-500 rounded-2xl rotate-3 flex items-center justify-center text-3xl shrink-0 shadow-lg border-2 border-white">🚗</div><div class="flex-1"><h4 class="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">TRÂNSITO AGORA</h4><h2 class="text-2xl font-black text-zinc-900 uppercase tracking-tight lfnm-text" data-key="Titulo">Situação das Vias</h2><p class="text-sm font-bold text-zinc-500 italic lfnm-text" data-key="Mensagem">Acompanhe as interdições e fluxo nas principais entradas da cidade.</p></div></div>`,
            settings: { widgetId: 'news_traffic_block', width: 'full' }
        }
    }
];
