
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onFinished: () => void;
}

/**
 * [COMPONENTE UI] Tela de Carregamento (Splash Screen)
 * -------------------------------------------------------------
 * Simula um sistema de "Centro de Comando" iniciando.
 * O carregamento é falso (baseado em timer), mas serve para:
 * 1. Criar impacto visual.
 * 2. Dar tempo de carregar assets pesados em background.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  const [progress, setProgress] = useState(0);
  const [currentLog, setCurrentLog] = useState("SISTEMA DE SEGURANÇA INICIANDO...");
  const [isExiting, setIsExiting] = useState(false);

  const logs = [
    "ACESSANDO SERVIDORES...",
    "AUTENTICANDO WELIX DUARTE...",
    "CONEXÃO ESTABELECIDA.",
    "MÓDULOS CARREGADOS.",
    "SCAN PARANAÍBA OK.",
    "SISTEMA PRONTO."
  ];

  // [CONFIGURAÇÃO] Ícone Central Animado
  // Atualizado para o novo ícone solicitado
  const microphoneIconUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P";

  useEffect(() => {
    let logIndex = 0;
    // Intervalo reduzido de 150ms para 60ms para maior velocidade
    const interval = setInterval(() => {
      setProgress(prev => {
        // Incremento aleatório para parecer natural
        const next = prev + (Math.random() * 15 + 5);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onFinished, 400); // Saída após animação de fade-out
          }, 150);
          return 100;
        }
        
        // Atualiza as mensagens de log baseado no progresso
        const newLogIndex = Math.floor((next / 100) * logs.length);
        if (newLogIndex !== logIndex && logs[newLogIndex]) {
          logIndex = newLogIndex;
          setCurrentLog(logs[newLogIndex]);
        }
        
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinished]);

  const isFinished = progress >= 100;

  return (
    <div className={`fixed inset-0 z-[2000] flex flex-col items-center justify-center transition-all duration-700 ${isExiting ? 'opacity-0 pointer-events-none scale-110' : 'opacity-100'} bg-black/80 backdrop-blur-[15px]`}>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-red-600/20 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-600/20 blur-[150px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="absolute top-0 left-0 w-full h-1.5 flex z-50 opacity-70">
        <div className="flex-1 bg-red-600 animate-pulse"></div>
        <div className="flex-1 bg-blue-600 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Ícone Giratório Central */}
      <div className="relative mb-6 flex items-center justify-center z-10">
        <div className="w-32 h-32 md:w-48 md:h-48 border border-white/20 rounded-full flex items-center justify-center relative">
          <div className="absolute inset-0 border-t-2 border-red-600 rounded-full animate-spin"></div>
          
          <div className="w-20 h-20 md:w-32 md:h-32 flex items-center justify-center">
            <img 
              src={microphoneIconUrl} 
              alt="Logo" 
              className="w-full h-full object-contain animate-loading-3d-spin"
            />
          </div>
        </div>
      </div>

      {/* Barra de Progresso e Logs */}
      <div className={`w-full max-w-xs px-8 relative z-10 transition-all duration-300 ${isFinished ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
        <div className="flex justify-between items-end mb-2">
          <span className="text-red-600 font-black text-[9px] uppercase tracking-[0.4em] italic">Transmissão On</span>
          <span className="text-white font-mono text-xs font-bold">{Math.round(progress)}%</span>
        </div>
        
        <div className="h-1 w-full bg-white/10 overflow-hidden rounded-full relative">
          <div 
            className="h-full bg-red-600 transition-all duration-200 ease-out shadow-[0_0_15px_rgba(220,38,38,0.8)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="mt-3 text-center h-4">
          <p className="text-white/60 font-mono text-[7px] uppercase tracking-widest animate-pulse">
            {currentLog}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loading-3d-spin {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
        .animate-loading-3d-spin {
          animation: loading-3d-spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
