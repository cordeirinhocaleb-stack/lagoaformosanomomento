import React from 'react';

interface InspectorHeaderProps {
    title: string;
    onClose: () => void;
    onDelete: () => void;
    darkMode?: boolean;
}

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({ title, onClose, onDelete, darkMode }) => {
    return (
        <div className={`p-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${darkMode ? 'border-zinc-800 bg-zinc-900/90' : 'border-zinc-200 bg-white/90'}`}>
            <h3 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {title}
            </h3>
            <div className="flex items-center gap-2">
                <button
                    onClick={onDelete}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Remover Bloco"
                    aria-label="Remover Bloco"
                >
                    <i className="fas fa-trash-alt text-xs"></i>
                </button>
                <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors"
                    title="Fechar Sidebar"
                    aria-label="Fechar Sidebar"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
    );
};
