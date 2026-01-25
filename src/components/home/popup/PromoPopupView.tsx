import React, { useMemo } from 'react';
import { PromoPopupConfig } from '../../../types';

// Hooks
import { usePopupStyles } from './hooks/usePopupStyles';
import { usePopupSize } from './hooks/usePopupSize';
import { usePopupTheme } from './hooks/usePopupTheme';
import { usePopupMedia } from './hooks/usePopupMedia';

// Components
import PopupContainer from './components/PopupContainer';

// Layouts
import BannerTopLayout from './layouts/BannerTopLayout';
import MonolithLayout from './layouts/MonolithLayout';
import AsymmetricLayout from './layouts/AsymmetricLayout';
import FragmentedLayout from './layouts/FragmentedLayout';
import CoverLayout from './layouts/CoverLayout';
import FeatureListLayout from './layouts/FeatureListLayout';
import CountdownLayout from './layouts/CountdownLayout';
import DefaultLayout from './layouts/DefaultLayout';

interface PromoPopupViewProps {
    config: PromoPopupConfig;
    mode: 'live' | 'preview';
    onClose?: () => void;
    onAction?: () => void;
}

const PromoPopupView: React.FC<PromoPopupViewProps> = ({ config, mode, onClose, onAction }) => {
    // Theme and media setup
    const { theme, mediaTheme, overlayPresetClass, videoFrame, mediaFilterClass } = usePopupTheme(
        config.theme || 'classic_default',
        config.mediaThemeId,
        config.overlayPreset,
        config.videoFramePreset,
        config.mediaFilter,
        config.mediaFilterVariant
    );

    // Config defaults
    const shape = config.shape || 'default';
    const size = config.size || 'md';
    const position = config.position || 'center';
    const overlay = config.overlay || 'dark';
    const animation = config.animation || 'zoom';
    const isSplit = theme.layout === 'split';

    // Styles
    const {
        wrapperClasses,
        positionClasses,
        overlayClasses,
        animationClass,
        containerShapeClasses,
        mediaShapeClasses,
        wrapperPointerEvents
    } = usePopupStyles({ mode, position, overlay, animation, shape, size, isSplit });

    // Size
    const { containerSizeClasses } = usePopupSize(size, mode, isSplit);

    // Media
    const { renderMedia } = usePopupMedia({
        config,
        mode,
        mediaTheme,
        overlayPresetClass,
        videoFrame,
        mediaFilterClass
    });

    // Font styles
    const fontStyle = useMemo(() => ({ fontFamily: config.fontFamily || 'Inter, sans-serif' }), [config.fontFamily]);

    const fontSizeClass = useMemo(() => {
        const sizeMap = { xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl', '2xl': 'text-3xl' };
        return sizeMap[config.fontSize || 'md'];
    }, [config.fontSize]);

    // Layout-specific props
    const layoutProps = {
        config,
        theme,
        size,
        shape,
        animationClass,
        fontStyle,
        fontSizeClass,
        wrapperClasses,
        overlayClasses,
        wrapperPointerEvents,
        overlay,
        containerSizeClasses,
        containerShapeClasses,
        mediaShapeClasses,
        isSplit,
        renderMedia,
        onAction,
        onClose
    };

    // Render specific layout
    if (theme.layout === 'banner_top') {
        return <BannerTopLayout {...layoutProps} />;
    }

    if (theme.layout === 'monolith') {
        return <MonolithLayout {...layoutProps} />;
    }

    if (theme.layout === 'asymmetric') {
        return <AsymmetricLayout {...layoutProps} />;
    }

    if (theme.layout === 'fragmented') {
        return <FragmentedLayout {...layoutProps} />;
    }

    if (theme.layout === 'cover') {
        return <CoverLayout {...layoutProps} />;
    }

    if (theme.layout === 'feature_list') {
        return <FeatureListLayout {...layoutProps} />;
    }

    if (theme.layout === 'countdown') {
        return <CountdownLayout {...layoutProps} />;
    }

    // Default layout
    return (
        <PopupContainer
            mode={mode}
            wrapperClasses={wrapperClasses}
            positionClasses={positionClasses}
            overlayClasses={overlayClasses}
            wrapperPointerEvents={wrapperPointerEvents}
            overlay={overlay}
            onClose={onClose}
        >
            <DefaultLayout {...layoutProps} />
        </PopupContainer>
    );
};

export default PromoPopupView;
