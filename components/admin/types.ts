// Admin-specific type definitions for the admin panel

export type BannerLayout = 'single' | 'split' | 'mosaic' | 'grid' | 'slider';
export type BannerTransition = 'fade' | 'slide' | 'zoom' | 'none';

export interface BannerVideoConfig {
    muted: boolean;
    loop: boolean;
    autoplay: boolean;
    effects: {
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
        sepia: number;
        opacity: number;
    };
}

export interface MobileToolButtonProps {
    icon: string;
    label: string;
    action: string;
    val?: string;
    activeColor?: string;
    tooltip?: string;
}

// Additional admin types can be added here as needed.
