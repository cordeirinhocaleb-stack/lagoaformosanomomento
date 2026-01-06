
export type PlacementStatus = 'active' | 'coming_soon' | 'deprecated';
export type PlacementModule = 'home' | 'article' | 'jobs' | 'gigs' | 'classifieds' | 'podcast' | 'community' | 'general';

export interface PlacementDef {
    id: string;
    label: string;
    description: string;
    module: PlacementModule;
    status: PlacementStatus;
    icon: string;
}
