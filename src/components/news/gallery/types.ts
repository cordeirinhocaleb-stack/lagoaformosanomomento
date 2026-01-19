import { GalleryItem, ContentBlock } from '@/types';

export interface LayoutProps {
    items: GalleryItem[];
    block: ContentBlock;
    openLightbox: (idx: number) => void;
    activeIndex?: number;
    setActiveIndex?: React.Dispatch<React.SetStateAction<number>>;
    comparisonValue?: number;
    setComparisonValue?: React.Dispatch<React.SetStateAction<number>>;
    getAspectRatioClass?: () => string;
    getObjectFitClass?: () => string;
    getGridColumnsClass?: () => string;
    uniformSize?: boolean;
}
