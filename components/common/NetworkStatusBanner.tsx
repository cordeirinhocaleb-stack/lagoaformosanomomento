
import React, { useState, useEffect } from 'react';

interface NetworkStatusBannerProps {
  onReconnect?: () => void;
}

const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onReconnect }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    
    const handleOnline = () => {
      setIsOffline(false);
      setIsReconnecting(true);
      
      // Feedback visual de "Reconectando..."
      if (onReconnect) {onReconnect();}
      
      setTimeout(() => {
        setIsReconnecting(false);
      }, 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onReconnect]);

  if (!isOffline && !isReconnecting) {return null;}

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[10000] py-3 px-4 flex items-center justify-center transition-all duration-500 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] ${isOffline ? 'bg-red-600' : 'bg-green-600'}`}>
        <div className="flex items-center gap-3">
            {isOffline ? (
                <>
                    <i className="fas fa-wifi-slash text-white animate-pulse"></i>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">
                        Sem Conexão com a Internet
                    </span>
                </>
            ) : (
                <>
                    <i className="fas fa-sync fa-spin text-white"></i>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">
                        Conexão Restaurada • Atualizando Dados...
                    </span>
                </>
            )}
        </div>
    </div>
  );
};

export default NetworkStatusBanner;
