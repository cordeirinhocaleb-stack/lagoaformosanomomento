import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PromoPopupItemConfig } from '../../../types';
import PromoPopupSlide from './PromoPopupSlide';

interface PromoPopupCarouselProps {
    items: PromoPopupItemConfig[];
    mode: 'live' | 'preview';
    onClose?: () => void;
    onAction?: (url: string) => void;
    selectedId?: string | null; // Nova prop para controle externo
    isMobilePreview?: boolean; // Força renderização mobile em preview
}

const PromoPopupCarousel: React.FC<PromoPopupCarouselProps> = ({
    items,
    mode,
    onClose,
    onAction,
    selectedId,
    isMobilePreview = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Touch State
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 50;

    // Filtra apenas itens ativos se estiver em modo LIVE
    // Em PREVIEW, mostra todos para edição
    const activeItems = React.useMemo(() => {
        return mode === 'live' ? items.filter(i => i.active) : items;
    }, [items, mode]);

    const count = activeItems.length;

    // Sincroniza o slide atual quando o usuário seleciona um item na lista do editor
    useEffect(() => {
        if (mode === 'preview' && selectedId) {
            const index = activeItems.findIndex(item => item.id === selectedId);
            if (index !== -1 && index !== currentIndex) {
                setCurrentIndex(index);
            }
        }
    }, [selectedId, activeItems, mode, currentIndex]);

    const nextSlide = useCallback(() => {
        if (count <= 1 || isAnimating) { return; }
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % count);
        setTimeout(() => setIsAnimating(false), 500);
    }, [count, isAnimating]);

    const prevSlide = useCallback(() => {
        if (count <= 1 || isAnimating) { return; }
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + count) % count);
        setTimeout(() => setIsAnimating(false), 500);
    }, [count, isAnimating]);

    // --- TOUCH HANDLERS (Mobile Swipe) ---

    const onTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) { return; }

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) { nextSlide(); }
        if (isRightSwipe) { prevSlide(); }
    };

    if (count === 0) { return null; }

    return (
        <div
            className="w-full h-full relative group overflow-hidden bg-transparent"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* --- SLIDES --- */}
            <div
                className="w-full h-full flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {activeItems.map((item) => (
                    <div key={item.id} className="w-full h-full flex-shrink-0 relative">
                        <PromoPopupSlide
                            item={item}
                            mode={mode}
                            onClose={onClose}
                            onAction={onAction}
                            className="w-full h-full"
                            isMobilePreview={isMobilePreview}
                        />
                    </div>
                ))}
            </div>

            {/* --- CONTROLS (Multi-slide only) --- */}
            {count > 1 && (
                <>
                    {/* Navigation Arrows - Using flex wrapper for better centering */}
                    <div className="absolute inset-y-0 left-0 right-0 z-40 pointer-events-none hidden md:flex items-center justify-between px-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                            className="w-10 h-10 flex items-center justify-center text-white bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 pointer-events-auto shadow-lg border border-white/10"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                            className="w-10 h-10 flex items-center justify-center text-white bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 pointer-events-auto shadow-lg border border-white/10"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    {/* Dots Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                        {activeItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`w-2 h-2 rounded-full transition-all shadow-sm ${idx === currentIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/40 hover:bg-white/70'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(PromoPopupCarousel);