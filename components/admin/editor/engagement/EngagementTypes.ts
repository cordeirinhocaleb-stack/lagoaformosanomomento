
import { ColorTheme } from '../EngagementColors';

// Tipos de Engajamento
export type EngagementType =
    | 'poll' | 'quiz' | 'slider' | 'comparison'
    | 'reaction' | 'counter' | 'thermometer' | 'ranking'
    | 'countdown' | 'timeline' | 'flipcard' | 'accordion' | 'cta' | 'testimonial';

// Estilos Visuais
export type EngagementStyle = 'default' | 'modern' | 'retro' | 'neon' | 'bars' | 'circles' | 'cards' | 'school' | 'gameshow' | 'minimal' | 'digital' | 'flip' | 'list' | 'podium' | 'grid' | 'carousel' | 'versus';

export const ENGAGEMENT_TYPES: { id: EngagementType; label: string; icon: string; description: string }[] = [
    { id: 'poll', label: 'Enquete', icon: 'fa-poll', description: 'Votação simples com barras de progresso.' },
    { id: 'quiz', label: 'Quiz', icon: 'fa-question-circle', description: 'Pergunta com resposta correta e feedback.' },
    { id: 'slider', label: 'Termômetro', icon: 'fa-sliders-h', description: 'Usuário desliza para dar nota de 0 a 100.' },
    { id: 'comparison', label: 'Comparação', icon: 'fa-balance-scale', description: 'Escolha entre duas opções com imagens.' },
    { id: 'reaction', label: 'Reações', icon: 'fa-smile', description: 'Barra de emojis para reagir ao conteúdo.' },
    { id: 'counter', label: 'Apoio', icon: 'fa-hand-holding-heart', description: 'Contador de cliques.' },
    { id: 'thermometer', label: 'Medidor', icon: 'fa-temperature-high', description: 'Barra vertical para medir intensidade.' },
    { id: 'ranking', label: 'Ranking', icon: 'fa-list-ol', description: 'Lista onde o usuário ordena itens.' },
    { id: 'countdown', label: 'Cronômetro', icon: 'fa-stopwatch', description: 'Contagem regressiva para um evento.' },
    { id: 'timeline', label: 'Linha do Tempo', icon: 'fa-stream', description: 'Sequência cronológica de eventos.' },
    { id: 'flipcard', label: 'Flip Card', icon: 'fa-exchange-alt', description: 'Cartão que gira ao clicar (Frente/Verso).' },
    { id: 'accordion', label: 'Acordeão', icon: 'fa-chevron-down', description: 'Conteúdo expansível para FAQs.' },
    { id: 'cta', label: 'Chamada (CTA)', icon: 'fa-bullhorn', description: 'Botão de ação destacado com link.' },
    { id: 'testimonial', label: 'Depoimento', icon: 'fa-quote-right', description: 'Citação com foto e nome.' },
];

export interface SubEditorProps {
    settings: Record<string, any>;
    style?: string;
    theme?: ColorTheme;
    onChange: (s: Record<string, any>) => void;
}
