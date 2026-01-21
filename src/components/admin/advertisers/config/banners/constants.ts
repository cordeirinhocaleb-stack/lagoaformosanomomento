
import { PromoBanner } from '@/types';

export const DEFAULT_BANNER: PromoBanner = {
    id: '',
    type: 'image',
    image: '', 
    images: [],
    layout: 'classic',
    align: 'left',
    overlayOpacity: 50,
    textPositionPreset: 'gradient_bottom_left',
    tag: 'Nova Tag',
    title: 'TÍTULO DO <font color="#dc2626">BANNER</font>',
    description: 'Descrição curta da chamada para ação.',
    buttonText: 'Saiba Mais',
    link: '#',
    active: true,
    buttonConfig: {
        label: 'Saiba Mais',
        link: '#',
        style: 'solid',
        size: 'md',
        rounded: 'md',
        effect: 'none'
    },
    textConfig: {
        titleSize: 'xl',
        titleShadow: 'soft',
        descriptionVisible: true,
        fontFamily: 'Inter',
        customColor: '#ffffff'
    }
};

export const THEMES = [
    { id: 'gradient_bottom_left', label: 'Notícia Padrão', icon: 'fa-newspaper', desc: 'Gradiente preto na base, texto à esquerda.' },
    { id: 'glass_center', label: 'Cinema Promo', icon: 'fa-film', desc: 'Caixa de vidro centralizada. Ideal para vídeos.' },
    { id: 'solid_right_bar', label: 'Coluna Editorial', icon: 'fa-columns', desc: 'Barra sólida lateral. Estilo revista.' },
    { id: 'floating_box_top_left', label: 'Card Flutuante', icon: 'fa-address-card', desc: 'Box branco no topo. Estilo minimalista.' },
    { id: 'hero_centered_clean', label: 'Impacto Central', icon: 'fa-star', desc: 'Texto gigante centralizado sem fundo. Máximo foco.' },
    { id: 'floating_bottom_right', label: 'Card Inferior Dir.', icon: 'fa-arrow-pointer', desc: 'Box flutuante elegante no canto inferior direito.' },
    { id: 'newspaper_clipping', label: 'Recorte Jornal', icon: 'fa-paperclip', desc: 'Estilo papel físico pregado no banner. Retrô.' },
    { id: 'vertical_sidebar_left', label: 'Faixa Vertical', icon: 'fa-grip-lines-vertical', desc: 'Ocupa a lateral esquerda com cor sólida.' },
    { id: 'full_overlay_impact', label: 'Overlay Colorido', icon: 'fa-palette', desc: 'Cobre todo o banner com uma cor transparente.' },
    { id: 'tv_news_bottom_bar', label: 'Breaking News TV', icon: 'fa-broadcast-tower', desc: 'Estilo barra de urgência de telejornal na base.' },
];
