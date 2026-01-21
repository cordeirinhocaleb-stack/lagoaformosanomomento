import { useState, useEffect, RefObject } from 'react';

export const useReadingProgress = (targetRef?: RefObject<HTMLElement | null>) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      if (targetRef && targetRef.current) {
        const element = targetRef.current;
        const rect = element.getBoundingClientRect();
        
        // Posição absoluta do elemento no documento
        const elementTop = rect.top + scrollY;
        const elementHeight = element.offsetHeight;
        const elementBottom = elementTop + elementHeight;
        
        // Ponto de início: Topo do artigo chega no topo da tela
        const start = elementTop;
        // Ponto de fim: Fim do artigo chega no fim da tela (leitura concluída)
        const end = elementBottom - windowHeight;
        
        const totalDistance = end - start;
        
        if (totalDistance <= 0) {
            setProgress(scrollY >= start ? 100 : 0);
            return;
        }

        const currentDistance = scrollY - start;
        const percentage = (currentDistance / totalDistance) * 100;
        
        setProgress(Math.min(100, Math.max(0, percentage)));
      } else {
        // Fallback para a página toda caso não haja ref
        const docHeight = document.documentElement.scrollHeight;
        const totalScrollable = docHeight - windowHeight;
        const percentage = totalScrollable > 0 ? (scrollY / totalScrollable) * 100 : 0;
        setProgress(Math.min(100, Math.max(0, percentage)));
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    
    // Chamada inicial
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [targetRef]);

  return progress;
};