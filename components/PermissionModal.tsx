
import React, { useState, useEffect } from 'react';
import Logo from './Logo';

interface PermissionModalProps {
  onAccept: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('lfnm_permissions_accepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    try {
      // Verifica se a API existe antes de chamar
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } else {
        console.log("API de mídia não suportada neste navegador.");
      }
      
      localStorage.setItem('lfnm_permissions_accepted', 'true');
      setIsVisible(false);
      onAccept();
    } catch (err: any) {
      // Trata erros específicos silenciosamente ou com log informativo
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        console.log("Nenhum dispositivo de câmera/microfone encontrado. Prosseguindo sem mídia.");
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        console.log("Permissão de mídia negada pelo usuário.");
      } else {
        console.warn("Aviso de permissão:", err.message || err);
      }
      
      // Garante que o usuário possa usar o site mesmo se falhar ou negar
      localStorage.setItem('lfnm_permissions_accepted', 'true');
      setIsVisible(false);
      // Chama onAccept para liberar eventuais componentes dependentes
      onAccept();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-white/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 animate-fadeInUp">
        <div className="p-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <Logo />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">
            Bem-vindo ao <span className="text-red-600">Portal</span>
          </h2>
          
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
            Para uma experiência imersiva completa (vídeos e áudio), solicitamos permissão de reprodução.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleAccept}
              className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95"
            >
              Continuar
            </button>
            
            <button 
              onClick={() => {
                localStorage.setItem('lfnm_permissions_accepted', 'true');
                setIsVisible(false);
              }}
              className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all"
            >
              Agora não
            </button>
          </div>

          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-8">
            Suas informações estão seguras conosco.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
