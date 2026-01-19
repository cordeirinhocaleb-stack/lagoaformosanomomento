
import React, { useState, useMemo } from 'react';
import { PromoPopupItemConfig } from '@/types';
import { POPUP_THEME_CATALOG } from '../../../home/popup/popupThemeCatalog';

interface ThemeSelectorProps {
    currentThemeId: string;
    onSelect: (updates: Partial<PromoPopupItemConfig>) => void;
    darkMode?: boolean;
}

const THEME_CATEGORIES = [
    { id: 'all', label: 'Todos', icon: 'fa-layer-group' },
    { id: 'retail', label: 'Varejo & Urgência', icon: 'fa-tag' },
    { id: 'luxury', label: 'Luxo & Editorial', icon: 'fa-gem' },
    { id: 'modern', label: 'Moderno & Tech', icon: 'fa-bolt' },
    { id: 'creative', label: 'Criativo & Bold', icon: 'fa-palette' },
    { id: 'social', label: 'Social & Chat', icon: 'fa-comments' },
    { id: 'dates', label: 'Datas & Eventos', icon: 'fa-calendar-star' },
];

const ThemeSelectorByFilter: React.FC<ThemeSelectorProps> = ({ currentThemeId, onSelect, darkMode = false }) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredThemes = useMemo(() => {
        if (activeCategory === 'all') { return POPUP_THEME_CATALOG; }

        if (activeCategory === 'dates') {
            return POPUP_THEME_CATALOG.filter(t => t.id.startsWith('date_') || t.id.startsWith('inst_'));
        }

        const categoryPrefix = activeCategory === 'retail' ? ['retail_'] :
            activeCategory === 'luxury' ? ['luxury_'] :
                activeCategory === 'modern' ? ['modern_'] :
                    activeCategory === 'creative' ? ['creative_'] :
                        activeCategory === 'social' ? ['social_'] :
                            [activeCategory];


        return POPUP_THEME_CATALOG.filter(t =>
            categoryPrefix.some(prefix => t.id.startsWith(prefix)) ||
            t.id.includes(`_${activeCategory}`)
        );
    }, [activeCategory]);

    const handleThemeClick = (themeId: string) => {
        const theme = POPUP_THEME_CATALOG.find(t => t.id === themeId);
        if (!theme) { return; }

        onSelect({
            themePresetId: theme.id,
            filterId: theme.filterId,
            filterVariant: theme.filterVariant,
            themeAdvanced: theme.defaults,
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
            } as unknown as PromoPopupItemConfig['media']
        });
    };

    return (
        <div className={`flex h-[450px] border rounded-[2rem] overflow-hidden shadow-sm ring-1 ring-black/5 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            {/* LEFT COLUMN: FILTERS (Menu Style) */}
            <div className={`w-48 border-r flex flex-col p-2 gap-1 overflow-y-auto ${darkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                <div className="px-3 py-3 mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest block ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Estilos</span>
                </div>
                {THEME_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group relative ${activeCategory === cat.id
                            ? (darkMode ? 'bg-white/10 shadow-sm text-white border border-white/10' : 'bg-white shadow-sm text-black border border-gray-200')
                            : (darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800')
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-colors shrink-0 ${activeCategory === cat.id ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') : (darkMode ? 'bg-white/5 text-gray-500 group-hover:bg-white/10' : 'bg-gray-200 text-gray-400 group-hover:bg-white')}`}>
                            <i className={`fas ${cat.icon}`}></i>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wide leading-tight">{cat.label}</span>
                        {activeCategory === cat.id && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-red-600"></div>}
                    </button>
                ))}
            </div>

            {/* RIGHT AREA: THEME GRID (Visual Rich) */}
            <div className={`flex-1 p-6 overflow-y-auto custom-scrollbar ${darkMode ? 'bg-black/40' : 'bg-gray-50/30'}`}>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredThemes.map(theme => {
                        const isSelected = currentThemeId === theme.id;
                        const { colors, defaults } = theme;

                        // Dynamic Mini-UI Styles
                        const borderRadius = defaults.borderRadius === 'strong' ? '12px' : defaults.borderRadius === 'soft' ? '8px' : '0px';
                        const surfaceClass = defaults.surfaceStyle === 'glass' ? 'backdrop-blur-sm bg-opacity-80' : '';
                        const borderStyle = defaults.surfaceStyle === 'outline' ? `2px solid ${colors.title}` : (colors.border ? `2px solid ${colors.border}` : '1px solid rgba(0,0,0,0.05)');

                        return (
                            <button
                                key={theme.id}
                                onClick={() => handleThemeClick(theme.id)}
                                className={`relative group flex flex-col transition-all duration-300 ${isSelected ? 'scale-[1.02]' : 'hover:-translate-y-1'}`}
                            >
                                {/* THEME PREVIEW CARD (MINI UI) */}
                                <div
                                    className={`
                                        w-full aspect-[4/3] relative overflow-hidden mb-3 shadow-sm transition-all
                                        ${isSelected ? 'ring-2 ring-red-600 shadow-xl' : (darkMode ? 'group-hover:shadow-lg ring-1 ring-white/10' : 'group-hover:shadow-lg ring-1 ring-black/5')}
                                    `}
                                    style={{
                                        borderRadius: '16px',
                                        backgroundColor: darkMode ? '#1f2937' : '#e5e7eb', // Canvas bg
                                        backgroundImage: darkMode ? 'radial-gradient(#374151 1px, transparent 1px)' : 'radial-gradient(#ccc 1px, transparent 1px)',
                                        backgroundSize: '10px 10px'
                                    }}
                                >
                                    {/* Simulated Backdrop Overlay */}
                                    <div className={`absolute inset-0 ${defaults.backdrop === 'dim_strong' ? 'bg-black/40' : defaults.backdrop === 'dim_soft' ? 'bg-black/10' : ''}`}></div>

                                    {/* Simulated Popup Content */}
                                    <div
                                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-auto flex flex-col p-3 ${surfaceClass}`}
                                        style={{
                                            backgroundColor: defaults.surfaceStyle === 'outline' ? 'transparent' : colors.background,
                                            borderRadius: borderRadius,
                                            border: borderStyle,
                                            boxShadow: defaults.shadow === 'glow' ? `0 0 15px ${colors.buttonBg}40` : '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {/* Animation Effect Indicator */}
                                        {theme.specialEffect && theme.specialEffect !== 'none' && (
                                            <div className="absolute top-1 right-1 text-[8px] opacity-60">
                                                {theme.specialEffect === 'snow' && '❄️'}
                                                {theme.specialEffect === 'hearts' && '❤️'}
                                                {theme.specialEffect === 'pumpkins' && '🎃'}
                                                {theme.specialEffect === 'confetti' && '🎉'}
                                                {theme.specialEffect === 'sparkles' && '✨'}
                                            </div>
                                        )}

                                        {/* Header Accent */}
                                        {defaults.headerAccent === 'top_bar' && <div className="h-1 w-full mb-2" style={{ backgroundColor: colors.buttonBg }}></div>}
                                        {defaults.headerAccent === 'badge' && <div className="w-8 h-2 rounded-full mb-2" style={{ backgroundColor: colors.buttonBg }}></div>}

                                        {/* Mock Media */}
                                        <div className="w-full h-8 mb-2 opacity-80" style={{ backgroundColor: '#00000020', borderRadius: borderRadius === '0px' ? '0' : '4px' }}></div>

                                        {/* Mock Text */}
                                        <div className="w-3/4 h-2 mb-1.5 rounded-sm" style={{ backgroundColor: colors.title }}></div>
                                        <div className="w-full h-1 mb-1 rounded-sm opacity-60" style={{ backgroundColor: colors.body }}></div>
                                        <div className="w-2/3 h-1 mb-3 rounded-sm opacity-60" style={{ backgroundColor: colors.body }}></div>

                                        {/* Mock Button */}
                                        <div
                                            className="w-full h-5 flex items-center justify-center rounded-md"
                                            style={{ backgroundColor: colors.buttonBg }}
                                        >
                                            <div className="w-8 h-1 rounded-sm" style={{ backgroundColor: colors.buttonText }}></div>
                                        </div>
                                    </div>

                                    {/* Active Check */}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce z-20">
                                            <i className="fas fa-check text-[10px]"></i>
                                        </div>
                                    )}
                                </div>

                                {/* Label Info */}
                                <div className="flex flex-col items-start px-1">
                                    <span className={`text-[10px] font-black uppercase tracking-tight leading-none ${isSelected ? 'text-red-600' : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                                        {theme.name}
                                    </span>
                                    <span className={`text-[9px] mt-1 line-clamp-1 text-left w-full ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {theme.description || 'Tema personalizável'}
                                    </span>
                                </div>
                            </button>
                        );
                    })}

                    {filteredThemes.length === 0 && (
                        <div className={`col-span-full py-12 text-center rounded-xl border border-dashed ${darkMode ? 'border-white/10 bg-white/5 text-gray-500' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                            <i className="fas fa-wind text-3xl mb-3 opacity-50"></i>
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum tema encontrado nesta categoria</p>
                        </div>
                    )}
                </div>
            </div>

            <p className={`hidden text-center text-[10px] font-medium uppercase tracking-widest ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                Selecione um tema para substituir a configuração atual
            </p>
        </div>
    );
};

export default ThemeSelectorByFilter;
