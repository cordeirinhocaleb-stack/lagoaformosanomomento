import { EditorialStyle } from './blocks/textblock/types';

export interface ThemePreset {
    id: EditorialStyle;
    label: string;
    icon: string;
    color: string;
}

const ALL_PRESETS: ThemePreset[] = [
    // PARAGRAPH / TEXTO
    { id: 'standard_clean', label: 'Padrão', icon: 'fa-align-left', color: 'bg-zinc-800' },
    { id: 'editorial_prose', label: 'Análise', icon: 'fa-feather-pointed', color: 'bg-zinc-600' },
    { id: 'breaking_brief', label: 'Urgente', icon: 'fa-bolt-lightning', color: 'bg-red-700' },

    // CORES GLOBAIS (Para Engajamento e Smart Blocks)
    { id: 'default_blue', label: 'Azul LFNM', icon: 'fa-palette', color: 'bg-blue-500' },
    { id: 'urgent_red', label: 'Vermelho Alerta', icon: 'fa-circle-exclamation', color: 'bg-red-500' },
    { id: 'nature_green', label: 'Verde Natureza', icon: 'fa-leaf', color: 'bg-green-500' },
    { id: 'royal_purple', label: 'Roxo Real', icon: 'fa-crown', color: 'bg-purple-500' },
    { id: 'dark_mode', label: 'Tema Escuro', icon: 'fa-moon', color: 'bg-zinc-900' },

    // HEADING / TÍTULOS
    { id: 'hero_headline', label: 'Manchete', icon: 'fa-heading', color: 'bg-zinc-900' },
    { id: 'sub_classic', label: 'Subtítulo', icon: 'fa-paragraph', color: 'bg-zinc-500' },
    { id: 'live_update', label: 'Ao Vivo', icon: 'fa-satellite-dish', color: 'bg-red-600' },

    // QUOTE / CITAÇÕES
    { id: 'impact_quote', label: 'Destaque', icon: 'fa-quote-left', color: 'bg-zinc-700' },
    { id: 'pull_quote', label: 'Gancho', icon: 'fa-quote-right', color: 'bg-red-500' },
    { id: 'quote_modern_accent', label: 'Moderno', icon: 'fa-minus', color: 'bg-zinc-400' },

    // LIST / LISTAS
    { id: 'bullets_clean', label: 'Lista', icon: 'fa-list-ul', color: 'bg-zinc-600' },
    { id: 'checklist_flow', label: 'Checklist', icon: 'fa-list-check', color: 'bg-green-600' },
    { id: 'numbered_steps', label: 'Passos', icon: 'fa-list-ol', color: 'bg-blue-600' },

    // SEPARATOR / DIVISORES
    { id: 'divider_minimal', label: 'Linha', icon: 'fa-minus', color: 'bg-zinc-400' },
    { id: 'divider_ornamental', label: 'Ornado', icon: 'fa-diamond', color: 'bg-red-500' },
    { id: 'divider_dots', label: 'Espaço', icon: 'fa-ellipsis-h', color: 'bg-blue-400' },

    // POLL / ENQUETE (IMPLEMENTADO ✅)
    { id: 'poll_classic', label: 'Clássica', icon: 'fa-chart-bar', color: 'bg-orange-600' },
    { id: 'poll_modern', label: 'Moderna', icon: 'fa-poll-h', color: 'bg-orange-500' },
    { id: 'poll_minimal', label: 'Minimalista', icon: 'fa-square-check', color: 'bg-orange-400' },

    // REACTION / REAÇÕES (IMPLEMENTADO ✅)
    { id: 'reaction_emoji', label: 'Emojis', icon: 'fa-face-grin-hearts', color: 'bg-yellow-600' },
    { id: 'reaction_hearts', label: 'Corações', icon: 'fa-heart', color: 'bg-yellow-500' },
    { id: 'reaction_stars', label: 'Estrelas', icon: 'fa-star', color: 'bg-yellow-400' },

    // COUNTER / APOIO (IMPLEMENTADO ✅)
    { id: 'counter_button', label: 'Botão', icon: 'fa-hand-pointer', color: 'bg-pink-600' },
    { id: 'counter_badge', label: 'Badge', icon: 'fa-award', color: 'bg-pink-500' },
    { id: 'counter_heart', label: 'Coração', icon: 'fa-heart-pulse', color: 'bg-pink-400' },

    // QUIZ / SLIDER (IMPLEMENTADO ✅)
    { id: 'quiz_educativo', label: 'Educativo', icon: 'fa-graduation-cap', color: 'bg-indigo-600' },
    { id: 'quiz_rapido', label: 'Rápido', icon: 'fa-bolt', color: 'bg-indigo-500' },
    { id: 'quiz_divertido', label: 'Divertido', icon: 'fa-face-laugh', color: 'bg-indigo-400' },
];

export const getThemesForBlock = (blockType: string, engagementType?: string): ThemePreset[] => {
    return ALL_PRESETS.filter(p => {
        if (blockType === 'quote') {
            return ['impact_quote', 'pull_quote', 'quote_modern_accent'].includes(p.id);
        }
        if (blockType === 'smart_block') {
            return ['default_blue', 'urgent_red', 'nature_green', 'royal_purple', 'dark_mode'].includes(p.id);
        }
        if (blockType === 'heading') {
            return ['hero_headline', 'sub_classic', 'live_update'].includes(p.id);
        }
        if (blockType === 'list') {
            return ['bullets_clean', 'checklist_flow', 'numbered_steps'].includes(p.id);
        }
        if (blockType === 'separator') {
            return ['divider_minimal', 'divider_ornamental', 'divider_dots'].includes(p.id);
        }

        // Blocos de engagement (COBERTURA TOTAL)
        if (blockType === 'engagement' && engagementType) {
            if (engagementType === 'poll' || engagementType === 'comparison' || engagementType === 'ranking') {
                return ['poll_classic', 'poll_modern', 'poll_minimal'].includes(p.id);
            }
            if (engagementType === 'reaction') {
                return ['reaction_emoji', 'reaction_hearts', 'reaction_stars'].includes(p.id);
            }
            if (engagementType === 'counter') {
                return ['counter_button', 'counter_badge', 'counter_heart'].includes(p.id);
            }
            // Tipos educativos / complexos
            if (['quiz', 'slider', 'thermometer', 'countdown', 'timeline', 'flipcard', 'accordion', 'cta', 'testimonial'].includes(engagementType)) {
                return ['quiz_educativo', 'quiz_rapido', 'quiz_divertido', 'default_blue', 'urgent_red', 'nature_green', 'royal_purple', 'dark_mode'].includes(p.id);
            }

            // Fallback para qualquer outro tipo de engajamento: mostra os de poll + os globais
            return ['poll_classic', 'poll_modern', 'poll_minimal', 'default_blue', 'urgent_red', 'nature_green', 'royal_purple', 'dark_mode'].includes(p.id);
        }

        // Paragraph/Default
        return ['standard_clean', 'editorial_prose', 'breaking_brief'].includes(p.id);
    });
};
