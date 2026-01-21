
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onFinished: () => void;
}

/**
 * [COMPONENTE UI] Tela de Carregamento (Splash Screen)
 * Limpa, sem logs de texto, focada na marca.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showEscape, setShowEscape] = useState(false);
  const microphoneIconUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P";

  useEffect(() => {
    // Simula tempo mínimo de carregamento para estabilidade visual
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onFinished, 500); // Tempo da animação de saída
    }, 1500);

    // Escape de Emergência após 10s
    const escapeTimer = setTimeout(() => {
      setShowEscape(true);
    }, 10000);

    return () => { clearTimeout(timer); clearTimeout(escapeTimer); };
  }, [onFinished]);

  const handleEmergencyLogout = () => {
    if (confirm("Isso limpará seus dados locais e recarregará a página. Continuar?")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
      window.location.reload();
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 bg-[#f4f4f7] ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

      <div className="relative flex flex-col items-center justify-center z-10">

        {/* Microfone Girando 3D */}
        <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center relative mb-8">
          {/* Anéis de Pulso */}
          <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping"></div>
          <div className="absolute inset-0 bg-red-600/5 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>

          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={microphoneIconUrl}
              alt="Carregando..."
              className="w-20 h-20 md:w-24 md:h-24 object-contain animate-loading-spin drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Texto Minimalista */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">
            LFNM
          </h2>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          </div>

          {showEscape && (
            <button
              onClick={handleEmergencyLogout}
              className="mt-8 animate-fadeIn text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5 flex items-center gap-2"
            >
              <i className="fas fa-power-off"></i> Reiniciar Sistema
            </button>
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin-y {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-loading-spin {
          animation: spin-y 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
