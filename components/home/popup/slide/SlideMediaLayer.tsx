
import React, { useState } from 'react';
import { PromoPopupItemConfig } from '@/types';
import { isSafeUrl } from '@/utils/popupSafety';
import { getOverlayPresetClass } from '../overlayPresets';
import { getVideoFrameById } from '../videoFrames';
import { getMediaFilterCss } from '../mediaFilters';
import { PopupMediaRenderer } from '../mediaPresentations';

interface SlideMediaLayerProps {
  item: PromoPopupItemConfig;
  mode: 'live' | 'preview';
  images: string[];
}

export const SlideMediaLayer: React.FC<SlideMediaLayerProps> = ({ item, mode, images }) => {
  const [videoError, setVideoError] = useState(false);

  // --- HELPERS PARA MÍDIA ---
  const getVisualClasses = (style: any) => {
      const radius = style.borderRadius === 'strong' ? 'rounded-3xl' : style.borderRadius === 'soft' ? 'rounded-xl' : 'rounded-none';
      const shadow = style.shadow === 'strong' ? 'shadow-2xl' : style.shadow === 'soft' ? 'shadow-lg' : 'shadow-none';
      const border = style.borderStyle === 'bold' ? 'border-4 border-white' : style.borderStyle === 'thin' ? 'border border-white/50' : 'border-0';
      return `${radius} ${shadow} ${border} overflow-hidden`;
  };

  // 1. Renderização de Vídeo
  const renderVideo = () => {
      const { videoUrl, videoSettings } = item.media;
      
      if (!videoUrl || !isSafeUrl(videoUrl) || videoError) {
          return (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 min-h-[200px]">
                  <i className="fas fa-video-slash text-4xl"></i>
              </div>
          );
      }

      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
      const fitClass = videoSettings.fit === 'contain' ? 'object-contain' : 'object-cover';
      const zoomClass = videoSettings.zoomMotion === 'strong' ? 'animate-kenburns-fast' : videoSettings.zoomMotion === 'soft' ? 'animate-kenburns' : '';
      const filterClass = getMediaFilterCss(videoSettings.filterId, videoSettings.filterVariant);
      const frameConfig = getVideoFrameById(videoSettings.framePreset);
      const visualClasses = getVisualClasses(videoSettings);
      const overlayClass = getOverlayPresetClass(videoSettings.overlayPreset);

      return (
          <div className={`w-full h-full p-4 flex items-center justify-center`}>
              <div className={`relative w-full h-full ${frameConfig.wrapperClass} ${frameConfig.innerClass} ${visualClasses}`}>
                  <div className={`absolute inset-0 z-10 pointer-events-none ${overlayClass}`}></div>
                  {isYouTube ? (
                      mode === 'preview' ? (
                          // PREVIEW: Placeholder
                          <div className="w-full h-full relative bg-black group cursor-default">
                              <img 
                                src={`https://img.youtube.com/vi/${videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || ''}/hqdefault.jpg`} 
                                className={`w-full h-full object-cover ${filterClass} opacity-70 group-hover:opacity-90 transition-opacity`} 
                                alt="Video Preview"
                              />
                              <div className="absolute inset-0 flex items-center justify-center z-20">
                                  <div className="w-14 h-14 bg-red-600/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border-2 border-white/20 shadow-xl">
                                      <i className="fas fa-play text-lg ml-1"></i>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          // LIVE: Iframe (Filtros CSS aplicados via mediaClass no iframe)
                          <iframe 
                              src={`https://www.youtube.com/embed/${videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || ''}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || ''}`} 
                              className={`w-full h-full object-cover ${filterClass} pointer-events-none`}
                              allow="autoplay; encrypted-media"
                          ></iframe>
                      )
                  ) : (
                      <video
                          src={videoUrl}
                          className={`w-full h-full ${fitClass} ${zoomClass} ${filterClass} transition-transform duration-700`}
                          autoPlay={videoSettings.autoplay && mode === 'live'}
                          muted={mode === 'preview' ? true : videoSettings.muted}
                          loop={videoSettings.loop}
                          playsInline
                          controls={mode === 'live' && !videoSettings.loop}
                          onError={() => setVideoError(true)}
                      />
                  )}
              </div>
          </div>
      );
  };

  // 2. Renderização de Imagens
  const renderImages = () => {
      const { imagePresentation, imageStyle } = item.media;
      if (!images || images.length === 0) return null;

      const visualClasses = getVisualClasses(imageStyle);
      const filterClass = getMediaFilterCss(imageStyle.filterId, imageStyle.filterVariant);
      const overlayClass = getOverlayPresetClass(imageStyle.overlayPreset);

      return (
          <div className={`w-full h-full relative ${visualClasses}`}>
              <div className={`absolute inset-0 z-10 pointer-events-none ${overlayClass}`} style={{ opacity: imageStyle.overlayIntensity ? imageStyle.overlayIntensity / 100 : 1 }}></div>
              <PopupMediaRenderer 
                  mode={imagePresentation}
                  images={images}
                  className={`w-full h-full ${filterClass} ${imageStyle.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
              />
          </div>
      );
  };

  // Render condicional
  if (item.media.videoUrl) return renderVideo();
  return renderImages();
};
