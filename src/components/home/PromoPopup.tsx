
import React, { useState, useEffect } from 'react';
import { PromoPopupConfig } from '../../types';
import PromoPopupView from './popup/PromoPopupView';
import { sanitizeText } from '../../utils/popupSafety';

interface PromoPopupProps {
  config: PromoPopupConfig | undefined;
}

const PromoPopup: React.FC<PromoPopupProps> = ({ config }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!config || !config.active) {return;}

    // 1. Validação de Rota (Onde exibir)
    const currentHash = window.location.hash || '#/';
    const targets = config.targetPages || ['all'];
    let isOnAllowedPage = false;

    if ((currentHash === '#/' || currentHash === '') && (targets.includes('home') || targets.includes('all'))) {
        isOnAllowedPage = true;
    }
    else if (currentHash.startsWith('#/news/') && (targets.includes('news_detail') || targets.includes('all'))) {
        isOnAllowedPage = true;
    }
    else if (targets.includes('advertiser_page')) {
        // Se a config tem 'advertiser_page', assume-se que o componente está montado na página correta (AdvertiserPage.tsx)
        isOnAllowedPage = true;
    }

    if (!isOnAllowedPage) {return;}

    // 2. Validação de Frequência (Storage) - Usa título sanitizado como chave
    const safeTitle = sanitizeText(config.title);
    const storageKey = `lfnm_popup_${safeTitle.replace(/\s/g, '_')}_seen`;
    const lastSeen = localStorage.getItem(storageKey);
    const now = Date.now();
    let shouldShow = true;

    if (config.frequency === 'once_per_session') {
      const sessionSeen = sessionStorage.getItem(storageKey);
      if (sessionSeen) {shouldShow = false;}
    } else if (config.frequency === 'once_per_day' && lastSeen) {
      const hoursSince = (now - parseInt(lastSeen)) / (1000 * 60 * 60);
      if (hoursSince < 24) {shouldShow = false;}
    }

    if (shouldShow) {
      // Pequeno delay para UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [config]);

  const handleClose = () => {
    if (!config) {return;}
    setIsVisible(false);
    
    // Salva estado de visualização
    const safeTitle = sanitizeText(config.title);
    const storageKey = `lfnm_popup_${safeTitle.replace(/\s/g, '_')}_seen`;
    localStorage.setItem(storageKey, Date.now().toString());
    sessionStorage.setItem(storageKey, 'true');
  };

  const handleAction = () => {
    if (config?.buttonLink) {
        window.open(config.buttonLink, '_blank');
    }
    handleClose();
  };

  if (!isVisible || !config) {return null;}

  return (
    <PromoPopupView 
        config={config} 
        mode="live"
        onClose={handleClose}
        onAction={handleAction}
    />
  );
};

export default PromoPopup;
