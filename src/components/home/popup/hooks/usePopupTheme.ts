import { useMemo } from 'react';
import { getThemeById } from '../popupThemes';
import { getMediaThemeById } from '../mediaThemes';
import { getOverlayPresetClass } from '../overlayPresets';
import { getVideoFrameById } from '../videoFrames';
import { getMediaFilterCss } from '../mediaFilters';

export const usePopupTheme = (
    themeId: string,
    mediaThemeId?: string,
    overlayPreset?: string,
    videoFramePreset?: string,
    mediaFilter?: string,
    mediaFilterVariant?: string
) => {
    const theme = useMemo(() => getThemeById(themeId || 'classic_default'), [themeId]);
    const mediaTheme = useMemo(() => getMediaThemeById(mediaThemeId), [mediaThemeId]);
    const overlayPresetClass = useMemo(() => getOverlayPresetClass(overlayPreset), [overlayPreset]);
    const videoFrame = useMemo(() => getVideoFrameById(videoFramePreset), [videoFramePreset]);
    const mediaFilterClass = useMemo(
        () => getMediaFilterCss(mediaFilter, mediaFilterVariant),
        [mediaFilter, mediaFilterVariant]
    );

    return {
        theme,
        mediaTheme,
        overlayPresetClass,
        videoFrame,
        mediaFilterClass
    };
};
