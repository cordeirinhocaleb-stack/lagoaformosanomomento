
export interface PopupThemeDef {
    id: string;
    name: string;
    category: 'Varejo' | 'Luxo' | 'Moderno' | 'Datas' | 'Criativo' | 'Clássico' | 'Gastronomia' | 'Esportes' | 'Tecnologia' | 'Infantil';
    layout: 'classic' | 'split' | 'cover' | 'floating';
    styles: {
        wrapper: string;
        container: string;
        closeBtn: string;
        mediaContainer: string;
        contentContainer: string;
        title: string;
        description: string;
        button: string;
    };
}

export const POPUP_THEMES: PopupThemeDef[] = [
    // --- VAREJO (ALTO IMPACTO) ---
    {
        id: 'retail_red',
        name: 'Oferta Relâmpago',
        category: 'Varejo',
        layout: 'classic',
        styles: {
            wrapper: 'bg-black/90 backdrop-blur-sm',
            container: 'bg-red-600 rounded-3xl border-4 border-white shadow-[0_20px_60px_rgba(220,38,38,0.6)]',
            closeBtn: 'bg-white text-red-600 hover:bg-black hover:text-white',
            mediaContainer: 'aspect-video rounded-t-2xl overflow-hidden border-b-4 border-white',
            contentContainer: 'p-8 text-center text-white',
            title: 'text-3xl md:text-5xl font-[1000] uppercase italic tracking-tighter drop-shadow-md',
            description: 'text-sm font-bold uppercase tracking-widest opacity-90 mb-6',
            button: 'bg-white text-red-600 font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black shadow-xl'
        }
    },
    {
        id: 'classic_default',
        name: 'Padrão LFNM',
        category: 'Clássico',
        layout: 'classic',
        styles: {
            wrapper: 'bg-black/80 backdrop-blur-md',
            container: 'bg-white rounded-[2rem] shadow-2xl overflow-hidden',
            closeBtn: 'bg-black/20 text-white hover:bg-black',
            mediaContainer: 'aspect-video bg-black',
            contentContainer: 'p-8 text-center',
            title: 'text-2xl font-[1000] uppercase italic tracking-tighter text-black',
            description: 'text-sm font-medium text-gray-600 mb-8',
            button: 'bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-black'
        }
    }
];

export const getThemeById = (id: string): PopupThemeDef => {
    return POPUP_THEMES.find(t => t.id === id) || POPUP_THEMES.find(t => t.id === 'classic_default') || POPUP_THEMES[0];
};
