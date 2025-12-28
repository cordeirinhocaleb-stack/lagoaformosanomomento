
import React, { useId } from 'react';

interface ChromaKeyGIFProps {
  src: string;
  className?: string;
}

/**
 * ChromaKeyGIF - Versão Segura
 * Remove o fundo verde de imagens/GIFs usando filtros SVG puros via CSS,
 * o que evita SecurityError por não manipular pixels no Canvas.
 */
const ChromaKeyGIF: React.FC<ChromaKeyGIFProps> = ({ src, className }) => {
  const filterId = useId().replace(/:/g, '');

  if (!src) return null;

  // Link direto do Drive para imagens
  const getDirectLink = (url: string) => {
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                   url.match(/id=([a-zA-Z0-9_-]+)/) ||
                   url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
    return url;
  };

  const imageSrc = getDirectLink(src);

  return (
    <div className={`relative ${className || ''}`}>
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <filter id={filterId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    1.2 -2.0 1.2 1.0 -0.1"
          />
          <feComponentTransfer>
            <feFuncA type="gamma" exponent="1.5" />
          </feComponentTransfer>
        </filter>
      </svg>

      <div 
        className="w-full h-full"
        style={{ 
          filter: `url(#${filterId})`,
          WebkitFilter: `url(#${filterId})`
        }}
      >
        <img
          src={imageSrc}
          className="w-full h-full object-contain pointer-events-none"
          alt="Content"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ChromaKeyGIF;
