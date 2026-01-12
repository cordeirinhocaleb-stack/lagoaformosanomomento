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
];

export const getThemesForBlock = (blockType: string): ThemePreset[] => {
    return ALL_PRESETS.filter(p => {
        if (blockType === 'quote') {
            return ['impact_quote', 'pull_quote', 'quote_modern_accent'].includes(p.id);
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
        // Paragraph/Default
        return ['standard_clean', 'editorial_prose', 'breaking_brief'].includes(p.id);
    });
};
