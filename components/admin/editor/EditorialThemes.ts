import { EditorialStyle } from './blocks/textblock/types';

export interface ThemePreset {
    id: EditorialStyle;
    label: string;
    icon: string;
    color: string;
}

const ALL_PRESETS: ThemePreset[] = [
    { id: 'newspaper_standard', label: 'Padrão Jornal', icon: 'fa-align-left', color: 'bg-zinc-800' },
    { id: 'breaking_alert', label: 'Breaking News', icon: 'fa-bolt', color: 'bg-red-600' },
    { id: 'impact_quote', label: 'Citação Impacto', icon: 'fa-quote-left', color: 'bg-zinc-400' },
    { id: 'hero_headline', label: 'Manchete Hero', icon: 'fa-heading', color: 'bg-zinc-900' },
    { id: 'police_siren', label: 'Alerta Policial', icon: 'fa-shield-halved', color: 'bg-yellow-500' },
    { id: 'tech_neon', label: 'Destaque Tech', icon: 'fa-terminal', color: 'bg-emerald-500' },
    { id: 'executive_summary', label: 'Resumo Exec.', icon: 'fa-list-check', color: 'bg-blue-600' },
    { id: 'vintage_letter', label: 'Carta Leitor', icon: 'fa-envelope-open-text', color: 'bg-orange-300' },
    { id: 'footnote', label: 'Rodapé/Nota', icon: 'fa-comment-dots', color: 'bg-zinc-300' },
    { id: 'checklist_pro', label: 'Lista Check', icon: 'fa-check-double', color: 'bg-green-600' },
    { id: 'quote_modern_accent', label: 'Citação G1', icon: 'fa-quote-left', color: 'bg-red-700' },
    { id: 'quote_elegant_editorial', label: 'Editorial Lux', icon: 'fa-feather-pointed', color: 'bg-zinc-800' },
    { id: 'quote_breaking_card', label: 'Card Breaking', icon: 'fa-bolt-lightning', color: 'bg-amber-600' },

    // LIST TEMAS
    { id: 'list_bullets_classic', label: 'Bullets Clássico', icon: 'fa-list-ul', color: 'bg-zinc-600' },
    { id: 'list_check_circle', label: 'Check Circle', icon: 'fa-check-circle', color: 'bg-green-600' },
    { id: 'list_numbered_modern', label: 'Numerado Modern', icon: 'fa-list-ol', color: 'bg-blue-600' },
    { id: 'list_timeline_vertical', label: 'Timeline Vertical', icon: 'fa-timeline', color: 'bg-purple-600' },
    { id: 'list_cards_shadow', label: 'Cards Box', icon: 'fa-layer-group', color: 'bg-orange-500' },
];

export const getThemesForBlock = (blockType: string): ThemePreset[] => {
    return ALL_PRESETS.filter(p => {
        if (blockType === 'quote') {
            return ['quote_modern_accent', 'quote_elegant_editorial', 'quote_breaking_card', 'impact_quote', 'vintage_letter'].includes(p.id);
        }
        if (blockType === 'heading') {
            return ['hero_headline', 'breaking_alert', 'police_siren', 'tech_neon'].includes(p.id);
        }
        if (blockType === 'list') {
            return ['checklist_pro', 'list_bullets_classic', 'list_check_circle', 'list_numbered_modern', 'list_timeline_vertical', 'list_cards_shadow'].includes(p.id);
        }
        // Paragraph/Default
        return ['newspaper_standard', 'executive_summary', 'footnote'].includes(p.id);
    });
};
