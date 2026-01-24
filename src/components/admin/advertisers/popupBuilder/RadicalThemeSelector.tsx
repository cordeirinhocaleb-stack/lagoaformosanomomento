import React, { useState, useRef, useMemo } from 'react';
import { PromoPopupItemConfig } from '../../../../types';
import { POPUP_THEME_CATALOG, PopupThemeToken } from '../../../home/popup/popupThemeCatalog';

interface ThemeSelectorProps {
    currentThemeId: string;
    onSelect: (updates: Partial<PromoPopupItemConfig>) => void;
    darkMode?: boolean;
    previewImage?: string;
}

const THEME_CATEGORIES = [
    { id: 'all', label: 'Todos' },
    { id: 'retail', label: 'Varejo & Urgência' },
    { id: 'luxury', label: 'Luxo' },
    { id: 'modern', label: 'Tech' },
    { id: 'creative', label: 'Bold (Full)' },
    { id: 'social', label: 'Social' },
];

const RadicalThemeSelector: React.FC<ThemeSelectorProps> = ({ currentThemeId, onSelect, darkMode = false, previewImage }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    // 1. Filtragem (Mantida lógica robusta anterior)
    const filteredThemes = useMemo(() => {
        if (activeCategory === 'all') { return POPUP_THEME_CATALOG; }
        return POPUP_THEME_CATALOG.filter(t => t.category === activeCategory);
    }, [activeCategory]);

    const handleThemeClick = (theme: PopupThemeToken) => {
        onSelect({
            themePresetId: theme.id,
            filterId: theme.filterId,
            filterVariant: theme.filterVariant,
            themeAdvanced: theme.defaults,
            // Mapeamento de Sugestões para Facilitar Configuração
            title: theme.suggestedTitle,
            body: theme.suggestedBody,
            ctaText: theme.suggestedCTA,
            textStyle: {
                fontFamily: theme.recommendedFontFamily,
                titleColor: theme.colors.title,
                bodyColor: theme.colors.body,
                buttonColor: theme.colors.buttonBg,
                buttonTextColor: theme.colors.buttonText,
                titleSize: '2xl',
                bodySize: 'md'
            },
            media: {
                imagePresentation: theme.recommendedImagePresentation
            } as any
        });
    };

    const handleCategoryChange = (catId: string) => {
        setActiveCategory(catId);
        // Reset scroll
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const scrollCategory = (direction: 'left' | 'right') => {
        if (!categoryScrollRef.current) return;
        const scrollAmount = 150;
        categoryScrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div className={`w-full max-w-full overflow-hidden flex flex-col gap-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>

            {/* CATEGORY NAV - FLEX ROW (Stable) */}
            <div className="flex items-center gap-4 w-full px-1">
                <button
                    onClick={() => scrollCategory('left')}
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors border ${darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/10 text-black'}`}
                >
                    <i className="fas fa-chevron-left text-xs"></i>
                </button>

                <div
                    ref={categoryScrollRef}
                    className="flex-1 flex gap-2 overflow-x-auto pb-0 no-scrollbar items-center scroll-smooth mask-fade-sides"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {THEME_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`
                                shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border
                                ${activeCategory === cat.id
                                    ? (darkMode ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-black text-white border-black shadow-lg')
                                    : (darkMode ? 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500' : 'bg-transparent text-gray-400 border-gray-200 hover:border-gray-400')}
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => scrollCategory('right')}
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors border ${darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/10 text-black'}`}
                >
                    <i className="fas fa-chevron-right text-xs"></i>
                </button>
            </div>

            {/* HOLOGRAPHIC STREAM CONTAINER */}
            <div className="relative group/stream px-4 md:px-14 mt-4 w-full">
                {/* BUTTONS - ARROWS (Centered in Gutters) - Using Flex for safety */}
                <div className="absolute inset-x-2 md:inset-x-4 top-[35%] -translate-y-1/2 z-30 flex justify-between pointer-events-none">
                    <button
                        onClick={() => scroll('left')}
                        className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 hover:scale-110 active:scale-95"
                    >
                        <i className="fas fa-chevron-left text-sm"></i>
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 hover:scale-110 active:scale-95"
                    >
                        <i className="fas fa-chevron-right text-sm"></i>
                    </button>
                </div>

                {/* SCROLL AREA */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-12 pt-4 px-2 snap-x snap-mandatory min-h-[380px] items-start no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {filteredThemes.map(theme => {
                        const isSelected = currentThemeId === theme.id;

                        // Determinar se vamos mostrar a imagem de preview ou o placeholder do tema
                        const showPreview = !!previewImage;

                        return (
                            <div
                                key={theme.id}
                                onClick={() => handleThemeClick(theme)}
                                className={`
                                    snap-center shrink-0 w-[280px] md:w-[320px] aspect-[4/5] relative group cursor-pointer transition-all duration-500
                                    ${isSelected ? 'scale-105 z-20' : 'hover:scale-105 opacity-90 hover:opacity-100'}
                                `}
                            >
                                {/* HALO GLOW Backing */}
                                {isSelected && (
                                    <div className="absolute -inset-4 bg-gradient-to-tr from-transparent via-red-500/20 to-transparent blur-2xl opacity-100 animate-pulse rounded-full pointer-events-none"></div>
                                )}

                                {/* CARD CONTAINER */}
                                <div
                                    className={`
                                        w-full h-full relative overflow-hidden flex flex-col
                                        ${darkMode ? 'bg-gray-900 ring-1 ring-white/10' : 'bg-white ring-1 ring-black/5 shadow-2xl'}
                                    `}
                                    style={{
                                        borderRadius: theme.defaults.borderRadius === 'full' ? '32px' :
                                            theme.defaults.borderRadius === 'none' ? '0px' : '16px',
                                    }}
                                >
                                    {/* DESCRIPTION BUTTON AREA (Top 60%) - REPLACED PREVIEW */}
                                    <div
                                        className="h-[65%] relative w-full overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all duration-500 border-b border-black/5"
                                        style={{ backgroundColor: isSelected ? theme.colors.buttonBg : (darkMode ? '#1a1a1a' : '#f8fafc') }}
                                    >
                                        <div
                                            className={`
                                                w-full py-4 px-3 rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-2
                                                ${isSelected
                                                    ? 'bg-white/10 border-white/40 scale-105'
                                                    : (darkMode ? 'bg-white/5 border-white/10 hover:border-red-500/50' : 'bg-black/5 border-black/10 hover:border-red-500/50')}
                                            `}
                                        >
                                            <i className={`fas fa-info-circle mb-1 text-lg ${isSelected ? 'text-white' : 'text-red-500'}`}></i>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] leading-tight ${isSelected ? 'text-white' : (darkMode ? 'text-gray-400' : 'text-gray-600')}`}>
                                                {theme.description || 'ESTILO PREMIUM'}
                                            </p>
                                            <div className={`mt-2 text-[8px] font-bold px-3 py-1 rounded-full uppercase ${isSelected ? 'bg-white text-black' : 'bg-red-600 text-white'}`}>
                                                VER DETALHES
                                            </div>
                                        </div>

                                        {/* FX Indicator - SMALLER ICONS */}
                                        {theme.specialEffect && theme.specialEffect !== 'none' && (
                                            <div className={`absolute top-3 right-3 text-[10px] animate-pulse z-20 w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-white/20' : 'bg-black/40'} backdrop-blur-sm shadow-lg`}>
                                                {theme.specialEffect === 'snow' && '❄️'}
                                                {theme.specialEffect === 'pulse_red' && '🔴'}
                                                {theme.specialEffect === 'glitch' && '⚡'}
                                                {theme.specialEffect === 'sparkles' && '✨'}
                                                {theme.specialEffect === 'matrix' && '📟'}
                                                {theme.specialEffect === 'confetti' && '🎉'}
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT AREA (Bottom 40%) */}
                                    <div className="flex-1 w-full p-4 flex flex-col items-center justify-center text-center">
                                        {theme.defaults.headerAccent === 'badge' && (
                                            <div className="mb-2 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest bg-red-600 text-white rounded-full">
                                                Destaque
                                            </div>
                                        )}

                                        <h3
                                            className="text-sm font-black leading-tight mb-2 line-clamp-1"
                                            style={{ color: darkMode ? '#fff' : (isSelected ? theme.colors.buttonBg : theme.colors.title), fontFamily: theme.recommendedFontFamily }}
                                        >
                                            {theme.suggestedTitle || 'TÍTULO'}
                                        </h3>

                                        <div
                                            className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border truncate max-w-[90%]"
                                            style={{
                                                backgroundColor: theme.colors.buttonBg,
                                                color: theme.colors.buttonText,
                                                borderColor: 'transparent',
                                                borderRadius: theme.defaults.borderRadius === 'full' ? '99px' : '4px'
                                            }}
                                        >
                                            {theme.suggestedCTA || 'Botão'}
                                        </div>
                                    </div>

                                    {/* INFO BAR (Bottom 30%) */}
                                    <div className={`relative h-24 p-4 flex flex-col justify-center ${darkMode ? 'bg-black/90' : 'bg-white border-t border-gray-100'}`}>
                                        <h4 className={`text-sm font-black uppercase tracking-wide mb-1 ${isSelected ? 'text-red-500' : (darkMode ? 'text-white' : 'text-black')}`}>
                                            {theme.name.replace(/^[^\w]+/, '')}
                                        </h4>
                                        <p className={`text-[10px] leading-tight line-clamp-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {theme.description}
                                        </p>

                                        {/* SELECTION INDICATOR */}
                                        <div className={`absolute bottom-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 scale-100' : 'bg-gray-700/50 scale-0 group-hover:scale-100'}`}>
                                            <i className="fas fa-check text-white text-[10px]"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* GHOST CARD (For spacing at end) */}
                    <div className="w-4 shrink-0"></div>
                </div>

                {/* Scroll Indicator */}
                <div className="flex justify-center gap-1 opacity-30 mt-2">
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse delay-75"></div>
                    <div className="w-1 h-1 rounded-full bg-current animate-pulse delay-150"></div>
                </div>
            </div>
        </div>
    );
};

export default RadicalThemeSelector;
