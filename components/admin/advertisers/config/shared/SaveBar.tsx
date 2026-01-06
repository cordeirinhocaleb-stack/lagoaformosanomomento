
import React from 'react';

interface SaveBarProps {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

const SaveBar: React.FC<SaveBarProps> = ({ isVisible, onSave, onDiscard }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] animate-slideUp w-[90%] max-w-xl">
        <div className="bg-[#0a0a0a] text-white p-2 pl-6 pr-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between border border-white/10 backdrop-blur-md">
            
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping absolute inset-0"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full relative z-10"></div>
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-300">
                    Alterações pendentes
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={onDiscard}
                    className="px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors text-zinc-500 hover:text-white"
                >
                    Descartar
                </button>
                <button 
                    onClick={onSave}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-green-500 transition-all shadow-lg hover:shadow-green-900/30 active:scale-95 flex items-center gap-2"
                >
                    <i className="fas fa-save"></i> Salvar
                </button>
            </div>
        </div>
    </div>
  );
};

export default SaveBar;
