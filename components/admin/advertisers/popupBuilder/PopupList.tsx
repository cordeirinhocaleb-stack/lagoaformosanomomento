
import React, { useRef, useEffect, useState } from 'react';
import { PromoPopupItemConfig } from '../../../../types';
import { MAX_ITEMS_PER_SET } from '../../../../utils/popupSafety';

interface PopupListProps {
    items: PromoPopupItemConfig[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onMove: (id: string, direction: 'up' | 'down') => void;
    onUpdate?: (id: string, updates: Partial<PromoPopupItemConfig>) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onClearAll?: () => void; 
}

const PopupList: React.FC<PopupListProps> = ({ 
    items, selectedId, onSelect, onAdd, onClearAll
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [items]);

    const scrollManual = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = direction === 'left' ? -200 : 200;
            scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(checkScroll, 350);
        }
    };

    return (
        <div className="relative w-full bg-gray-50 border-b border-gray-100 p-2 flex flex-col lg:flex-row items-center gap-2 group/list overflow-hidden">
            
            {/* 1. ÁREA DE AÇÃO (Topo no Mobile / Esquerda no Desktop) */}
            <div className="w-full lg:w-auto flex items-center justify-between lg:justify-start lg:shrink-0 lg:pl-1 lg:border-r lg:border-gray-200 lg:pr-2 lg:mr-1">
                <button 
                    onClick={onAdd}
                    disabled={items.length >= MAX_ITEMS_PER_SET}
                    className="flex-1 lg:flex-none h-11 lg:h-10 rounded-xl bg-black text-white hover:bg-red-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-3 px-4 disabled:opacity-30 group/add"
                    title="Novo Slide"
                >
                    <i className="fas fa-plus text-[10px] group-hover/add:rotate-90 transition-transform"></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">Novo Slide</span>
                </button>

                {/* Ação de Limpar visível no mobile ao lado do Adicionar */}
                {items.length > 0 && onClearAll && (
                    <button 
                        onClick={onClearAll}
                        className="lg:hidden ml-2 w-11 h-11 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center active:scale-95 shadow-sm"
                        title="Limpar Tudo"
                    >
                        <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                )}
            </div>

            {/* 2. ÁREA DE NAVEGAÇÃO DE SLIDES (Estilo Weather) */}
            <div className="relative flex-1 w-full flex items-center overflow-hidden">
                
                {/* Setas de Navegação (Flutuantes sobre a lista) */}
                {canScrollLeft && (
                    <button 
                        onClick={() => scrollManual('left')}
                        className="absolute left-0 z-30 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-red-600 shadow-lg active:scale-90 transition-all"
                    >
                        <i className="fas fa-chevron-left text-[10px]"></i>
                    </button>
                )}

                {/* Container de Slides Horizontal */}
                <div 
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide px-2 lg:px-4 mask-fade-sides py-1"
                >
                    {items.length === 0 && (
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest pl-2 py-3">Crie seu primeiro slide acima</span>
                    )}

                    {items.map((item, index) => {
                        const isSelected = selectedId === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`
                                    relative flex items-center gap-3 px-5 py-2.5 rounded-xl transition-all border-2 shrink-0
                                    ${isSelected 
                                        ? 'bg-white border-red-600 text-red-600 shadow-lg scale-105 z-10' 
                                        : 'bg-white border-transparent text-gray-400 hover:bg-gray-100'
                                    }
                                `}
                            >
                                <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                <span className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap">
                                    Slide {index + 1}
                                </span>
                                {isSelected && item.title && (
                                    <span className="hidden sm:inline-block text-[8px] font-bold text-gray-400 border-l border-gray-200 pl-2 max-w-[80px] truncate">
                                        {item.title}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {canScrollRight && (
                    <button 
                        onClick={() => scrollManual('right')}
                        className="absolute right-0 z-30 w-8 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-red-600 shadow-lg active:scale-90 transition-all"
                    >
                        <i className="fas fa-chevron-right text-[10px]"></i>
                    </button>
                )}
            </div>

            {/* Ação de Limpar (Fixo à Direita no Desktop apenas) */}
            {items.length > 0 && onClearAll && (
                <div className="hidden lg:block shrink-0 pl-2 border-l border-gray-200 ml-1">
                    <button 
                        onClick={onClearAll}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center border border-red-100"
                        title="Limpar Tudo"
                    >
                        <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                </div>
            )}

            <style>{`
                .mask-fade-sides {
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
            `}</style>
        </div>
    );
};

export default PopupList;
