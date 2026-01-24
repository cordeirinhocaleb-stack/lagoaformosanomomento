
import React, { useRef, useState, useEffect } from 'react';

interface LazyBlockProps {
  children: React.ReactNode;
  threshold?: number; // 0.0 a 1.0 (quanto do elemento precisa aparecer)
  minHeight?: string; // Altura reservada antes de carregar (evita pulos na tela)
  className?: string;
}

const LazyBlock: React.FC<LazyBlockProps> = ({ children, threshold = 0.01, minHeight = '300px', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Usamos um threshold bem baixo (0.01) e um rootMargin generoso (300px)
    // para que o bloco "acorde" antes mesmo do usuário chegar nele.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '300px 0px' // Carrega 300px antes de entrar na tela
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      className={`transition-opacity duration-500 ${className} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        minHeight: isVisible ? 'auto' : minHeight,
        containIntrinsicSize: isVisible ? 'auto' : `100% ${minHeight}`,
        contentVisibility: 'auto'
      }}
    >
      {isVisible ? children : (
        <div className="w-full h-full min-h-inherit flex items-center justify-center bg-gray-50/30 rounded-[3rem] border border-dashed border-gray-100">
          <img src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P" className="w-8 h-8 animate-coin opacity-20" alt="Loading" />
        </div>
      )}
    </div>
  );
};

export default LazyBlock;
