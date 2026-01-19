// Version: 1.111 - Blocos temáticos de comemorações do ano
import { ContentBlock } from '@/types';

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
        id: 'natal',
        name: 'Natal',
        emoji: '🎄',
        date: '25/12',
        colors: { primary: '#dc2626', secondary: '#16a34a', accent: '#fef3c7' },
        icon: 'fa-tree',
        description: 'Template festivo de Natal com cores vermelho e verde',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-natal bg-gradient-to-br from-red-50 to-green-50 p-8 rounded-3xl border-4 border-red-600 relative overflow-hidden"><div class="absolute top-0 right-0 text-9xl opacity-10">🎄</div><h2 class="text-4xl font-black text-red-600 mb-4 lfnm-text" data-key="Titulo">🎅 Feliz Natal!</h2><p class="text-lg text-gray-700 mb-6 lfnm-text" data-key="Mensagem">Desejamos a todos um Natal repleto de paz, amor e alegria!</p><div class="flex gap-4 justify-center"><span class="text-6xl">🎁</span><span class="text-6xl">⛄</span><span class="text-6xl">🔔</span></div></div>`,
            settings: { widgetId: 'celebration_natal', width: 'full' }
        }
    },
    {
        id: 'ano_novo',
        name: 'Ano Novo',
        emoji: '🎆',
        date: '01/01',
        colors: { primary: '#eab308', secondary: '#3b82f6', accent: '#ffffff' },
        icon: 'fa-champagne-glasses',
        description: 'Celebração de Ano Novo com fogos e champagne',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-ano-novo bg-gradient-to-br from-yellow-400 via-blue-500 to-purple-600 p-8 rounded-3xl text-white relative overflow-hidden"><div class="absolute inset-0 bg-black opacity-20"></div><div class="relative z-10"><h2 class="text-5xl font-black mb-4 text-center lfnm-text" data-key="Titulo">🎆 Feliz 2026!</h2><p class="text-xl text-center mb-6 lfnm-text" data-key="Mensagem">Que o novo ano traga realizações e felicidade!</p><div class="flex gap-3 justify-center text-4xl"><span>🥂</span><span>🎉</span><span>✨</span><span>🎊</span></div></div></div>`,
            settings: { widgetId: 'celebration_ano_novo', width: 'full' }
        }
    },
    {
        id: 'carnaval',
        name: 'Carnaval',
        emoji: '🎭',
        date: 'Fev/Mar',
        colors: { primary: '#ec4899', secondary: '#8b5cf6', accent: '#fbbf24' },
        icon: 'fa-masks-theater',
        description: 'Festa de Carnaval com cores vibrantes',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-carnaval bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400 p-8 rounded-3xl relative overflow-hidden"><h2 class="text-5xl font-black text-white mb-4 text-center drop-shadow-lg lfnm-text" data-key="Titulo">🎭 Carnaval 2026!</h2><p class="text-xl text-white text-center mb-6 drop-shadow lfnm-text" data-key="Mensagem">É tempo de folia e alegria!</p><div class="flex gap-3 justify-center text-5xl"><span>🎉</span><span>🎊</span><span>🎺</span><span>🥁</span></div></div>`,
            settings: { widgetId: 'celebration_carnaval', width: 'full' }
        }
    },
    {
        id: 'pascoa',
        name: 'Páscoa',
        emoji: '🐰',
        date: 'Mar/Abr',
        colors: { primary: '#f472b6', secondary: '#a78bfa', accent: '#fde047' },
        icon: 'fa-egg',
        description: 'Páscoa com coelhos e ovos coloridos',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-pascoa bg-gradient-to-br from-pink-100 via-purple-100 to-yellow-100 p-8 rounded-3xl border-4 border-pink-300 relative"><div class="absolute top-0 right-0 text-9xl opacity-10">🐰</div><h2 class="text-4xl font-black text-pink-600 mb-4 lfnm-text" data-key="Titulo">🐰 Feliz Páscoa!</h2><p class="text-lg text-gray-700 mb-6 lfnm-text" data-key="Mensagem">Que esta Páscoa traga renovação e doçura!</p><div class="flex gap-4 justify-center text-5xl"><span>🥚</span><span>🍫</span><span>🌷</span></div></div>`,
            settings: { widgetId: 'celebration_pascoa', width: 'full' }
        }
    },
    {
        id: 'dia_pais',
        name: 'Dia dos Pais',
        emoji: '👨',
        date: '2º Dom Ago',
        colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#dbeafe' },
        icon: 'fa-user-tie',
        description: 'Homenagem ao Dia dos Pais',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-dia-pais bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border-4 border-blue-600 relative"><div class="absolute top-0 right-0 text-9xl opacity-10">👨</div><h2 class="text-4xl font-black text-blue-600 mb-4 lfnm-text" data-key="Titulo">👨 Feliz Dia dos Pais!</h2><p class="text-lg text-gray-700 mb-6 lfnm-text" data-key="Mensagem">Parabéns a todos os pais pelo seu dia!</p><div class="flex gap-4 justify-center text-5xl"><span>👔</span><span>🔧</span><span>💙</span></div></div>`,
            settings: { widgetId: 'celebration_dia_pais', width: 'full' }
        }
    },
    {
        id: 'dia_maes',
        name: 'Dia das Mães',
        emoji: '👩',
        date: '2º Dom Mai',
        colors: { primary: '#ec4899', secondary: '#be185d', accent: '#fce7f3' },
        icon: 'fa-heart',
        description: 'Homenagem ao Dia das Mães',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-dia-maes bg-gradient-to-br from-pink-50 to-rose-100 p-8 rounded-3xl border-4 border-pink-500 relative"><div class="absolute top-0 right-0 text-9xl opacity-10">👩</div><h2 class="text-4xl font-black text-pink-600 mb-4 lfnm-text" data-key="Titulo">👩 Feliz Dia das Mães!</h2><p class="text-lg text-gray-700 mb-6 lfnm-text" data-key="Mensagem">Parabéns a todas as mães pelo seu dia!</p><div class="flex gap-4 justify-center text-5xl"><span>💐</span><span>💝</span><span>🌹</span></div></div>`,
            settings: { widgetId: 'celebration_dia_maes', width: 'full' }
        }
    },
    {
        id: 'dia_namorados',
        name: 'Dia dos Namorados',
        emoji: '💑',
        date: '12/06',
        colors: { primary: '#ef4444', secondary: '#f472b6', accent: '#fecdd3' },
        icon: 'fa-heart',
        description: 'Celebração do Dia dos Namorados',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-namorados bg-gradient-to-br from-red-100 via-pink-100 to-rose-100 p-8 rounded-3xl border-4 border-red-500 relative overflow-hidden"><div class="relative z-10"><h2 class="text-4xl font-black text-red-600 mb-4 text-center lfnm-text" data-key="Titulo">💑 Feliz Dia dos Namorados!</h2><p class="text-lg text-gray-700 mb-6 text-center lfnm-text" data-key="Mensagem">Celebre o amor com quem você ama!</p><div class="flex gap-4 justify-center text-5xl"><span>💕</span><span>🌹</span><span>💝</span></div></div></div>`,
            settings: { widgetId: 'celebration_namorados', width: 'full' }
        }
    },
    {
        id: 'independencia',
        name: 'Independência',
        emoji: '🇧🇷',
        date: '07/09',
        colors: { primary: '#16a34a', secondary: '#eab308', accent: '#3b82f6' },
        icon: 'fa-flag',
        description: 'Dia da Independência do Brasil',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-independencia bg-gradient-to-br from-green-600 via-yellow-400 to-blue-600 p-8 rounded-3xl text-white relative"><div class="absolute inset-0 bg-black opacity-20"></div><div class="relative z-10"><h2 class="text-4xl font-black mb-4 text-center drop-shadow-lg lfnm-text" data-key="Titulo">🇧🇷 7 de Setembro!</h2><p class="text-xl text-center mb-6 drop-shadow lfnm-text" data-key="Mensagem">Independência ou Morte!</p><div class="flex gap-4 justify-center text-5xl"><span>🇧🇷</span><span>🎖️</span><span>🏛️</span></div></div></div>`,
            settings: { widgetId: 'celebration_independencia', width: 'full' }
        }
    },
    {
        id: 'halloween',
        name: 'Halloween',
        emoji: '🎃',
        date: '31/10',
        colors: { primary: '#f97316', secondary: '#000000', accent: '#7c3aed' },
        icon: 'fa-ghost',
        description: 'Noite de Halloween assustadora',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-halloween bg-gradient-to-br from-orange-600 via-black to-purple-900 p-8 rounded-3xl text-white relative overflow-hidden"><div class="absolute top-0 right-0 text-9xl opacity-20">🎃</div><h2 class="text-4xl font-black text-orange-400 mb-4 lfnm-text" data-key="Titulo">🎃 Happy Halloween!</h2><p class="text-lg mb-6 lfnm-text" data-key="Mensagem">Doces ou travessuras?</p><div class="flex gap-4 justify-center text-5xl"><span>👻</span><span>🦇</span><span>🕷️</span></div></div>`,
            settings: { widgetId: 'celebration_halloween', width: 'full' }
        }
    },
    {
        id: 'volta_aulas',
        name: 'Volta às Aulas',
        emoji: '📚',
        date: 'Jan/Fev',
        colors: { primary: '#eab308', secondary: '#3b82f6', accent: '#10b981' },
        icon: 'fa-graduation-cap',
        description: 'Início do ano letivo',
        template: {
            type: 'smart_block',
            content: `<div class="widget-root celebration-volta-aulas bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 p-8 rounded-3xl border-4 border-yellow-500 relative"><div class="absolute top-0 right-0 text-9xl opacity-10">📚</div><h2 class="text-4xl font-black text-blue-600 mb-4 lfnm-text" data-key="Titulo">📚 Volta às Aulas!</h2><p class="text-lg text-gray-700 mb-6 lfnm-text" data-key="Mensagem">Bom ano letivo a todos os estudantes!</p><div class="flex gap-4 justify-center text-5xl"><span>✏️</span><span>📖</span><span>🎒</span></div></div>`,
            settings: { widgetId: 'celebration_volta_aulas', width: 'full' }
        }
    }
];
