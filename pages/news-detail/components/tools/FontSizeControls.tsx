import React from 'react';

interface FontSizeControlsProps {
    current: number;
    set: (val: number | ((prev: number) => number)) => void;
    mini?: boolean;
    inline?: boolean;
}

const FontSizeControls: React.FC<FontSizeControlsProps> = ({ current, set, mini, inline }) => {
    const handleIncrease = () => set(prev => Math.min(prev + 1, 10));
    const handleDecrease = () => set(prev => Math.max(prev - 1, -2));
    const handleReset = () => set(0);

    if (mini) {
        return (
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleIncrease}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:text-red-600 transition-colors"
                    title="Aumentar Fonte"
                >
                    <span className="text-xs font-black">A+</span>
                </button>
                <button
                    onClick={handleReset}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:text-red-600 transition-colors"
                >
                    <span className="text-xs font-black">A</span>
                </button>
            </div>
        );
    }

    const btnClass = "w-9 h-9 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center";
    const activeClass = "bg-white dark:bg-zinc-700 text-red-600 shadow-sm border border-gray-100 dark:border-zinc-600";
    const inactiveClass = "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-gray-100/50 dark:hover:bg-zinc-800/50";

    return (
        <div className={`flex items-center gap-3 ${inline ? 'bg-gray-50 dark:bg-zinc-900 px-3 py-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800' : ''}`}>
            {!inline && <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest ml-1">Fonte</p>}
            <div className={`flex items-center gap-1 ${!inline ? 'bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl' : ''}`}>
                <button
                    onClick={handleDecrease}
                    className={`${btnClass} ${current < 0 ? activeClass : inactiveClass}`}
                    title="Diminuir"
                >
                    A-
                </button>
                <button
                    onClick={handleReset}
                    className={`${btnClass} ${current === 0 ? activeClass : inactiveClass}`}
                    title="Padrão"
                >
                    A
                </button>
                <button
                    onClick={handleIncrease}
                    className={`${btnClass} ${current > 0 ? activeClass : inactiveClass}`}
                    title="Aumentar"
                >
                    A+
                </button>
            </div>
            {current !== 0 && (
                <span className="text-[8px] font-black text-red-500 opacity-50 uppercase tracking-tighter">
                    {current > 0 ? `+${current}` : current}
                </span>
            )}
        </div>
    );
};

export default FontSizeControls;