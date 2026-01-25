import React, { useMemo } from 'react';
import { PromoPopupConfig } from '../../../../types';
import { isSafeUrl } from '../../../../utils/popupSafety';
import { PopupMediaRenderer } from '../mediaPresentations';

interface UsePopupMediaProps {
    config: PromoPopupConfig;
    mode: 'live' | 'preview';
    mediaTheme: any;
    overlayPresetClass: string;
    videoFrame: any;
    mediaFilterClass: string;
}

export const usePopupMedia = ({
    config,
    mode,
    mediaTheme,
    overlayPresetClass,
    videoFrame,
    mediaFilterClass
}: UsePopupMediaProps) => {
    // Lista de imagens seguras
    const imageList = useMemo(() => {
        let rawList: string[] = [];
        if (config.images && config.images.length > 0) {
            rawList = config.images;
        } else if (config.mediaUrl && config.mediaType === 'image') {
            rawList = [config.mediaUrl];
        }
        return rawList.filter(url => isSafeUrl(url));
    }, [config.images, config.mediaUrl, config.mediaType]);

    // Renderização de Mídia
    const renderMedia = () => {
        const themeContainerClass = `relative w-full h-full overflow-hidden ${mediaTheme.containerClass}`;
        const overlayClass = `absolute inset-0 z-10 pointer-events-none ${mediaTheme.overlayClass}`;
        const mediaClass = `${mediaTheme.mediaClass} ${mediaFilterClass}`;
        const overlayPresetDiv = <div className={`absolute inset-0 z-20 pointer-events-none ${overlayPresetClass}`
    }> </div>;

    // Vídeo
    if (config.mediaType === 'video' && config.mediaUrl && isSafeUrl(config.mediaUrl)) {
        const videoIdMatch = config.mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/ |.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
        const isYouTube = !!videoId;

        return (
            <div className= "w-full h-full flex items-center justify-center p-2" >
            <div className={ `relative w-full h-full ${videoFrame.wrapperClass}` }>
                <div className={ `relative w-full h-full overflow-hidden ${videoFrame.innerClass}` }>
                    { overlayPresetDiv }
        {
            isYouTube ? (
                mode === 'preview' ? (
                    <div className= "w-full h-full relative bg-black group cursor-default" >
                    <img
                      src= {`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        className = {`w-full h-full object-cover ${mediaClass} opacity-70 group-hover:opacity-90 transition-opacity`
    }
    alt = "Video Preview"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20" >
            <div className="w-14 h-14 bg-red-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/20 shadow-xl" >
                <i className="fas fa-play text-lg ml-1" > </i>
                    </div>
                    </div>
                    </div>
                ) : (
    <iframe
                    src= {`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}`}
className = {`w-full h-full object-cover ${mediaClass} pointer-events-none`}
allow = "autoplay; encrypted-media"
    > </iframe>
                )
              ) : (
    <video
                  src= { config.mediaUrl }
autoPlay
muted
loop
controls = { false}
playsInline
className = {`w-full h-full object-cover ${mediaClass}`}
                />
              )}
</div>
    </div>
    </div>
      );
    }

// Imagens
if (imageList.length > 0) {
    const presentationMode = config.imagePresentation || (imageList.length > 1 ? 'mini_slider' : 'hero_single');

    return (
        <div className= { themeContainerClass } >
        <div className={ overlayClass }> </div>
    { overlayPresetDiv }
    <PopupMediaRenderer
            mode={ presentationMode }
    images = { imageList }
    className = { mediaClass }
    imageStyle = { config.media?.imageStyle }
        />
        </div>
      );
}

return null;
  };

return { renderMedia, imageList };
};
