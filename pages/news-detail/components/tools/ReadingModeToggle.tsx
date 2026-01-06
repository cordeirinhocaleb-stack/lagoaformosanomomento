import React from 'react';

interface ReadingModeToggleProps {
    active: boolean;
    toggle: () => void;
}

const ReadingModeToggle: React.FC<ReadingModeToggleProps> = ({ active, toggle }) => {
    return (
        <button 
            onClick={toggle}
            className={`w-full py-3 text-[10px] font-[1000] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 border shadow-sm ${
                active 
                ? 'bg-zinc-900 text-white border-zinc-900' 
                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:bg-red-600 hover:text-white dark:hover:bg-red-600'
            }`}
        >
            <i className={`fas ${active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            {active ? 'Sair do Modo Foco' : 'Ativar Modo Foco'}
        </button>
    );
};

export default ReadingModeToggle;