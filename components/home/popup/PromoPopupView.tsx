
import React, { useMemo } from 'react';
import { PromoPopupConfig, PopupSize } from '../../../types';
import { getThemeById } from './popupThemes';
import { getMediaThemeById } from './mediaThemes';
import { getOverlayPresetClass } from './overlayPresets';
import { getVideoFrameById } from './videoFrames';
import { getMediaFilterCss } from './mediaFilters';
import { isSafeUrl } from '../../../utils/popupSafety';
import { PopupMediaRenderer } from './mediaPresentations';

interface PromoPopupViewProps {
  config: PromoPopupConfig;
  mode: 'live' | 'preview';
  onClose?: () => void;
  onAction?: () => void;
}

const PromoPopupView: React.FC<PromoPopupViewProps> = ({ config, mode, onClose, onAction }) => {
  const theme = getThemeById(config.theme || 'classic_default');
  const mediaTheme = getMediaThemeById(config.mediaThemeId); 
  const overlayPresetClass = getOverlayPresetClass(config.overlayPreset);
  const videoFrame = getVideoFrameById(config.videoFramePreset); // Frame de Vídeo
  const mediaFilterClass = getMediaFilterCss(config.mediaFilter, config.mediaFilterVariant); // Classes de Filtro CSS

  const styles = theme.styles;
  const shape = config.shape || 'default';
  const size = config.size || 'md';
  const position = config.position || 'center';
  const overlay = config.overlay || 'dark';
  const animation = config.animation || 'zoom';

  // Carrossel Automático (SAFE ONLY)
  const imageList = useMemo(() => {
      let rawList: string[] = [];
      if (config.images && config.images.length > 0) {rawList = config.images;}
      else if (config.mediaUrl && config.mediaType === 'image') {rawList = [config.mediaUrl];}
      
      // Filtra apenas URLs seguras
      return rawList.filter(url => isSafeUrl(url));
  }, [config.images, config.mediaUrl, config.mediaType]);

  // Classes de Posicionamento (Live vs Preview)
  let positionClasses = '';
  let wrapperClasses = '';

  if (mode === 'live') {
      wrapperClasses = 'fixed inset-0 z-[9999]';
      if (position === 'center') {positionClasses = 'items-center justify-center';}
      else if (position === 'top-center') {positionClasses = 'items-start justify-center pt-20';}
      else if (position === 'bottom-center') {positionClasses = 'items-end justify-center pb-8';}
      else if (position === 'bottom-right') {positionClasses = 'items-end justify-end pb-8 pr-4 md:pr-8';}
      else if (position === 'bottom-left') {positionClasses = 'items-end justify-start pb-8 pl-4 md:pl-8';}
      else if (position === 'top-left') {positionClasses = 'items-start justify-start pt-20 pl-4 md:pl-8';}
      else if (position === 'top-right') {positionClasses = 'items-start justify-end pt-20 pr-4 md:pr-8';}
      else if (position === 'center-left') {positionClasses = 'items-center justify-start pl-4 md:pl-8';}
      else if (position === 'center-right') {positionClasses = 'items-center justify-end pr-4 md:pr-8';}
  } else {
      // Preview Mode: Centralizado no container pai
      wrapperClasses = 'absolute inset-0 z-10';
      positionClasses = 'items-center justify-center';
      
      // Simulação de posição relativa no preview
      if (position.includes('top')) {positionClasses = 'items-start justify-center pt-4';}
      if (position.includes('bottom')) {positionClasses = 'items-end justify-center pb-4';}
  }

  // Classes de Overlay
  let overlayClasses = 'bg-black/80 backdrop-blur-sm';
  if (overlay === 'transparent') {overlayClasses = 'bg-transparent pointer-events-none';}
  if (overlay === 'blur') {overlayClasses = 'bg-white/30 backdrop-blur-xl';}

  // Classes de Animação
  let animationClass = mode === 'live' ? 'animate-zoomIn' : '';
  if (mode === 'live') {
      if (animation === 'fade') {animationClass = 'animate-fadeIn';}
      if (animation === 'slide-up') {animationClass = 'animate-slideUp';}
      if (animation === 'slide-in-right') {animationClass = 'animate-slideInRight';}
      if (animation === 'slide-in-left') {animationClass = 'animate-slideInLeft';}
  }

  // Mapeamento de Tamanhos
  const getSizeClass = (s: PopupSize) => {
      switch(s) {
          case 'xs': return 'max-w-xs';
          case 'sm': return 'max-w-sm';
          case 'md': return 'max-w-md';
          case 'lg': return 'max-w-lg';
          case 'xl': return 'max-w-xl';
          case '2xl': return 'max-w-2xl';
          case 'fullscreen': return 'w-full h-full rounded-none max-w-none';
          case 'banner_top': return 'w-full max-w-4xl fixed top-0 left-1/2 -translate-x-1/2 mt-4';
          case 'banner_bottom': return 'w-full max-w-4xl fixed bottom-0 left-1/2 -translate-x-1/2 mb-4';
          case 'sidebar_left': return 'w-80 h-auto fixed left-4 top-1/2 -translate-y-1/2';
          case 'sidebar_right': return 'w-80 h-auto fixed right-4 top-1/2 -translate-y-1/2';
          default: return 'max-w-md';
      }
  };

  const isSplit = theme.layout === 'split';
  let containerSizeClasses = getSizeClass(size);
  if (isSplit && !containerSizeClasses.includes('max-w') && size !== 'fullscreen') {containerSizeClasses += ' max-w-4xl grid md:grid-cols-2';}
  
  if (mode === 'preview') {
      if (size === 'banner_top' || size === 'banner_bottom') {containerSizeClasses = 'w-full max-w-sm';}
      if (size === 'sidebar_left' || size === 'sidebar_right') {containerSizeClasses = 'w-64';}
      if (size === 'fullscreen') {containerSizeClasses = 'w-full h-full';}
  }

  // Renderização de Mídia OTIMIZADA com MEDIA THEMES e VIDEO FRAMES e FILTERS
  const renderMedia = () => {
      // Wrapper do Tema de Mídia (Container Geral)
      const themeContainerClass = `relative w-full h-full overflow-hidden ${mediaTheme.containerClass}`;
      const overlayClass = `absolute inset-0 z-10 pointer-events-none ${mediaTheme.overlayClass}`;
      const mediaClass = `${mediaTheme.mediaClass} ${mediaFilterClass}`;
      
      // Preset de Overlay (Gradientes, Tinturas, etc) - Camada Superior
      const overlayPresetDiv = <div className={`absolute inset-0 z-20 pointer-events-none ${overlayPresetClass}`}></div>;

      // SEGURANÇA: Só renderiza vídeo se a URL for segura
      if (config.mediaType === 'video' && config.mediaUrl && isSafeUrl(config.mediaUrl)) {
          const videoIdMatch = config.mediaUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
          const videoId = videoIdMatch ? videoIdMatch[1] : null;
          const isYouTube = !!videoId;
          
          // VIDEO FRAME WRAPPER
          return (
              <div className={`w-full h-full flex items-center justify-center p-2`}>
                  <div className={`relative w-full h-full ${videoFrame.wrapperClass}`}>
                      <div className={`relative w-full h-full overflow-hidden ${videoFrame.innerClass}`}>
                          {overlayPresetDiv}
                          {isYouTube ? (
                              mode === 'preview' ? (
                                  // PREVIEW: Placeholder
                                  <div className="w-full h-full relative bg-black group cursor-default">
                                      <img 
                                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                                        className={`w-full h-full object-cover ${mediaClass} opacity-70 group-hover:opacity-90 transition-opacity`} 
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
                                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}`} 
                                      className={`w-full h-full object-cover ${mediaClass} pointer-events-none`}
                                      allow="autoplay; encrypted-media"
                                  ></iframe>
                              )
                          ) : (
                              <video 
                                src={config.mediaUrl} 
                                autoPlay 
                                muted 
                                loop 
                                controls={false}
                                playsInline
                                className={`w-full h-full object-cover ${mediaClass}`} 
                              />
                          )}
                      </div>
                  </div>
              </div>
          );
      }

      // NOVO SISTEMA DE APRESENTAÇÃO DE IMAGENS (v2)
      if (imageList.length > 0) {
          // Determina o modo de apresentação. 
          // Se não estiver definido (legacy), usa 'mini_slider' se tiver múltiplas imagens, ou 'hero_single' se for só uma.
          const presentationMode = config.imagePresentation || (imageList.length > 1 ? 'mini_slider' : 'hero_single');

          return (
              <div className={themeContainerClass}>
                  <div className={overlayClass}></div>
                  {overlayPresetDiv}
                  
                  {/* Chama o novo renderizador de apresentações */}
                  <PopupMediaRenderer 
                      mode={presentationMode}
                      images={imageList}
                      className={mediaClass} // Passa classes de filtro e brilho para as imagens internas
                  />
              </div>
          );
      }

      return null;
  };

  // Shape Styles
  let containerShapeClasses = '';
  let mediaShapeClasses = '';

  if (size !== 'fullscreen') {
      if (shape === 'square') {
          containerShapeClasses = 'rounded-none';
          mediaShapeClasses = 'rounded-none';
      } else if (shape === 'rounded') {
          containerShapeClasses = 'rounded-3xl';
          mediaShapeClasses = 'rounded-t-3xl';
      } else if (shape === 'circle' && !isSplit) {
          containerShapeClasses = 'rounded-full aspect-square flex flex-col items-center justify-center p-12 text-center';
          mediaShapeClasses = 'rounded-full w-40 h-40 mx-auto mb-6 overflow-hidden';
      } else if (shape === 'leaf') {
          containerShapeClasses = 'rounded-tr-[4rem] rounded-bl-[4rem]';
          mediaShapeClasses = 'rounded-tr-[3.5rem]';
      } else if (shape === 'heart') {
          containerShapeClasses = 'rounded-[3rem] rounded-bl-none rounded-tr-none';
      } else if (shape === 'hexagon') {
          containerShapeClasses = 'rounded-xl';
      }
  }

  // Estilos de Fonte Dinâmicos
  const fontStyle = {
      fontFamily: config.fontFamily || 'Inter, sans-serif'
  };
  
  const fontSizeClass = {
      xs: 'text-sm', sm: 'text-base', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl', '2xl': 'text-3xl'
  }[config.fontSize || 'md'];

  const wrapperPointerEvents = overlay === 'transparent' ? 'pointer-events-none' : 'pointer-events-auto';

  return (
    <div className={`${wrapperClasses} flex p-4 ${positionClasses} ${overlayClasses} ${wrapperPointerEvents} transition-all duration-500`}>
      {overlay !== 'transparent' && onClose && (
          <div className="absolute inset-0" onClick={onClose}></div>
      )}

      <div 
        className={`relative w-full ${containerSizeClasses} ${animationClass} ${styles.container} ${shape !== 'default' ? containerShapeClasses : ''} shadow-2xl pointer-events-auto`}
      >
        <button 
            onClick={onClose}
            className={`absolute z-[100] w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-xl rounded-full active:scale-95 group ${styles.closeBtn} ${shape === 'circle' ? 'top-4 right-4' : '-top-3 -right-3 md:-right-4 md:-top-4'}`}
            title="Fechar"
        >
            <i className="fas fa-times text-lg group-hover:rotate-90 transition-transform duration-300"></i>
        </button>

        {(config.mediaUrl || (config.images && config.images.length > 0)) && theme.id !== 'creative_terminal' && (
            <div className={`${styles.mediaContainer} ${isSplit ? 'h-64 md:h-full' : ''} relative ${shape !== 'default' && !isSplit ? mediaShapeClasses : ''} ${size === 'fullscreen' ? 'h-1/2' : ''} p-2 bg-transparent border-0`}>
                {/* RenderMedia agora inclui o wrapper do tema visual e video frame */}
                {renderMedia()}
            </div>
        )}

        <div className={`relative z-10 ${styles.contentContainer} ${shape === 'circle' ? 'p-0' : ''} ${size === 'fullscreen' ? 'h-1/2 flex flex-col justify-center items-center' : ''}`}>
            <h2 
                className={`leading-none mb-3 ${styles.title} ${size === 'fullscreen' ? 'text-5xl md:text-7xl' : ''}`}
                style={{ ...fontStyle, fontSize: config.fontSize ? undefined : 'inherit' }}
            >
                {config.title}
            </h2>
            <p 
                className={`whitespace-pre-line ${styles.description} ${size === 'fullscreen' ? 'text-xl max-w-2xl mx-auto' : ''} ${fontSizeClass}`}
                style={fontStyle}
            >
                {config.description}
            </p>

            <button 
                onClick={onAction}
                className={`w-full py-4 transition-all flex items-center justify-center gap-2 ${styles.button} ${size === 'fullscreen' ? 'max-w-md mx-auto text-xl py-6' : ''}`}
            >
                {config.buttonText} {theme.category !== 'Criativo' && <i className="fas fa-arrow-right"></i>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PromoPopupView;
