
import { PlacementDef } from './placementTypes';

export const PLACEMENTS_REGISTRY: PlacementDef[] = [
    // --- ATIVOS (Legado e Atuais) ---
    { 
        id: 'master_carousel', 
        label: 'Carrossel Master (Topo)', 
        description: 'Banner rotativo principal na Home e topo de Notícias.', 
        module: 'home', 
        status: 'active', 
        icon: 'fa-images' 
    },
    { 
        id: 'sidebar', 
        label: 'Sidebar Lateral', 
        description: 'Coluna lateral fixa em telas Desktop.', 
        module: 'general', 
        status: 'active', 
        icon: 'fa-columns' 
    },
    { 
        id: 'standard_list', 
        label: 'Lista Padrão (Rodapé)', 
        description: 'Carrossel de parceiros no final das páginas.', 
        module: 'general', 
        status: 'active', 
        icon: 'fa-list' 
    },
    { 
        id: 'live_tab', 
        label: 'Aba Ao Vivo', 
        description: 'Destaque exclusivo durante transmissões.', 
        module: 'home', 
        status: 'active', 
        icon: 'fa-video' 
    },
    { 
        id: 'interstitial', 
        label: 'Intersticial (Popup)', 
        description: 'Anúncio de tela cheia (alto impacto).', 
        module: 'general', 
        status: 'active', 
        icon: 'fa-expand' 
    },

    // --- NOTÍCIAS (Futuro) ---
    { 
        id: 'article_left_rail_supporters', 
        label: 'Apoiadores (Artigo)', 
        description: 'Lista vertical ao lado do texto da notícia.', 
        module: 'article', 
        status: 'coming_soon', 
        icon: 'fa-newspaper' 
    },
    { 
        id: 'article_footer_supporters', 
        label: 'Rodapé (Artigo)', 
        description: 'Grid de marcas ao final da leitura.', 
        module: 'article', 
        status: 'coming_soon', 
        icon: 'fa-arrow-down' 
    },

    // --- MÓDULOS ESPECÍFICOS (Futuro) ---
    { 
        id: 'jobs_home_featured', 
        label: 'Destaque Vagas', 
        description: 'Topo da seção de empregos.', 
        module: 'jobs', 
        status: 'coming_soon', 
        icon: 'fa-briefcase' 
    },
    { 
        id: 'gigs_home_featured', 
        label: 'Destaque Bicos', 
        description: 'Topo da seção de bicos/freelance.', 
        module: 'gigs', 
        status: 'coming_soon', 
        icon: 'fa-hammer' 
    },
    { 
        id: 'classifieds_home_grid', 
        label: 'Classificados Grid', 
        description: 'Vitrine de produtos em destaque.', 
        module: 'classifieds', 
        status: 'coming_soon', 
        icon: 'fa-store' 
    },
    { 
        id: 'podcast_sponsor_slot', 
        label: 'Patrocínio Podcast', 
        description: 'Banner ou menção na área de áudio.', 
        module: 'podcast', 
        status: 'coming_soon', 
        icon: 'fa-podcast' 
    },
    { 
        id: 'groups_promo_slot', 
        label: 'Promoção Grupos', 
        description: 'Destaque na lista de grupos WhatsApp.', 
        module: 'community', 
        status: 'coming_soon', 
        icon: 'fa-users' 
    },
];
