
import React from 'react';

const UsefulNumbers: React.FC = () => {
    const numbers = [
        { label: 'PM', value: '190', icon: 'fa-shield-halved', color: 'text-blue-500' },
        { label: 'Bombeiros', value: '193', icon: 'fa-fire-extinguisher', color: 'text-red-500' },
        { label: 'SAMU', value: '192', icon: 'fa-ambulance', color: 'text-orange-500' },
        { label: 'Pronto Socorro', value: '(34) 3824-0140', icon: 'fa-hospital', color: 'text-green-500' },
        { label: 'Polícia Civil', value: '147', icon: 'fa-id-card', color: 'text-gray-400' },
    ];

    return (
        <div className="w-full bg-zinc-950 border-t border-white/5 py-1 px-4 md:px-8 overflow-hidden">
            <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide py-0.5">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap hidden md:flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                    Números Úteis:
                </span>
                {numbers.map((item, idx) => (
                    <div
                        key={idx}
                        className={`items-center gap-2 whitespace-nowrap group cursor-pointer hover:scale-105 transition-transform ${idx >= 3 ? 'hidden md:flex' : 'flex'
                            }`}
                    >
                        <i className={`fas ${item.icon} ${item.color} text-[10px]`}></i>
                        <span className="text-[9px] font-bold text-gray-400 uppercase group-hover:text-white transition-colors">{item.label}:</span>
                        <span className="text-[10px] font-black text-white tracking-wider group-hover:text-red-500 transition-colors">{item.value}</span>
                    </div>
                ))}

                <a href="/utilidade" className="ml-4 pl-4 border-l border-zinc-800 flex items-center gap-2 text-[9px] font-black text-red-600 hover:text-white uppercase tracking-widest transition-colors hover:bg-red-600/10 px-3 py-0.5 rounded-full">
                    Ver todos <i className="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    );
};

export default UsefulNumbers;
