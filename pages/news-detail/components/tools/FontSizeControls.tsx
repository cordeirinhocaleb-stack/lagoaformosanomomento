import React from 'react';

interface FontSizeControlsProps {
    current: 'base' | 'lg' | 'xl';
    set: (val: 'base' | 'lg' | 'xl') => void;
    mini?: boolean;
    inline?: boolean;
}

const FontSizeControls: React.FC<FontSizeControlsProps> = ({ current, set, mini, inline }) => {
    const sizes: ('base' | 'lg' | 'xl')[] = ['base', 'lg', 'xl'];

    if (mini) {
        return (
            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => {
                        const idx = sizes.indexOf(current);
                        set(sizes[(idx + 1) % sizes.length]);
                    }}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Ajustar Tamanho da Fonte"
                >
                    <i className="fas fa-font"></i>
                </button>
            </div>
        );
    }

    if (inline) {
        return (
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-gray-100 dark:border-zinc-800">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest hidden sm:inline">Tamanho do texto</span>
                <div className="flex items-center gap-1">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => set(size)}
                            className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${
                                current === size 
                                ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-sm border border-gray-100 dark:border-zinc-600' 
                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                            }`}
                        >
                            {size === 'base' ? 'A-' : size === 'lg' ? 'A' : 'A+'}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Tamanho da Fonte</p>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                <button 
                    onClick={() => set('base')}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all ${current === 'base' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
                >
                    A-
                </button>
                <button 
                    onClick={() => set('lg')}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all ${current === 'lg' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
                >
                    A
                </button>
                <button 
                    onClick={() => set('xl')}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all ${current === 'xl' ? 'bg-white dark:bg-zinc-700 text-red-600 shadow-sm' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'}`}
                >
                    A+
                </button>
            </div>
        </div>
    );
};

export default FontSizeControls;