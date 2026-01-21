
export const toolbarBtn = (isActive: boolean) => `
    flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
    ${isActive 
        ? 'bg-black text-white shadow-md transform scale-105' 
        : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-transparent'
    }
`;

export const zoomBtn = (isActive: boolean) => `
    w-8 h-8 flex items-center justify-center rounded-lg text-[9px] font-bold transition-all
    ${isActive
        ? 'bg-blue-50 text-blue-600 border border-blue-200'
        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
    }
`;

export const stageBackground = (mode: 'light' | 'dark' | 'site') => {
    switch (mode) {
        case 'dark': 
            return 'bg-[#111]';
        case 'site': 
            // Gradiente que simula o site com blur
            return 'bg-gradient-to-br from-gray-900 via-gray-800 to-black';
        case 'light':
        default:
            // Padrão xadrez sutil para transparência
            return `bg-[#f4f4f5] border border-gray-200`; // Simplificado, mas ideal seria um pattern SVG
    }
};

export const deviceFrame = (device: 'phone' | 'desktop') => {
    if (device === 'phone') {
        return {
            width: '375px',
            height: '812px', // iPhone X dimensions
            borderRadius: '40px',
            borderWidth: '12px',
            borderColor: '#1a1a1a',
            className: 'shadow-2xl bg-white relative overflow-hidden ring-4 ring-black/10'
        };
    }
    return {
        width: '1280px', // Standard Desktop width
        height: '800px',
        borderRadius: '12px',
        borderWidth: '1px',
        borderColor: '#e5e7eb',
        className: 'shadow-xl bg-white relative overflow-hidden'
    };
};
