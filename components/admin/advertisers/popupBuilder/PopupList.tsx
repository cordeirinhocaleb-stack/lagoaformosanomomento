import React, { useRef } from 'react';
import { PromoPopupItemConfig } from '../../../../types';

interface PopupListProps {
    items: PromoPopupItemConfig[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onAdd: () => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onMove: (dragIndex: number, hoverIndex: number) => void;
    onUpdate: (id: string, updates: Partial<PromoPopupItemConfig>) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    onClearAll: () => void;
    darkMode?: boolean;
}

const PopupList: React.FC<PopupListProps> = ({
    items,
    selectedId,
    onSelect,
    onAdd,
    onDelete,
    onClearAll,
    darkMode = false
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`w-full flex-none flex items-center border-b relative z-30 transition-colors ${darkMode ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-100'}`}>

            {/* Botão de Scroll Esquerdo */}
            <button
                onClick={() => handleScroll('left')}
                className={`hidden md:flex flex-none w-10 h-full items-center justify-center transition-colors border-r z-20 ${darkMode ? 'bg-zinc-900 border-white/10 text-gray-400 hover:text-white hover:bg-white/5' : 'bg-white border-gray-100 text-gray-400 hover:text-black hover:bg-gray-50'}`}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            {/* Container Scrollável */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-x-auto custom-scrollbar flex items-center gap-0 scroll-smooth relative"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Botão de Adicionar - Fixo no início ou não? Vamos colocar como o primeiro item */}
                <div className={`sticky left-0 z-10 flex-none p-4 w-32 md:w-40 border-r h-[120px] flex flex-col items-center justify-center gap-2 group cursor-pointer transition-all ${darkMode ? 'bg-zinc-900 border-white/10 hover:bg-white/5' : 'bg-white border-gray-100 hover:bg-gray-50'}`} onClick={onAdd}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${darkMode ? 'bg-white/10 text-white' : 'bg-black text-white'}`}>
                        <i className="fas fa-plus"></i>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Novo Slide</span>
                </div>

                {items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8 opacity-50 whitespace-nowrap">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Nenhum slide criado</span>
                    </div>
                )}

                {items.map((item, index) => {
                    const isSelected = item.id === selectedId;
                    return (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item.id)}
                            className={`flex-none w-32 md:w-40 h-[120px] border-r relative group cursor-pointer transition-all ${isSelected
                                ? (darkMode ? 'bg-white/10 border-white/10' : 'bg-gray-50 border-gray-200 shadow-inner')
                                : (darkMode ? 'bg-transparent border-white/10 hover:bg-white/5' : 'bg-white border-gray-100 hover:bg-gray-50')
                                }`}
                        >
                            <div className="absolute top-2 left-2 z-10 bg-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                                #{index + 1}
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                                className="absolute top-2 right-2 z-10 w-6 h-6 bg-white text-red-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white transform hover:scale-110"
                                title="Excluir Slide"
                            >
                                <i className="fas fa-times text-[10px]"></i>
                            </button>

                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 shadow-sm relative overflow-hidden ${darkMode ? 'bg-white/10 text-white' : 'bg-white border border-gray-100 text-gray-400'}`}>
                                    {item.media?.images?.[0] ? (
                                        <img src={item.media.images[0]} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fas fa-image opacity-50"></i>
                                    )}
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full text-center ${isSelected ? (darkMode ? 'text-white' : 'text-black') : 'text-gray-400'}`}>
                                    {item.title || `Slide ${index + 1}`}
                                </span>
                            </div>

                            {/* Indicador de Seleção */}
                            {isSelected && (
                                <div className={`absolute bottom-0 left-0 right-0 h-1 ${darkMode ? 'bg-white' : 'bg-black'}`}></div>
                            )}
                        </div>
                    );
                })}

                {/* Espaço extra no final para scroll */}
                <div className="flex-none w-10"></div>
            </div>

            {/* Botão de Scroll Direito */}
            <button
                onClick={() => handleScroll('right')}
                className={`hidden md:flex flex-none w-10 h-full items-center justify-center transition-colors border-l z-20 ${darkMode ? 'bg-zinc-900 border-white/10 text-gray-400 hover:text-white hover:bg-white/5' : 'bg-white border-gray-100 text-gray-400 hover:text-black hover:bg-gray-50'}`}
            >
                <i className="fas fa-chevron-right"></i>
            </button>

            {items.length > 0 && (
                <div className={`flex-none px-4 border-l h-[120px] flex items-center ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                    <button
                        onClick={onClearAll}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Limpar Tudo"
                    >
                        <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            )}

        </div>
    );
};

export default PopupList;
