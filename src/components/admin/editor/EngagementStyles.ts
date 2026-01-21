
export interface EngagementStyle {
    id: string;
    label: string;
    icon: string;
    previewClass?: string;
    description?: string;
}

export const ENGAGEMENT_TYPE_STYLES: Record<string, EngagementStyle[]> = {
    poll: [
        { id: 'bars', label: 'Barras', icon: 'fa-chart-bar', description: 'Barras de progresso verticais clássicas' },
        { id: 'circles', label: 'Circular', icon: 'fa-chart-pie', description: 'Layout horizontal com progresso circular' },
        { id: 'cards', label: 'Cards', icon: 'fa-border-all', description: 'Opções em cards com imagens de fundo' }
    ],
    quiz: [
        { id: 'school', label: 'Escola', icon: 'fa-graduation-cap', description: 'Visual acadêmico e divertido' },
        { id: 'gameshow', label: 'TV Show', icon: 'fa-trophy', description: 'Estilo vibrante de programa de auditório' },
        { id: 'minimal', label: 'Minimal', icon: 'fa-check', description: 'Foco total no conteúdo, sem distrações' }
    ],
    countdown: [
        { id: 'digital', label: 'Digital', icon: 'fa-clock', description: 'Fonte digital estilo LED/LCD' },
        { id: 'flip', label: 'Flip', icon: 'fa-calendar', description: 'Cartões que giram (flip-clock)' },
        { id: 'minimal', label: 'Simples', icon: 'fa-minus', description: 'Texto puro e elegante' }
    ],
    ranking: [
        { id: 'list', label: 'Lista', icon: 'fa-list-ol', description: 'Lista ordenada clássica' },
        { id: 'podium', label: 'Pódio', icon: 'fa-trophy', description: 'Top 3 em destaque visual' },
        { id: 'cards', label: 'Cards', icon: 'fa-th-large', description: 'Grid de itens ranqueados' }
    ],
    image_poll: [
        { id: 'grid', label: 'Grid', icon: 'fa-th', description: 'Grid uniforme de imagens' },
        { id: 'carousel', label: 'Carrossel', icon: 'fa-images', description: 'Deslize lateral para votar' },
        { id: 'versus', label: 'Versus', icon: 'fa-right-left', description: 'Comparação 1x1 lado a lado' }
    ]
};

// Fallback for types not specifically defined yet
export const DEFAULT_ENGAGEMENT_STYLES: EngagementStyle[] = [
    { id: 'default', label: 'Padrão', icon: 'fa-square' },
    { id: 'modern', label: 'Moderno', icon: 'fa-rocket' },
    { id: 'retro', label: 'Retrô', icon: 'fa-gamepad' },
    { id: 'neon', label: 'Neon', icon: 'fa-bolt' }
];

export const getEngagementStyles = (type: string): EngagementStyle[] => {
    return ENGAGEMENT_TYPE_STYLES[type] || DEFAULT_ENGAGEMENT_STYLES;
};
