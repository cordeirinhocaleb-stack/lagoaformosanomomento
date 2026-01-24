
export interface EngagementStyle {
    id: string;
    label: string;
    icon: string;
    previewClass?: string;
    description?: string;
}

export const ENGAGEMENT_TYPE_STYLES: Record<string, EngagementStyle[]> = {
    poll: [
        { id: 'police_tactical', label: 'Operação Tática', icon: 'fa-user-secret', description: 'Tema policial com identidade visual de investigação e operações.' },
        { id: 'fire_brigade', label: 'Brigada 193', icon: 'fa-fire-extinguisher', description: 'Visual de urgência e resgate com tons de alerta.' },
        { id: 'cyber_dystopia', label: 'Futuro Distópico', icon: 'fa-robot', description: 'Estilo cyberpunk/hacker para notícias de tecnologia.' },
        { id: 'election', label: 'Cédula Eleitoral', icon: 'fa-check-to-slot', description: 'Layout sóbrio para pesquisas de opinião' },
        { id: 'street_pulse', label: 'Pulso das Ruas', icon: 'fa-users', description: 'Visual dinâmico com cores vibrantes' },
        { id: 'police_investigation', label: 'Inquérito Antigo', icon: 'fa-magnifying-glass-chart', description: 'Estilo analítico e técnico (Legacy)' }
    ],
    quiz: [
        { id: 'fact_check', label: 'Fact-Check', icon: 'fa-shield-check', description: 'Verificação rápida de veracidade' },
        { id: 'knowledge_test', label: 'Conhecimento', icon: 'fa-book-open-reader', description: 'Teste de conhecimentos gerais' },
        { id: 'interactive_interview', label: 'Entrevista', icon: 'fa-comments', description: 'Fluxo de perguntas e respostas' }
    ],
    countdown: [
        { id: 'breaking_news', label: 'Plantão Urgente', icon: 'fa-bolt', description: 'O tempo voa! Alerta máximo com visual de "Breaking News".' },
        { id: 'election_day', label: 'Urnas Abertas', icon: 'fa-landmark', description: 'Contagem oficial estilo Tribunal Eleitoral.' },
        { id: 'event_premiere', label: 'Grande Estreia', icon: 'fa-calendar-star', description: 'Visual de tapete vermelho para lançamentos.' }
    ],
    ranking: [
        { id: 'power_list', label: 'Lista de Poder', icon: 'fa-crown', description: 'Ranking estilo revista de negócios (Forbes/Time).' },
        { id: 'sports_podium', label: 'Pódio Esportivo', icon: 'fa-trophy', description: 'Classificação vibrante estilo canal de esportes.' },
        { id: 'market_index', label: 'Índice de Mercado', icon: 'fa-arrow-trend-up', description: 'Top trends com visual financeiro clean.' }
    ],
    image_poll: [
        { id: 'versus_battle', label: 'Batalha VS', icon: 'fa-crosshairs', description: 'Duelo visual direto com separador diagonal agressivo.' },
        { id: 'gallery_award', label: 'Prêmio de Fotografia', icon: 'fa-camera-retro', description: 'Fundo escuro, foco total na arte.' },
        { id: 'before_after_tech', label: 'Antes e Depois', icon: 'fa-sliders', description: 'Comparativo técnico estilo arquitetura.' }
    ],
    // Alias for 'comparison' used in EditorSidebar
    comparison: [
        { id: 'versus_battle', label: 'Batalha VS', icon: 'fa-crosshairs', description: 'Duelo visual direto.' },
        { id: 'gallery_award', label: 'Prêmio de Fotografia', icon: 'fa-camera-retro', description: 'Foco na arte.' },
        { id: 'before_after_tech', label: 'Antes e Depois', icon: 'fa-sliders', description: 'Comparativo técnico.' }
    ],
    reaction: [
        { id: 'comic_boom', label: 'Comic Boom 💥', icon: 'fa-masks-theater', description: 'Estilo HQ/Pop Art vibrante.' },
        { id: 'pixel_pet', label: 'Pixel Pet 👾', icon: 'fa-gamepad', description: 'Estilo 8-bit Tamagotchi.' },
        { id: 'glass_emojis', label: 'Glass Emojis 💎', icon: 'fa-gem', description: 'Estilo iOS Premium 3D.' }
    ],
    counter: [
        { id: 'life_bar', label: 'Barra de Vida ❤️', icon: 'fa-heart-pulse', description: 'Estilo RPG/Gamer de saúde.' },
        { id: 'crowd_power', label: 'Poder da Multidão 🙌', icon: 'fa-hands-clapping', description: 'Silhuetas de show/protesto.' },
        { id: 'gold_coin', label: 'Moeda Dourada 🪙', icon: 'fa-coins', description: 'Estilo Mario/Sonic.' }
    ],
    timeline: [
        { id: 'metro_line', label: 'Linha de Metrô 🚇', icon: 'fa-train-subway', description: 'Mapa de estações colorido.' },
        { id: 'film_roll', label: 'Rolo de Filme 🎞️', icon: 'fa-film', description: 'Estilo cinema antigo.' },
        { id: 'whatsapp_chat', label: 'Chat Zap 💬', icon: 'fa-comments', description: 'Estilo conversa de mensageiro.' }
    ],
    flipcard: [
        { id: 'vinyl_cover', label: 'Capa de Vinil 🎵', icon: 'fa-record-vinyl', description: 'Disco saindo da capa.' },
        { id: 'top_secret', label: 'Top Secret ✉️', icon: 'fa-file-shield', description: 'Envelope confidencial.' },
        { id: 'tarot_card', label: 'Carta de Tarot 🔮', icon: 'fa-hat-wizard', description: 'Místico e mágico.' }
    ],
    accordion: [
        { id: 'file_cabinet', label: 'Arquivo de Aço 🗄️', icon: 'fa-box-archive', description: 'Gavetas de escritório.' },
        { id: 'code_terminal', label: 'Terminal Code 👨‍💻', icon: 'fa-terminal', description: 'Editor de código Matrix.' },
        { id: 'pizza_box', label: 'Caixa de Pizza 🍕', icon: 'fa-pizza-slice', description: 'Abas de papelão empilhadas.' }
    ],
    cta: [
        { id: 'launch_button', label: 'Lançar Foguete 🚀', icon: 'fa-rocket', description: 'Botão vermelho físico gigante.' },
        { id: 'golden_ticket', label: 'Bilhete Dourado 🎫', icon: 'fa-ticket', description: 'Convite premium metálico.' },
        { id: 'neon_sign', label: 'Luz Neon 🏩', icon: 'fa-lightbulb', description: 'Letreiro piscante na parede.' }
    ]
};

// Fallback for types not specifically defined yet
export const DEFAULT_ENGAGEMENT_STYLES: EngagementStyle[] = [
    { id: 'news_standard', label: 'Jornalístico', icon: 'fa-newspaper' },
    { id: 'news_impact', label: 'Impacto', icon: 'fa-burst' },
    { id: 'news_tech', label: 'Digital', icon: 'fa-microchip' },
    { id: 'news_classic', label: 'Clássico', icon: 'fa-font' }
];

export const getEngagementStyles = (type: string): EngagementStyle[] => {
    return ENGAGEMENT_TYPE_STYLES[type] || DEFAULT_ENGAGEMENT_STYLES;
};
