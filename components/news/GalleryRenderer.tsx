
import React, { useState } from 'react';
import { ContentBlock, GalleryItem } from '../../types';
import GalleryLightbox from './gallery/GalleryLightbox';
import * as Layouts from './gallery/GalleryLayouts';

interface GalleryRendererProps {
    block: ContentBlock;
    isEditor?: boolean;
}

const GalleryRenderer: React.FC<GalleryRendererProps> = ({ block, isEditor = false }) => {
    // Normalize items
    const rawItems = block.content?.images || (block.settings && Array.isArray(block.settings.images) ? block.settings.images : null) || block.content?.items || [];
    const items: GalleryItem[] = Array.isArray(rawItems) ? rawItems.map((item: unknown, idx: number) => {
        if (typeof item === 'string') {
            return {
                id: `gallery-item-${idx}`,
                url: item,
                caption: '',
                alt: ''
            };
        }
        return item as GalleryItem;
    }) : [];

    const style: string = block.settings.galleryStyle || block.settings.style || 'grid';
    const [activeIndex, setActiveIndex] = useState(0);
    const [comparisonValue, setComparisonValue] = useState(50);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const uniformSize = block.settings?.uniformSize || false;
    const aspectRatioSetting = block.settings?.aspectRatio || 'auto';
    const objectFitSetting = block.settings?.objectFit || 'cover';

    const getAspectRatioClass = () => {
        if (!uniformSize || aspectRatioSetting === 'auto') { return ''; }
        switch (aspectRatioSetting) {
            case 'square': return 'aspect-square';
            case 'video': return 'aspect-video';
            case 'portrait': return 'aspect-[3/4]';
            default: return '';
        }
    };

    const getObjectFitClass = () => {
        return objectFitSetting === 'contain' ? 'object-contain' : 'object-cover';
    };

    const columns = block.settings?.columns || 3;
    const getGridColumnsClass = () => {
        switch (columns) {
            case 2: return 'md:grid-cols-2';
            case 4: return 'md:grid-cols-2 lg:grid-cols-4';
            case 5: return 'md:grid-cols-3 lg:grid-cols-5';
            default: return 'md:grid-cols-2 lg:grid-cols-3';
        }
    };

    React.useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [lightboxIndex]);

    if (items.length === 0) { return null; }

    const openLightbox = (idx: number) => setLightboxIndex(idx);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
    };
    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
    };

    const layoutProps = {
        items,
        block,
        openLightbox,
        activeIndex,
        setActiveIndex,
        comparisonValue,
        setComparisonValue,
        getAspectRatioClass,
        getObjectFitClass,
        getGridColumnsClass,
        uniformSize
    };

    return (
        <div className={`${isEditor ? '' : 'my-20'} w-full animate-fadeIn relative`}>
            {style === 'spotlight' && <Layouts.SpotlightLayout {...layoutProps} />}
            {(style === 'hero_slider' || style === 'slideshow') && <Layouts.HeroSliderLayout {...layoutProps} />}
            {style === 'news_mosaic' && <Layouts.NewsMosaicLayout {...layoutProps} />}
            {(style === 'filmstrip' || style === 'carousel') && <Layouts.FilmstripLayout {...layoutProps} />}
            {style === 'comparison' && <Layouts.ComparisonLayout {...layoutProps} />}
            {(style === 'masonry' || style === 'grid' || style === 'columns') && <Layouts.MasonryLayout {...layoutProps} />}
            {(style === 'stories_scroll' || style === 'reel') && <Layouts.StoriesScrollLayout {...layoutProps} />}
            {style === 'card_peek' && <Layouts.CardPeekLayout {...layoutProps} />}
            {style === 'polaroid' && <Layouts.PolaroidLayout {...layoutProps} />}

            {block.settings.caption && (
                <p className="text-center text-[11px] font-black text-zinc-400 uppercase mt-12 tracking-[0.4em] flex items-center justify-center gap-4">
                    <span className="w-12 h-px bg-zinc-200"></span>
                    <i className="fas fa-camera text-[8px] text-red-500"></i>
                    {block.settings.caption}
                    <span className="w-12 h-px bg-zinc-200"></span>
                </p>
            )}

            <GalleryLightbox
                isOpen={lightboxIndex !== null}
                items={items}
                index={lightboxIndex || 0}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrev={prevImage}
            />
        </div>
    );
};

export default GalleryRenderer;
