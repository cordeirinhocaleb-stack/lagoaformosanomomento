
import { PlacementDef } from './placementTypes';

export const PLACEMENTS_REGISTRY: PlacementDef[] = [
    // --- ATIVOS ---
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
        id: 'interstitial',
        label: 'Intersticial (Popup)',
        description: 'Anúncio de tela cheia (alto impacto).',
        module: 'general',
        status: 'active',
        icon: 'fa-expand'
    }
];
